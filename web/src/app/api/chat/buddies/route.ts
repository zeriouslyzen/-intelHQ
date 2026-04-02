import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const { session, response } = await requireAuth();
  if (response) return response;
  const userId = session!.user!.id;
  const list = await db.buddyList.findMany({
    where: { userId },
    include: {
      buddy: {
        select: { id: true, name: true, displayName: true, email: true },
      },
    },
  });
  const profileIds = list.map((l) => l.buddyUserId);
  const profiles = await db.chatProfile.findMany({
    where: { userId: { in: profileIds } },
  });
  const profileByUserId = Object.fromEntries(profiles.map((p) => [p.userId, p]));
  const buddies = list.map((l) => ({
    id: l.buddy.id,
    screenName: l.buddy.name || l.buddy.displayName || l.buddy.email || "",
    status: (profileByUserId[l.buddy.id]?.status as "online" | "away" | "busy" | "offline") || "offline",
  }));
  return NextResponse.json(buddies);
}

export async function POST(request: Request) {
  const { session, response } = await requireAuth();
  if (response) return response;
  const userId = session!.user!.id;
  const body = await request.json().catch(() => ({}));
  const { buddyUserId, email } = body as { buddyUserId?: string; email?: string };
  let targetId = buddyUserId;
  if (!targetId && email) {
    const u = await db.user.findUnique({ where: { email: String(email).trim().toLowerCase() } });
    targetId = u?.id;
  }
  if (!targetId || targetId === userId) {
    return NextResponse.json({ error: "Valid buddy user or email required" }, { status: 400 });
  }
  await db.buddyList.upsert({
    where: { userId_buddyUserId: { userId, buddyUserId: targetId } },
    create: { userId, buddyUserId: targetId },
    update: {},
  });
  return NextResponse.json({ ok: true });
}
