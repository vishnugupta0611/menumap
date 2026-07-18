"use client";

import { Suspense, useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import MaterialIcon from "@/components/stitch/MaterialIcon";
import { findDishResults, getApproxLocationFromIp } from "@/services/restaurant-service";
import { useAuth } from "@/contexts/AuthContext";
import { useGlobalStore } from "@/stores/global-store";

function SearchResultsContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialFilter = searchParams.get("filter") || "All";
  const initialLat = searchParams.get("lat");
  const initialLng = searchParams.get("lng");

  const {
    searchPageLoaded, searchActiveTab, searchAllDishes, searchTrendingDishes,
    searchPage, searchHasMore, searchCachedQuery, searchCachedFilter,
    setSearchActiveTab, setSearchAllInitial,
    appendSearchAll, setSearchTrending
  } = useGlobalStore();

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [submittedQuery, setSubmittedQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState(searchActiveTab);
  const [userLat, setUserLat] = useState(initialLat ? Number(initialLat) : null);
  const [userLng, setUserLng] = useState(initialLng ? Number(initialLng) : null);
  const [userCity, setUserCity] = useState("");
  const [locating, setLocating] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [page, setPage] = useState(searchPageLoaded ? searchPage : 1);
  const [loadingMore, setLoadingMore] = useState(false);
  const observer = useRef();

  const TRENDING_KEYWORDS = "Idli Chowmein Dosa Sambhar Pasta Chhole Bhature Pizza Burger Momos";

  const lastDishElementRef = useCallback(node => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      // Only paginate if we haven't hit the 30 items limit (5 pages of 6) to keep frontend light
      if (entries[0].isIntersecting && searchHasMore && activeTab === "All" && page < 5) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loadingMore, searchHasMore, activeTab, page]);

  const formatDistance = (distKm, city) => {
    if (distKm === undefined) return "Locating...";
    if (distKm === null) return city || "Unknown Location";
    const m = Math.round(distKm * 1000);
    if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
    return `${m} m`;
  };

  useEffect(() => {
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
          getApproxLocationFromIp().then((ipLocation) => {
            if (!ipLocation) return;
            if (ipLocation.city) setUserCity(ipLocation.city);
            if (ipLocation.lat !== null && ipLocation.lng !== null) {
              setUserLat(ipLocation.lat);
              setUserLng(ipLocation.lng);
            }
          });
        }
      );
    }
  }, [userLat]);

  useEffect(() => {
    setSearchActiveTab(activeTab);
    
    async function loadResults() {
      // If navigating back and we have cached data for the exact same query and filter, skip fetching
      if (searchPageLoaded && page === searchPage && searchCachedQuery === submittedQuery && searchCachedFilter === activeTab && (activeTab === "All" ? searchAllDishes.length > 0 : searchTrendingDishes.length > 0)) {
        return;
      }
      
      try {
        if (page > 1) setLoadingMore(true);
        
        let resultsRes;
        
        if (activeTab === "Trending") {
          // Fetch trending quickly without rigid location bounds
          resultsRes = await findDishResults(TRENDING_KEYWORDS, { limit: 12 });
          setSearchTrending(resultsRes.data || []);
        } else {
          // 'All' tab: robust fallback logic by sorting by nearby globally instead of filtering by city
          const reqFilters = {
            nearby: true, // sorts by distance
            lat: userLat !== null ? userLat : undefined,
            lng: userLng !== null ? userLng : undefined,
            page,
            limit: 6
          };
          if (activeTab === "Veg") reqFilters.veg = true;
          if (activeTab === "Under Rs 200") reqFilters.maxPrice = 200;
          
          resultsRes = await findDishResults(submittedQuery, reqFilters);
          const newDishes = resultsRes.data || [];
          
          if (page === 1) {
            setSearchAllInitial(newDishes, resultsRes.hasMore || false, submittedQuery, activeTab);
          } else {
            setSearchAllInitial([...searchAllDishes, ...newDishes], resultsRes.hasMore || false, submittedQuery, activeTab);
            // Updating page explicitly via Zustand state
            useGlobalStore.setState({ searchPage: page });
          }
        }
        
        setLoadError("");
      } catch (err) {
        setLoadError("Search is temporarily unavailable.");
      } finally {
        setLoadingMore(false);
      }
    }

    loadResults();
  }, [submittedQuery, activeTab, userLat, userLng, page]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setPage(1);
  };

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
            setPage(1);
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
      setPage(1);
      setActiveFilter(filter);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSubmittedQuery(searchQuery);
    setPage(1);
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (activeTab !== "All") params.set("tab", activeTab);
    if (userLat !== null && userLng !== null) {
      params.set("lat", String(userLat));
      params.set("lng", String(userLng));
    }
    router.replace(`/search${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const tabs = ["All", "Trending", "Veg", "Under Rs 200"];
  const displayData = activeTab === "Trending" ? searchTrendingDishes : searchAllDishes;

  return (
    <div className="bg-background text-on-background min-h-screen pb-16">
      <header className="bg-surface/80 dark:bg-surface-dim/80 backdrop-blur-xl top-0 z-40 sticky border-b border-surface-container">
        <div className="flex justify-between items-center w-full px-margin-mobile py-4 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-3 no-underline">
            <img src="/images/logo.png" alt="HeyRestro" className="h-12 w-auto" />
          </Link>
          
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

      <section className="px-margin-mobile pt-4 space-y-4 max-w-4xl mx-auto">
        <form onSubmit={handleSearchSubmit} className="flex flex-col gap-2">
          <div className="flex items-center gap-3 bg-surface-container-low rounded-xl px-4 py-3 border border-outline-variant/30 w-full">
            <MaterialIcon name="search" className="text-on-surface-variant" />
            <input
              type="text"
              className="font-body-md text-on-surface font-semibold bg-transparent border-none outline-none focus:ring-0 w-full p-0"
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="bg-primary text-on-primary px-3 py-1 rounded-lg text-sm font-bold flex items-center justify-center cursor-pointer border-none shadow-sm shrink-0 hover:opacity-90">
              Search
            </button>
          </div>
        </form>

        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar -mx-margin-mobile px-margin-mobile">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`whitespace-nowrap px-6 py-2 rounded-full font-bold text-sm cursor-pointer transition-all active:scale-95 flex items-center gap-1 ${
                activeTab === tab
                  ? "bg-primary text-on-primary shadow-md"
                  : "bg-surface border border-outline-variant text-on-surface-variant hover:bg-surface-variant/30"
              }`}
            >
              {tab === "Trending" && <MaterialIcon name="trending_up" className={`text-[18px] ${activeTab === tab ? "text-on-primary" : "text-primary"}`} />}
              {tab === "Veg" && <div className="w-3 h-3 rounded-sm border border-green-600 flex items-center justify-center mr-1"><div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div></div>}
              {tab}
            </button>
          ))}
        </div>
      </section>

      <main className="px-margin-mobile mt-6 max-w-7xl mx-auto">
        {activeTab === "Trending" && (
          <div className="mb-4">
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-1 flex items-center gap-2">
              <MaterialIcon name="trending_up" className="text-primary" /> Trending Now
            </h2>
            <p className="font-body-sm text-on-surface-variant opacity-80">Popular dishes that people are loving</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loadError && (
          <div className="col-span-full rounded-2xl border border-error-container bg-error-container/40 p-4 text-sm text-on-error-container">
            {loadError}
          </div>
        )}
        {displayData.length > 0 ? (
          displayData.map((item, index) => {
            const isLast = index === displayData.length - 1;
            return (
            <article
              ref={isLast ? lastDishElementRef : null}
              key={item._id || item.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-surface-container transition-all duration-300 flex flex-col h-full group cursor-pointer active:scale-[0.98]"
              onClick={() => router.push(`/${item.restaurant?.city || "kanpur"}/${item.restaurant?.slug || "food-villa"}`)}
            >
              {/* Image Section */}
              <div className="relative h-40 w-full overflow-hidden bg-surface-container-low">
                <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={item.name} src={item.image} />
                
                {item.rating && (
                  <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1 shadow-sm border border-white/20">
                    <span className="text-[12px]">⭐</span>
                    <span className="text-[12px] font-bold text-on-surface">{item.rating}</span>
                  </div>
                )}

                <button className="absolute top-2 right-2 px-3 py-1.5 bg-primary text-on-primary flex items-center gap-1 shadow-lg shadow-primary/30 border border-primary/20 font-bold text-[11px] uppercase tracking-wider rounded-full hover:bg-primary-container hover:text-on-primary-container hover:scale-105 active:scale-95 transition-all duration-300 z-10 group/add" onClick={(e) => { 
                  e.stopPropagation(); 
                  router.push(`/${item.restaurant?.city || "kanpur"}/${item.restaurant?.slug || "food-villa"}/menu`); 
                }}>
                  <span>ADD</span>
                  <MaterialIcon name="add" className="text-[14px] transition-transform duration-300 group-hover/add:rotate-90" />
                </button>

                {item.isBestseller && (
                  <div className="absolute bottom-2 left-2 bg-gradient-to-r from-primary to-primary-container text-on-primary px-2 py-0.5 rounded shadow-md text-[10px] font-bold uppercase tracking-wider">
                    Bestseller
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="p-3.5 flex flex-col flex-grow">
                {/* Title Row */}
                <div className="flex justify-between items-start gap-2 mb-1">
                  <h3 className="font-bold text-[16px] text-on-surface leading-tight line-clamp-1">
                    {item.name}
                  </h3>
                  <span className="text-[16px] text-primary font-bold whitespace-nowrap">₹{item.price}</span>
                </div>
                
                {/* Restaurant */}
                <p className="text-[13px] text-on-surface-variant font-medium line-clamp-1 mb-0.5">
                  {item.restaurant?.name || "Nearby restaurant"}
                </p>

                {/* Category */}
                <p className="text-[12px] text-on-surface-variant opacity-80 mb-3 font-medium">
                  {item.category ? `${item.category} • ` : ""}{item.veg ? "Veg" : "Non-Veg"}
                </p>

                {/* Divider */}
                <div className="mt-auto border-t border-surface-container pt-3"></div>

                {/* Bottom Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[12px] text-on-surface-variant font-medium">
                    📍 {formatDistance(item.restaurant?.distanceKm, item.restaurant?.city)}
                  </div>
                  
                  <div className={`flex items-center gap-1 text-[12px] font-bold ${item.restaurant?.openNow ? "text-tertiary" : "text-error"}`}>
                    {item.restaurant?.openNow ? "🟢 Open" : "🔴 Closed"}
                  </div>
                </div>
              </div>
            </article>
            );
          })
        ) : (
          <div className="col-span-full py-16 text-center text-on-surface-variant font-body-lg">
            No dishes found.
          </div>
        )}
        </div>
        
        {loadingMore && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
