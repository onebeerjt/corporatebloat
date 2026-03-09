import type { Mode } from "@/types/company";

type ModeToggleProps = {
  mode: Mode;
  onChange: (nextMode: Mode) => void;
};

export default function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="inline-flex items-center gap-1 border border-[var(--border)] bg-[var(--bg)] p-1">
      <button
        type="button"
        onClick={() => onChange("efficiency")}
        className={`px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] transition ${
          mode === "efficiency" ? "bg-[var(--accent)] text-black" : "text-[var(--muted)] hover:text-[var(--text)]"
        }`}
      >
        Efficiency Mode
      </button>
      <button
        type="button"
        onClick={() => onChange("risk")}
        className={`px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] transition ${
          mode === "risk" ? "bg-[var(--accent)] text-black" : "text-[var(--muted)] hover:text-[var(--text)]"
        }`}
      >
        Layoff Risk Mode
      </button>
    </div>
  );
}
