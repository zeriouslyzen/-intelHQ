import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import path from "node:path";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function getAdapter() {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  const filePath = url.replace(/^file:/, "").trim();
  const resolved =
    path.isAbsolute(filePath) ?
      filePath
    : filePath.startsWith(".") && !filePath.includes("prisma")
    ? path.join(process.cwd(), "prisma", path.basename(filePath))
    : path.join(process.cwd(), filePath);
  return new PrismaBetterSqlite3({ url: `file:${resolved}` });
}

export const db: PrismaClient =
  global.prisma ??
  new PrismaClient({ adapter: getAdapter() });

if (process.env.NODE_ENV !== "production") {
  global.prisma = db;
}

