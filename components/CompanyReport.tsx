import { prospectingSignals } from "@/lib/insightEngine";
import { formatMoney } from "@/lib/formatters";
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

export default function CompanyReport({ companies, generated }: CompanyReportProps) {
  if (!generated) {
    return null;
  }

  const efficiencyRank = [...companies].sort((a, b) => (b.revenuePerEmployee ?? 0) - (a.revenuePerEmployee ?? 0));

  return (
    <section className="border border-[var(--border)] bg-[var(--surface)] p-4 md:p-5">
      <h2 className="font-display text-4xl tracking-[0.08em]">Company Comparison Report</h2>

      <div className="mt-4 space-y-4 font-mono text-xs leading-relaxed">
        <div>
          <p className="uppercase tracking-[0.14em] text-[var(--muted)]">Companies Compared</p>
          {companies.map((company) => (
            <p key={company.symbol}>{company.name}</p>
          ))}
        </div>

        <div className="border-t border-[var(--border)] pt-3">
          <p className="uppercase tracking-[0.14em] text-[var(--muted)]">Efficiency Ranking</p>
          {efficiencyRank.map((company, index) => (
            <p key={company.symbol}>
              {index + 1}. {company.name}
            </p>
          ))}
        </div>

        <div className="border-t border-[var(--border)] pt-3">
          <p className="uppercase tracking-[0.14em] text-[var(--muted)]">Revenue Per Employee</p>
          {efficiencyRank.map((company) => (
            <p key={company.symbol}>
              {company.name}: {formatMoney(company.revenuePerEmployee)}
            </p>
          ))}
        </div>

        <div className="border-t border-[var(--border)] pt-3">
          <p className="uppercase tracking-[0.14em] text-[var(--muted)]">Industry Adjusted Efficiency</p>
          {efficiencyRank.map((company) => (
            <p key={company.symbol}>
              {company.name}: {(company.industryEfficiencyRatio ?? 1).toFixed(2)}x industry median
            </p>
          ))}
        </div>

        <div className="border-t border-[var(--border)] pt-3">
          <p className="uppercase tracking-[0.14em] text-[var(--muted)]">Workforce Momentum</p>
          {efficiencyRank.map((company) => (
            <p key={company.symbol}>
              {company.name}: {company.workforceMomentum}
            </p>
          ))}
        </div>

        <div className="border-t border-[var(--border)] pt-3">
          <p className="uppercase tracking-[0.14em] text-[var(--muted)]">Supply Chain Exposure</p>
          {efficiencyRank.map((company) => (
            <div key={company.symbol} className="mb-2">
              <p>{company.name}</p>
              <p>- China manufacturing: {company.supplyExposure?.chinaManufacturing ?? "N/A"}</p>
              <p>- Taiwan semiconductors: {company.supplyExposure?.taiwanSemiconductors ?? "N/A"}</p>
              <p>- Red Sea shipping: {company.supplyExposure?.redSeaShipping ?? "N/A"}</p>
              <p>- Panama Canal: {company.supplyExposure?.panamaCanal ?? "N/A"}</p>
              <p>- European energy: {company.supplyExposure?.europeanEnergy ?? "N/A"}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-[var(--border)] pt-3">
          <p className="uppercase tracking-[0.14em] text-[var(--muted)]">Tech Stack Signals</p>
          {efficiencyRank.map((company) => (
            <p key={company.symbol}>
              {company.name}: ERP {company.techStack?.erp ?? "N/A"}, Cloud {company.techStack?.cloudProvider ?? "N/A"},
              Analytics {company.techStack?.analytics ?? "N/A"}
            </p>
          ))}
        </div>

        <div className="border-t border-[var(--border)] pt-3">
          <p className="uppercase tracking-[0.14em] text-[var(--muted)]">Prospecting Signals</p>
          {efficiencyRank.map((company) => {
            const signals = prospectingSignals(company);
            return (
              <div key={company.symbol} className="mb-3">
                <p>{company.name}</p>
                {signals.length > 0 ? (
                  signals.map((signal) => <p key={signal}>- {signal}</p>)
                ) : (
                  <p>- no immediate pressure flags</p>
                )}
                <p className="text-[var(--muted)]">Possible operational pressures:</p>
                {pressures(company).map((item) => (
                  <p key={item}>- {item}</p>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
