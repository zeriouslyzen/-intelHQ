import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const notes = await db.note.findMany({
      orderBy: { updatedAt: "desc" },
      take: 50,
    });
    return NextResponse.json(notes);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const { body: text, regionCode, instrumentId } = (body ?? {}) as {
      body?: string;
      regionCode?: string;
      instrumentId?: string;
    };
    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "body is required" },
        { status: 400 }
      );
    }
    const note = await db.note.create({
      data: {
        body: text,
        regionCode: regionCode ?? null,
        instrumentId: instrumentId ?? null,
      },
    });
    return NextResponse.json(note);
  } catch {
    return NextResponse.json({ error: "Failed to save note" }, { status: 500 });
  }
}
