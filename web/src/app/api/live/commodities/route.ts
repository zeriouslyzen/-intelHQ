import { fetchCommodities } from "@/lib/markets";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const data = await fetchCommodities();
  return NextResponse.json(data);
}
