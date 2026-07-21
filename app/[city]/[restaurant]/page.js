import RestaurantProfile from "@/components/public/RestaurantProfile";
import {
  findRestaurant,
  findRestaurantMenu,
  listReviews,
  listGallery,
} from "@/services/restaurant-service";

export async function generateMetadata({ params }) {
  const { city, restaurant: slug } = await params;

  const restaurant = await findRestaurant(city, slug);

  const title = `${restaurant.name} | Best Restaurant in ${restaurant.city} | HeyRestro`;

  const description = `Explore ${restaurant.name} located in ${restaurant.city}. View menu, address, contact details, photos, reviews, opening hours and discover the best dining experience with HeyRestro.`;

  const image =
    restaurant.logoImage ||
    restaurant.heroImage ||
    "https://heyrestro.com/og-image.png";

  const canonical = `https://heyrestro.com/${city}/${slug}`;

  const keywords = [
    restaurant.name,
    `${restaurant.name} menu`,
    `${restaurant.name} restaurant`,
    `${restaurant.name} ${restaurant.city}`,
    `${restaurant.city} restaurants`,
    `Restaurants in ${restaurant.city}`,
    "Restaurant Menu",
    "Digital Menu",
    "QR Menu",
    "Food Near Me",
    "HeyRestro",
  ];

  return {
    title,
    description,
    keywords,

    alternates: {
      canonical,
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-video-preview": -1,
        "max-snippet": -1,
      },
    },

    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "HeyRestro",
      locale: "en_IN",
      type: "website",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: restaurant.name,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function RestaurantPage({ params }) {
  const { city, restaurant: slug } = await params;

  const restaurant = await findRestaurant(city, slug);
  const menu = await findRestaurantMenu(city, slug);
  const reviews = await listReviews(city, slug);
  const gallery = await listGallery(city, slug);

  return (
    <RestaurantProfile
      restaurant={restaurant}
      menu={menu}
      reviews={reviews}
      gallery={gallery}
    />
  );
}
