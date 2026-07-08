import SectionHeading from "@/components/stitch/SectionHeading";
import { findRestaurant } from "@/services/restaurant-service";

export default async function GalleryPage({ params }) {
  const { city, restaurant: slug } = await params;
  const restaurant = await findRestaurant(city, slug);

  return (
    <div className="mx-auto max-w-4xl px-margin-mobile pb-32">
      <SectionHeading title="Gallery" />
      <div className="grid gap-4 md:grid-cols-2 mt-6">
        {[restaurant.heroImage, ...(restaurant.gallery || [])].filter(Boolean).map((image, index) => (
          <img
            key={index}
            alt={restaurant.name}
            className="h-72 w-full rounded-[32px] object-cover shadow-sm border border-surface-container hover:scale-[1.01] transition-transform duration-300"
            src={image}
          />
        ))}
      </div>
    </div>
  );
}
