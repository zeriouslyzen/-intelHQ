import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const { session, response } = await requireAuth();
  if (response) return response;
  const userId = session!.user!.id;
  let profile = await db.chatProfile.findUnique({ where: { userId } });
  if (!profile) {
    profile = await db.chatProfile.create({
      data: { userId, status: "online" },
    });
  }
  const user = await db.user.findUnique({ where: { id: userId } });
  return NextResponse.json({
    screenName: user?.name || user?.displayName || user?.email || "",
    status: profile.status,
    awayMessage: profile.awayMessage ?? "",
  });
}

export async function PATCH(request: Request) {
  const { session, response } = await requireAuth();
  if (response) return response;
  const userId = session!.user!.id;
  const body = await request.json().catch(() => ({}));
  const { screenName, status, awayMessage } = body as {
    screenName?: string;
    status?: string;
    awayMessage?: string;
  };
  const updates: { status?: string; awayMessage?: string | null; updatedAt: Date } = { updatedAt: new Date() };
  if (status !== undefined && ["online", "away", "busy", "offline"].includes(status)) {
    updates.status = status;
  }
  if (awayMessage !== undefined) {
    updates.awayMessage = awayMessage === "" ? null : awayMessage;
  }
  await db.chatProfile.upsert({
    where: { userId },
    create: { userId, status: updates.status ?? "online", awayMessage: updates.awayMessage ?? null, updatedAt: new Date() },
    update: updates,
  });
  if (screenName !== undefined && typeof screenName === "string") {
    await db.user.update({
      where: { id: userId },
      data: { name: screenName.trim() || undefined, displayName: screenName.trim() || undefined },
    });
  }
  return NextResponse.json({ ok: true });
}
