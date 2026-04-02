import { fetchIndexQuotes } from "@/lib/markets";
import { NextResponse } from "next/server";

/** CDN / Data Cache; matches Yahoo poll cadence in lib. */
export const revalidate = 30;

export async function GET() {
  const data = await fetchIndexQuotes();
  return NextResponse.json(data);
}
