"use client";

import { useEffect, useMemo, useState } from "react";

import BubbleChart from "@/components/BubbleChart";
import CompanyDrawer from "@/components/CompanyDrawer";
import CompanyReport from "@/components/CompanyReport";
import CompanyReportBuilder from "@/components/CompanyReportBuilder";
import Filters from "@/components/Filters";
import Leaderboard from "@/components/Leaderboard";
import Methodology from "@/components/Methodology";
import ModeToggle from "@/components/ModeToggle";
import SearchBar from "@/components/SearchBar";
import SummaryCards from "@/components/SummaryCards";
import { isKnowledgeEconomy } from "@/lib/classification";
import { MOMENTUM_COLORS, RISK_COLORS } from "@/lib/constants";
import type { Company, CompanyApiResponse, Mode, OperatingModel, SortKey } from "@/types/company";

type LoadState = "idle" | "loading" | "success" | "error";

function normalizeCompany(item: Company): Company | null {
  if (!item.symbol || !item.name || !item.sector) {
    return null;
  }

  return {
    ...item,
    symbol: item.symbol.toUpperCase()
  };
}

function sortCompanies(companies: Company[], sortKey: SortKey): Company[] {
  const sorted = [...companies];

  sorted.sort((a, b) => {
    if (sortKey === "name") {
      return a.name.localeCompare(b.name);
    }

    const aValue = (a[sortKey] as number | undefined) ?? 0;
    const bValue = (b[sortKey] as number | undefined) ?? 0;
    return bValue - aValue;
  });

  return sorted;
}

