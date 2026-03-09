# Corporate Bloat Index

Corporate Bloat Index is a Next.js finance-style dashboard that combines two exploratory views:

- Corporate Efficiency Index
- Layoff Risk Radar

The app keeps an interactive D3 bubble chart as the hero and adds mode-aware summaries, a sortable leaderboard, and a company detail drawer.

## Features

- Efficiency mode with percentile-based efficiency scores from revenue per employee
- Layoff Risk mode with transparent heuristic risk scoring (not a prediction model)
- Bubble chart with zoom + pan, hover tooltip, and selected bubble highlight
- Leaderboard with click-to-select row/bubble sync
- Right-side company detail drawer with score explanations
- Sector filtering, search, and sort controls
- API route with live-data attempt + mock fallback

## Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- D3.js (bubble visualization)
- Vercel-friendly server route handlers

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

```bash
FMP_API_KEY=your_key_here
```

- If `FMP_API_KEY` is set, `/api/companies` attempts to fetch company profiles from Financial Modeling Prep.
- If API access fails or the key is missing, the app automatically falls back to `/data/mock-companies.json`.

## Data Source Options

Primary:
- Financial Modeling Prep profile endpoint via `lib/data-source.ts`

Fallback:
- Local curated mock dataset (`/data/mock-companies.json`)

## Methodology Summary

- Revenue per employee = revenue / employees
- Efficiency score = percentile rank of revenue per employee, normalized to 0-100
- Efficiency labels:
  - Lean: top tier
  - Normal: middle tier
  - Bloated: lower tier
- Layoff risk score is a heuristic based on:
  - bottom revenue/employee percentile
  - workforce scale combined with low efficiency
  - labor-heavy sector combined with low efficiency
  - extra penalty for bottom 15% efficiency
- Risk labels:
  - Low: 0-1 points
  - Medium: 2-3 points
  - High: 4+ points

Important:
- Layoff risk is an inferred signal/proxy from public fundamentals.
- It is not investment advice, employment advice, or a forecast model.

## Deployment

- Import this repo into Vercel and deploy with default settings, or:

```bash
vercel deploy
```
