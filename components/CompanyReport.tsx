import { prospectingSignals } from "@/lib/insightEngine";
import { formatMoney, formatScore, formatSignedPercent } from "@/lib/formatters";
import type { Company } from "@/types/company";

type CompanyReportProps = {
  companies: Company[];
  generated: boolean;
};

function pressures(company: Company): string[] {
  const results: string[] = [];
  if ((company.industryEfficiencyRatio ?? 1) < 1) {
    results.push("margin compression");
  }
  if ((company.growthGap ?? 0) > 5) {
    results.push("labor cost drag");
  }
  if ((company.supplyChainRiskScore ?? 0) >= 60) {
    results.push("supply chain constraints");
  }
  if (results.length === 0) {
    results.push("no major pressure signal");
  }
  return results;
}

function rankMap(companies: Company[]): Map<string, number> {
  const sorted = [...companies].sort((a, b) => (b.revenuePerEmployee ?? 0) - (a.revenuePerEmployee ?? 0));
  return new Map(sorted.map((company, index) => [company.symbol, index + 1]));
}

function pillTone(value: number, type: "positive" | "risk"): string {
  if (type === "positive") {
    if (value >= 67) {
      return "text-[var(--green)] border-[var(--green)]/40 bg-[rgba(0,232,122,0.1)]";
    }
    if (value >= 34) {
      return "text-[var(--yellow)] border-[var(--yellow)]/40 bg-[rgba(255,215,0,0.1)]";
    }
    return "text-[var(--accent)] border-[var(--accent)]/40 bg-[rgba(255,60,60,0.1)]";
  }

  if (value >= 67) {
    return "text-[var(--accent)] border-[var(--accent)]/40 bg-[rgba(255,60,60,0.1)]";
  }
  if (value >= 34) {
    return "text-[var(--yellow)] border-[var(--yellow)]/40 bg-[rgba(255,215,0,0.1)]";
  }
  return "text-[var(--green)] border-[var(--green)]/40 bg-[rgba(0,232,122,0.1)]";
}

