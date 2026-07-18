// app/sitemap.js — Sitemap Index
// Returns pointers to static-sitemap + chunked restaurant sitemaps.
// Revalidated every 12 hours so it stays fresh without hammering the DB.

export const revalidate = 43200; // 12 hours

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://heyrestro.com";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.heyrestro.com";
const CHUNK_SIZE = 50000; // Google's max URLs per sitemap file

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

export default async function sitemap() {
  const now = new Date().toISOString();
  const count = await getRestaurantCount();
  const chunks = Math.max(1, Math.ceil(count / CHUNK_SIZE));

  const entries = [
    // Static pages sitemap
    {
      url: `${BASE_URL}/sitemaps/static.xml`,
      lastModified: now,
    },
  ];

  // Restaurant chunk sitemaps
  for (let i = 1; i <= chunks; i++) {
    entries.push({
      url: `${BASE_URL}/sitemaps/restaurants-${i}.xml`,
      lastModified: now,
    });
  }

  return entries;
}
