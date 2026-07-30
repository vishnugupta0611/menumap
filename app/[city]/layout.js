export async function generateMetadata({ params }) {
  // Await the params for Next.js 15 compatibility
  const { city } = await params;
  
  // Format the city name (e.g., 'new-delhi' -> 'New Delhi')
  const decodedCity = decodeURIComponent(city);
  const formattedCity = decodedCity
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  const title = `Best Restaurants in ${formattedCity} - View Menus & Order Online | HeyRestro`;
  const description = `Discover the best restaurants in ${formattedCity}. Browse local food menus, read reviews, and order online for dine-in, delivery, or pickup with HeyRestro.`;
  const url = `https://heyrestro.com/${encodeURIComponent(decodedCity)}`;

  return {
    title,
    description,
    keywords: [
      `Restaurants in ${formattedCity}`,
      `Best food in ${formattedCity}`,
      `${formattedCity} food delivery`,
      `${formattedCity} restaurant menus`,
      "Order food online",
      "HeyRestro"
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "HeyRestro",
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    }
  };
}

export default function CityLayout({ children }) {
  return <>{children}</>;
}
