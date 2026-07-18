export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://heyrestro.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/login",
          "/register/",
          "/sso-callback/",
          "/customer/",
          "/splash",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
