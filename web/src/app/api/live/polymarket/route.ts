import { fetchPolymarketTopMarkets } from "@/lib/polymarket";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const payload = await fetchPolymarketTopMarkets(12);
  return NextResponse.json(payload);
}
