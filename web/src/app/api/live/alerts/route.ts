import { fetchAllAlerts } from "@/lib/alerts";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const data = await fetchAllAlerts();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([]);
  }
}
