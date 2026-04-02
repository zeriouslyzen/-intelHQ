import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

async function checkMember(threadId: string, userId: string) {
  const p = await db.threadParticipant.findUnique({
    where: { threadId_userId: { threadId, userId } },
  });
  return !!p;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const { session, response } = await requireAuth();
  if (response) return response;
  const userId = session!.user!.id;
  const { threadId } = await params;
  const member = await checkMember(threadId, userId);
  if (!member) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);
  const cursor = searchParams.get("cursor");
  const messages = await db.message.findMany({
    where: { threadId },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: { author: { select: { id: true, name: true, displayName: true, email: true } } },
  });
  const hasMore = messages.length > limit;
  const list = (hasMore ? messages.slice(0, limit) : messages).reverse();
  const nextCursor = hasMore ? list[0]?.id : null;
  return NextResponse.json({
    messages: list.map((m) => ({
      id: m.id,
      author: m.author.name || m.author.displayName || m.author.email || "",
      content: m.body,
      at: m.createdAt.getTime(),
    })),
    nextCursor,
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const { session, response } = await requireAuth();
  if (response) return response;
  const userId = session!.user!.id;
  const { threadId } = await params;
  const member = await checkMember(threadId, userId);
  if (!member) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await request.json().catch(() => ({}));
  const text = (body?.body ?? body?.content ?? body?.text) as string;
  if (!text || typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "Message body required" }, { status: 400 });
  }
  const message = await db.message.create({
    data: { threadId, authorId: userId, body: text.trim() },
    include: { author: { select: { id: true, name: true, displayName: true, email: true } } },
  });
  return NextResponse.json({
    id: message.id,
    author: message.author.name || message.author.displayName || message.author.email || "",
    content: message.body,
    at: message.createdAt.getTime(),
  });
}
