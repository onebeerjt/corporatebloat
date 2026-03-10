type SearchBarProps = {
  value: string;
  onChange: (nextValue: string) => void;
};

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <label className="flex items-center gap-2">
      <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">Search</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search companies"
        className="w-44 border border-[var(--border)] bg-[var(--bg)] px-2 py-1 font-mono text-xs uppercase tracking-[0.08em] text-[var(--text)] outline-none md:w-56"
      />
    </label>
  );
}
