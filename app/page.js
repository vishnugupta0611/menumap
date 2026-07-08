"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MaterialIcon from "@/components/stitch/MaterialIcon";
import { listNearbyRestaurants, findDishResults } from "@/services/restaurant-service";
import { useAuth } from "@/contexts/AuthContext";

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [headerVisible, setHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const [nearbyRestaurants, setNearbyRestaurants] = useState([]);
  const [trendingDishes, setTrendingDishes] = useState([]);
  const [recommendedDishes, setRecommendedDishes] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [userLocation, setUserLocation] = useState(null);

  const formatDistance = (distKm) => {
    if (distKm === undefined) return "Locating...";
    if (distKm === null) return "No GPS Data";
    const m = Math.round(distKm * 1000);
    return `${m} meters`;
  };

  // Load data dynamically
  useEffect(() => {
    async function loadData(lat, lng) {
      try {
        const query = (lat && lng) ? `?lat=${lat}&lng=${lng}` : "";
        const restaurantsList = await listNearbyRestaurants(query ? { lat, lng } : {});
        setNearbyRestaurants(restaurantsList);

        const dishes = await findDishResults("", query ? { lat, lng } : {});
        setTrendingDishes(dishes.slice(0, 3));
        setRecommendedDishes(dishes.slice(0, 4));
      } catch {
        setLoadError("Food discovery is temporarily unavailable. Please try again in a moment.");
      }
    }
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          loadData(pos.coords.latitude, pos.coords.longitude);
        },
        () => loadData()
      );
    } else {
      loadData();
    }
  }, []);

  // Handle header show/hide on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setHeaderVisible(false);
      } else {
        setHeaderVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const categories = [
    { label: "All", emoji: "🍽️" },
    { label: "Starters", emoji: "🍕" },
    { label: "Main Course", emoji: "🍛" },
    { label: "Chinese", emoji: "🍜" },
    { label: "Bowls", emoji: "🥗" },
  ];

  return (
    <div className="bg-background text-on-background font-body-md antialiased pb-16 min-h-screen">
      {/* Top App Bar */}
      <header
        className={`fixed top-0 left-0 w-full z-40 bg-surface/80 dark:bg-surface-dim/80 backdrop-blur-xl transition-transform duration-300 ${
          headerVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="flex justify-between items-center w-full px-margin-mobile py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-primary/10 text-primary">
              <MaterialIcon name="restaurant_menu" className="text-[24px]" />
            </div>
            <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary font-bold">MenuMap</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 flex items-center justify-center hover:bg-surface-variant/50 rounded-full transition-colors active:scale-95 duration-200 text-primary cursor-pointer border-none bg-transparent">
              <MaterialIcon name="shopping_cart" />
            </button>
            
            {user ? (
              <Link href="/customer/profile" className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary shadow-sm flex items-center justify-center bg-primary text-on-primary font-bold">
                {user.photo ? (
                  <img
                    className="w-full h-full object-cover"
                    alt={user.name}
                    src={user.photo}
                  />
                ) : (
                  <img
                    className="w-full h-full object-cover"
                    alt={user.name}
                    src="https://media1.tenor.com/m/b52O7R4-l1IAAAAC/milk-and-mocha-bear.gif"
                  />
                )}
              </Link>
            ) : (
              <Link href="/login" className="px-4 h-10 rounded-full border border-outline-variant shadow-sm flex items-center justify-center gap-2 text-on-surface hover:bg-surface-variant transition-colors font-bold">
                <MaterialIcon name="login" className="text-[18px]" />
                <span className="text-sm">Login</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="pt-24 px-margin-mobile max-w-4xl mx-auto">
        {/* Hero Greeting */}
        <section className="mb-8">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Good morning, Foodie!</h2>
          <p className="font-body-md text-on-surface-variant opacity-80">Ready to discover your next favorite meal?</p>
        </section>

        {/* Floating Search Bar */}
        <section className="sticky top-20 z-30 mb-8">
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex items-center shadow-[0px_10px_30px_rgba(0,0,0,0.04)] rounded-full overflow-hidden glass-card border border-white/20 bg-white"
          >
            <MaterialIcon name="search" className="absolute left-4 text-outline" />
            <input
              className="w-full py-4 pl-12 pr-4 bg-transparent border-none focus:ring-0 text-body-md placeholder:text-outline-variant outline-none"
              placeholder="Search dishes, restaurants or cuisines..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </section>

        {/* Quick Search Chips */}
        <section className="mb-10 -mx-margin-mobile overflow-x-auto hide-scrollbar flex gap-3 px-margin-mobile">
          {categories.map((cat) => (
            <button
              key={cat.label}
              onClick={() => {
                setActiveCategory(cat.label);
                if (cat.label !== "All") {
                  setSearchQuery(cat.label);
                } else {
                  setSearchQuery("");
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-on-surface whitespace-nowrap transition-all active:scale-95 cursor-pointer border-none ${
                activeCategory === cat.label
                  ? "bg-primary-container/15 border border-primary/20"
                  : "bg-surface-container-high border border-transparent hover:bg-surface-variant"
              }`}
            >
              <span>{cat.emoji}</span>
              <span className="font-label-sm text-label-sm">{cat.label}</span>
            </button>
          ))}
        </section>

        {/* Trending Dishes */}
        <section className="mb-12">
          {loadError && (
            <div className="mb-6 rounded-2xl border border-error-container bg-error-container/40 p-4 text-sm text-on-error-container">
              {loadError}
            </div>
          )}
          <div className="flex justify-between items-end mb-6">
            <h3 className="font-headline-md text-headline-md text-on-surface">Trending Dishes</h3>
            <button className="text-primary font-label-sm text-label-sm uppercase tracking-wider cursor-pointer border-none bg-transparent">
              See All
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {trendingDishes.map((dish, index) => (
              <div
                key={dish._id || index}
                className={`relative rounded-3xl overflow-hidden shadow-lg group cursor-pointer ${
                  index === 0 ? "sm:col-span-2 h-64" : "h-48"
                }`}
              >
                <img
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  alt={dish.name}
                  src={dish.image}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  {index === 0 && (
                    <span className="px-2 py-1 bg-tertiary text-white rounded-lg text-xs font-bold mb-2 inline-block">
                      MOST LOVED
                    </span>
                  )}
                  <h4 className="font-headline-md text-headline-md text-white">{dish.name}</h4>
                  <p className="text-sm opacity-90">{dish.restaurant?.name || "Kitchen Studio"}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Nearby Restaurants */}
        <section className="mb-12">
          <div className="flex justify-between items-end mb-6">
            <h3 className="font-headline-md text-headline-md text-on-surface">Nearby Restaurants</h3>
            <button className="text-primary font-label-sm text-label-sm uppercase tracking-wider cursor-pointer border-none bg-transparent">
              Map View
            </button>
          </div>
          <div className="flex -mx-margin-mobile overflow-x-auto hide-scrollbar gap-6 px-margin-mobile">
            {nearbyRestaurants.map((restaurant) => (
              <Link
                key={restaurant._id}
                href={`/${restaurant.city}/${restaurant.slug}`}
                className="flex-shrink-0 w-72 group block"
              >
                <div className="relative h-44 w-full rounded-2xl overflow-hidden shadow-sm mb-3">
                  <img
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    alt={restaurant.name}
                    src={restaurant.heroImage}
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                    <MaterialIcon name="star" className="text-sm text-primary fill" />
                    <span className="text-xs font-bold text-on-surface">{restaurant.rating}</span>
                  </div>
                </div>
                <h4 className="font-headline-md text-[18px] text-on-surface group-hover:text-primary transition-colors">
                  {restaurant.name}
                </h4>
                <p className="text-on-surface-variant text-sm flex items-center gap-1 mt-1">
                  <MaterialIcon name="location_on" className="text-xs" />
                  {restaurant.cuisine?.split(", ")[0]} • <span className="font-bold">{formatDistance(restaurant.distanceKm)}</span> away
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Recommended */}
        <section className="mb-12">
          <h3 className="font-headline-md text-headline-md text-on-surface mb-6">Recommended</h3>
          <div className="space-y-6">
            {recommendedDishes.map((dish) => (
              <div
                key={dish._id}
                className="flex gap-4 p-4 rounded-3xl bg-white shadow-[0px_10px_30px_rgba(0,0,0,0.02)] border border-surface-variant/30 hover:border-primary/20 transition-all"
              >
                <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                  <img className="w-full h-full object-cover" alt={dish.name} src={dish.image} />
                </div>
                <div className="flex flex-col justify-between py-1 flex-1">
                  <div>
                    <h4 className="font-bold text-on-surface">{dish.name}</h4>
                    <p className="text-xs text-on-surface-variant mt-1">
                      {dish.veg ? "Vegetarian" : "Non-Vegetarian"} • {dish.restaurant?.name || "Kitchen Studio"}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-primary font-bold">Rs {dish.price}</span>
                    <button className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full hover:scale-110 active:scale-90 transition-transform cursor-pointer border-none">
                      <MaterialIcon name="add" className="text-sm text-white" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Floating Map Button */}
      <button className="fixed bottom-8 right-6 z-40 bg-primary text-white flex items-center gap-2 px-6 py-3 rounded-full shadow-lg hover:shadow-primary/30 transition-all hover:scale-105 active:scale-95 group cursor-pointer border-none">
        <MaterialIcon name="map" className="fill text-white" />
        <span className="font-label-sm text-label-sm">Explore Map</span>
      </button>
    </div>
  );
}
