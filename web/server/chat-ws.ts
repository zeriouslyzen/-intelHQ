import "dotenv/config";
import { WebSocketServer } from "ws";
import { db } from "../src/lib/db";
import { verifyWsToken } from "../src/lib/ws-token";

const PORT = Number(process.env.CHAT_WS_PORT) || 3001;

type Client = { ws: import("ws").WebSocket; userId: string };
const threadClients = new Map<string, Set<Client>>();

function getOrCreateThreadSet(threadId: string): Set<Client> {
  let set = threadClients.get(threadId);
  if (!set) {
    set = new Set();
    threadClients.set(threadId, set);
  }
  return set;
}

function send(ws: import("ws").WebSocket, obj: object) {
  if (ws.readyState === 1) ws.send(JSON.stringify(obj));
}

const wss = new WebSocketServer({ port: PORT });

wss.on("connection", async (ws, req) => {
  const url = new URL(req.url ?? "", `http://${req.headers.host ?? "localhost"}`);
  const threadId = url.searchParams.get("threadId");
  const token = url.searchParams.get("token");
  if (!threadId || !token) {
    send(ws, { type: "system", payload: { text: "Missing threadId or token" } });
    ws.close();
    return;
  }
  const auth = verifyWsToken(token);
  if (!auth) {
    send(ws, { type: "system", payload: { text: "Invalid or expired token" } });
    ws.close();
    return;
  }
  const userId = auth.userId;
  const participant = await db.threadParticipant.findUnique({
    where: { threadId_userId: { threadId, userId } },
  });
  if (!participant) {
    send(ws, { type: "system", payload: { text: "Not a member of this thread" } });
    ws.close();
    return;
  }
  const client: Client = { ws, userId };
  getOrCreateThreadSet(threadId).add(client);
  ws.on("close", () => {
    getOrCreateThreadSet(threadId).delete(client);
    const set = threadClients.get(threadId);
    if (set?.size === 0) threadClients.delete(threadId);
  });
  ws.on("message", async (raw) => {
    try {
      const msg = JSON.parse(raw.toString()) as { type?: string; body?: string; threadId?: string };
      if (msg?.type === "ping") {
        send(ws, { type: "pong" });
        return;
      }
      if (msg?.type === "send_message" && typeof msg.body === "string" && msg.body.trim()) {
        const message = await db.message.create({
          data: { threadId, authorId: userId, body: msg.body.trim() },
          include: { author: { select: { id: true, name: true, displayName: true, email: true } } },
        });
        const payload = {
          id: message.id,
          author: message.author.name || message.author.displayName || message.author.email || "",
          content: message.body,
          at: message.createdAt.getTime(),
        };
        const out = { type: "message" as const, payload };
        for (const c of getOrCreateThreadSet(threadId)) {
          send(c.ws, out);
        }
      }
    } catch {
      send(ws, { type: "system", payload: { text: "Invalid message" } });
    }
  });
});

console.log(`Chat WebSocket server listening on port ${PORT}`);
