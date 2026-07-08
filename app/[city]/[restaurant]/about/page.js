import MaterialIcon from "@/components/stitch/MaterialIcon";
import { findRestaurant } from "@/services/restaurant-service";

export default async function AboutPage({ params }) {
  const { city, restaurant: slug } = await params;
  const restaurant = await findRestaurant(city, slug);

  const mapFacilityIcon = (facility) => {
    const name = facility.toLowerCase();
    if (name.includes("ac") || name.includes("air condition")) return "ac_unit";
    if (name.includes("park") || name.includes("valet")) return "local_parking";
    if (name.includes("family") || name.includes("kid")) return "family_restroom";
    if (name.includes("outdoor") || name.includes("deck") || name.includes("patio")) return "deck";
    if (name.includes("music") || name.includes("live")) return "music_note";
    if (name.includes("card") || name.includes("payment")) return "credit_card";
    if (name.includes("wifi") || name.includes("internet")) return "wifi";
    if (name.includes("deliver") || name.includes("takeaway")) return "delivery_dining";
    if (name.includes("drink") || name.includes("bar") || name.includes("alcohol")) return "local_bar";
    return "check_circle";
  };

  return (
    <div className="px-margin-mobile md:px-margin-desktop grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-4xl mx-auto pb-32">
      <div className="lg:col-span-12 space-y-12">
        <section id="about">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-10 w-2 bg-primary rounded-full"></div>
            <h2 className="font-headline-md text-headline-md">Our Story</h2>
          </div>
          <div className="bg-white rounded-[24px] p-8 shadow-sm border border-surface-container">
            <p className="font-body-lg text-on-surface-variant leading-relaxed mb-6">
              {restaurant.story || `Founded in the heart of the city, ${restaurant.name} was born from a passion for authentic culinary traditions. Our kitchen is a sanctuary where artisanal techniques meet modern culinary curiosity.`}
            </p>
            {!restaurant.story && (
              <p className="font-body-lg text-on-surface-variant leading-relaxed">
                Every ingredient is sourced from sustainable local farms and premium suppliers. We believe that a meal is more than just sustenance; it is a celebration of life, family, and the enduring beauty of simple, high-quality food.
              </p>
            )}
          </div>
        </section>

        {restaurant.facilities && restaurant.facilities.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-10 w-2 bg-primary rounded-full"></div>
              <h2 className="font-headline-md text-headline-md">Facilities</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {restaurant.facilities.map((facility, idx) => (
                <div key={idx} className="bg-white p-5 rounded-[24px] flex flex-col items-center justify-center gap-3 border border-surface-container shadow-sm hover:border-primary/20 transition-all group">
                  <MaterialIcon name={mapFacilityIcon(facility)} className="text-primary text-3xl group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-on-surface text-sm text-center">{facility}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
