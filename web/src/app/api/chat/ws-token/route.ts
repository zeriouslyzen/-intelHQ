import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { createWsToken } from "@/lib/ws-token";

export const dynamic = "force-dynamic";

export async function GET() {
  const { session, response } = await requireAuth();
  if (response) return response;
  const userId = session!.user!.id;
  const token = createWsToken(userId);
  return NextResponse.json({ token });
}
