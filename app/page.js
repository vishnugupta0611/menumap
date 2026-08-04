"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MaterialIcon from "@/components/stitch/MaterialIcon";
import { listNearbyRestaurants, findDishResults, getApproxLocationFromIp, listGallery } from "@/services/restaurant-service";
import Fuse from "fuse.js";
import { useAuth } from "@/contexts/AuthContext";
import { useGlobalStore } from "@/stores/global-store";
import {
  Search,
  MapPin,
  Star,
  Clock,
  Bike,
  ChevronRight,
  ChevronLeft,
  Flame,
  Sparkles,
  Award,
  UtensilsCrossed,
  ArrowUpRight,
  X,
  MapPinOff,
  Map as MapIcon,
} from "lucide-react";

/* ------------------------------------------------------------------ *
 *  HeyRestro — Discovery Hub
 * ------------------------------------------------------------------ */

const CATEGORIES = [
  { label: "Pizza", emoji: "🍕" },
  { label: "Burger", emoji: "🍔" },
  { label: "Chinese", emoji: "🥡" },
  { label: "South Indian", emoji: "🥞" },
  { label: "Momos", emoji: "🥟" },
  { label: "Biryani", emoji: "🍛" },
  { label: "Dessert", emoji: "🍰" },
  { label: "Coffee", emoji: "☕" },
];

