export const revalidate = 43200; // 12 hours

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://heyrestro.com";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.heyrestro.com";

export default async function sitemap() {
  const staticRoutes = [
    "",
    "/search",
    "/contact",
    "/about",
    "/privacy",
    "/terms",
    "/restaurants",
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "daily",
    priority: route === "" ? 1 : 0.8,
  }));

  // Fetch up to 1000 restaurants directly for the sitemap to ensure instant flat indexing
  let restaurants = [];
  try {
    const res = await fetch(`${API_URL}/api/sitemap/restaurants?limit=1000`, {
      next: { revalidate: 43200 },
    });
    if (res.ok) {
      const data = await res.json();
      restaurants = data.restaurants || [];
    }
  } catch (error) {
    console.error("Failed to fetch restaurants for sitemap", error);
  }

  const restaurantRoutes = restaurants.map((restro) => ({
    url: `${BASE_URL}/${encodeURIComponent(restro.city)}/${encodeURIComponent(restro.slug)}`,
    lastModified: restro.updatedAt ? new Date(restro.updatedAt).toISOString() : new Date().toISOString(),
    changeFrequency: "daily",
    priority: 0.9,
  }));
  
  // Fetch up to 1000 cities
  let cities = [];
  try {
    const res = await fetch(`${API_URL}/api/sitemap/cities`, {
      next: { revalidate: 43200 },
    });
    if (res.ok) {
      const data = await res.json();
      cities = data.cities || [];
    }
  } catch (error) {
    console.error("Failed to fetch cities for sitemap", error);
  }

  const cityRoutes = cities.map((city) => ({
    url: `${BASE_URL}/${encodeURIComponent(city)}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [...staticRoutes, ...cityRoutes, ...restaurantRoutes];
}
