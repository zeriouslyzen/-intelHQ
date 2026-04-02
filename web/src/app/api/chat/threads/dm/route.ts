import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { session, response } = await requireAuth();
  if (response) return response;
  const userId = session!.user!.id;
  const { searchParams } = new URL(request.url);
  const withUserId = searchParams.get("withUserId");
  if (!withUserId || withUserId === userId) {
    return NextResponse.json({ error: "withUserId required and must differ from current user" }, { status: 400 });
  }
  const candidates = await db.thread.findMany({
    where: {
      contextType: "dm",
      AND: [
        { participants: { some: { userId } } },
        { participants: { some: { userId: withUserId } } },
      ],
    },
    include: { participants: true },
  });
  const withBoth = candidates.find((t) => t.participants.length === 2);
  if (withBoth) {
    return NextResponse.json({ id: withBoth.id, name: "" });
  }
  const thread = await db.thread.create({
    data: {
      contextType: "dm",
      title: "DM",
      createdById: userId,
      participants: {
        create: [{ userId }, { userId: withUserId }],
      },
    },
  });
  return NextResponse.json({ id: thread.id, name: "" });
}
