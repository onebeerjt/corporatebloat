import type { Company } from "@/types/company";

export function companyInsights(company: Company): string[] {
  const insights: string[] = [];

  if ((company.industryEfficiencyRatio ?? 1) < 1 && (company.growthGap ?? 0) > 5) {
    insights.push("Workforce expansion ahead of revenue may indicate operational inefficiencies.");
  }

  if ((company.industryEfficiencyRatio ?? 1) > 1.2 && (company.growthGap ?? 0) < 0) {
    insights.push("Strong operating leverage. Revenue scaling faster than workforce.");
  }

  if ((company.supplyChainRiskScore ?? 0) >= 60) {
    insights.push("Supply chain concentration risk may pressure margins and delivery reliability.");
  }

  if ((company.efficiencyScore ?? 0) < 35) {
    insights.push("Low relative efficiency versus peers suggests room for operating model improvements.");
  }

  if (insights.length === 0) {
    insights.push("No major pressure signal from the current heuristic set.");
  }

  return insights;
}

export function prospectingSignals(company: Company): string[] {
  const signals: string[] = [];

  if ((company.industryEfficiencyRatio ?? 1) < 1) {
    signals.push("lower relative efficiency");
  }

  if ((company.growthGap ?? 0) > 5) {
    signals.push("expanding workforce ahead of revenue");
  }

  if ((company.supplyChainRiskScore ?? 0) >= 60) {
    signals.push("large supply chain concentration risk");
  }

  if ((company.layoffRiskScore ?? 0) >= 60) {
    signals.push("elevated layoff risk proxy");
  }

  return signals;
}
