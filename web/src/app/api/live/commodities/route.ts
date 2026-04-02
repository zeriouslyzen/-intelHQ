import { fetchCommodities } from "@/lib/markets";
import { NextResponse } from "next/server";

export const revalidate = 60;

export async function GET() {
  const data = await fetchCommodities();
  return NextResponse.json(data);
}
