import { createHmac, timingSafeEqual } from "crypto";

const SECRET = process.env.NEXTAUTH_SECRET ?? "";
const TTL_MS = 60 * 1000;

export function createWsToken(userId: string): string {
  const payload = JSON.stringify({ userId, exp: Date.now() + TTL_MS });
  const payloadB64 = Buffer.from(payload, "utf8").toString("base64url");
  const sig = createHmac("sha256", SECRET).update(payloadB64).digest("base64url");
  return `${payloadB64}.${sig}`;
}

export function verifyWsToken(token: string): { userId: string } | null {
  if (!SECRET) return null;
  const i = token.lastIndexOf(".");
  if (i === -1) return null;
  const payloadB64 = token.slice(0, i);
  const sig = token.slice(i + 1);
  const expected = createHmac("sha256", SECRET).update(payloadB64).digest("base64url");
  if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig, "utf8"), Buffer.from(expected, "utf8"))) return null;
  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    if (typeof payload.userId !== "string" || typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    return { userId: payload.userId };
  } catch {
    return null;
  }
}
