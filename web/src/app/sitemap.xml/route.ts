import { NextResponse } from "next/server";

const baseUrl = "https://researchdefence.com";

const staticPaths = [
  "",
  "/markets",
  "/map",
  "/events",
  "/wartime",
  "/alerts",
  "/chat",
  "/notes",
  "/settings/feeds",
];

function buildSitemapXml(): string {
  const urls = staticPaths
    .map((path) => {
      const loc = path ? `${baseUrl}${path}` : baseUrl;
      const lastmod = new Date().toISOString().slice(0, 10);
      return `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>${path === "" ? "1.0" : "0.8"}</priority>\n  </url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  const xml = buildSitemapXml();
  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
