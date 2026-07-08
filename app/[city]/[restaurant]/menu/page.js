import { findRestaurant, findRestaurantMenu, listOffers } from "@/services/restaurant-service";
import RestaurantMenuList from "@/components/public/RestaurantMenuList";

export default async function MenuPage({ params }) {
  const { city, restaurant: slug } = await params;
  
  const [restaurant, menu, offers] = await Promise.all([
    findRestaurant(city, slug),
    findRestaurantMenu(city, slug),
    listOffers(city, slug).catch(() => []) // Fallback in case backend route isn't restarted yet
  ]);
  
  const normalizedMenu = menu.map(item => ({ ...item, id: item._id || item.id }));

  return <RestaurantMenuList restaurant={restaurant} className="pt-24" menu={normalizedMenu} offers={offers} />;
}
