import type { EfficiencyLabel, RiskLabel, SortKey } from "@/types/company";

export const LABOR_HEAVY_SECTORS = new Set([
  "Retail",
  "Industrials",
  "Manufacturing",
  "Healthcare",
  "Consumer",
  "Telecom",
  "Aerospace"
]);

export const EFFICIENCY_COLORS: Record<EfficiencyLabel, string> = {
  Lean: "#00e87a",
  Normal: "#ffd700",
  Bloated: "#ff3c3c"
};

export const RISK_COLORS: Record<RiskLabel, string> = {
  Low: "#00e87a",
  Medium: "#ffd700",
  High: "#ff3c3c"
};

export const MODE_LABELS = {
  efficiency: "Efficiency Mode",
  risk: "Layoff Risk Mode"
} as const;

export const SORT_OPTIONS: { label: string; value: SortKey }[] = [
  { label: "Layoff Risk Score", value: "layoffRiskScore" },
  { label: "Efficiency Score", value: "efficiencyScore" },
  { label: "Revenue / Employee", value: "revenuePerEmployee" },
  { label: "Company Name", value: "name" },
  { label: "Employees", value: "employees" },
  { label: "Revenue", value: "revenue" }
];

export const FMP_BASE_URL = "https://financialmodelingprep.com/stable";