export default function CompanyReport({ companies, generated }: CompanyReportProps) {
  if (!generated) {
    return null;
  }

  const ranks = rankMap(companies);
  const highestEfficiency = [...companies].sort((a, b) => (b.efficiencyScore ?? 0) - (a.efficiencyScore ?? 0))[0];
  const largestGap = [...companies].sort((a, b) => (b.growthGap ?? -999) - (a.growthGap ?? -999))[0];
  const highestSupply = [...companies].sort((a, b) => (b.supplyChainRiskScore ?? 0) - (a.supplyChainRiskScore ?? 0))[0];

  return (
    <section className="border border-[var(--border)] bg-[var(--surface)] p-4 md:p-5">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[var(--border)] pb-3">
        <div>
          <h2 className="font-display text-4xl tracking-[0.08em]">Company Comparison Report</h2>
          <p className="mt-1 font-mono text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
            {companies.length} companies compared
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {companies.map((company) => (
            <span
              key={company.symbol}
              className="inline-flex items-center gap-2 border border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] px-2 py-1 font-mono text-[11px] tracking-[0.08em]"
            >
              <span className="font-display text-base leading-none tracking-[0.08em]">{company.symbol}</span>
              <span className="text-[var(--muted)]">{company.name}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <article className="border border-[var(--border)] bg-[linear-gradient(140deg,rgba(0,232,122,0.12),rgba(255,255,255,0.02))] p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">Most Efficient</p>
          <p className="mt-1 font-display text-3xl leading-none">{highestEfficiency?.name ?? "N/A"}</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
            {highestEfficiency?.symbol ?? ""}
          </p>
        </article>
        <article className="border border-[var(--border)] bg-[linear-gradient(140deg,rgba(255,215,0,0.12),rgba(255,255,255,0.02))] p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">Largest Growth Gap</p>
          <p className="mt-1 font-display text-3xl leading-none">{largestGap?.name ?? "N/A"}</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
            {largestGap?.symbol ?? ""}
          </p>
        </article>
        <article className="border border-[var(--border)] bg-[linear-gradient(140deg,rgba(255,60,60,0.12),rgba(255,255,255,0.02))] p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">Highest Supply Risk</p>
          <p className="mt-1 font-display text-3xl leading-none">{highestSupply?.name ?? "N/A"}</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
            {highestSupply?.symbol ?? ""}
          </p>
        </article>
      </div>

      <div className="mt-4 overflow-auto border border-[var(--border)]">
        <table className="w-full min-w-[900px] border-collapse">
          <thead className="bg-[rgba(17,17,20,0.98)]">
            <tr className="border-b border-[var(--border)]">
              <th className="px-3 py-2 text-left font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
                Metric
              </th>
              {companies.map((company) => (
                <th
                  key={company.symbol}
                  className="px-3 py-2 text-left"
                >
                  <p className="font-display text-xl tracking-[0.08em] text-[var(--text)]">{company.name}</p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
                    {company.symbol}
                  </p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="font-mono text-xs">
            <tr className="border-b border-[var(--border)]">
              <td className="px-3 py-2 text-[var(--muted)]">Efficiency Rank</td>
              {companies.map((company) => (
                <td key={company.symbol} className="px-3 py-2">
                  #{ranks.get(company.symbol) ?? "-"}
                </td>
              ))}
            </tr>
            <tr className="border-b border-[var(--border)]">
              <td className="px-3 py-2 text-[var(--muted)]">Revenue / Employee</td>
              {companies.map((company) => (
                <td key={company.symbol} className="px-3 py-2">
                  {formatMoney(company.revenuePerEmployee)}
                </td>
              ))}
            </tr>
            <tr className="border-b border-[var(--border)]">
              <td className="px-3 py-2 text-[var(--muted)]">Industry Efficiency Ratio</td>
              {companies.map((company) => (
                <td key={company.symbol} className="px-3 py-2">
                  {(company.industryEfficiencyRatio ?? 1).toFixed(2)}x
                </td>
              ))}
            </tr>
            <tr className="border-b border-[var(--border)]">
              <td className="px-3 py-2 text-[var(--muted)]">Workforce Momentum</td>
              {companies.map((company) => (
                <td key={company.symbol} className="px-3 py-2">
                  {company.workforceMomentum}
                </td>
              ))}
            </tr>
            <tr className="border-b border-[var(--border)]">
              <td className="px-3 py-2 text-[var(--muted)]">Growth Gap</td>
              {companies.map((company) => (
                <td key={company.symbol} className="px-3 py-2">
                  {formatSignedPercent(company.growthGap)}
                </td>
              ))}
            </tr>
            <tr className="border-b border-[var(--border)]">
              <td className="px-3 py-2 text-[var(--muted)]">Supply Chain Risk</td>
              {companies.map((company) => (
                <td key={company.symbol} className="px-3 py-2">
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-1 ${pillTone(
                      company.supplyChainRiskScore ?? 0,
                      "risk"
                    )}`}
                  >
                    {formatScore(company.supplyChainRiskScore)} ({company.supplyChainRiskLabel})
                  </span>
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-3 py-2 text-[var(--muted)]">Operating Model</td>
              {companies.map((company) => (
                <td key={company.symbol} className="px-3 py-2">
                  {company.operatingModel ?? "N/A"}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-2">
        {companies.map((company) => {
          const signals = prospectingSignals(company);
          return (
            <article
              key={company.symbol}
              className="border border-[var(--border)] bg-[linear-gradient(165deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display text-2xl tracking-[0.08em]">{company.name}</p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">
                    {company.symbol} · {company.operatingModel ?? "N/A"}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] ${pillTone(
                    company.efficiencyScore ?? 0,
                    "positive"
                  )}`}
                >
                  Efficiency {formatScore(company.efficiencyScore)}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-xs">
                <div>
                  <p className="text-[var(--muted)]">Supply Exposure</p>
                  <p>China: {company.supplyExposure?.chinaManufacturing ?? "N/A"}</p>
                  <p>Taiwan: {company.supplyExposure?.taiwanSemiconductors ?? "N/A"}</p>
                  <p>Red Sea: {company.supplyExposure?.redSeaShipping ?? "N/A"}</p>
                  <p>Panama: {company.supplyExposure?.panamaCanal ?? "N/A"}</p>
                </div>
                <div>
                  <p className="text-[var(--muted)]">Tech Stack</p>
                  <p>Cloud: {company.techStack?.cloudProvider ?? "N/A"}</p>
                  <p>ERP: {company.techStack?.erp ?? "N/A"}</p>
                  <p>CRM: {company.techStack?.crm ?? "N/A"}</p>
                  <p>Analytics: {company.techStack?.analytics ?? "N/A"}</p>
                </div>
              </div>

              <div className="mt-3 border-t border-[var(--border)] pt-2 font-mono text-xs">
                <p className="text-[var(--muted)]">Prospecting Signals</p>
                {signals.length > 0 ? signals.map((signal) => <p key={signal}>- {signal}</p>) : <p>- none</p>}
                <p className="mt-1 text-[var(--muted)]">Possible Operational Pressures</p>
                {pressures(company).map((item) => (
                  <p key={item}>- {item}</p>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
