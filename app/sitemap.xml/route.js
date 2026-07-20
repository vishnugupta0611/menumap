export const revalidate = 43200; // 12 hours

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://heyrestro.com";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.heyrestro.com";
const CHUNK_SIZE = 50000;

async function getRestaurantCount() {
  try {
    const res = await fetch(`${API_URL}/api/sitemap/count`, {
      next: { revalidate: 43200 },
    });
    if (!res.ok) return 0;
    const data = await res.json();
    return data.count || 0;
  } catch {
    return 0;
  }
}

export async function GET() {
  const now = new Date().toISOString();
  const count = await getRestaurantCount();
  const chunks = Math.max(1, Math.ceil(count / CHUNK_SIZE));

  let sitemapsXml = `  <sitemap>
    <loc>${BASE_URL}/sitemaps/static.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>\n`;

  for (let i = 1; i <= chunks; i++) {
    sitemapsXml += `  <sitemap>
    <loc>${BASE_URL}/sitemaps/restaurants-${i}.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>\n`;
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapsXml}</sitemapindex>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=43200, stale-while-revalidate=3600",
    },
  });
}
