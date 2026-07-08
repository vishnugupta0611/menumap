import RestaurantProfile from "@/components/public/RestaurantProfile";
import { findRestaurant, findRestaurantMenu, listReviews, listGallery } from "@/services/restaurant-service";

export async function generateMetadata({ params }) {
  const { city, restaurant: slug } = await params;
  const restaurant = await findRestaurant(city, slug);
  return {
    title: `${restaurant.name} Menu, Reviews and Profile | MenuMap`,
    description: `${restaurant.name} in ${restaurant.city}. View QR menu, dishes, facilities, photos and reviews.`,
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
