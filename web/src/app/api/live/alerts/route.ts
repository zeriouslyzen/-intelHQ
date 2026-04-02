import { fetchAllAlerts } from "@/lib/alerts";
import { NextResponse } from "next/server";

export const revalidate = 300;

export async function GET() {
  try {
    const data = await fetchAllAlerts();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([]);
  }
}
