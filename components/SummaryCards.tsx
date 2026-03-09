import { formatEmployees, formatMoney } from "@/lib/formatters";
import type { Company, Mode } from "@/types/company";

type SummaryCardsProps = {
  mode: Mode;
  companies: Company[];
};

function averageRevenuePerEmployee(companies: Company[]): number {
  const values = companies
    .map((company) => company.revenuePerEmployee)
    .filter((value): value is number => value !== undefined);

  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export default function SummaryCards({ mode, companies }: SummaryCardsProps) {
  const totalEmployees = companies.reduce((sum, company) => sum + (company.employees ?? 0), 0);
  const avgRpe = averageRevenuePerEmployee(companies);

  const mostEfficient = [...companies]
    .filter((company) => company.efficiencyScore !== undefined)
    .sort((a, b) => (b.efficiencyScore ?? 0) - (a.efficiencyScore ?? 0))[0];

  const highestRisk = [...companies]
    .filter((company) => company.layoffRiskScore !== undefined)
    .sort((a, b) => (b.layoffRiskScore ?? 0) - (a.layoffRiskScore ?? 0))[0];

  const highRisk = companies.filter((company) => company.layoffRiskLabel === "High");
  const highRiskEmployees = highRisk.reduce((sum, company) => sum + (company.employees ?? 0), 0);
  const bloatedCount = companies.filter((company) => company.efficiencyLabel === "Bloated").length;

  const cards =
    mode === "efficiency"
      ? [
          { label: "Total Employees Covered", value: formatEmployees(totalEmployees), accent: false },
          { label: "Avg Revenue / Employee", value: formatMoney(avgRpe), accent: false },
          { label: "Most Efficient Ticker", value: mostEfficient?.symbol ?? "N/A", accent: true },
          { label: "Companies Flagged Bloated", value: String(bloatedCount), accent: true }
        ]
      : [
          { label: "Companies High Risk", value: String(highRisk.length), accent: true },
          { label: "Employees in High Risk Group", value: formatEmployees(highRiskEmployees), accent: false },
          { label: "Highest Risk Ticker", value: highestRisk?.symbol ?? "N/A", accent: true },
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
