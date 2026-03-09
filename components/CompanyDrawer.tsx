import { formatEmployees, formatMoney, formatScore } from "@/lib/formatters";
import type { Company } from "@/types/company";

type CompanyDrawerProps = {
  company: Company | null;
  open: boolean;
  onClose: () => void;
};

function Meter({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded bg-[var(--border)]">
      <div className="h-full" style={{ width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: color }} />
    </div>
  );
}

export default function CompanyDrawer({ company, open, onClose }: CompanyDrawerProps) {
  return (
    <aside
      className={`fixed right-0 top-0 z-[1200] h-full w-full max-w-[420px] border-l border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl transition-transform duration-200 ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-display text-5xl leading-none tracking-[0.08em]">{company?.symbol ?? "-"}</p>
          <p className="mt-1 font-mono text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
            {company?.name ?? "No selection"}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="border border-[var(--border)] px-2 py-1 font-mono text-xs uppercase tracking-[0.14em] text-[var(--muted)] hover:text-[var(--text)]"
        >
          Close
        </button>
      </div>

      {company ? (
        <>
          <div className="mt-4 space-y-2 border border-[var(--border)] bg-[var(--bg)] p-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[var(--muted)]">Sector / Industry</span>
              <span>
                {company.sector} {company.industry ? `- ${company.industry}` : ""}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--muted)]">Revenue</span>
              <span>{formatMoney(company.revenue)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--muted)]">Employees</span>
              <span>{formatEmployees(company.employees)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--muted)]">Revenue / Employee</span>
              <span>{formatMoney(company.revenuePerEmployee)}</span>
            </div>
          </div>

          <div className="mt-4 space-y-3 border border-[var(--border)] bg-[var(--bg)] p-3">
            <div>
              <div className="mb-1 flex items-center justify-between font-mono text-xs">
                <span className="text-[var(--muted)]">Efficiency Score ({company.efficiencyLabel})</span>
                <span>{formatScore(company.efficiencyScore)}</span>
              </div>
              <Meter value={company.efficiencyScore ?? 0} color="var(--yellow)" />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between font-mono text-xs">
                <span className="text-[var(--muted)]">Layoff Risk Score ({company.layoffRiskLabel})</span>
                <span>{formatScore(company.layoffRiskScore)}</span>
              </div>
              <Meter value={company.layoffRiskScore ?? 0} color="var(--accent)" />
            </div>
          </div>

          <div className="mt-4 space-y-2 font-mono text-xs leading-relaxed text-[var(--text)]">
            <p>
              Efficiency score is based on revenue per employee relative to peers in this dataset.
            </p>
            <p>
              Layoff risk is a heuristic signal based on low relative efficiency and company scale; it is
              not a forecast.
            </p>
            {company.website ? (
              <a
                href={company.website}
                target="_blank"
                rel="noreferrer"
                className="inline-block border border-[var(--border)] px-2 py-1 uppercase tracking-[0.12em] text-[var(--muted)] hover:text-[var(--text)]"
              >
                Company Website
              </a>
            ) : (
              <p className="text-[var(--muted)]">Website unavailable in current dataset.</p>
            )}
          </div>
        </>
      ) : (
        <p className="mt-6 font-mono text-xs text-[var(--muted)]">
          Select a bubble or leaderboard row to view company detail.
        </p>
      )}
    </aside>
  );
}
