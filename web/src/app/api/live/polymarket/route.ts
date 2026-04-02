import { fetchPolymarketTopMarkets } from "@/lib/polymarket";
import { NextResponse } from "next/server";

export const revalidate = 60;

export async function GET() {
  const payload = await fetchPolymarketTopMarkets(12);
  return NextResponse.json(payload);
}
