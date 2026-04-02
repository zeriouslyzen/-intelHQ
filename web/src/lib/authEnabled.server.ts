/**
 * Whether to mount NextAuth on the client and show sign-in UI.
 * Off when explicitly disabled, or when credentials/database are not configured
 * (avoids CLIENT_FETCH_ERROR spam in the console).
 */
export function isNextAuthEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_AUTH_DISABLED === "true") return false;
  const secret = process.env.NEXTAUTH_SECRET?.trim();
  const db = process.env.DATABASE_URL?.trim();
  return Boolean(secret && db);
}
