export type RiskLabel = "Low" | "Medium" | "High";
export type EfficiencyLabel = "Lean" | "Normal" | "Bloated";

export type Mode = "efficiency" | "risk";

export type SortKey =
  | "layoffRiskScore"
  | "efficiencyScore"
  | "revenuePerEmployee"
  | "name"
  | "employees"
  | "revenue";

export interface Company {
  symbol: string;
  name: string;
  sector: string;
  industry?: string;
  revenue?: number;
  marketCap?: number;
  employees?: number;
  price?: number;
  country?: string;
  website?: string;
  description?: string;

  revenuePerEmployee?: number;
  efficiencyScore?: number;
  layoffRiskScore?: number;
  layoffRiskLabel?: RiskLabel;
  efficiencyLabel?: EfficiencyLabel;
}

export interface CompanyApiResponse {
  companies: Company[];
  source: "fmp" | "mock";
  asOf: string;
}
