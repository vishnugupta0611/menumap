import Link from "next/link";
import RestaurantHeader from "@/components/public/RestaurantHeader";
import MaterialIcon from "@/components/stitch/MaterialIcon";
import { findRestaurant, findRestaurantMenu } from "@/services/restaurant-service";

export default async function DishPage({ params }) {
  const { city, restaurant: slug, dish } = await params;
  const restaurant = await findRestaurant(city, slug);
  const menu = await findRestaurantMenu(city, slug);
  const item = menu.find((menuItem) => menuItem.id === dish) || menu[0];

  return (
    <div className="pb-10">
      <main className="mx-auto max-w-3xl px-margin-mobile pt-8">
        <img alt={item.name} className="mb-6 h-[360px] w-full rounded-[32px] object-cover shadow-2xl" src={item.image} />
        <div className="rounded-3xl border border-surface-container bg-white p-8 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <span className={`h-3 w-3 rounded-full ${item.veg ? "bg-tertiary" : "bg-error"}`} />
            <span className="font-label-sm text-label-sm uppercase text-secondary">{item.category}</span>
          </div>
          <h1 className="font-display-lg-mobile text-display-lg-mobile text-on-background">{item.name}</h1>
          <p className="mt-3 font-body-lg text-body-lg text-on-surface-variant">{item.description}</p>
          <div className="mt-8 flex items-center justify-between">
            <span className="font-display-lg-mobile text-display-lg-mobile text-primary">Rs {item.price}</span>
            <button className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-on-primary shadow-lg shadow-primary/20">
              <MaterialIcon name="add_shopping_cart" /> Add
            </button>
          </div>
        </div>
        <Link className="mt-6 inline-flex text-primary" href={`/${city}/${slug}/menu`}>Back to menu</Link>
      </main>
    </div>
  );
}
