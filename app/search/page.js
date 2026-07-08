"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import MaterialIcon from "@/components/stitch/MaterialIcon";
import { findDishResults, listNearbyRestaurants } from "@/services/restaurant-service";

function SearchResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState("All");
  const [filteredData, setFilteredData] = useState([]);
  const [userLat, setUserLat] = useState(null);
  const [userLng, setUserLng] = useState(null);
  const [userCity, setUserCity] = useState("");
  const [locating, setLocating] = useState(false);
  const [loadError, setLoadError] = useState("");

  const formatDistance = (distKm) => {
    if (distKm === undefined) return "Locating...";
    if (distKm === null) return "No GPS Data";
    const m = Math.round(distKm * 1000);
    return `${m} meters`;
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
        const results = await findDishResults(searchQuery, filters);
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
    router.replace(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const filterOptions = ["All", "Under Rs 200", "Nearby", "Open Now", "Rating", "Veg"];

  return (
    <div className="bg-background text-on-background min-h-screen pb-16">
      <header className="bg-surface/80 dark:bg-surface-dim/80 backdrop-blur-xl top-0 z-40 sticky border-b border-surface-container">
        <div className="flex justify-between items-center w-full px-margin-mobile py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/" className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20 flex items-center justify-center">
              <img
                className="w-full h-full object-cover"
                alt="Concierge headshot"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBK8i5O5uh9OzzoZFbUOgVzF01pEFgmzUrF_PEveJs9cP-PvLr8AwfsW9Mi6Nu0wwIRN4LCXGpmvcWspu0neGdFl6btPOXY_vv-5wTx1OQkz8fwZFheHNIR5lYOnRKWEB25r_eBhkWjJ9QaQ1qnE1loo3xeRZIJmo5uxhjm1UHQfzgGJZtFwyALxE-CUSrCZrYlk5rxifjSGyZCDDeAqvhC4aBXKUuC1RsL4Aq0mQLU-XX6QaCfEIls"
              />
            </Link>
            <Link href="/" className="font-display-lg-mobile text-display-lg-mobile text-primary font-bold">
              MenuMap
            </Link>
          </div>
          <Link href="/login" className="px-4 py-2 rounded-full bg-primary text-on-primary font-label-sm text-label-sm">
            Restaurant Portal
          </Link>
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
              {filter === "Rating" && <MaterialIcon name="keyboard_arrow_down" className="text-[16px]" />}
            </button>
          ))}
        </div>
      </section>

      <main className="px-margin-mobile mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter max-w-7xl mx-auto">
        {loadError && (
          <div className="col-span-full rounded-2xl border border-error-container bg-error-container/40 p-4 text-sm text-on-error-container">
            {loadError}
          </div>
        )}
        {filteredData.length > 0 ? (
          filteredData.map((item) => (
            <article
              key={item._id || item.id}
              className="bg-white rounded-[24px] overflow-hidden shadow-[0px_10px_30px_rgba(0,0,0,0.04)] border border-surface-container transition-all hover:translate-y-[-4px] active:scale-[0.98] duration-300 flex flex-col h-full"
            >
              <div className="relative h-56 w-full">
                <img className="w-full h-full object-cover" alt={item.name} src={item.image} />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                  <MaterialIcon name="star" className="text-[16px] text-primary fill" />
                  <span className="text-label-sm font-bold text-on-surface">{item.rating || 4.5}</span>
                </div>
                <div className="absolute bottom-4 left-4">
                  <div className="border-[1.5px] border-tertiary p-[2px] bg-white rounded-sm">
                    <div className={`rounded-full w-2.5 h-2.5 ${item.veg ? "bg-tertiary" : "bg-error"}`} />
                  </div>
                </div>
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-1 gap-3">
                  <div>
                    <h3 className="font-headline-md text-headline-md text-on-surface font-bold truncate max-w-[220px]">{item.name}</h3>
                    <p className="text-on-surface-variant font-body-md text-sm">{item.restaurant?.name || "Nearby restaurant"}</p>
                  </div>
                  <span className="font-headline-md text-primary font-bold">Rs {item.price}</span>
                </div>
                <div className="flex items-center gap-4 mt-3 mb-5">
                  <div className="flex items-center gap-1 text-on-secondary-fixed-variant">
                    <MaterialIcon name="near_me" className="text-[18px]" />
                    <span className="text-label-sm font-bold">
                      {formatDistance(item.restaurant?.distanceKm)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-on-secondary-fixed-variant">
                    <MaterialIcon name="schedule" className="text-[18px]" />
                    <span className="text-label-sm">{item.restaurant?.openNow ? "Open now" : "Closed"}</span>
                  </div>
                </div>
                <Link
                  href={`/${item.restaurant?.city || "kanpur"}/${item.restaurant?.slug || "food-villa"}`}
                  className="mt-auto w-full py-3 bg-primary text-on-primary rounded-xl font-bold font-label-sm text-sm transition-transform active:scale-95 shadow-md shadow-primary/10 text-center block"
                >
                  View Restaurant
                </Link>
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
