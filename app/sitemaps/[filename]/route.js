// app/sitemaps/[filename]/route.js
// Handles:  /sitemaps/restaurants-1.xml, /sitemaps/restaurants-2.xml ...
// Fetches restaurants from the Express API in batches — never loads all at once.

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://heyrestro.com";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.heyrestro.com";
const CHUNK_SIZE = 50000;
const BATCH_SIZE = 500; // fetch 500 at a time from API

function escapeXml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatDate(date) {
  try {
    return new Date(date).toISOString().split("T")[0];
  } catch {
    return new Date().toISOString().split("T")[0];
  }
}

// Fetch one page of restaurants from the API
async function fetchRestaurantPage(page, limit) {
  try {
    const res = await fetch(
      `${API_URL}/api/sitemap/restaurants?page=${page}&limit=${limit}`,
      { next: { revalidate: 43200 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.restaurants || [];
  } catch {
    return [];
  }
}

export async function GET(request, { params }) {
  const { filename } = await params;

  // Only handle restaurant chunk files
  const match = filename.match(/^restaurants-(\d+)\.xml$/);
  if (!match) {
    return new Response("Not found", { status: 404 });
  }

  const chunkIndex = parseInt(match[1], 10); // 1-based
  if (isNaN(chunkIndex) || chunkIndex < 1) {
    return new Response("Not found", { status: 404 });
  }

  // Which slice of restaurants does this chunk cover?
  const startRecord = (chunkIndex - 1) * CHUNK_SIZE; // 0-based offset
  const endRecord = startRecord + CHUNK_SIZE;

  // Collect URLs by paginating through just this chunk's range
  const urlLines = [];
  let fetched = 0;
  let apiPage = Math.floor(startRecord / BATCH_SIZE) + 1;

  while (fetched < CHUNK_SIZE) {
    const restaurants = await fetchRestaurantPage(apiPage, BATCH_SIZE);
    if (!restaurants.length) break;

    for (const r of restaurants) {
      // Skip records before our chunk's start
      const absoluteIndex = (apiPage - 1) * BATCH_SIZE + restaurants.indexOf(r);
      if (absoluteIndex < startRecord) continue;
      if (absoluteIndex >= endRecord) break;

      if (!r.city || !r.slug) continue; // skip invalid

      const city = escapeXml(r.city.toLowerCase());
      const slug = escapeXml(r.slug.toLowerCase());
      const lastmod = formatDate(r.updatedAt);

      urlLines.push(`  <url>
    <loc>${BASE_URL}/${city}/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${BASE_URL}/${city}/${slug}/menu</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
      fetched++;
    }

    if (restaurants.length < BATCH_SIZE) break; // no more pages
    apiPage++;
  }

  if (urlLines.length === 0) {
    // Return empty but valid sitemap
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;
    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=43200, stale-while-revalidate=3600",
      },
    });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlLines.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=43200, stale-while-revalidate=3600",
    },
  });
}
