import { formatEmployees, formatMoney, formatSignedPercent } from "@/lib/formatters";
import type { Company, Mode } from "@/types/company";

type SummaryCardsProps = {
  mode: Mode;
  companies: Company[];
};

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export default function SummaryCards({ mode, companies }: SummaryCardsProps) {
  const totalEmployees = companies.reduce((sum, company) => sum + (company.employees ?? 0), 0);
  const avgRpe = average(
    companies
      .map((company) => company.revenuePerEmployee)
      .filter((value): value is number => value !== undefined)
  );

  const topEfficiency = [...companies].sort((a, b) => (b.efficiencyScore ?? 0) - (a.efficiencyScore ?? 0))[0];
  const highSupply = companies.filter((company) => company.supplyChainRiskLabel === "High");
  const avgGrowthGap = average(
    companies.map((company) => company.growthGap).filter((value): value is number => value !== undefined)
  );
  const worstGrowthGap = [...companies].sort((a, b) => (b.growthGap ?? -999) - (a.growthGap ?? -999))[0];
  const highestSupply = [...companies].sort(
    (a, b) => (b.supplyChainRiskScore ?? 0) - (a.supplyChainRiskScore ?? 0)
  )[0];

  const cards =
    mode === "efficiency"
      ? [
          { label: "Total Employees Covered", value: formatEmployees(totalEmployees), accent: false },
          { label: "Avg Revenue / Employee", value: formatMoney(avgRpe), accent: false },
          { label: "Most Efficient Ticker", value: topEfficiency?.symbol ?? "N/A", accent: true },
          {
            label: "Companies Below Industry Median",
            value: String(companies.filter((item) => (item.industryEfficiencyRatio ?? 1) < 1).length),
            accent: true
          }
        ]
      : mode === "workforce"
        ? [
            {
              label: "Headcount Ahead of Revenue",
              value: String(companies.filter((item) => (item.growthGap ?? 0) > 5).length),
              accent: true
            },
            { label: "Average Growth Gap", value: formatSignedPercent(avgGrowthGap), accent: false },
            { label: "Largest Growth Gap", value: worstGrowthGap?.symbol ?? "N/A", accent: true },
            { label: "Avg Revenue / Employee", value: formatMoney(avgRpe), accent: false }
          ]
        : [
            { label: "Companies High Supply Risk", value: String(highSupply.length), accent: true },
            {
              label: "Employees in High Risk Group",
              value: formatEmployees(highSupply.reduce((sum, item) => sum + (item.employees ?? 0), 0)),
              accent: false
            },
            { label: "Highest Exposure Ticker", value: highestSupply?.symbol ?? "N/A", accent: true },
            { label: "Avg Revenue / Employee", value: formatMoney(avgRpe), accent: false }
          ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {cards.map((card) => (
        <article key={card.label} className="border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">{card.label}</p>
          <p
            className={`mt-2 font-display text-4xl leading-none ${
              card.accent ? "text-[var(--accent)]" : "text-[var(--text)]"
            }`}
          >
            {card.value}
          </p>
        </article>
      ))}
    </div>
  );
}
