import type { EfficiencyLabel, MomentumLabel, OperatingModel, RiskLabel, SortKey } from "@/types/company";

export const LABOR_HEAVY_SECTORS = new Set([
  "Retail",
  "Industrials",
  "Manufacturing",
  "Healthcare",
  "Consumer",
  "Telecom",
  "Aerospace",
  "Energy"
]);

export const KNOWLEDGE_INDUSTRIES = ["software", "cloud", "internet", "semiconductor", "fintech", "payments"];

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

export const MOMENTUM_COLORS: Record<MomentumLabel, string> = {
  "Lean scaling": "#00e87a",
  "Balanced growth": "#ffd700",
  "Headcount expansion ahead of revenue": "#ff3c3c"
};

export const OPERATING_MODEL_OPTIONS: OperatingModel[] = [
  "Knowledge Economy",
  "Retail & Consumer",
  "Asset Heavy",
  "Services"
];

export const MODE_LABELS = {
  efficiency: "Efficiency",
  workforce: "Workforce Momentum",
  supply: "Supply Chain Exposure"
} as const;

export const SORT_OPTIONS: { label: string; value: SortKey }[] = [
  { label: "Efficiency Score", value: "efficiencyScore" },
  { label: "Revenue / Employee", value: "revenuePerEmployee" },
  { label: "Workforce Growth Gap", value: "growthGap" },
  { label: "Supply Chain Risk", value: "supplyChainRiskScore" },
  { label: "Layoff Risk", value: "layoffRiskScore" },
  { label: "Company Name", value: "name" },
  { label: "Employees", value: "employees" },
  { label: "Revenue", value: "revenue" }
];

export const FMP_BASE_URL = "https://financialmodelingprep.com/stable";
