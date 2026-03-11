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
              className="border border-[var(--border)] bg-[var(--bg)] px-2 py-1 font-mono text-[11px] uppercase tracking-[0.12em]"
            >
              {company.symbol}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <article className="border border-[var(--border)] bg-[var(--bg)] p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">Most Efficient</p>
          <p className="mt-1 font-display text-3xl leading-none">{highestEfficiency?.symbol ?? "N/A"}</p>
        </article>
        <article className="border border-[var(--border)] bg-[var(--bg)] p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">Largest Growth Gap</p>
          <p className="mt-1 font-display text-3xl leading-none">{largestGap?.symbol ?? "N/A"}</p>
        </article>
        <article className="border border-[var(--border)] bg-[var(--bg)] p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">Highest Supply Risk</p>
          <p className="mt-1 font-display text-3xl leading-none">{highestSupply?.symbol ?? "N/A"}</p>
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
                  className="px-3 py-2 text-left font-display text-xl tracking-[0.08em] text-[var(--text)]"
                >
                  {company.symbol}
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
                  {formatScore(company.supplyChainRiskScore)} ({company.supplyChainRiskLabel})
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
            <article key={company.symbol} className="border border-[var(--border)] bg-[var(--bg)] p-3">
              <div className="flex items-center justify-between">
                <p className="font-display text-2xl tracking-[0.08em]">{company.symbol}</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">{company.name}</p>
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
