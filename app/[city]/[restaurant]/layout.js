import RestaurantHeader from "@/components/public/RestaurantHeader";

import { findRestaurant } from "@/services/restaurant-service";

export default async function RestaurantLayout({ children, params }) {
  const { city, restaurant: slug } = await params;
  
  let restaurant;
  try {
    restaurant = await findRestaurant(city, slug);
  } catch (err) {
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-error bg-background text-on-surface">
        Restaurant not found
      </div>
    );
  }

  const settings = restaurant.menuUiSettings || {
    colorPalette: "clay",
    font: "jakarta",
    showTabs: true,
  };

  return (
    <div className={`min-h-screen bg-background pb-8 text-on-surface theme-${settings.colorPalette} font-theme-${settings.font}`}>
      <RestaurantHeader restaurant={restaurant} />
      <div className="pt-[65px]">

        {children}
      </div>
    </div>
  );
}
