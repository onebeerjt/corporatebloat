import type { Company } from "@/types/company";

type CompanyReportBuilderProps = {
  selectedCompanies: Company[];
  onGenerate: () => void;
  onClear: () => void;
  onRemove: (symbol: string) => void;
};

export default function CompanyReportBuilder({
  selectedCompanies,
  onGenerate,
  onClear,
  onRemove
}: CompanyReportBuilderProps) {
  return (
    <section className="fixed bottom-5 left-5 z-[1050] w-[320px] border border-[var(--border)] bg-[rgba(17,17,20,0.97)] p-3 shadow-xl backdrop-blur">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-2xl tracking-[0.08em]">Selected Companies ({selectedCompanies.length})</h3>
      </div>

      <div className="mt-2 max-h-40 space-y-1 overflow-auto font-mono text-xs">
        {selectedCompanies.length === 0 ? (
          <p className="text-[var(--muted)]">No companies selected yet.</p>
        ) : (
          selectedCompanies.map((company) => (
            <div key={company.symbol} className="flex items-center justify-between border-b border-[var(--border)] pb-1">
              <span>{company.name}</span>
              <button
                type="button"
                onClick={() => onRemove(company.symbol)}
                className="text-[10px] uppercase tracking-[0.12em] text-[var(--muted)] hover:text-[var(--text)]"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onGenerate}
          disabled={selectedCompanies.length < 2}
          className="flex-1 border border-[var(--accent)] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black disabled:border-[var(--border)] disabled:text-[var(--muted)]"
        >
          Generate Report
        </button>
        <button
          type="button"
          onClick={onClear}
          className="border border-[var(--border)] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--muted)] hover:text-[var(--text)]"
        >
          Clear
        </button>
      </div>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">Max 10 companies</p>
    </section>
  );
}
