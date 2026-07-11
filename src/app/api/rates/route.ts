import { NextResponse } from "next/server";
import {
  getCachedRates,
  RATES_REVALIDATE_SECONDS,
} from "@/lib/rates";

export const runtime = "nodejs";

export async function GET() {
  const payload = await getCachedRates();

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": `public, s-maxage=${RATES_REVALIDATE_SECONDS}, stale-while-revalidate=86400`,
    },
  });
}
