import { fetchRadioStations } from "@/lib/radio";
import { NextResponse } from "next/server";

export const revalidate = 900;

export async function GET() {
  try {
    const data = await fetchRadioStations();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([]);
  }
}
