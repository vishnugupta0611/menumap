"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import MaterialIcon from "@/components/stitch/MaterialIcon";
import { findDishResults, listNearbyRestaurants } from "@/services/restaurant-service";
import { useAuth } from "@/contexts/AuthContext";

function SearchResultsContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialFilter = searchParams.get("filter") || "All";
  const initialLat = searchParams.get("lat");
  const initialLng = searchParams.get("lng");

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [filteredData, setFilteredData] = useState([]);
  const [userLat, setUserLat] = useState(initialLat ? Number(initialLat) : null);
  const [userLng, setUserLng] = useState(initialLng ? Number(initialLng) : null);
  const [userCity, setUserCity] = useState("");
  const [locating, setLocating] = useState(false);
  const [loadError, setLoadError] = useState("");

  const formatDistance = (distKm, city) => {
    if (distKm === undefined) return "Locating...";
    if (distKm === null) return city || "Unknown Location";
    const m = Math.round(distKm * 1000);
    if (m >= 1000) {
      return `${(m / 1000).toFixed(1)} km`;
    }
    return `${m} m`;
  };

  useEffect(() => {
    // Attempt to get location silently on mount for accurate distances everywhere
    if (navigator.geolocation && userLat === null) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          setUserLat(pos.coords.latitude);
          setUserLng(pos.coords.longitude);
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
            const data = await res.json();
            const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || "";
            setUserCity(city);
          } catch {}
        },
        () => {
          // Silent failure if denied, just won't show precise distances
        }
      );
    }
  }, [userLat]);

  useEffect(() => {
    async function loadResults() {
      try {
        const filters = {
          maxPrice: activeFilter === "Under Rs 200" ? 200 : undefined,
          veg: activeFilter === "Veg" ? true : undefined,
          openNow: activeFilter === "Open Now" ? true : undefined,
          nearby: activeFilter === "Nearby" ? true : undefined,
          lat: userLat !== null ? userLat : undefined,
          lng: userLng !== null ? userLng : undefined,
          city: activeFilter === "Nearby" && userCity ? userCity : undefined,
        };
        let results = await findDishResults(searchQuery, filters);
        
        if (results && activeFilter === "Rating") {
          results = [...results].sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5));
        }

        setFilteredData(results || []);
        setLoadError("");
      } catch (err) {
        setFilteredData([]);
        setLoadError("Search is temporarily unavailable.");
      }
    }

    loadResults();
  }, [searchQuery, activeFilter, userLat, userLng]);

  const handleFilterClick = (filter) => {
    if (filter === "Nearby" && userLat === null) {
      if (!navigator.geolocation) {
        setLoadError("Geolocation is not supported by your browser");
        return;
      }
      setLocating(true);
      setLoadError("");
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            setUserLat(position.coords.latitude);
            setUserLng(position.coords.longitude);
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
            const data = await res.json();
            const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || "";
            setUserCity(city);
            setActiveFilter(filter);
          } catch {
            setLoadError("Failed to apply location");
          } finally {
            setLocating(false);
          }
        },
        () => {
          setLoadError("Location access denied. Please allow location access to find nearby restaurants.");
          setLocating(false);
        }
      );
    } else {
      setActiveFilter(filter);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (activeFilter !== "All") params.set("filter", activeFilter);
    if (userLat !== null && userLng !== null) {
      params.set("lat", String(userLat));
      params.set("lng", String(userLng));
    }
    router.replace(`/search${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const filterOptions = ["All", "Under Rs 200", "Nearby", "Open Now", "Rating", "Veg"];

  return (
    <div className="bg-background text-on-background min-h-screen pb-16">
      <header className="bg-surface/80 dark:bg-surface-dim/80 backdrop-blur-xl top-0 z-40 sticky border-b border-surface-container">
        <div className="flex justify-between items-center w-full px-margin-mobile py-4 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-3 no-underline">
            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-primary/10 text-primary">
              <MaterialIcon name="restaurant_menu" className="text-[24px]" />
            </div>
            <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary font-bold">MenuMap</h1>
          </Link>
          
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

      <section className="px-margin-mobile pt-4 space-y-4 max-w-4xl mx-auto">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 bg-surface-container-low rounded-xl px-4 py-3 border border-outline-variant/30">
          <MaterialIcon name="search" className="text-on-surface-variant" />
          <input
            type="text"
            className="font-body-md text-on-surface font-semibold bg-transparent border-none outline-none focus:ring-0 w-full p-0"
            placeholder="Search dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar -mx-margin-mobile px-margin-mobile">
          {filterOptions.map((filter) => (
            <button
              key={filter}
              onClick={() => handleFilterClick(filter)}
              className={`whitespace-nowrap px-4 py-2 rounded-full font-label-sm text-label-sm cursor-pointer transition-all active:scale-95 flex items-center gap-1 ${
                activeFilter === filter
                  ? "bg-primary text-on-primary shadow-sm"
                  : "bg-white border border-outline-variant text-on-surface-variant hover:bg-surface-variant/20"
              }`}
            >
              {filter === "Nearby" && locating ? "Locating..." : filter}
              {filter === "Rating" && <MaterialIcon name="star" className="text-[14px]" />}
            </button>
          ))}
        </div>
      </section>

      <main className="px-margin-mobile mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
        {loadError && (
          <div className="col-span-full rounded-2xl border border-error-container bg-error-container/40 p-4 text-sm text-on-error-container">
            {loadError}
          </div>
        )}
        {filteredData.length > 0 ? (
          filteredData.map((item) => (
            <article
              key={item._id || item.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:shadow-primary/5 border border-surface-container transition-all duration-300 flex flex-col h-full group cursor-pointer active:scale-[0.98]"
              onClick={() => router.push(`/${item.restaurant?.city || "kanpur"}/${item.restaurant?.slug || "food-villa"}`)}
            >
              {/* Image Section */}
              <div className="relative h-36 w-full overflow-hidden bg-surface-container-low">
                <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={item.name} src={item.image} />
                
                {/* Rating Badge */}
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm border border-white/20">
                  <MaterialIcon name="star" className="text-[14px] text-primary fill" />
                  <span className="text-xs font-bold text-on-surface">{item.rating || "4.5"}</span>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-3.5 flex flex-col flex-grow">
                {/* Header (Veg/NonVeg + Title) */}
                <div className="flex justify-between items-start gap-2 mb-1">
                  <div className="flex gap-2 items-start">
                    <div className="mt-1 shrink-0 border border-outline-variant/60 p-[2px] bg-white rounded-sm shadow-sm">
                      <div className={`rounded-full w-1.5 h-1.5 ${item.veg ? "bg-tertiary" : "bg-error"}`} />
                    </div>
                    <h3 className="font-bold text-base text-on-surface leading-tight line-clamp-2">
                      {item.name}
                    </h3>
                  </div>
                  <span className="text-base text-primary font-bold whitespace-nowrap">₹{item.price}</span>
                </div>
                
                {/* Restaurant Info */}
                <div className="mt-0.5 mb-3 pl-6">
                  <p className="text-xs text-on-surface-variant line-clamp-1 font-medium">
                    By {item.restaurant?.name || "Nearby restaurant"}
                  </p>
                  {item.restaurant?.address && (
                    <p className="text-[11px] text-on-surface-variant opacity-80 line-clamp-1 mt-0.5">
                      {item.restaurant.address}
                    </p>
                  )}
                </div>

                {/* Footer / Meta Info */}
                <div className="mt-auto pt-3 border-t border-surface-container flex items-center justify-between">
                  <div className="flex items-center gap-1 text-on-surface-variant bg-surface-container-low px-2 py-1 rounded-md">
                    <MaterialIcon name="location_on" className="text-[14px] text-primary" />
                    <span className="text-[11px] font-bold tracking-wide uppercase truncate max-w-[80px]">
                      {formatDistance(item.restaurant?.distanceKm, item.restaurant?.city)}
                    </span>
                  </div>
                  
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold ${item.restaurant?.openNow ? "bg-tertiary/10 text-tertiary" : "bg-error/10 text-error"}`}>
                    <div className={`w-1 h-1 rounded-full ${item.restaurant?.openNow ? "bg-tertiary" : "bg-error"}`}></div>
                    {item.restaurant?.openNow ? "OPEN" : "CLOSED"}
                  </div>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-on-surface-variant font-body-lg">
            {activeFilter === "Nearby" && userLat === null 
              ? "Please allow location access to see nearby dishes." 
              : "No dishes found matching your query."}
          </div>
        )}
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading search...</div>}>
      <SearchResultsContent />
    </Suspense>
  );
}
