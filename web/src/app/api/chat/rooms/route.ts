import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const { session, response } = await requireAuth();
  if (response) return response;
  const userId = session!.user!.id;
  const participants = await db.threadParticipant.findMany({
    where: { userId },
    include: { thread: true },
  });
  const rooms = participants
    .filter((p) => p.thread.contextType === "room")
    .map((p) => ({ id: p.thread.id, name: p.thread.title }));
  return NextResponse.json(rooms);
}

export async function POST(request: Request) {
  const { session, response } = await requireAuth();
  if (response) return response;
  const userId = session!.user!.id;
  const body = await request.json().catch(() => ({}));
  const name = (body?.name as string)?.trim();
  if (!name) {
    return NextResponse.json({ error: "Room name required" }, { status: 400 });
  }
  const thread = await db.thread.create({
    data: {
      contextType: "room",
      title: name,
      createdById: userId,
    },
  });
  await db.threadParticipant.create({
    data: { threadId: thread.id, userId },
  });
  return NextResponse.json({ id: thread.id, name: thread.title });
}
