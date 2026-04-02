/**
 * Canonical origin for metadata, sitemap, and aligning with NextAuth cookies.
 * If users hit https://www.example.com but NEXTAUTH_URL is https://example.com,
 * session cookies and CSRF checks can fail (browser treats them as different sites).
 */
export function getSiteOrigin(): string {
  const raw = process.env.NEXTAUTH_URL?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) {
    try {
      return new URL(raw).origin;
    } catch {
      /* invalid */
    }
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "https://www.researchdefence.com";
}
