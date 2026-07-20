import RestaurantProfile from "@/components/public/RestaurantProfile";
import { findRestaurant, findRestaurantMenu, listReviews, listGallery } from "@/services/restaurant-service";

export async function generateMetadata({ params }) {
  const { city, restaurant: slug } = await params;
  const restaurant = await findRestaurant(city, slug);
  const title = `${restaurant.name} Menu, Reviews and Profile | MenuMap`;
  const description = `${restaurant.name} in ${restaurant.city}. View QR menu, dishes, facilities, photos and reviews.`;
  const image = restaurant.logoImage || restaurant.heroImage || "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=1600&auto=format&fit=crop";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://heyrestro.com/${city}/${slug}`,
      siteName: 'MenuMap',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${restaurant.name} banner`,
        },
      ],
      locale: 'en_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
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

  return <RestaurantProfile restaurant={restaurant} menu={menu} reviews={reviews} gallery={gallery} />;
}
