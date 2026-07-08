"use client";

import { useState } from "react";
import Link from "next/link";
import MaterialIcon from "@/components/stitch/MaterialIcon";

export default function RestaurantProfile({ restaurant, menu, reviews = [] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const famousItems = menu.filter((item) => item.popular);
  const heroLayout = restaurant.menuUiSettings?.heroImageLayout || "rounded";

  const formatTime = (t) => {
    if (!t) return null;
    return t.get ? t.get("open") : t;
  };

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
    <>
      {/* Hero Section */}
      {restaurant.heroImage && (
        <section className={heroLayout === "rounded" ? "mb-8 max-w-4xl mx-auto px-margin-mobile pt-4" : "mb-8 w-full"}>
          <div className={`relative w-full overflow-hidden group ${
            heroLayout === "rounded" 
              ? "h-64 md:h-80 rounded-[32px] border border-surface-container shadow-sm" 
              : heroLayout === "square"
                ? "h-72 md:h-96"
                : "h-[calc(100vh-65px)]"
          }`}>
            <img
              src={restaurant.heroImage}
              alt={restaurant.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className={`absolute inset-0 ${heroLayout === "full-width" ? "bg-black/60" : "bg-gradient-to-t from-black/80 via-black/20 to-transparent"}`} />
            <div className={`absolute inset-0 flex flex-col text-white ${
              heroLayout === "full-width"
                ? "justify-center items-center text-center px-margin-mobile"
                : `justify-end pb-6 md:pb-8 ${heroLayout === "rounded" ? "px-6 md:px-8" : "w-full max-w-4xl mx-auto px-margin-mobile"}`
            }`}>
              <h1 className={`font-display-lg font-bold mb-2 leading-tight ${heroLayout === "full-width" ? "text-5xl md:text-7xl mb-4" : "text-4xl md:text-5xl"}`}>
                {restaurant.name}
              </h1>
              {restaurant.cuisine && (
                <p className={`font-body-md text-white/90 text-sm md:text-base mb-3 flex items-center gap-2 ${heroLayout === "full-width" ? "justify-center md:text-xl mb-6" : ""}`}>
                  <MaterialIcon name="restaurant" className="text-[18px]" />
                  {restaurant.cuisine}
                </p>
              )}
              <div className={`flex gap-3 items-center ${heroLayout === "full-width" ? "justify-center mb-10" : ""}`}>
                <span
                  className={`px-3 py-1 text-xs font-bold tracking-wide uppercase rounded-full border ${
                    restaurant.openNow
                      ? "bg-green-500/20 text-green-300 border-green-500/30"
                      : "bg-red-500/20 text-red-300 border-red-500/30"
                  }`}
                >
                  {restaurant.openNow ? "OPEN NOW" : "CLOSED"}
                </span>
                {restaurant.priceForTwo && (
                  <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-white/10 text-white/85 flex items-center gap-1">
                    ₹{restaurant.priceForTwo} for two
                  </span>
                )}
              </div>

              {heroLayout === "full-width" && (
                <div className="w-full max-w-2xl text-black">
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[24px]">
                      search
                    </span>
                    <input
                      className="w-full pl-14 pr-6 py-5 bg-white/95 backdrop-blur-md border-none focus:outline-none focus:ring-4 focus:ring-primary/50 transition-all font-body-lg text-[18px] rounded-full shadow-2xl"
                      placeholder="Search the menu..."
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Search Bar (Standard) */}
      {heroLayout !== "full-width" && (
        <div className="px-margin-mobile mb-10 max-w-4xl mx-auto">
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] group-focus-within:text-primary transition-colors">
            search
          </span>
          <input
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-surface-container focus:outline-none focus:border-primary transition-colors font-body-md text-[15px] rounded-xl placeholder:text-on-surface-variant/50"
            placeholder="Search the menu"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        </div>
      )}

      {/* Story / About Us */}
      {restaurant.story && (
        <section className="px-margin-mobile mb-12 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-6 w-1 bg-primary rounded-full" />
            <h2 className="font-headline-md text-headline-md text-on-surface">Our story</h2>
          </div>
          <div className="bg-surface-container-lowest p-6 md:p-7 rounded-2xl border border-surface-container">
            <p className="text-on-surface-variant font-body-md leading-relaxed">
              {restaurant.story}
            </p>
          </div>
        </section>
      )}

      {/* Most Famous Section */}
      {famousItems.length > 0 && (
        <section className="px-margin-mobile mb-12 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-6 w-1 bg-primary rounded-full" />
            <h2 className="font-headline-md text-headline-md text-on-surface">Most ordered</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 px-1">
            {famousItems
              .filter(
                (item) =>
                  !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((dish) => (
                <Link
                  key={dish.id || dish._id}
                  href={`/${restaurant.city}/${restaurant.slug}/${dish.id || dish._id}`}
                  className="flex-none w-48 md:w-56 bg-white rounded-2xl border border-surface-container hover:border-primary/40 transition-colors overflow-hidden block"
                >
                  <div className="h-32 w-full bg-surface-container overflow-hidden">
                    {dish.image ? (
                      <img
                        alt={dish.name}
                        className="w-full h-full object-cover"
                        src={dish.image}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-surface-variant">
                        <MaterialIcon
                          name="restaurant"
                          className="text-on-surface-variant opacity-40 text-3xl"
                        />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-on-surface text-sm mb-1 truncate">
                      {dish.name}
                    </h3>
                    <p className="text-primary font-bold text-sm">₹{dish.price}</p>
                  </div>
                </Link>
              ))}
          </div>
        </section>
      )}

      {/* Contact & Info Cards */}
      <section className="px-margin-mobile mb-12 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-6 w-1 bg-primary rounded-full" />
          <h2 className="font-headline-md text-headline-md text-on-surface">Info & contact</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-surface-container">
            <div className="flex items-start gap-3.5 mb-4">
              <MaterialIcon name="location_on" className="text-primary text-[20px] mt-0.5 shrink-0" />
              <div>
                <p className="font-bold text-on-surface text-sm mb-1">Address</p>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  {restaurant.address || `${restaurant.name}, ${restaurant.city}`}
                </p>
              </div>
            </div>
            {(restaurant.phone || restaurant.whatsapp) && (
              <div className="flex items-start gap-3.5 pt-4 border-t border-surface-container">
                <MaterialIcon name="call" className="text-primary text-[20px] mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-on-surface text-sm mb-1">Contact</p>
                  {restaurant.phone && (
                    <p className="text-on-surface-variant text-sm">{restaurant.phone}</p>
                  )}
                  {restaurant.whatsapp && (
                    <p className="text-on-surface-variant text-sm mt-0.5">
                      WhatsApp: {restaurant.whatsapp}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-surface-container">
            <div className="flex items-start gap-3.5 mb-4">
              <MaterialIcon name="schedule" className="text-primary text-[20px] mt-0.5 shrink-0" />
              <div>
                <p className="font-bold text-on-surface text-sm mb-1">Hours</p>
                <p className="text-on-surface-variant text-sm">
                  {restaurant.timings?.open
                    ? `${formatTime(restaurant.timings.open)} - ${formatTime(restaurant.timings.close)}`
                    : "11:00 AM - 11:00 PM"}
                </p>
                {restaurant.holidays && restaurant.holidays.length > 0 && (
                  <p className="text-error text-xs font-semibold mt-1">
                    Closed: {restaurant.holidays.join(", ")}
                  </p>
                )}
              </div>
            </div>

            {(restaurant.website || restaurant.socialLinks) && (
              <div className="flex items-start gap-3.5 pt-4 border-t border-surface-container">
                <MaterialIcon name="public" className="text-primary text-[20px] mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-on-surface text-sm mb-2">Connect</p>
                  <div className="flex gap-4">
                    {restaurant.website && (
                      <a
                        href={restaurant.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm font-semibold"
                      >
                        Website
                      </a>
                    )}
                    {restaurant.socialLinks?.instagram && (
                      <a
                        href={restaurant.socialLinks.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-on-surface-variant hover:text-on-surface hover:underline text-sm font-semibold"
                      >
                        Instagram
                      </a>
                    )}
                    {restaurant.socialLinks?.facebook && (
                      <a
                        href={restaurant.socialLinks.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-on-surface-variant hover:text-on-surface hover:underline text-sm font-semibold"
                      >
                        Facebook
                      </a>
                    )}
                    {restaurant.socialLinks?.x && (
                      <a
                        href={restaurant.socialLinks.x}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-on-surface-variant hover:text-on-surface hover:underline text-sm font-semibold"
                      >
                        X
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      {restaurant.facilities && restaurant.facilities.length > 0 && (
        <section className="px-margin-mobile mb-12 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-6 w-1 bg-primary rounded-full" />
            <h2 className="font-headline-md text-headline-md text-on-surface">Facilities</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {restaurant.facilities.map((facility, idx) => (
              <div
                key={idx}
                className="bg-white p-4 rounded-xl flex flex-col items-center justify-center gap-2 border border-surface-container"
              >
                <MaterialIcon name={mapFacilityIcon(facility)} className="text-primary text-2xl" />
                <span className="font-semibold text-on-surface text-xs text-center">
                  {facility}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Move to Menu Button */}
      <section className="px-margin-mobile mb-16 max-w-4xl mx-auto">
        <Link
          href={`/${restaurant.city}/${restaurant.slug}/menu`}
          className="w-full bg-primary text-on-primary font-bold py-6 px-8 rounded-2xl flex items-center justify-between gap-4 hover:bg-primary/90 transition-colors"
        >
          <div>
            <span className="block text-xl font-display-md mb-1">Explore the menu</span>
            <span className="block font-body-md text-on-primary/80 text-sm">
              {menu.length} items available
            </span>
          </div>
          <MaterialIcon name="arrow_forward" className="text-2xl shrink-0" />
        </Link>
      </section>

      {/* Gallery Section */}
      {restaurant.gallery && restaurant.gallery.length > 0 && (
        <section className="px-margin-mobile mb-16 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="h-6 w-1 bg-primary rounded-full" />
              <h2 className="font-headline-md text-headline-md text-on-surface">Gallery</h2>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 snap-x snap-mandatory">
            {restaurant.gallery.map((img, idx) => (
              <div key={idx} className="shrink-0 w-64 h-64 sm:w-72 sm:h-72 snap-center rounded-[24px] overflow-hidden border border-surface-container shadow-sm">
                <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Reviews Section */}
      {reviews && reviews.length > 0 && (
        <section className="px-margin-mobile mb-16 max-w-4xl mx-auto" id="reviews">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="h-6 w-1 bg-primary rounded-full" />
              <h2 className="font-headline-md text-headline-md text-on-surface">Reviews</h2>
            </div>
            <Link
              href={`/${restaurant.city}/${restaurant.slug}/reviews`}
              className="text-primary font-semibold text-sm flex items-center gap-1 hover:underline"
            >
              See all
              <MaterialIcon name="arrow_forward" className="text-[16px]" />
            </Link>
          </div>
          <div className="space-y-3">
            {reviews.map((review) => (
              <div
                key={review.id || review._id}
                className="bg-white p-6 rounded-2xl border border-surface-container"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    {review.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface text-sm">{review.name}</h4>
                    <div className="flex text-primary">
                      {Array.from({ length: review.rating }).map((_, index) => (
                        <MaterialIcon key={index} name="star" fill className="text-[14px]" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-on-surface-variant font-body-md text-sm leading-relaxed">
                  {review.text}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}