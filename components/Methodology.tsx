export default function Methodology() {
  return (
    <section className="border border-[var(--border)] bg-[var(--surface)] p-4 md:p-5">
      <h3 className="font-display text-3xl tracking-[0.08em]">Methodology</h3>
      <p className="mt-2 font-mono text-xs text-[var(--muted)]">
        Data comes from Financial Modeling Prep profiles when `FMP_API_KEY` is available, with a local
        mock company dataset as fallback.
      </p>
      <div className="mt-3 space-y-2 font-mono text-xs leading-relaxed text-[var(--text)]">
        <p>Revenue per employee = annual revenue / employees.</p>
        <p>Efficiency score is a percentile rank of revenue per employee across this dataset (0-100).</p>
        <p>
          Layoff risk is an inferred heuristic signal, not a forecast. It adds points for low relative
          efficiency, very large workforce with low efficiency, and labor-heavy sectors with low efficiency.
        </p>
        <p className="text-[var(--muted)]">
          This tool is an exploratory public-market visualization and not investment or employment advice.
        </p>
      </div>
    </section>
  );
}
