import { findRestaurant, findRestaurantMenu } from "@/services/restaurant-service";
import RestaurantMenuList from "@/components/public/RestaurantMenuList";

export default async function MenuPage({ params }) {
  const { city, restaurant: slug } = await params;
  const restaurant = await findRestaurant(city, slug);
  const menu = await findRestaurantMenu(city, slug);
  const normalizedMenu = menu.map(item => ({ ...item, id: item._id || item.id }));

  return <RestaurantMenuList restaurant={restaurant} className="pt-24" menu={normalizedMenu} />;
}