const COLLECTIONS = [
  { title: "Best Rooftop Cafes", count: "32 places", img: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=700&q=80" },
  { title: "Street Food", count: "48 places", img: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=700&q=80" },
  { title: "Family Restaurants", count: "27 places", img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=700&q=80" },
  { title: "Romantic Dinner", count: "19 places", img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=700&q=80" },
  { title: "Budget Eats", count: "61 places", img: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=700&q=80" },
  { title: "Luxury Dining", count: "14 places", img: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=700&q=80" },
];

function ScrollRow({ children, id }) {
  const ref = useRef(null);
  const scroll = (dir) => {
    if (ref.current) ref.current.scrollBy({ left: dir * 340, behavior: "smooth" });
  };
  return (
    <div className="scroll-row-wrap">
      <button className="scroll-nav left" onClick={() => scroll(-1)} aria-label="Scroll left">
        <ChevronLeft size={18} strokeWidth={2.4} />
      </button>
      <div className="scroll-row" ref={ref} id={id}>
        {children}
      </div>
      <button className="scroll-nav right" onClick={() => scroll(1)} aria-label="Scroll right">
        <ChevronRight size={18} strokeWidth={2.4} />
      </button>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [mode, setMode] = useState("restaurant"); // 'restaurant' | 'dish'
  const [query, setQuery] = useState("");
  const [mapOpen, setMapOpen] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const {
    homeDataLoaded, nearbyRestaurants, trendingDishes, recommendedDishes, setHomeData
  } = useGlobalStore();

  const [loadError, setLoadError] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  const loading = !homeDataLoaded && !loadError;

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
      if (homeDataLoaded) return;
      
      try {
        const { lat, lng, city } = location;
        const locationFilters = {
          lat: lat || undefined,
          lng: lng || undefined,
          city: city || undefined,
        };
        const TRENDING_KEYWORDS = "Idli Chowmein Dosa Sambhar Pasta Chhole Bhature Pizza Burger Momos";
        
        const safeFetch = (promise, fallback) => promise.catch(e => { console.error(e); return fallback; });
        
        const [restaurantsList, dishesRes, recRes, fallbackRes, ultimateFallbackRes] = await Promise.all([
          listNearbyRestaurants(locationFilters), // Let this throw if backend is down!
          safeFetch(findDishResults(TRENDING_KEYWORDS, { ...locationFilters, limit: 10 }), { data: [] }),
          safeFetch(findDishResults("", { ...locationFilters, limit: 20 }), { data: [] }),
          safeFetch(findDishResults(TRENDING_KEYWORDS, { limit: 10 }), { data: [] }),
          safeFetch(findDishResults("", { limit: 20 }), { data: [] })
        ]);
        
        const shuffleArray = (array) => {
          const arr = [...array];
          for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
          }
          return arr;
        };
        
        let parsedRestaurants = restaurantsList?.data || restaurantsList;
        let broadRestaurants = (Array.isArray(parsedRestaurants) && parsedRestaurants.length) ? parsedRestaurants : [];
        if (!broadRestaurants.length) {
          const fb = await safeFetch(listNearbyRestaurants({}), []);
          const parsedFb = fb?.data || fb;
          if (Array.isArray(parsedFb)) broadRestaurants = parsedFb;
        }
        
        const extractData = (res) => (Array.isArray(res) ? res : res?.data || []);
        
        let dishes = extractData(dishesRes);
        
        if (dishes.length < 3) {
          const fallbackDishes = extractData(fallbackRes);
          const seen = new Set(dishes.map(d => String(d._id || d.id)));
          for (const d of fallbackDishes) {
            if (!seen.has(String(d._id || d.id))) {
              dishes.push(d);
              seen.add(String(d._id || d.id));
            }
          }
        }
        
        if (dishes.length < 3) {
          const ultimateFallbackDishes = extractData(ultimateFallbackRes);
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
        
        const recData = extractData(recRes);
        const ultData = extractData(ultimateFallbackRes);
        const rawRecDishes = shuffleArray(recData.length ? recData : ultData);
        const finalRecDishes = [];
        const seenRecRestros = new Set();
        
        for (const dish of rawRecDishes) {
          const restroId = String(dish.restaurantId?._id || dish.restaurantId || "unknown");
          if (!seenRecRestros.has(restroId)) {
            finalRecDishes.push(dish);
            seenRecRestros.add(restroId);
            if (finalRecDishes.length >= 5) break;
          }
        }
        
        if (finalRecDishes.length < 5) {
          for (const dish of rawRecDishes) {
            if (!finalRecDishes.find(d => d._id === dish._id)) {
              finalRecDishes.push(dish);
              if (finalRecDishes.length >= 5) break;
            }
          }
        }
        
        const fallbackProcessDishes = async (dishesArray) => {
          const missingImageDishes = dishesArray.filter(d => {
            const hasNoImg = !d.image || typeof d.image !== 'string' || d.image.trim() === '' || d.image.includes('placeholder');
            return hasNoImg && d.restaurant?.city && d.restaurant?.slug;
          });
          if (missingImageDishes.length === 0) return;

          const restroMap = new Map();
          missingImageDishes.forEach(d => {
            const key = `${d.restaurant.city}/${d.restaurant.slug}`;
            if (!restroMap.has(key)) restroMap.set(key, { city: d.restaurant.city, slug: d.restaurant.slug, dishes: [] });
            restroMap.get(key).dishes.push(d);
          });

          await Promise.all(Array.from(restroMap.values()).map(async (restro) => {
            try {
              const gallery = await listGallery(restro.city, restro.slug);
              if (gallery && gallery.length > 0) {
                const fuse = new Fuse(gallery, {
                  keys: ["name", "tags", "title", "description"],
                  threshold: 0.6,
                  ignoreLocation: true
                });
                
                restro.dishes.forEach((dish, i) => {
                  const results = fuse.search(dish.name);
                  if (results.length > 0 && results[0].item.url) {
                    dish.image = results[0].item.url;
                  } else {
                    const randomGalleryImg = gallery[i % gallery.length];
                    if (randomGalleryImg?.url) {
                      dish.image = randomGalleryImg.url;
                    }
                  }
                });
              }
            } catch (e) {
              console.error("Gallery fallback failed", e);
            }
          }));
        };

        await fallbackProcessDishes([...finalTrending, ...finalRecDishes]);

        console.log("Setting home data:", {
          nearbyRestaurants: broadRestaurants,
          trendingDishes: finalTrending,
          recommendedDishes: finalRecDishes
        });

        setHomeData({
          nearbyRestaurants: broadRestaurants,
          trendingDishes: finalTrending,
          recommendedDishes: finalRecDishes
        });

        try {
          const shuffledRestros = shuffleArray(broadRestaurants).slice(0, 10);
          const galleryPromises = shuffledRestros.map(r => safeFetch(listGallery(r.city, r.slug), []));
          const galleries = await Promise.all(galleryPromises);
          
          let allPhotos = [];
          galleries.forEach((g, idx) => {
            const restro = shuffledRestros[idx];
            if (g && g.length > 0) {
              allPhotos.push(...g.map(img => img.url).filter(Boolean).map(url => ({
                url,
                restaurantName: restro.name,
                city: restro.city || 'kanpur',
                slug: restro.slug
              })));
            } else if (restro?.image) {
              allPhotos.push({
                url: restro.image,
                restaurantName: restro.name,
                city: restro.city || 'kanpur',
                slug: restro.slug
              });
            }
          });
          
          allPhotos = shuffleArray(allPhotos).filter(photo => photo && photo.url && !photo.url.includes('placeholder')).slice(0, 15);
          if (allPhotos.length === 0) {
             allPhotos = [
               { url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80", restaurantName: "Sample Restaurant", city: "kanpur", slug: "sample" },
               { url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80", restaurantName: "Sample Cafe", city: "kanpur", slug: "sample" },
               { url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80", restaurantName: "Sample Eatery", city: "kanpur", slug: "sample" },
               { url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80", restaurantName: "Sample Restro", city: "kanpur", slug: "sample" }
             ];
          }
          setGalleryPhotos(allPhotos);
        } catch(e) { console.error("Gallery fetch error:", e); }
      } catch (e) {
        console.error("PAGE LOAD ERROR IN LOADDATA:", e);
        setLoadError("Food discovery is temporarily unavailable. Please try again in a moment. Error: " + e.message);
      }
    }
    
    async function fetchDetailedLocation(lat, lng) {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`);
        const data = await res.json();
        return data?.address?.neighbourhood || data?.address?.suburb || data?.address?.city_district || data?.address?.city || data?.address?.town || null;
      } catch (e) {
        return null;
      }
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          setLocationDenied(false);
          const address = await fetchDetailedLocation(pos.coords.latitude, pos.coords.longitude);
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, city: address });
          loadData({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        async (err) => {
          if (err.code === 1) setLocationDenied(true);
          const ipLocation = await getApproxLocationFromIp();
          if (ipLocation?.lat && ipLocation?.lng) {
            setUserLocation({ lat: ipLocation.lat, lng: ipLocation.lng, approximate: true, city: ipLocation.city });
          }
          loadData(ipLocation || {});
        },
        { timeout: 3000, maximumAge: 60000 }
      );
    } else {
      getApproxLocationFromIp().then((ipLocation) => {
        if (ipLocation?.lat && ipLocation?.lng) {
          setUserLocation({ lat: ipLocation.lat, lng: ipLocation.lng, approximate: true, city: ipLocation.city });
        }
        loadData(ipLocation || {});
      });
    }
  }, [homeDataLoaded]);

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
    if (!query.trim()) return;

    if (mode === 'restaurant') {
      router.push(`/restaurants?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
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

  return (
    <div className="bg-background text-on-background min-h-screen relative overflow-hidden">
      {/* Existing Header Component */}
      <header
        className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 ${
          headerVisible 
            ? "translate-y-0 bg-white/85 backdrop-blur-xl border-b border-black/5 shadow-[0_2px_10px_rgba(0,0,0,0.03)]" 
            : "-translate-y-full bg-transparent"
        }`}
      >
        <div className="flex justify-between items-center w-full px-5 md:px-8 py-3 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105 active:scale-95">
              <img src="/images/logo.png?v=2" alt="HeyRestro" className="h-10 w-auto" />
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            {(!user || (user.role !== "owner" && user.role !== "employee" && !user.isEmployee)) && (
              <Link href="/customer/profile#orders" className="relative w-10 h-10 flex items-center justify-center hover:bg-black/5 rounded-full transition-all active:scale-95 duration-200 text-gray-700 cursor-pointer border-none bg-transparent no-underline">
                <MaterialIcon name="shopping_cart" className="text-[22px]" />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#FF6B35] rounded-full border-2 border-white"></span>
              </Link>
            )}
            
            {user ? (
              <Link href={(user.role === "owner" || user.role === "employee" || user.isEmployee) ? "/admin/dashboard" : "/customer/profile"} 
                className="w-10 h-10 rounded-full overflow-hidden shadow-sm flex items-center justify-center bg-gray-100 text-gray-700 font-bold transition-all hover:scale-105 active:scale-95 ring-2 ring-transparent hover:ring-[#FF6B35]/40">
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
              <Link href="/login" className="px-5 h-10 rounded-full bg-[#140E0A] text-white hover:bg-black shadow-md flex items-center justify-center gap-2 transition-all hover:-translate-y-[1px] active:scale-95 font-semibold no-underline text-[14px]">
                <span>Login</span>
                <ArrowUpRight size={16} className="opacity-80" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* -------------------- New Design Integration -------------------- */}
      <div className="hr-root pt-20 pb-16">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700;800&display=swap');

          .hr-root {
            --bg: transparent;
            --surface: #FFFFFF;
            --primary: #FF6B35;
            --primary-deep: #E6552A;
            --amber: #FFB258;
            --ink: #241C18;
            --ink-soft: #7A6E66;
            --ink-faint: #A79C93;
            --border: rgba(36,28,24,0.08);
            --glass: rgba(255,255,255,0.6);
            --glass-strong: rgba(255,255,255,0.78);
            --glass-border: rgba(255,255,255,0.7);
            --shadow-sm: 0 2px 10px rgba(36,28,24,0.05);
            --shadow-md: 0 10px 30px rgba(255,107,53,0.10), 0 2px 10px rgba(36,28,24,0.05);
            --shadow-lg: 0 24px 60px rgba(255,107,53,0.16), 0 8px 24px rgba(36,28,24,0.08);
            --r-xl: 28px;
            --r-lg: 22px;
            --r-md: 16px;
            --r-full: 999px;

            background: var(--bg);
            color: var(--ink);
            font-family: 'Inter', -apple-system, sans-serif;
            font-feature-settings: "tnum" 1;
            position: relative;
          }

          .hr-root * { box-sizing: border-box; }

          .hr-root ::-webkit-scrollbar { display: none; }
          .hr-root { scrollbar-width: none; }

          /* ---------- ambient background ---------- */
          .bg-orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(70px);
            opacity: 0.35;
            pointer-events: none;
            z-index: 0;
          }
          .bg-orb.one { width: 480px; height: 480px; background: radial-gradient(circle, #FFB258, transparent 70%); top: -180px; right: -120px; }
          .bg-orb.two { width: 380px; height: 380px; background: radial-gradient(circle, #FF6B35, transparent 70%); top: 420px; left: -160px; opacity: 0.18; }

          .hr-container { position: relative; z-index: 1; max-width: 1180px; margin: 0 auto; padding: 0 28px; }

          /* ---------- hero ---------- */
          .hero { padding: 40px 0 40px; text-align: center; }
          .hero-eyebrow {
            display: inline-flex; align-items: center; gap: 6px;
            font-size: 13px; font-weight: 600; color: var(--primary-deep);
            background: rgba(255,107,53,0.09); padding: 7px 16px; border-radius: var(--r-full);
            margin-bottom: 26px; letter-spacing: 0.01em;
          }
          .hero h1 {
            font-family: 'Inter', -apple-system, sans-serif;
            font-weight: 800;
            font-size: clamp(40px, 6vw, 68px);
            line-height: 1.04;
            letter-spacing: -0.03em;
            margin: 0 0 18px;
            color: var(--ink);
          }
          .hero h1 em { font-style: normal; color: var(--primary); font-weight: 800; }
          .hero p { font-size: 17px; color: var(--ink-soft); max-width: 460px; margin: 0 auto; line-height: 1.55; }

          /* ---------- search island (signature element) ---------- */
          .search-island {
            max-width: 700px; margin: 44px auto 0;
            background: var(--glass-strong);
            backdrop-filter: blur(24px) saturate(180%);
            -webkit-backdrop-filter: blur(24px) saturate(180%);
            border: 1px solid var(--glass-border);
            border-radius: 30px;
            box-shadow: var(--shadow-lg);
            padding: 10px;
          }
          .mode-track {
            position: relative;
            display: flex;
            background: rgba(36,28,24,0.045);
            border-radius: 22px;
            padding: 5px;
            margin-bottom: 10px;
          }
          .mode-indicator {
            position: absolute; top: 5px; bottom: 5px; left: 5px;
            width: calc(50% - 5px);
            background: var(--ink);
            border-radius: 17px;
            transition: transform .38s cubic-bezier(.65,0,.35,1);
            box-shadow: 0 6px 16px rgba(36,28,24,0.25);
          }
          .mode-indicator.dish { transform: translateX(calc(100% + 0px)); background: var(--primary); box-shadow: 0 6px 16px rgba(255,107,53,0.35); }
          .mode-btn {
            position: relative; z-index: 1; flex: 1;
            display: flex; align-items: center; justify-content: center; gap: 7px;
            padding: 11px 0; border: none; background: transparent; cursor: pointer;
            font-size: 14px; font-weight: 600; color: var(--ink-soft);
            transition: color .3s ease;
          }
          .mode-btn.active { color: #fff; }
          .search-input-row { display: flex; align-items: center; gap: 12px; padding: 6px 8px 6px 18px; }
          .search-input-row svg { color: var(--ink-faint); flex-shrink: 0; }
          .search-input-row input {
            flex: 1; border: none; outline: none; background: transparent;
            font-size: 16.5px; font-family: 'Inter', sans-serif; color: var(--ink);
            padding: 10px 0;
            margin: 0;
            box-shadow: none;
          }
          .search-input-row input::placeholder { color: var(--ink-faint); font-weight: 400; }
          .search-go {
            width: 44px; height: 44px; border-radius: 15px; border: none; cursor: pointer;
            background: linear-gradient(135deg, var(--primary), var(--primary-deep));
            color: #fff; display: flex; align-items: center; justify-content: center;
            box-shadow: 0 8px 18px rgba(255,107,53,0.35);
            transition: transform .2s ease;
            flex-shrink: 0;
          }
          .search-go:hover { transform: scale(1.06) rotate(-4deg); }

          /* ---------- categories ---------- */
          .categories { padding: 52px 0 8px; }
          .cat-scroll { display: flex; gap: 12px; overflow-x: auto; padding: 4px 0; }
          .cat-chip {
            flex-shrink: 0; display: flex; align-items: center; gap: 8px;
            padding: 11px 20px; border-radius: var(--r-full);
            background: var(--surface); border: 1px solid var(--border);
            font-size: 14.5px; font-weight: 600; color: var(--ink);
            cursor: pointer; transition: all .25s ease; box-shadow: var(--shadow-sm);
            text-decoration: none;
          }
          .cat-chip span.emoji { font-size: 17px; }
          .cat-chip:hover { transform: translateY(-3px); border-color: var(--primary); box-shadow: 0 10px 22px rgba(255,107,53,0.16); color: var(--ink); }

          /* ---------- section header ---------- */
          .section { padding: 46px 0 6px; }
          .section-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 20px; }
          .section-head h2 { font-family: 'Fraunces', serif; font-size: 26px; font-weight: 500; letter-spacing: -0.01em; margin: 0; color: var(--ink); }
          .section-head .sub { font-size: 13.5px; color: var(--ink-soft); margin-top: 4px; font-weight: 500; }
          .see-all { font-size: 13.5px; font-weight: 700; color: var(--primary-deep); display: flex; align-items: center; gap: 3px; cursor: pointer; background:none; border:none; text-decoration:none; }
          .see-all:hover { text-decoration: underline; color: var(--primary-deep); }

          /* ---------- scroll rows ---------- */
          .scroll-row-wrap { position: relative; }
          .scroll-row { display: flex; gap: 18px; overflow-x: auto; scroll-behavior: smooth; padding: 6px 2px 14px; }
          .scroll-nav {
            position: absolute; top: 40%; z-index: 5; width: 36px; height: 36px; border-radius: 50%;
            background: var(--glass-strong); backdrop-filter: blur(10px); border: 1px solid var(--glass-border);
            display: flex; align-items: center; justify-content: center; cursor: pointer;
            box-shadow: var(--shadow-md); transition: transform .2s ease;
            color: var(--ink);
          }
          .scroll-nav:hover { transform: scale(1.1); }
          .scroll-nav.left { left: -6px; } .scroll-nav.right { right: -6px; }

          /* restaurant card */
          .r-card { flex-shrink: 0; width: 268px; border-radius: var(--r-lg); background: var(--surface); border: 1px solid var(--border); overflow: hidden; cursor: pointer; transition: all .35s cubic-bezier(.2,.8,.2,1); box-shadow: var(--shadow-sm); text-decoration: none; display: block; color: var(--ink); }
          .r-card:hover { transform: translateY(-7px); box-shadow: var(--shadow-md); color: var(--ink); }
          .r-img-wrap { position: relative; height: 150px; overflow: hidden; }
          .r-img-wrap img { width: 100%; height: 100%; object-fit: cover; transition: transform .5s ease; }
          .r-card:hover .r-img-wrap img { transform: scale(1.08); }
          .r-badge { position: absolute; top: 10px; left: 10px; font-size: 11px; font-weight: 700; padding: 5px 10px; border-radius: var(--r-full); backdrop-filter: blur(8px); }
          .r-badge.open { background: rgba(46,140,80,0.85); color: #fff; }
          .r-badge.closed { background: rgba(36,28,24,0.7); color: #fff; }
          .r-rating { position: absolute; top: 10px; right: 10px; display: flex; align-items: center; gap: 3px; background: rgba(255,255,255,0.9); backdrop-filter: blur(8px); padding: 5px 9px; border-radius: var(--r-full); font-size: 12px; font-weight: 700; color: var(--ink); }
          .r-body { padding: 14px 16px 16px; }
          .r-body h3 { font-size: 15.5px; font-weight: 700; margin: 0 0 4px; letter-spacing: -0.01em; color: var(--ink); }
          .r-meta { font-size: 12.5px; color: var(--ink-soft); margin-bottom: 10px; }
          .r-foot { display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: var(--ink-soft); font-weight: 600; }
          .r-foot .pill { display: flex; align-items: center; gap: 4px; }

          /* dish card */
          .d-card { flex-shrink: 0; width: 220px; border-radius: var(--r-lg); background: var(--surface); border: 1px solid var(--border); overflow: hidden; cursor: pointer; transition: all .35s cubic-bezier(.2,.8,.2,1); box-shadow: var(--shadow-sm); text-decoration: none; display: block; color: var(--ink); }
          .d-card:hover { transform: translateY(-7px) scale(1.01); box-shadow: var(--shadow-md); color: var(--ink); }
          .d-img { height: 130px; overflow: hidden; }
          .d-img img { width: 100%; height: 100%; object-fit: cover; transition: transform .5s ease; }
          .d-card:hover .d-img img { transform: scale(1.1); }
          .d-body { padding: 12px 14px 14px; }
          .d-body h4 { font-size: 14.5px; font-weight: 700; margin: 0 0 2px; color: var(--ink); }
          .d-body .rest { font-size: 12px; color: var(--ink-soft); margin-bottom: 8px; }
          .d-foot { display: flex; align-items: center; justify-content: space-between; }
          .d-price { font-weight: 800; color: var(--primary-deep); font-size: 14px; }
          .d-rate { display: flex; align-items: center; gap: 3px; font-size: 12px; font-weight: 700; color: var(--ink); }



          /* gallery slider */
          .gallery-slider-wrap { overflow: hidden; width: 100%; padding-bottom: 20px; margin-top: 10px; }
          .gallery-slider { display: flex; gap: 16px; width: max-content; animation: scrollGallery 40s linear infinite; }
          .gallery-slider:hover { animation-play-state: paused; }
          .gallery-slide { width: 260px; height: 180px; border-radius: 20px; overflow: hidden; flex-shrink: 0; box-shadow: var(--shadow-sm); position: relative; cursor: pointer; }
          .gallery-slide img { width: 100%; height: 100%; object-fit: cover; transition: transform .5s ease; }
          .gallery-slide:hover img { transform: scale(1.08); }
          @keyframes scrollGallery { to { transform: translateX(calc(-50% - 8px)); } }

          /* map panel */
          .map-panel {
            position: fixed; inset: 0; z-index: 150; background: rgba(20,14,10,0.45); backdrop-filter: blur(4px);
            display: flex; align-items: center; justify-content: center; animation: fadeIn .25s ease;
          }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          .map-panel-card {
            width: min(560px, 90vw); background: var(--surface); border-radius: 28px; padding: 36px;
            box-shadow: var(--shadow-lg); text-align: center; position: relative; color: var(--ink);
          }
          .map-panel-close { position: absolute; top: 18px; right: 18px; width: 32px; height: 32px; border-radius: 50%; background: rgba(36,28,24,0.06); border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--ink); }
          .map-panel-card h3 { font-family: 'Fraunces', serif; font-size: 24px; font-weight: 500; margin: 18px 0 8px; }
          .map-panel-card p { color: var(--ink-soft); font-size: 14px; margin: 0 0 24px; }
          
          /* map floating button */
          .map-fab-wrap { position: fixed; bottom: 30px; right: 30px; z-index: 50; }
          .map-ping { position: absolute; inset: 0; border-radius: 50%; border: 2px solid var(--primary); animation: ping 2.4s cubic-bezier(0,0,0.2,1) infinite; }
          .map-fab {
            position: relative; width: 48px; height: 48px; border-radius: 50%;
            background: rgba(255,255,255,0.55);
            backdrop-filter: blur(20px) saturate(180%);
            -webkit-backdrop-filter: blur(20px) saturate(180%);
            border: 1px solid rgba(255,255,255,0.8);
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 16px 40px rgba(255,107,53,0.35), 0 4px 14px rgba(36,28,24,0.12);
            cursor: pointer; transition: all .3s cubic-bezier(.34,1.56,.64,1);
          }
          .map-fab:hover { transform: scale(1.08); }
          .map-fab .core {
            width: 100%; height: 100%; border-radius: 50%;
            background: linear-gradient(135deg, var(--primary), var(--primary-deep));
            display: flex; align-items: center; justify-content: center; color: #fff;
          }
          @keyframes ping { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(1.9); opacity: 0; } }

          @keyframes fireFlicker {
            0%, 100% { transform: scale(1); color: #FF6B35; filter: drop-shadow(0 0 2px rgba(255,107,53,0.3)); opacity: 0.9; }
            50% { transform: scale(1.08); color: #FFB258; filter: drop-shadow(0 0 6px rgba(255,178,88,0.8)); opacity: 1; }
          }
          .fire-icon {
            animation: fireFlicker 2s ease-in-out infinite;
            transform-origin: center bottom;
          }

          @media (max-width: 860px) {
            .coll-grid { grid-template-columns: repeat(2, 1fr); }
            .hr-container { padding: 0 18px; }
          }
          @media (max-width: 560px) {
            .coll-grid { grid-template-columns: 1fr; }
            .hero { padding: 30px 0 30px; }
          }
        `}</style>

        <div className="bg-orb one" />
        <div className="bg-orb two" />

        <div className="hr-container">
          {/* Hero */}
          <div className="hero">
            <div className={`hero-eyebrow cursor-pointer transition-opacity ${locationDenied ? 'opacity-70' : 'hover:opacity-80'}`} onClick={() => {
              if (locationDenied) {
                alert("Location access is blocked. Please enable it in your browser settings (click the lock icon in the address bar) to explore nearby places.");
              } else {
                openMapExplore();
              }
            }}>
              {locationDenied ? <MapPinOff size={14} strokeWidth={2.5} /> : <MapPin size={14} strokeWidth={2.5} />}
              <span className={locationDenied ? "line-through decoration-primary decoration-2" : ""}>
                {locationDenied ? "Location Disabled" : (userLocation?.city || "Locating...")}
              </span>
            </div>
            <h1>
              Find your next
              <br />
              <em>favorite meal.</em>
            </h1>
            <p>Restaurants, dishes, and hidden gems around you — discover it all in one place.</p>

            {/* Search Island */}
            <div className="search-island">
              <div className="mode-track">
                <div className={`mode-indicator ${mode === 'dish' ? 'dish' : ''}`} />
                <button type="button" className={`mode-btn ${mode === 'restaurant' ? 'active' : ''}`} onClick={() => setMode('restaurant')}>
                  <UtensilsCrossed size={15} /> Restaurants
                </button>
                <button type="button" className={`mode-btn ${mode === 'dish' ? 'active' : ''}`} onClick={() => setMode('dish')}>
                  <Flame size={15} className="fire-icon" /> Dishes
                </button>
              </div>
              <form className="search-input-row" onSubmit={handleSearchSubmit}>
                <Search size={19} strokeWidth={2.2} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={mode === 'restaurant' ? 'Search restaurants, cafes, bakeries…' : 'Search dishes like Paneer Tikka, Pizza, Momos…'}
                />
                <button type="submit" className="search-go"><ArrowUpRight size={18} /></button>
              </form>
            </div>
          </div>

          {/* Categories */}
          <div className="categories">
            <div className="cat-scroll">
              {CATEGORIES.map((c) => (
                <Link href={`/search?q=${encodeURIComponent(c.label)}`} className="cat-chip" key={c.label}>
                  <span className="emoji">{c.emoji}</span>
                  {c.label}
                </Link>
              ))}
            </div>
          </div>

          {loadError ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center w-full">
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                <MaterialIcon name="error_outline" className="text-3xl" />
              </div>
              <h3 className="text-xl font-bold mb-2">Oops! Something went wrong</h3>
              <p className="text-gray-500 max-w-md">{loadError}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-6 px-6 py-2.5 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition-opacity"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              {/* Nearby restaurants */}
              <div className="section">
                <div className="section-head">
                  <div>
                    <h2>Nearby Restaurants</h2>
                    <div className="sub">Within walking distance, ready to serve</div>
                  </div>
                  <Link href="/restaurants" className="see-all">See all <ChevronRight size={14} /></Link>
                </div>
                <ScrollRow id="nearby">
                  {loading ? (
                    Array(4).fill(0).map((_, i) => (
                      <div key={i} className="flex-shrink-0 w-[268px] h-[260px] bg-black/5 rounded-2xl animate-pulse"></div>
                    ))
                  ) : nearbyRestaurants.length > 0 ? (
                    nearbyRestaurants.map((r) => (
                      <Link href={`/${r.city || 'kanpur'}/${r.slug}`} className="r-card" key={r._id || r.id || r.name}>
                        <div className="r-img-wrap">
                          <img src={r.heroImage || r.logoImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.name)}&background=random&size=300`} alt={r.name} />
                          <div className="r-rating"><Star size={11} fill="#FF6B35" color="#FF6B35" /> {r.rating || '4.5'}</div>
                        </div>
                        <div className="r-body">
                          <h3>{r.name}</h3>
                          <div className="r-meta">{r.cuisine?.split(', ')[0] || 'Restaurant'}</div>
                          <div className="r-foot">
                            <span className="pill"><MapPin size={12} /> {formatDistance(r.distanceKm)}</span>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="w-full py-10 flex flex-col items-center justify-center text-gray-400">
                      <MaterialIcon name="restaurant_menu" className="text-4xl mb-2 opacity-50" />
                      <p>No restaurants found nearby.</p>
                    </div>
                  )}
                </ScrollRow>
              </div>

              {/* Trending dishes */}
              <div className="section">
                <div className="section-head">
                  <div>
                    <h2>Trending Near You</h2>
                    <div className="sub">The dishes everyone's ordering right now</div>
                  </div>
                  <Link href="/search?trending=true" className="see-all">See all <ChevronRight size={14} /></Link>
                </div>
                <ScrollRow id="trending">
                  {loading ? (
                    Array(4).fill(0).map((_, i) => (
                      <div key={i} className="flex-shrink-0 w-[220px] h-[240px] bg-black/5 rounded-2xl animate-pulse"></div>
                    ))
                  ) : trendingDishes.length > 0 ? (
                    trendingDishes.map((d, index) => (
                      <Link href={d.restaurant ? `/${d.restaurant.city || 'kanpur'}/${d.restaurant.slug}` : '/search'} className="d-card" key={d._id || index}>
                        <div className="d-img"><img src={d.image || '/placeholder-food.jpg'} alt={d.name} /></div>
                        <div className="d-body">
                          <h4>{d.name}</h4>
                          <div className="rest">{d.restaurant?.name || 'Kitchen Studio'}</div>
                          <div className="d-foot">
                            <span className="d-price">₹{d.price}</span>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="w-full py-10 flex flex-col items-center justify-center text-gray-400">
                      <MaterialIcon name="local_dining" className="text-4xl mb-2 opacity-50" />
                      <p>No trending dishes found.</p>
                    </div>
                  )}
                </ScrollRow>
              </div>

              {/* Gallery Slider */}
              {galleryPhotos.length > 0 && (
                <div className="section mb-6">
                  <div className="section-head">
                    <div>
                      <h2>Food Gallery</h2>
                      <div className="sub">Delicious moments from nearby restaurants</div>
                    </div>
                  </div>
                  <div className="gallery-slider-wrap">
                    <div className="gallery-slider">
                      {[...galleryPhotos, ...galleryPhotos].map((photo, i) => (
                        <Link href={`/${photo.city}/${photo.slug}`} key={i} className="gallery-slide block group">
                          <img src={photo.url} alt={photo.restaurantName} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none opacity-90 transition-opacity group-hover:opacity-100" />
                          <div className="absolute bottom-3 left-3 right-3 text-white flex items-center justify-between">
                            <div className="font-bold text-[14px] truncate drop-shadow-md">{photo.restaurantName}</div>
                            <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0">
                              <ChevronRight size={14} className="text-white" />
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Floating Map Button */}
      <div className="map-fab-wrap">
        <div className="map-ping" />
        <div className="map-fab" onClick={openMapExplore}>
          <div className="core"><MapIcon size={16} strokeWidth={2.4} color="#000000" /></div>
        </div>
      </div>

      {mapOpen && (
        <div className="map-panel" onClick={() => setMapOpen(false)}>
          <div className="map-panel-card" onClick={(e) => e.stopPropagation()}>
            <button className="map-panel-close" onClick={() => setMapOpen(false)}><X size={16} /></button>
            <MapPin size={30} color="#FF6B35" />
            <h3>Map view</h3>
            <p>This is where the live map opens — every nearby restaurant, plotted and ready to explore.</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-surface-container-low text-on-surface py-12 px-margin-mobile md:px-margin-desktop border-t border-outline-variant/20 relative z-10">
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
