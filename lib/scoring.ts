import { LABOR_HEAVY_SECTORS } from "@/lib/constants";
import type { Company, EfficiencyLabel, MomentumLabel, RiskLabel, SupplyLevel } from "@/types/company";

function safeRevenuePerEmployee(company: Company): number | undefined {
  const revenue = company.revenue;
  const employees = company.employees;
  if (!revenue || !employees || employees <= 0) {
    return undefined;
  }
  return revenue / employees;
}

function percentileRank(value: number, sorted: number[]): number {
  if (sorted.length === 0) {
    return 0.5;
  }

  let index = 0;
  while (index < sorted.length && sorted[index] <= value) {
    index += 1;
  }

  return index / sorted.length;
}

function getEfficiencyLabel(percentile: number): EfficiencyLabel {
  if (percentile >= 0.67) {
    return "Lean";
  }
  if (percentile >= 0.34) {
    return "Normal";
  }
  return "Bloated";
}

function getRiskLabel(points: number): RiskLabel {
  if (points <= 1) {
    return "Low";
  }
  if (points <= 3) {
    return "Medium";
  }
  return "High";
}

function normalizeRisk(points: number): number {
  return Math.max(0, Math.min(100, points * 20));
}

function momentumLabel(growthGap: number): MomentumLabel {
  if (growthGap <= -5) {
    return "Lean scaling";
  }
  if (growthGap > 5) {
    return "Headcount expansion ahead of revenue";
  }
  return "Balanced growth";
}

const SUPPLY_WEIGHT: Record<SupplyLevel, number> = {
  Low: 0,
  Medium: 1,
  High: 2,
  "Very High": 3
};

function supplyRisk(company: Company): { score: number; label: RiskLabel } {
  const exposure = company.supplyExposure;
  if (!exposure) {
    return { score: 40, label: "Medium" };
  }

  const total =
    SUPPLY_WEIGHT[exposure.chinaManufacturing] +
    SUPPLY_WEIGHT[exposure.taiwanSemiconductors] +
    SUPPLY_WEIGHT[exposure.redSeaShipping] +
    SUPPLY_WEIGHT[exposure.panamaCanal] +
    SUPPLY_WEIGHT[exposure.europeanEnergy];

  const score = Math.round((total / 15) * 100);

  if (score >= 67) {
    return { score, label: "High" };
  }
  if (score >= 34) {
    return { score, label: "Medium" };
  }
  return { score, label: "Low" };
}

export function scoreCompanies(input: Company[]): Company[] {
  const revenuePerEmployeeValues = input
    .map((company) => safeRevenuePerEmployee(company))
    .filter((value): value is number => value !== undefined)
    .sort((a, b) => a - b);

  const employeeValues = input
    .map((company) => company.employees ?? 0)
    .filter((value) => value > 0)
    .sort((a, b) => a - b);

  const withBase = input.map((company) => {
    const revenuePerEmployee = safeRevenuePerEmployee(company);

    if (!revenuePerEmployee) {
      return {
        ...company,
        revenuePerEmployee: undefined,
        efficiencyScore: 0,
        efficiencyLabel: "Bloated" as EfficiencyLabel,
        layoffRiskScore: 70,
        layoffRiskLabel: "High" as RiskLabel,
        growthGap: 0,
        workforceMomentum: "Balanced growth" as MomentumLabel,
        supplyChainRiskScore: supplyRisk(company).score,
        supplyChainRiskLabel: supplyRisk(company).label
      };
    }

    const efficiencyPercentile = percentileRank(revenuePerEmployee, revenuePerEmployeeValues);
    const efficiencyScore = efficiencyPercentile * 100;
    const efficiencyLabel = getEfficiencyLabel(efficiencyPercentile);

    const growthGap = (company.headcountGrowth ?? 0) - (company.revenueGrowth ?? 0);

    let riskPoints = 0;

    if (efficiencyPercentile <= 0.3) {
      riskPoints += 2;
    }

    const employeePercentile = percentileRank(company.employees ?? 0, employeeValues);
    if (efficiencyPercentile <= 0.3 && employeePercentile >= 0.7) {
      riskPoints += 1;
    }

    if (efficiencyPercentile <= 0.3 && LABOR_HEAVY_SECTORS.has(company.sector)) {
      riskPoints += 1;
    }

    if (efficiencyPercentile <= 0.15) {
      riskPoints += 1;
    }

    const supply = supplyRisk(company);

    return {
      ...company,
      revenuePerEmployee,
      efficiencyScore,
      efficiencyLabel,
      layoffRiskScore: normalizeRisk(riskPoints),
      layoffRiskLabel: getRiskLabel(riskPoints),
      growthGap,
      workforceMomentum: momentumLabel(growthGap),
      supplyChainRiskScore: supply.score,
      supplyChainRiskLabel: supply.label
    };
  });

  const industryMedians = new Map<string, number>();
  const byIndustry = new Map<string, number[]>();

  for (const company of withBase) {
    if (!company.industry || !company.revenuePerEmployee) {
      continue;
    }

    const current = byIndustry.get(company.industry) ?? [];
    current.push(company.revenuePerEmployee);
    byIndustry.set(company.industry, current);
  }

  for (const [industry, values] of byIndustry.entries()) {
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    const median =
      sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
    industryMedians.set(industry, median);
  }

  return withBase.map((company) => {
    if (!company.industry || !company.revenuePerEmployee) {
      return { ...company, industryEfficiencyRatio: 1 };
    }

    const median = industryMedians.get(company.industry) ?? company.revenuePerEmployee;
    const ratio = median > 0 ? company.revenuePerEmployee / median : 1;

    return {
      ...company,
      industryEfficiencyRatio: ratio
    };
  });
}
