export type RiskLabel = "Low" | "Medium" | "High";
export type EfficiencyLabel = "Lean" | "Normal" | "Bloated";
export type MomentumLabel = "Lean scaling" | "Balanced growth" | "Headcount expansion ahead of revenue";
export type SupplyLevel = "Low" | "Medium" | "High" | "Very High";

export type OperatingModel = "Knowledge Economy" | "Retail & Consumer" | "Asset Heavy" | "Services";

export type Mode = "efficiency" | "workforce" | "supply";

export type SortKey =
  | "layoffRiskScore"
  | "efficiencyScore"
  | "revenuePerEmployee"
  | "name"
  | "employees"
  | "revenue"
  | "growthGap"
  | "supplyChainRiskScore";

export type SupplyExposure = {
  chinaManufacturing: SupplyLevel;
  taiwanSemiconductors: SupplyLevel;
  redSeaShipping: SupplyLevel;
  panamaCanal: SupplyLevel;
  europeanEnergy: SupplyLevel;
};

export type TechStack = {
  cloudProvider?: string;
  erp?: string;
  crm?: string;
  analytics?: string;
};

export interface Company {
  symbol: string;
  name: string;
  sector: string;
  industry?: string;
  operatingModel?: OperatingModel;
  revenue?: number;
  marketCap?: number;
  employees?: number;
  price?: number;
  country?: string;
  website?: string;
  description?: string;
  revenueGrowth?: number;
  headcountGrowth?: number;
  supplyExposure?: SupplyExposure;
  techStack?: TechStack;

  revenuePerEmployee?: number;
  efficiencyScore?: number;
  layoffRiskScore?: number;
  layoffRiskLabel?: RiskLabel;
  efficiencyLabel?: EfficiencyLabel;
  growthGap?: number;
  workforceMomentum?: MomentumLabel;
  supplyChainRiskScore?: number;
  supplyChainRiskLabel?: RiskLabel;
  industryEfficiencyRatio?: number;
}

export interface CompanyApiResponse {
  companies: Company[];
  source: "fmp" | "mock";
  asOf: string;
}
