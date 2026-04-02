import { fetchGlobalNews } from "@/lib/news";
import { NextResponse } from "next/server";

export const revalidate = 120;

export async function GET() {
  const data = await fetchGlobalNews();
  return NextResponse.json(data);
}
