import { fetchVesselPositions } from "@/lib/vessels";
import { NextResponse } from "next/server";

export const revalidate = 60;

export async function GET() {
  try {
    const data = await fetchVesselPositions();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([]);
  }
}