export default function BloatIndex() {
  const [mode, setMode] = useState<Mode>("efficiency");
  const [sortKey, setSortKey] = useState<SortKey>("efficiencyScore");
  const [sector, setSector] = useState("ALL SECTORS");
  const [industry, setIndustry] = useState("ALL INDUSTRIES");
  const [operatingModel, setOperatingModel] = useState<OperatingModel | "ALL">("ALL");
  const [knowledgeOnly, setKnowledgeOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [source, setSource] = useState<"fmp" | "mock">("mock");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [reportSymbols, setReportSymbols] = useState<string[]>([]);
  const [reportGenerated, setReportGenerated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoadState("loading");

      try {
        const response = await fetch("/api/companies", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Failed to load");
        }

        const payload = (await response.json()) as CompanyApiResponse;
        const normalized = payload.companies
          .map((item) => normalizeCompany(item))
          .filter((item): item is Company => item !== null);

        if (!cancelled) {
          setCompanies(normalized);
          setSource(payload.source);
          setLoadState("success");
        }
      } catch {
        if (!cancelled) {
          setLoadState("error");
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (mode === "efficiency") {
      setSortKey("efficiencyScore");
      return;
    }

    if (mode === "workforce") {
      setSortKey("growthGap");
      return;
    }

    setSortKey("supplyChainRiskScore");
  }, [mode]);

  const sectors = useMemo(
    () => ["ALL SECTORS", ...Array.from(new Set(companies.map((company) => company.sector))).sort()],
    [companies]
  );

  const industries = useMemo(
    () => [
      "ALL INDUSTRIES",
      ...Array.from(new Set(companies.map((company) => company.industry).filter(Boolean) as string[])).sort()
    ],
    [companies]
  );

  const filteredCompanies = useMemo(() => {
    const term = search.trim().toLowerCase();

    return companies.filter((company) => {
      const matchesSector = sector === "ALL SECTORS" || company.sector === sector;
      const matchesIndustry = industry === "ALL INDUSTRIES" || company.industry === industry;
      const matchesModel = operatingModel === "ALL" || company.operatingModel === operatingModel;
      const matchesKnowledge = !knowledgeOnly || isKnowledgeEconomy(company);
      const matchesSearch =
        term.length === 0 ||
        company.symbol.toLowerCase().includes(term) ||
        company.name.toLowerCase().includes(term);

      return matchesSector && matchesIndustry && matchesModel && matchesKnowledge && matchesSearch;
    });
  }, [companies, industry, knowledgeOnly, operatingModel, search, sector]);

  const rankedCompanies = useMemo(() => sortCompanies(filteredCompanies, sortKey), [filteredCompanies, sortKey]);

  const reportCompanies = useMemo(() => {
    const lookup = new Map(companies.map((company) => [company.symbol, company]));
    return reportSymbols.map((symbol) => lookup.get(symbol)).filter((company): company is Company => !!company);
  }, [companies, reportSymbols]);

  const reportSymbolSet = useMemo(() => new Set(reportSymbols), [reportSymbols]);

  const activeLegend =
    mode === "efficiency"
      ? [
          { label: "Lean", color: "var(--green)" },
          { label: "Normal", color: "var(--yellow)" },
          { label: "Bloated", color: "var(--accent)" }
        ]
      : mode === "workforce"
        ? [
            { label: "Lean scaling", color: MOMENTUM_COLORS["Lean scaling"] },
            { label: "Balanced", color: MOMENTUM_COLORS["Balanced growth"] },
            { label: "Headcount ahead", color: MOMENTUM_COLORS["Headcount expansion ahead of revenue"] }
          ]
        : [
            { label: "Low", color: RISK_COLORS.Low },
            { label: "Medium", color: RISK_COLORS.Medium },
            { label: "High", color: RISK_COLORS.High }
          ];

  const openCompany = (company: Company) => {
    setSelectedCompany(company);
    setDrawerOpen(true);
  };

  const addToReport = (company: Company) => {
    setReportSymbols((current) => {
      if (current.includes(company.symbol) || current.length >= 10) {
        return current;
      }
      return [...current, company.symbol];
    });
  };

  const removeFromReport = (symbol: string) => {
    setReportSymbols((current) => current.filter((item) => item !== symbol));
  };

  const clearReport = () => {
    setReportSymbols([]);
    setReportGenerated(false);
  };

  if (loadState === "loading" || loadState === "idle") {
    return (
      <section className="mx-auto w-full max-w-[1480px] border border-[var(--border)] bg-[var(--surface)] p-8">
        <p className="font-display text-5xl tracking-[0.08em]">Loading Corporate Operations Explorer...</p>
      </section>
    );
  }

  if (loadState === "error") {
    return (
      <section className="mx-auto w-full max-w-[1480px] border border-[var(--border)] bg-[var(--surface)] p-8">
        <p className="font-display text-4xl tracking-[0.08em] text-[var(--accent)]">Data load failed</p>
        <p className="mt-2 font-mono text-sm text-[var(--muted)]">
          Unable to fetch company records. Reload the page to retry.
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-[1480px] flex-col gap-5 pb-20">
      <header className="border border-[var(--border)] bg-[var(--surface)] px-5 py-4">
        <h1 className="font-display text-5xl leading-none tracking-[0.14em] md:text-7xl">
          CORPORATE <span className="text-[var(--accent)]">OPERATIONS</span> EXPLORER
        </h1>
        <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-[var(--muted)] md:text-sm">
          Bloomberg-style operational intelligence for public companies
        </p>
      </header>

      <SummaryCards mode={mode} companies={filteredCompanies} />

      <div className="sticky top-0 z-[900] flex flex-col gap-3 border border-[var(--border)] bg-[rgba(17,17,20,0.97)] px-4 py-4 backdrop-blur md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <ModeToggle mode={mode} onChange={setMode} />
          <Filters
            sectors={sectors}
            industries={industries}
            sector={sector}
            industry={industry}
            sortKey={sortKey}
            operatingModel={operatingModel}
            knowledgeOnly={knowledgeOnly}
            onSectorChange={setSector}
            onIndustryChange={setIndustry}
            onSortChange={setSortKey}
            onOperatingModelChange={setOperatingModel}
            onKnowledgeOnlyChange={setKnowledgeOnly}
          />
          <SearchBar value={search} onChange={setSearch} />
        </div>

        <div className="ml-auto flex flex-col items-end gap-2">
          <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
            {activeLegend.map((entry) => (
              <span key={entry.label} className="inline-flex items-center gap-2">
                <i className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} /> {entry.label}
              </span>
            ))}
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
            {filteredCompanies.length} companies shown - source: {source}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.35fr_1fr]">
        <BubbleChart
          companies={rankedCompanies}
          mode={mode}
          selectedSymbol={selectedCompany?.symbol ?? null}
          reportSymbols={reportSymbolSet}
          onSelectCompany={openCompany}
          onAddToReport={addToReport}
        />

        <Leaderboard
          mode={mode}
          sortKey={sortKey}
          companies={rankedCompanies}
          selectedSymbol={selectedCompany?.symbol ?? null}
          reportSymbols={reportSymbolSet}
          onSelectCompany={openCompany}
          onAddToReport={addToReport}
        />
      </div>

      <CompanyReport companies={reportCompanies} generated={reportGenerated} />
      <Methodology />

      <CompanyReportBuilder
        selectedCompanies={reportCompanies}
        onGenerate={() => setReportGenerated(true)}
        onClear={clearReport}
        onRemove={removeFromReport}
      />

      <CompanyDrawer
        company={selectedCompany}
        open={drawerOpen}
        inReport={selectedCompany ? reportSymbolSet.has(selectedCompany.symbol) : false}
        onClose={() => setDrawerOpen(false)}
        onAddToReport={addToReport}
      />

      {drawerOpen ? (
        <button
          type="button"
          aria-label="Close detail drawer overlay"
          onClick={() => setDrawerOpen(false)}
          className="fixed inset-0 z-[1100] bg-[rgba(0,0,0,0.45)]"
        />
      ) : null}
    </section>
  );
}
