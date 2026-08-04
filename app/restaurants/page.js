"use client";

import { Suspense, useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import MaterialIcon from "@/components/stitch/MaterialIcon";
import { api } from "@/lib/api";

function RestaurantsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  
  const [restaurants, setRestaurants] = useState([]);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");
  const observer = useRef();

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset pagination when search query changes
  useEffect(() => {
    setRestaurants([]);
    setPage(1);
    setHasMore(true);
  }, [debouncedQuery]);

  // Fetch data
  useEffect(() => {
    let isMounted = true;
    
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/restaurants', {
          params: {
            q: debouncedQuery || undefined,
            page: page,
            limit: 6
          }
        });
        
        if (!isMounted) return;
        
        const data = res.data.data || [];
        setHasMore(res.data.hasMore ?? data.length === 6);
        
        if (page === 1) {
          setRestaurants(data);
        } else {
          setRestaurants(prev => [...prev, ...data]);
        }
        setError("");
      } catch (err) {
        if (isMounted) {
          setError("Failed to load restaurants.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchRestaurants();
    
    return () => { isMounted = false; };
  }, [debouncedQuery, page]);

  // Infinite scroll observer
  const lastElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    }, { rootMargin: "200px" }); // Start loading slightly before hitting the bottom
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  return (
    <div className="bg-background min-h-screen pb-16 flex flex-col font-body-md text-on-background">
      {/* Sticky Top Header with Search */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md shadow-sm border-b border-outline-variant/30">
        <div className="flex items-center justify-between px-margin-mobile py-4 max-w-4xl mx-auto gap-4">
          <button 
            onClick={() => router.back()}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-surface-variant/50 text-on-surface hover:bg-surface-variant transition-colors active:scale-95 border-none cursor-pointer"
          >
            <MaterialIcon name="arrow_back" />
          </button>
          
          <div className="flex-1 relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant flex items-center">
              <MaterialIcon name="search" />
            </div>
            <input
              type="text"
              placeholder="Search registered restaurants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-surface border border-outline-variant/50 rounded-full text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow text-sm"
            />
          </div>
        </div>
      </header>

      {/* Main Content List */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-margin-mobile py-6">
        <h1 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-6">All Restaurants</h1>
        
        {error && (
          <div className="text-center text-error p-4 bg-error-container rounded-xl mb-4">
            {error}
          </div>
        )}

        {restaurants.length === 0 && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-70">
            <MaterialIcon name="restaurant_menu" className="text-6xl mb-4 text-primary" />
            <p className="text-lg font-bold">No restaurants found</p>
            <p className="text-sm">Try searching with a different term.</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          {restaurants.map((restro, index) => {
            const isLast = index === restaurants.length - 1;
            const ref = isLast ? lastElementRef : null;
            
            return (
              <Link 
                href={`/${encodeURIComponent(restro.city)}/${encodeURIComponent(restro.slug)}`} 
                key={restro._id || restro.id}
                ref={ref}
                className="group block bg-surface rounded-2xl overflow-hidden shadow-sm border border-outline-variant/30 hover:shadow-md hover:border-primary/30 transition-all duration-300 no-underline text-inherit"
              >
                <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-surface-variant">
                  {restro.heroImage ? (
                    <img 
                      src={restro.heroImage} 
                      alt={restro.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-on-surface-variant opacity-50">
                      <MaterialIcon name="restaurant" className="text-4xl" />
                    </div>
                  )}
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                  
                  {/* Content over image */}
                  <div className="absolute bottom-0 left-0 p-4 sm:p-6 w-full text-white">
                    <div className="flex items-center gap-3">
                      {restro.logoImage && (
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 bg-white flex-shrink-0 shadow-lg">
                          <img src={restro.logoImage} alt={`${restro.name} logo`} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold line-clamp-1 drop-shadow-md">{restro.name}</h2>
                        <div className="flex items-center gap-2 text-white/90 text-sm mt-1">
                          <MaterialIcon name="location_on" className="text-[14px]" />
                          <span className="capitalize">{restro.city}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 flex justify-between items-center bg-surface-container-lowest">
                  <div>
                    {restro.cuisine && (
                      <p className="text-xs font-semibold text-primary/80 uppercase tracking-wider mb-1 line-clamp-1">{restro.cuisine}</p>
                    )}
                    <div className="flex items-center gap-3 text-sm text-on-surface-variant font-medium">
                      {restro.rating > 0 && (
                        <span className="flex items-center gap-1 bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full text-xs">
                          <MaterialIcon name="star" className="text-[14px]" />
                          {restro.rating.toFixed(1)}
                        </span>
                      )}
                      {restro.priceForTwo && <span>₹{restro.priceForTwo} for two</span>}
                    </div>
                  </div>
                  
                  <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${restro.openNow ? 'bg-primary/10 text-primary' : 'bg-surface-variant text-on-surface-variant'}`}>
                    {restro.openNow ? 'Open Now' : 'Closed'}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 gap-6 mt-6">
            {[...Array(page === 1 ? 4 : 2)].map((_, i) => (
              <div key={`skel-${i}`} className="bg-surface rounded-2xl overflow-hidden shadow-sm border border-outline-variant/30 animate-pulse">
                <div className="h-48 sm:h-56 bg-surface-variant w-full"></div>
                <div className="p-4 bg-surface-container-lowest flex justify-between">
                  <div>
                    <div className="h-3 bg-surface-variant rounded w-20 mb-2"></div>
                    <div className="h-4 bg-surface-variant rounded w-32"></div>
                  </div>
                  <div className="h-6 bg-surface-variant rounded-full w-16"></div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {!hasMore && restaurants.length > 0 && (
          <div className="text-center py-8 text-on-surface-variant text-sm font-medium">
            You've reached the end of the list.
          </div>
        )}
      </main>
    </div>
  );
}

export default function RestaurantsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
      <RestaurantsContent />
    </Suspense>
  );
}
