"use client";

import { useEffect, useMemo, useState } from "react";

import BubbleChart from "@/components/BubbleChart";
import CompanyDrawer from "@/components/CompanyDrawer";
import Filters from "@/components/Filters";
import Leaderboard from "@/components/Leaderboard";
import Methodology from "@/components/Methodology";
import ModeToggle from "@/components/ModeToggle";
import SearchBar from "@/components/SearchBar";
import SummaryCards from "@/components/SummaryCards";
import type { Company, CompanyApiResponse, Mode, SortKey } from "@/types/company";

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
  const [search, setSearch] = useState("");
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [source, setSource] = useState<"fmp" | "mock">("mock");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

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
    setSortKey(mode === "efficiency" ? "efficiencyScore" : "layoffRiskScore");
  }, [mode]);

  const sectors = useMemo(
    () => ["ALL SECTORS", ...Array.from(new Set(companies.map((company) => company.sector))).sort()],
    [companies]
  );

  const filteredCompanies = useMemo(() => {
    const term = search.trim().toLowerCase();

    return companies.filter((company) => {
      const matchesSector = sector === "ALL SECTORS" || company.sector === sector;
      const matchesSearch =
        term.length === 0 ||
        company.symbol.toLowerCase().includes(term) ||
        company.name.toLowerCase().includes(term);
      return matchesSector && matchesSearch;
    });
  }, [companies, search, sector]);

  const rankedCompanies = useMemo(() => sortCompanies(filteredCompanies, sortKey), [filteredCompanies, sortKey]);

  const activeLegend =
    mode === "efficiency"
      ? [
          { label: "Lean", color: "var(--green)" },
          { label: "Normal", color: "var(--yellow)" },
          { label: "Bloated", color: "var(--accent)" }
        ]
      : [
          { label: "Low", color: "var(--green)" },
          { label: "Medium", color: "var(--yellow)" },
          { label: "High", color: "var(--accent)" }
        ];

  const openCompany = (company: Company) => {
    setSelectedCompany(company);
    setDrawerOpen(true);
  };

  if (loadState === "loading" || loadState === "idle") {
    return (
      <section className="mx-auto w-full max-w-[1480px] border border-[var(--border)] bg-[var(--surface)] p-8">
        <p className="font-display text-5xl tracking-[0.08em]">Loading Corporate Bloat Index...</p>
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
    <section className="mx-auto flex w-full max-w-[1480px] flex-col gap-5 pb-10">
      <header className="border border-[var(--border)] bg-[var(--surface)] px-5 py-4">
        <h1 className="font-display text-5xl leading-none tracking-[0.14em] md:text-7xl">
          CORPORATE <span className="text-[var(--accent)]">BLOAT</span> INDEX
        </h1>
        <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-[var(--muted)] md:text-sm">
          Corporate Efficiency Index + Layoff Risk Radar
        </p>
      </header>

      <SummaryCards mode={mode} companies={filteredCompanies} />

      <div className="sticky top-0 z-[900] flex flex-col gap-3 border border-[var(--border)] bg-[rgba(17,17,20,0.97)] px-4 py-4 backdrop-blur md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <ModeToggle mode={mode} onChange={setMode} />
          <Filters
            sectors={sectors}
            sector={sector}
            sortKey={sortKey}
            onSectorChange={setSector}
            onSortChange={setSortKey}
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
          onSelectCompany={openCompany}
        />

        <Leaderboard
          mode={mode}
          sortKey={sortKey}
          companies={rankedCompanies}
          selectedSymbol={selectedCompany?.symbol ?? null}
          onSelectCompany={openCompany}
        />
      </div>

      <Methodology />

      <CompanyDrawer company={selectedCompany} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
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
