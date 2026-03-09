import { NextResponse } from "next/server";

import { getCompanies } from "@/lib/data-source";
import type { CompanyApiResponse } from "@/types/company";

export async function GET() {
  try {
    const { companies, source } = await getCompanies();

    const payload: CompanyApiResponse = {
      companies,
      source,
      asOf: new Date().toISOString()
    };

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=21600"
      }
    });
  } catch {
    return NextResponse.json({ message: "Unable to load companies" }, { status: 500 });
  }
}
