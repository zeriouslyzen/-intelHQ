import { fetchConflictUpdates } from "@/lib/conflict";
import { getFeedsConfig } from "@/lib/configDb";
import { NextResponse } from "next/server";

export const revalidate = 120;

export async function GET() {
  try {
    const config = await getFeedsConfig();
    const data = await fetchConflictUpdates(config);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([]);
  }
}
