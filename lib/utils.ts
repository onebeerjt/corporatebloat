import type { Company } from "@/data/companies";

export function fmt(n: number): string {
  const abs = Math.abs(n);

  if (abs >= 1e12) {
    return `$${(n / 1e12).toFixed(1)}T`;
  }
  if (abs >= 1e9) {
    return `$${(n / 1e9).toFixed(1).replace(/\.0$/, "")}B`;
  }
  if (abs >= 1e6) {
    return `$${(n / 1e6).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (abs >= 1e3) {
    return `$${(n / 1e3).toFixed(0)}K`;
  }

  return `$${Math.round(n).toLocaleString()}`;
}

export function fmtEmp(n: number): string {
  const abs = Math.abs(n);

  if (abs >= 1e6) {
    return `${(n / 1e6).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (abs >= 1e4) {
    return `${Math.round(n / 1e3)}K`;
  }

  return Math.round(n).toLocaleString();
}

export function getBloatCategory(
  company: Company
): "lean" | "normal" | "bloated" | "finance" {
  if (company.sector === "Finance") {
    return "finance";
  }

  const revenuePerEmployee =
    company.revenuePerEmployee ?? company.revenue / company.employees;

  if (revenuePerEmployee > 1_000_000) {
    return "lean";
  }
  if (revenuePerEmployee > 300_000) {
    return "normal";
  }

  return "bloated";
}

export function getColor(bloat: string): string {
  switch (bloat) {
    case "lean":
      return "#00e87a";
    case "normal":
      return "#ffd700";
    case "bloated":
      return "#ff3c3c";
    case "finance":
      return "#3c8eff";
    default:
      return "#5a5a6a";
  }
}
