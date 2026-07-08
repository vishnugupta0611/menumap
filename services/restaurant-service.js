const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000") + "/api";

async function apiGet(endpoint, options = {}) {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    next: options.revalidate ? { revalidate: options.revalidate } : undefined,
    cache: options.cache,
  });

  if (!res.ok) {
    throw new Error(`MenuMap API request failed: ${endpoint}`);
  }

  const json = await res.json();
  return json.data;
}

export async function listNearbyRestaurants(query = {}) {
  const params = new URLSearchParams(query);
  return apiGet(`/restaurants${params.size ? `?${params.toString()}` : ""}`, { revalidate: 60 });
}

export async function findRestaurant(city, slug) {
  return apiGet(`/restaurants/${city}/${slug}`, { cache: "no-store" });
}

export async function findRestaurantMenu(city, slug) {
  return apiGet(`/restaurants/${city}/${slug}/menu`, { cache: "no-store" });
}

export async function findDishResults(query = "", filters = {}) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  });
  return apiGet(`/search/dishes?${params.toString()}`, { cache: "no-store" });
}

export async function listReviews(city = "kanpur", slug = "food-villa") {
  return apiGet(`/restaurants/${city}/${slug}/reviews`, { revalidate: 60 });
}

export async function listGallery(city, slug) {
  return apiGet(`/restaurants/${city}/${slug}/gallery`, { cache: "no-store" });
}

export async function listOffers(city, slug) {
  return apiGet(`/restaurants/${city}/${slug}/offers`, { cache: "no-store" });
}
