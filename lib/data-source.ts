import seedCompanies from "@/data/companies.json";
import { inferOperatingModel } from "@/lib/classification";
import { FMP_BASE_URL } from "@/lib/constants";
import { scoreCompanies } from "@/lib/scoring";
import type { Company } from "@/types/company";

type FmpProfile = {
  symbol?: string;
  companyName?: string;
  sector?: string;
  industry?: string;
  mktCap?: number;
  price?: number;
  country?: string;
  website?: string;
  description?: string;
  fullTimeEmployees?: string | number;
};

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.replace(/[^0-9.-]/g, "");
    if (!normalized) {
      return undefined;
    }
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function normalizeSector(sector?: string): string {
  if (!sector) {
    return "Unknown";
  }
  if (sector === "Financial Services") {
    return "Financials";
  }
  return sector;
}

function normalizeCompany(company: Partial<Company>): Company | null {
  if (!company.symbol || !company.name) {
    return null;
  }

  const normalized: Company = {
    symbol: company.symbol,
    name: company.name,
    sector: normalizeSector(company.sector),
    industry: company.industry,
    operatingModel: company.operatingModel,
    revenue: toNumber(company.revenue),
    marketCap: toNumber(company.marketCap),
    employees: toNumber(company.employees),
    price: toNumber(company.price),
    country: company.country,
    website: company.website,
    description: company.description,
    revenueGrowth: toNumber(company.revenueGrowth),
    headcountGrowth: toNumber(company.headcountGrowth),
    supplyExposure: company.supplyExposure,
    techStack: company.techStack
  };

  if (!normalized.operatingModel) {
    normalized.operatingModel = inferOperatingModel(normalized);
  }

  return normalized;
}

function getMockCompanies(): Company[] {
  const parsed = (seedCompanies as Company[])
    .map((company) => normalizeCompany(company))
    .filter((company): company is Company => company !== null);

  return scoreCompanies(parsed);
}

async function fetchFromFmp(apiKey: string): Promise<Company[] | null> {
  const seeds = seedCompanies as Company[];
  const symbols = seeds.map((company) => company.symbol).slice(0, 120);

  try {
    const profilesUrl = `${FMP_BASE_URL}/profile?symbol=${symbols.join(",")}&apikey=${apiKey}`;
    const response = await fetch(profilesUrl, { next: { revalidate: 60 * 60 * 6 } });

    if (!response.ok) {
      return null;
    }

    const profiles = (await response.json()) as FmpProfile[];
    if (!Array.isArray(profiles) || profiles.length === 0) {
      return null;
    }

    const seedBySymbol = new Map(seeds.map((company) => [company.symbol, company]));

    const merged = profiles
      .map((profile) => {
        const symbol = profile.symbol?.toUpperCase();
        if (!symbol) {
          return null;
        }

        const seed = seedBySymbol.get(symbol);
        const revenue = seed?.revenue;

        return normalizeCompany({
          symbol,
          name: profile.companyName ?? seed?.name,
          sector: profile.sector ?? seed?.sector,
          industry: profile.industry ?? seed?.industry,
          operatingModel: seed?.operatingModel,
          revenue,
          marketCap: toNumber(profile.mktCap) ?? seed?.marketCap,
          employees: toNumber(profile.fullTimeEmployees) ?? seed?.employees,
          price: toNumber(profile.price),
          country: profile.country ?? seed?.country,
          website: profile.website ?? seed?.website,
          description: profile.description,
          revenueGrowth: seed?.revenueGrowth,
          headcountGrowth: seed?.headcountGrowth,
          supplyExposure: seed?.supplyExposure,
          techStack: seed?.techStack
        });
      })
      .filter((company): company is Company => company !== null && !!company.revenue && !!company.employees);

    if (merged.length < 20) {
      return null;
    }

    return scoreCompanies(merged);
  } catch {
    return null;
  }
}

export async function getCompanies(): Promise<{ companies: Company[]; source: "fmp" | "mock" }> {
  const apiKey = process.env.FMP_API_KEY;

  if (!apiKey) {
    return { companies: getMockCompanies(), source: "mock" };
  }

  const fmpCompanies = await fetchFromFmp(apiKey);
  if (fmpCompanies && fmpCompanies.length > 0) {
    return { companies: fmpCompanies, source: "fmp" };
  }

  return { companies: getMockCompanies(), source: "mock" };
}
