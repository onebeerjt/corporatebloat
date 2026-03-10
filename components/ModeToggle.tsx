import type { Mode } from "@/types/company";

type ModeToggleProps = {
  mode: Mode;
  onChange: (nextMode: Mode) => void;
};

export default function ModeToggle({ mode, onChange }: ModeToggleProps) {
  const modes: { key: Mode; label: string }[] = [
    { key: "efficiency", label: "Efficiency" },
    { key: "workforce", label: "Workforce Momentum" },
    { key: "supply", label: "Supply Exposure" }
  ];

  return (
    <div className="inline-flex items-center gap-1 border border-[var(--border)] bg-[var(--bg)] p-1">
      {modes.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onChange(item.key)}
          className={`px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] transition ${
            mode === item.key ? "bg-[var(--accent)] text-black" : "text-[var(--muted)] hover:text-[var(--text)]"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
