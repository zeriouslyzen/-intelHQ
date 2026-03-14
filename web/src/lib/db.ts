import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

let _client: PrismaClient | null = null;
let _initError: Error | null = null;

function getClient(): PrismaClient {
  if (_client) return _client;
  if (_initError) throw _initError;
  try {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error("DATABASE_URL is not set");
    const adapter = new PrismaPg({ connectionString });
    _client = global.prisma ?? new PrismaClient({ adapter });
    if (process.env.NODE_ENV !== "production") {
      global.prisma = _client;
    }
    return _client;
  } catch (e) {
    _initError = e instanceof Error ? e : new Error(String(e));
    throw _initError;
  }
}

export const db = new Proxy({} as PrismaClient, {
  get(_, prop: string) {
    return getClient()[prop as keyof PrismaClient];
  },
});
