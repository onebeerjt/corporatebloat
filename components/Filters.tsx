import { OPERATING_MODEL_OPTIONS, SORT_OPTIONS } from "@/lib/constants";
import type { OperatingModel, SortKey } from "@/types/company";

type FiltersProps = {
  sectors: string[];
  industries: string[];
  sector: string;
  industry: string;
  sortKey: SortKey;
  operatingModel: OperatingModel | "ALL";
  knowledgeOnly: boolean;
  onSectorChange: (sector: string) => void;
  onIndustryChange: (industry: string) => void;
  onSortChange: (sort: SortKey) => void;
  onOperatingModelChange: (model: OperatingModel | "ALL") => void;
  onKnowledgeOnlyChange: (value: boolean) => void;
};

export default function Filters({
  sectors,
  industries,
  sector,
  industry,
  sortKey,
  operatingModel,
  knowledgeOnly,
  onSectorChange,
  onIndustryChange,
  onSortChange,
  onOperatingModelChange,
  onKnowledgeOnlyChange
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
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">Industry</span>
        <select
          value={industry}
          onChange={(event) => onIndustryChange(event.target.value)}
          className="border border-[var(--border)] bg-[var(--bg)] px-2 py-1 font-mono text-xs uppercase tracking-[0.08em] text-[var(--text)] outline-none"
        >
          {industries.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">Operating Model</span>
        <select
          value={operatingModel}
          onChange={(event) => onOperatingModelChange(event.target.value as OperatingModel | "ALL")}
          className="border border-[var(--border)] bg-[var(--bg)] px-2 py-1 font-mono text-xs uppercase tracking-[0.08em] text-[var(--text)] outline-none"
        >
          <option value="ALL">All</option>
          {OPERATING_MODEL_OPTIONS.map((item) => (
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

      <div className="inline-flex items-center gap-1 border border-[var(--border)] bg-[var(--bg)] p-1">
        <button
          type="button"
          onClick={() => onKnowledgeOnlyChange(false)}
          className={`px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] ${
            !knowledgeOnly ? "bg-[var(--accent)] text-black" : "text-[var(--muted)]"
          }`}
        >
          All Companies
        </button>
        <button
          type="button"
          onClick={() => onKnowledgeOnlyChange(true)}
          className={`px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] ${
            knowledgeOnly ? "bg-[var(--accent)] text-black" : "text-[var(--muted)]"
          }`}
        >
          Knowledge Economy
        </button>
      </div>
    </>
  );
}
