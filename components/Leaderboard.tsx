import { formatEmployees, formatMoney, formatScore, formatSignedPercent } from "@/lib/formatters";
import type { Company, Mode, SortKey } from "@/types/company";

type LeaderboardProps = {
  mode: Mode;
  sortKey: SortKey;
  companies: Company[];
  selectedSymbol: string | null;
  reportSymbols: Set<string>;
  onSelectCompany: (company: Company) => void;
  onAddToReport: (company: Company) => void;
};

function modeValue(mode: Mode, company: Company): string {
  if (mode === "efficiency") {
    return company.efficiencyLabel ?? "N/A";
  }
  if (mode === "workforce") {
    return company.workforceMomentum ?? "N/A";
  }
  return `${formatScore(company.supplyChainRiskScore)} (${company.supplyChainRiskLabel ?? "N/A"})`;
}

export default function Leaderboard({
  mode,
  sortKey,
  companies,
  selectedSymbol,
  reportSymbols,
  onSelectCompany,
  onAddToReport
}: LeaderboardProps) {
  return (
    <section className="border border-[var(--border)] bg-[var(--surface)]">
      <header className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <h2 className="font-display text-3xl tracking-[0.08em]">Leaderboard</h2>
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
          Sorted by {sortKey}
        </p>
      </header>

      <div className="max-h-[560px] overflow-auto">
        <table className="w-full min-w-[920px] border-collapse">
          <thead className="sticky top-0 bg-[rgba(17,17,20,0.98)]">
            <tr className="border-b border-[var(--border)]">
              <th className="px-3 py-2 text-left font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
                Rank
              </th>
              <th className="px-3 py-2 text-left font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
                Ticker
              </th>
              <th className="px-3 py-2 text-left font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
                Company
              </th>
              <th className="px-3 py-2 text-left font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
                Sector
              </th>
              <th className="px-3 py-2 text-right font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
                Revenue / Employee
              </th>
              <th className="px-3 py-2 text-right font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
                Growth Gap
              </th>
              <th className="px-3 py-2 text-right font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
                Employees
              </th>
              <th className="px-3 py-2 text-right font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
                Revenue
              </th>
              <th className="px-3 py-2 text-right font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
                Mode Signal
              </th>
              <th className="px-3 py-2 text-right font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
                Report
              </th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company, index) => {
              const active = selectedSymbol === company.symbol;
              const inReport = reportSymbols.has(company.symbol);

              return (
                <tr
                  key={company.symbol}
                  onClick={() => onSelectCompany(company)}
                  className={`cursor-pointer border-b border-[var(--border)] transition hover:bg-[rgba(255,255,255,0.04)] ${
                    active ? "bg-[rgba(255,60,60,0.12)]" : ""
                  }`}
                >
                  <td className="px-3 py-2 font-mono text-xs">{index + 1}</td>
                  <td className="px-3 py-2 font-display text-xl tracking-[0.08em]">{company.symbol}</td>
                  <td className="px-3 py-2 font-mono text-xs">{company.name}</td>
                  <td className="px-3 py-2 font-mono text-xs text-[var(--muted)]">{company.sector}</td>
                  <td className="px-3 py-2 text-right font-mono text-xs">
                    {formatMoney(company.revenuePerEmployee)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-xs">{formatSignedPercent(company.growthGap)}</td>
                  <td className="px-3 py-2 text-right font-mono text-xs">
                    {formatEmployees(company.employees)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-xs">{formatMoney(company.revenue)}</td>
                  <td className="px-3 py-2 text-right font-mono text-xs">{modeValue(mode, company)}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onAddToReport(company);
                      }}
                      disabled={inReport}
                      className={`border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] ${
                        inReport
                          ? "border-[var(--border)] text-[var(--muted)]"
                          : "border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black"
                      }`}
                    >
                      {inReport ? "Added" : "+ Add to Report"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
