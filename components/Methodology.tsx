export default function Methodology() {
  return (
    <section className="border border-[var(--border)] bg-[var(--surface)] p-4 md:p-5">
      <h3 className="font-display text-3xl tracking-[0.08em]">Methodology</h3>
      <div className="mt-3 space-y-2 font-mono text-xs leading-relaxed text-[var(--text)]">
        <p>Revenue per employee = annual revenue / employees.</p>
        <p>Efficiency score = percentile rank of revenue per employee across this dataset (0-100).</p>
        <p>Workforce momentum = headcount growth minus revenue growth (growth gap).</p>
        <p>
          Supply chain risk score is a weighted rollup of mock exposure tags (China manufacturing, Taiwan semiconductors,
          Red Sea shipping, Panama Canal, European energy).
        </p>
        <p>
          Layoff risk is an inferred heuristic signal, not a forecast. Prospecting signals are deterministic rules from
          these operational metrics.
        </p>
        <p className="text-[var(--muted)]">
          This is an exploratory public-market operating model tool, not investment or employment advice.
        </p>
      </div>
    </section>
  );
}
