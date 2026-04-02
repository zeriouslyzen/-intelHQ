import { fetchFxSnapshot } from "@/lib/markets";
import { NextResponse } from "next/server";

export const revalidate = 120;

export async function GET() {
  const data = await fetchFxSnapshot();
  return NextResponse.json(data);
}
