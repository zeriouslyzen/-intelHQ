import { fetchCryptoQuotes } from "@/lib/cryptoQuotes";
import { NextResponse } from "next/server";

export const revalidate = 45;

export async function GET() {
  const data = await fetchCryptoQuotes();
  return NextResponse.json(data);
}
