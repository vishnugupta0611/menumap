"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MaterialIcon from "@/components/stitch/MaterialIcon";
import { listNearbyRestaurants, findDishResults, getApproxLocationFromIp } from "@/services/restaurant-service";
import { useAuth } from "@/contexts/AuthContext";
import { useGlobalStore } from "@/stores/global-store";

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [headerVisible, setHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const {
    homeDataLoaded, nearbyRestaurants, trendingDishes, recommendedDishes, setHomeData
  } = useGlobalStore();

  const [loadError, setLoadError] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  
  // Derived state: it's loading if we haven't loaded data yet AND there's no error
  const loading = !homeDataLoaded && !loadError;
  const [greeting, setGreeting] = useState("Good morning");

  console.log("RENDER app/page.js:", { loading, homeDataLoaded, nearbyLen: nearbyRestaurants?.length, trendingLen: trendingDishes?.length });

  const formatDistance = (distKm) => {
    if (distKm === undefined) return "Locating...";
    if (distKm === null) return "No GPS Data";
    const m = Math.round(distKm * 1000);
    if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
    return `${m} m`;
  };

  // Load data dynamically
  useEffect(() => {
    async function loadData(location = {}) {
      if (homeDataLoaded) return; // Use cached data instantly
      
      try {
        const { lat, lng, city } = location;
        const locationFilters = {
          lat: lat || undefined,
          lng: lng || undefined,
          city: city || undefined,
        };
        const TRENDING_KEYWORDS = "Idli Chowmein Dosa Sambhar Pasta Chhole Bhature Pizza Burger Momos";
        
        // Fetch primary data and all fallbacks in ONE parallel burst to eliminate ALL sequential waiting!
        const [restaurantsList, dishesRes, recRes, fallbackRes, ultimateFallbackRes] = await Promise.all([
          listNearbyRestaurants(locationFilters),
          findDishResults(TRENDING_KEYWORDS, { ...locationFilters, limit: 10 }),
          findDishResults("", { ...locationFilters, limit: 20 }),
          findDishResults(TRENDING_KEYWORDS, { limit: 10 }),
          findDishResults("", { limit: 20 })
        ]);
        
        const shuffleArray = (array) => {
          const arr = [...array];
          for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
          }
          return arr;
        };
        
        const broadRestaurants = restaurantsList.length ? restaurantsList : await listNearbyRestaurants({});
        
        let dishes = dishesRes.data || [];
        
        if (dishes.length < 3) {
          const fallbackDishes = fallbackRes.data || [];
          const seen = new Set(dishes.map(d => String(d._id || d.id)));
          for (const d of fallbackDishes) {
            if (!seen.has(String(d._id || d.id))) {
              dishes.push(d);
              seen.add(String(d._id || d.id));
            }
          }
        }
        
        if (dishes.length < 3) {
          const ultimateFallbackDishes = ultimateFallbackRes.data || [];
          const seen = new Set(dishes.map(d => String(d._id || d.id)));
          for (const d of ultimateFallbackDishes) {
            if (!seen.has(String(d._id || d.id))) {
              dishes.push(d);
              seen.add(String(d._id || d.id));
            }
          }
        }
        
        dishes = shuffleArray(dishes);
        const finalTrending = dishes.slice(0, 3);
        
        const rawRecDishes = shuffleArray((recRes.data?.length ? recRes.data : ultimateFallbackRes.data) || []);
        const finalRecDishes = [];
        const seenRecRestros = new Set();
        
        // First try to get up to 5 items from distinct restaurants
        for (const dish of rawRecDishes) {
          const restroId = String(dish.restaurantId?._id || dish.restaurantId || "unknown");
          if (!seenRecRestros.has(restroId)) {
            finalRecDishes.push(dish);
            seenRecRestros.add(restroId);
            if (finalRecDishes.length >= 5) break;
          }
        }
        
        // If we still need more to reach 5, pad with remaining items
        if (finalRecDishes.length < 5) {
          for (const dish of rawRecDishes) {
            if (!finalRecDishes.find(d => d._id === dish._id)) {
              finalRecDishes.push(dish);
              if (finalRecDishes.length >= 5) break;
            }
          }
        }
        
        setHomeData({
          nearbyRestaurants: broadRestaurants,
          trendingDishes: finalTrending,
          recommendedDishes: finalRecDishes
        });
      } catch {
        setLoadError("Food discovery is temporarily unavailable. Please try again in a moment.");
      }
    }
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          loadData({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        async () => {
          const ipLocation = await getApproxLocationFromIp();
          if (ipLocation?.lat && ipLocation?.lng) {
            setUserLocation({ lat: ipLocation.lat, lng: ipLocation.lng, approximate: true });
          }
          loadData(ipLocation || {});
        },
        { timeout: 3000, maximumAge: 60000 } // Don't wait longer than 3 seconds for GPS
      );
    } else {
      getApproxLocationFromIp().then((ipLocation) => {
        if (ipLocation?.lat && ipLocation?.lng) {
          setUserLocation({ lat: ipLocation.lat, lng: ipLocation.lng, approximate: true });
        }
        loadData(ipLocation || {});
      });
    }

    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, [homeDataLoaded]);

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

  const openMapExplore = () => {
    const goToNearby = (location) => {
      const params = new URLSearchParams();
      if (location?.lat && location?.lng) {
        params.set("lat", String(location.lat));
        params.set("lng", String(location.lng));
      }
      router.push(`/map?${params.toString()}`);
    };

    if (userLocation) {
      goToNearby(userLocation);
      return;
    }

    if (!navigator.geolocation) {
      goToNearby();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        goToNearby({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        goToNearby();
      }
    );
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
            <Link href="/" className="flex items-center gap-2">
              <img src="/images/logo.png?v=2" alt="HeyRestro" className="h-12 w-auto" />
            </Link>
          </div>
          
          <div className="flex items-center gap-2">
            {(!user || (user.role !== "owner" && user.role !== "employee" && !user.isEmployee)) && (
              <Link href="/customer/profile#orders" className="w-10 h-10 flex items-center justify-center hover:bg-surface-variant/50 rounded-full transition-colors active:scale-95 duration-200 text-primary cursor-pointer border-none bg-transparent no-underline">
                <MaterialIcon name="shopping_cart" />
              </Link>
            )}
            
            {user ? (
              <Link href={(user.role === "owner" || user.role === "employee" || user.isEmployee) ? "/admin/dashboard" : "/customer/profile"} className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary shadow-sm flex items-center justify-center bg-primary text-on-primary font-bold">
                {(user.role === "owner" || user.role === "employee" || user.isEmployee) ? (
                  <MaterialIcon name="admin_panel_settings" className="text-[20px]" />
                ) : user.photo ? (
                  <img
                    className="w-full h-full object-cover"
                    alt={user.name}
                    src={user.photo}
                  />
                ) : (
                  <img
                    className="w-full h-full object-cover"
                    alt={user.name}
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random`}
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
          <h2 className="font-headline-md text-headline-md text-on-surface mb-2">{greeting}, Foodie!</h2>
          <p className="font-body-md text-on-surface-variant opacity-80">Ready to discover your next favorite meal?</p>
        </section>

        {/* Search Bar */}
        <section className="relative z-30 mb-8">
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex items-center shadow-md hover:shadow-lg transition-shadow duration-300 rounded-full overflow-hidden bg-surface border-2 border-primary/20 focus-within:border-primary/60 pr-2 pl-4 py-1"
          >
            <MaterialIcon name="search" className="text-primary text-[22px]" />
            <input
              className="w-full py-3 px-3 bg-transparent border-none focus:ring-0 text-on-surface font-semibold placeholder:text-on-surface-variant/70 outline-none"
              placeholder="Search dishes, restaurants..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="bg-primary text-on-primary px-4 py-2 rounded-full text-sm font-bold flex items-center justify-center cursor-pointer border-none shadow-sm shrink-0 hover:scale-105 active:scale-95 transition-transform">
              Search
            </button>
          </form>
        </section>

        {/* Quick Search Chips */}
        <section className="mb-10 -mx-margin-mobile overflow-x-auto hide-scrollbar flex gap-3 px-margin-mobile">
          {categories.map((cat, index) => (
            <div key={cat.label} className="flex gap-3">
              <button
                onClick={() => {
                  setActiveCategory(cat.label);
                  if (cat.label !== "All") {
                    router.push(`/search?q=${encodeURIComponent(cat.label)}`);
                  }
                }}
                className={`whitespace-nowrap px-5 py-2.5 rounded-full font-bold text-sm shadow-sm transition-all duration-300 flex items-center gap-2 cursor-pointer border ${
                  activeCategory === cat.label
                    ? "bg-primary text-on-primary border-transparent scale-105"
                    : "bg-surface text-on-surface border-outline-variant/30 hover:bg-surface-variant hover:border-primary/40 active:scale-95"
                }`}
              >
                <span>{cat.emoji}</span>
                {cat.label}
              </button>
              
              {/* Inject All Restros button right after All */}
              {index === 0 && (
                <Link
                  href="/registered-restro"
                  className="whitespace-nowrap px-5 py-2.5 rounded-full font-bold text-sm shadow-sm transition-all duration-300 flex items-center gap-2 cursor-pointer border bg-secondary text-on-secondary border-transparent hover:brightness-110 active:scale-95 no-underline"
                >
                  <MaterialIcon name="storefront" className="text-[18px]" />
                  All Restros
                </Link>
              )}
            </div>
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
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface mb-1">Trending Near You</h2>
              <p className="font-body-sm text-on-surface-variant opacity-80">Most loved dishes in your area</p>
            </div>
            <Link href="/search?trending=true" className="font-label-md text-primary font-bold hover:underline">
              See all
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {loading ? (
              Array(2).fill(0).map((_, i) => (
                <div key={i} className={`relative rounded-3xl bg-surface-variant animate-pulse ${i === 0 ? "sm:col-span-2 h-64" : "h-48"}`}></div>
              ))
            ) : trendingDishes.map((dish, index) => (
              <Link
                key={dish._id || index}
                href={dish.restaurant ? `/${dish.restaurant.city || 'kanpur'}/${dish.restaurant.slug}` : '/search?trending=true'}
                className={`relative rounded-3xl overflow-hidden shadow-lg group cursor-pointer ${
                  index === 0 ? "sm:col-span-2 h-64" : "h-48"
                }`}
              >
                <img
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  alt={dish.name}
                  src={dish.image || '/placeholder-food.jpg'}
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
              </Link>
            ))}
          </div>
        </section>

        {/* Nearby Restaurants */}
        <section className="mb-12">
          <div className="flex justify-between items-end mb-6">
            <h3 className="font-headline-md text-headline-md text-on-surface">Nearby Restaurants</h3>
            <button
              onClick={openMapExplore}
              className="text-primary font-label-sm text-label-sm uppercase tracking-wider cursor-pointer border-none bg-transparent"
            >
              Map View
            </button>
          </div>
          {/* Added pb-4 so shadows/cards don't clip, removed -mx-margin-mobile which causes white overlay issues on some mobile layouts, using full width padding instead */}
          <div className="flex overflow-x-auto hide-scrollbar gap-6 pb-6 pt-2 w-[100vw] relative left-1/2 -translate-x-1/2 px-margin-mobile md:w-auto md:left-auto md:translate-x-0 md:px-0">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-72">
                  <div className="h-44 w-full rounded-2xl bg-surface-variant animate-pulse mb-3"></div>
                  <div className="h-5 w-3/4 bg-surface-variant animate-pulse rounded mb-2"></div>
                  <div className="h-4 w-1/2 bg-surface-variant animate-pulse rounded"></div>
                </div>
              ))
            ) : (
              <>
                {nearbyRestaurants.map((restaurant) => (
                  <Link
                    key={restaurant._id}
                    href={`/${restaurant.city}/${restaurant.slug}`}
                    prefetch={true}
                    className="flex-shrink-0 w-72 group block"
                  >
                    <div className="relative h-44 w-full rounded-2xl overflow-hidden shadow-sm mb-3">
                      <img
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        alt={restaurant.name}
                        src={restaurant.heroImage || restaurant.logoImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(restaurant.name)}&background=random&size=300`}
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
                <Link
                  href="/search"
                  className="flex-shrink-0 w-72 group block h-full min-h-[240px] rounded-2xl border-2 border-dashed border-primary/30 hover:border-primary bg-primary/5 hover:bg-primary/10 transition-all flex flex-col items-center justify-center gap-3"
                >
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <MaterialIcon name="arrow_forward" className="text-primary text-2xl" />
                  </div>
                  <h4 className="font-headline-md text-[18px] text-primary">See all restro</h4>
                </Link>
              </>
            )}
          </div>
        </section>

        {/* Recommended */}
        <section className="mb-12">
          <h3 className="font-headline-md text-headline-md text-on-surface mb-6">Recommended</h3>
          <div className="space-y-6">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-3xl bg-white shadow-sm border border-surface-variant/30">
                  <div className="w-24 h-24 rounded-2xl bg-surface-variant animate-pulse flex-shrink-0"></div>
                  <div className="flex flex-col justify-between py-1 flex-1">
                    <div>
                      <div className="h-5 w-3/4 bg-surface-variant animate-pulse rounded mb-2"></div>
                      <div className="h-3 w-1/2 bg-surface-variant animate-pulse rounded"></div>
                    </div>
                    <div className="h-4 w-1/4 bg-surface-variant animate-pulse rounded mt-2"></div>
                  </div>
                </div>
              ))
            ) : recommendedDishes.map((dish) => (
              <Link
                key={dish._id}
                href={dish.restaurant ? `/${dish.restaurant.city || 'kanpur'}/${dish.restaurant.slug}` : '/search'}
                className="flex gap-4 p-4 rounded-3xl bg-white shadow-[0px_10px_30px_rgba(0,0,0,0.02)] border border-surface-variant/30 hover:border-primary/20 hover:shadow-md transition-all group"
              >
                <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                  <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={dish.name} src={dish.image || '/placeholder-food.jpg'} />
                </div>
                <div className="flex flex-col justify-between py-1 flex-1">
                  <div>
                    <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors">{dish.name}</h4>
                    <p className="text-xs text-on-surface-variant mt-1">
                      {dish.veg ? "Vegetarian" : "Non-Vegetarian"} • {dish.restaurant?.name || "Kitchen Studio"}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-primary font-bold">Rs {dish.price}</span>
                    <span className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full group-hover:scale-110 transition-transform">
                      <MaterialIcon name="arrow_forward" className="text-sm text-white" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* Floating Map Button */}
      <button
        onClick={openMapExplore}
        className="fixed bottom-8 right-6 z-40 bg-primary text-white flex items-center gap-2 px-6 py-3 rounded-full shadow-lg hover:shadow-primary/30 transition-all hover:scale-105 active:scale-95 group cursor-pointer border-none"
      >
        <MaterialIcon name="map" className="fill text-white" />
        <span className="font-label-sm text-label-sm">Explore Map</span>
      </button>

      {/* Footer */}
      <footer className="bg-surface-container-low text-on-surface py-12 px-margin-mobile md:px-margin-desktop mt-20 border-t border-outline-variant/20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h2 className="font-display-sm text-primary font-bold mb-4 flex items-center gap-2">
              <img src="/images/logo.png" alt="HeyRestro" className="h-8 w-auto" />
            </h2>
            <p className="text-on-surface-variant max-w-sm mb-6">
              Connecting food lovers with local flavors. Build digital menus, discover nearby restaurants, and order seamlessly.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-on-surface mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-on-surface-variant hover:text-primary transition-colors text-sm">About Us</Link></li>
              <li><Link href="/contact" className="text-on-surface-variant hover:text-primary transition-colors text-sm">Contact</Link></li>
              <li><Link href="/register/owner" className="text-on-surface-variant hover:text-primary transition-colors text-sm">For Restaurants</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-on-surface mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><Link href="/terms" className="text-on-surface-variant hover:text-primary transition-colors text-sm">Terms & Conditions</Link></li>
              <li><Link href="/privacy" className="text-on-surface-variant hover:text-primary transition-colors text-sm">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-outline-variant/30 text-center md:text-left text-sm text-on-surface-variant flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} HeyRestro. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center hover:text-primary transition-colors">
              <MaterialIcon name="language" className="text-[20px]" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
