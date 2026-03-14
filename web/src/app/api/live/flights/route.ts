import { fetchFlightStates } from "@/lib/flights";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const data = await fetchFlightStates();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([]);
  }
}
