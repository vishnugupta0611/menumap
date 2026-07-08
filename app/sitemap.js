export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://menumap.in";

  // Mock restaurant links for sitemap
  const routes = [
    "",
    "/search",
    "/login",
    "/kanpur/food-villa",
    "/kanpur/food-villa/menu",
    "/kanpur/food-villa/about",
    "/kanpur/the-greenhouse",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "daily",
    priority: route === "" ? 1.0 : 0.8,
  }));
}
