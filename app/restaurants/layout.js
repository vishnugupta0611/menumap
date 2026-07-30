export const metadata = {
  title: "All Restaurants | HeyRestro",
  description: "Discover the best restaurants near you on HeyRestro. Browse menus, ratings, and order food online from top-rated local spots.",
  alternates: {
    canonical: "/restaurants",
  },
  openGraph: {
    title: "All Restaurants | HeyRestro",
    description: "Discover the best restaurants near you on HeyRestro. Browse menus, ratings, and order food online from top-rated local spots.",
    url: "https://www.heyrestro.com/restaurants",
    siteName: "HeyRestro",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "All Restaurants | HeyRestro",
    description: "Discover the best restaurants near you on HeyRestro. Browse menus, ratings, and order food online from top-rated local spots.",
  }
};

export default function RestaurantsLayout({ children }) {
  return <>{children}</>;
}
