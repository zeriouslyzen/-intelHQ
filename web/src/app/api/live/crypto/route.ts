import { fetchCryptoQuotes } from "@/lib/cryptoQuotes";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const data = await fetchCryptoQuotes();
  return NextResponse.json(data);
}
