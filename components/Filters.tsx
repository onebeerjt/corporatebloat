import type { SortKey } from "@/types/company";

type FiltersProps = {
  sectors: string[];
  sector: string;
  sortKey: SortKey;
  onSectorChange: (sector: string) => void;
  onSortChange: (sort: SortKey) => void;
};

const SORT_OPTIONS: { label: string; value: SortKey }[] = [
  { label: "Layoff Risk", value: "layoffRiskScore" },
  { label: "Efficiency Score", value: "efficiencyScore" },
  { label: "Revenue / Employee", value: "revenuePerEmployee" },
  { label: "Company", value: "name" },
  { label: "Employees", value: "employees" },
  { label: "Revenue", value: "revenue" }
];

export default function Filters({
  sectors,
  sector,
  sortKey,
  onSectorChange,
  onSortChange
}: FiltersProps) {
  return (
    <>
      <label className="flex items-center gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">Sector</span>
        <select
          value={sector}
          onChange={(event) => onSectorChange(event.target.value)}
          className="border border-[var(--border)] bg-[var(--bg)] px-2 py-1 font-mono text-xs uppercase tracking-[0.08em] text-[var(--text)] outline-none"
        >
          {sectors.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">Sort</span>
        <select
          value={sortKey}
          onChange={(event) => onSortChange(event.target.value as SortKey)}
          className="border border-[var(--border)] bg-[var(--bg)] px-2 py-1 font-mono text-xs uppercase tracking-[0.08em] text-[var(--text)] outline-none"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}
