# Corporate Operations Explorer

Corporate Operations Explorer is a Next.js dashboard for comparing public companies on operational efficiency, workforce momentum, and supply-chain exposure.

It preserves the Bloomberg-style dark UI and interactive bubble chart while adding:
- report-builder workflows
- deterministic comparison reports
- operating model and knowledge-economy filters
- prospecting signals from simple transparent rules

## Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- D3.js (bubble visualization)

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

```bash
FMP_API_KEY=your_key_here
```

- If `FMP_API_KEY` is present, `/api/companies` attempts Financial Modeling Prep profile data.
- If live fetch fails or key is missing, app uses local `/data/companies.json`.

## Data Model Highlights

Each company includes:
- `symbol`, `name`, `sector`, `industry`, `operatingModel`
- `revenue`, `employees`, `marketCap`
- `revenueGrowth`, `headcountGrowth`
- `supplyExposure` tags
- `techStack` placeholders

Derived metrics:
- `revenuePerEmployee`
- `efficiencyScore` + label
- `growthGap` + workforce momentum label
- `supplyChainRiskScore` + label
- `layoffRiskScore` + label
- `industryEfficiencyRatio`

## Product Features

- Bubble chart with zoom/pan, tooltip, selection, and `+ Add to Report`
- Leaderboard with `+ Add to Report` per row
- Report builder (up to 10 companies)
- Generated deterministic comparison report
- Filters: sector, industry, operating model, knowledge-economy quick toggle, search
- Modes: Efficiency, Workforce Momentum, Supply Exposure
- Company drawer with supply tags, tech stack, and prospecting insight rules

## Methodology Summary

- Revenue per employee = revenue / employees
- Efficiency score = percentile rank within dataset
- Workforce momentum = `headcountGrowth - revenueGrowth`
  - `<= -5`: Lean scaling
  - `-5 to +5`: Balanced growth
  - `> +5`: Headcount expansion ahead of revenue
- Supply chain risk score = weighted level mapping across:
  - China manufacturing
  - Taiwan semiconductors
  - Red Sea shipping
  - Panama Canal
  - European energy
- Prospecting signals are deterministic if/then rules (no ML)

## Important Disclaimer

Layoff risk and prospecting outputs are heuristic operational signals from public-style fundamentals and mock exposure tags. They are not forecasts, employment advice, or investment advice.

## Deploy

- Connect the repo to Vercel and deploy with defaults, or:

```bash
vercel deploy
```
