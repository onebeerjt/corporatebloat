import { LABOR_HEAVY_SECTORS } from "@/lib/constants";
import type { Company, EfficiencyLabel, RiskLabel } from "@/types/company";

function safeRevenuePerEmployee(company: Company): number | undefined {
  const revenue = company.revenue;
  const employees = company.employees;
  if (!revenue || !employees || employees <= 0) {
    return undefined;
  }
  return revenue / employees;
}

function percentileRank(value: number, sorted: number[]): number {
  if (sorted.length === 0) {
    return 0.5;
  }

  let index = 0;
  while (index < sorted.length && sorted[index] <= value) {
    index += 1;
  }

  return index / sorted.length;
}

function getEfficiencyLabel(percentile: number): EfficiencyLabel {
  if (percentile >= 0.67) {
    return "Lean";
  }
  if (percentile >= 0.34) {
    return "Normal";
  }
  return "Bloated";
}

function getRiskLabel(points: number): RiskLabel {
  if (points <= 1) {
    return "Low";
  }
  if (points <= 3) {
    return "Medium";
  }
  return "High";
}

function normalizeRisk(points: number): number {
  return Math.max(0, Math.min(100, points * 20));
}

export function scoreCompanies(input: Company[]): Company[] {
  const revenuePerEmployeeValues = input
    .map((company) => safeRevenuePerEmployee(company))
    .filter((value): value is number => value !== undefined)
    .sort((a, b) => a - b);

  const employeeValues = input
    .map((company) => company.employees ?? 0)
    .filter((value) => value > 0)
    .sort((a, b) => a - b);

  return input.map((company) => {
    const revenuePerEmployee = safeRevenuePerEmployee(company);

    if (!revenuePerEmployee) {
      return {
        ...company,
        revenuePerEmployee: undefined,
        efficiencyScore: 0,
        efficiencyLabel: "Bloated",
        layoffRiskScore: 70,
        layoffRiskLabel: "High"
      };
    }

    const efficiencyPercentile = percentileRank(revenuePerEmployee, revenuePerEmployeeValues);
    const efficiencyScore = efficiencyPercentile * 100;
    const efficiencyLabel = getEfficiencyLabel(efficiencyPercentile);

    let riskPoints = 0;

    if (efficiencyPercentile <= 0.3) {
      riskPoints += 2;
    }

    const employeePercentile = percentileRank(company.employees ?? 0, employeeValues);
    if (efficiencyPercentile <= 0.3 && employeePercentile >= 0.7) {
      riskPoints += 1;
    }

    if (efficiencyPercentile <= 0.3 && LABOR_HEAVY_SECTORS.has(company.sector)) {
      riskPoints += 1;
    }

    if (efficiencyPercentile <= 0.15) {
      riskPoints += 1;
    }

    return {
      ...company,
      revenuePerEmployee,
      efficiencyScore,
      efficiencyLabel,
      layoffRiskScore: normalizeRisk(riskPoints),
      layoffRiskLabel: getRiskLabel(riskPoints)
    };
  });
}
