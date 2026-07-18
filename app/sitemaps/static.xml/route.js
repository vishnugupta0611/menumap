// app/sitemaps/static.xml/route.js
// Serves the static pages sitemap.

export const revalidate = 86400; // 24 hours — static pages rarely change

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://heyrestro.com";

const STATIC_PAGES = [
  { path: "/",               changeFreq: "daily",   priority: "1.0" },
  { path: "/search",         changeFreq: "daily",   priority: "0.9" },
  { path: "/login",          changeFreq: "monthly", priority: "0.5" },
  { path: "/register/owner", changeFreq: "monthly", priority: "0.6" },
  { path: "/register/customer", changeFreq: "monthly", priority: "0.5" },
  { path: "/about",          changeFreq: "monthly", priority: "0.6" },
  { path: "/contact",        changeFreq: "monthly", priority: "0.5" },
  { path: "/privacy",        changeFreq: "yearly",  priority: "0.3" },
  { path: "/terms",          changeFreq: "yearly",  priority: "0.3" },
];

function buildStaticXml() {
  const now = new Date().toISOString().split("T")[0];

  const urls = STATIC_PAGES.map(
    ({ path, changeFreq, priority }) => `
  <url>
    <loc>${BASE_URL}${path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${changeFreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  ).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

export async function GET() {
  const xml = buildStaticXml();

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
    },
  });
}
