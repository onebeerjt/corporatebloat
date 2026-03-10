import { KNOWLEDGE_INDUSTRIES } from "@/lib/constants";
import type { Company, OperatingModel } from "@/types/company";

function containsAny(text: string, keywords: string[]): boolean {
  const normalized = text.toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword));
}

export function inferOperatingModel(company: Company): OperatingModel {
  const industry = `${company.industry ?? ""} ${company.sector}`.toLowerCase();

  if (containsAny(industry, KNOWLEDGE_INDUSTRIES)) {
    return "Knowledge Economy";
  }

  if (containsAny(industry, ["retail", "consumer", "restaurant", "apparel", "food"])) {
    return "Retail & Consumer";
  }

  if (containsAny(industry, ["consult", "outsourcing", "services", "it services"])) {
    return "Services";
  }

  return "Asset Heavy";
}

export function isKnowledgeEconomy(company: Company): boolean {
  if (company.operatingModel === "Knowledge Economy") {
    return true;
  }

  const industry = `${company.industry ?? ""} ${company.sector}`.toLowerCase();
  return containsAny(industry, KNOWLEDGE_INDUSTRIES);
}
