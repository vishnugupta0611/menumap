"use client";

import { useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import MaterialIcon from "@/components/stitch/MaterialIcon";
import { listNearbyRestaurants } from "@/services/restaurant-service";

// Dynamically import the map component with ssr: false
const RestaurantMap = dynamic(() => import("@/components/RestaurantMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-surface-container-low">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  ),
});

function MapContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialLat = searchParams.get("lat");
  const initialLng = searchParams.get("lng");

  const [restaurants, setRestaurants] = useState([]);
  const [center, setCenter] = useState(
    initialLat && initialLng ? [Number(initialLat), Number(initialLng)] : null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadRestaurants() {
      try {
        setLoading(true);
        // If we don't have a center yet, try to get it
        let lat = center?.[0];
        let lng = center?.[1];

        if (!lat || !lng) {
          if (navigator.geolocation) {
            try {
              const pos = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                  timeout: 5000,
                });
              });
              lat = pos.coords.latitude;
              lng = pos.coords.longitude;
              setCenter([lat, lng]);
            } catch (e) {
              console.warn("Could not get location", e);
            }
          }
        }

        const data = await listNearbyRestaurants(lat && lng ? { lat, lng } : {});
        setRestaurants(data || []);
      } catch (err) {
        setError("Failed to load restaurants on map.");
      } finally {
        setLoading(false);
      }
    }

    loadRestaurants();
  }, [center]);

  return (
    <div className="relative w-full h-screen bg-surface flex flex-col overflow-hidden">
      {/* Floating Header */}
      <header className="absolute top-0 left-0 right-0 z-50 p-4 pointer-events-none">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <button
            onClick={() => router.back()}
            className="w-12 h-12 rounded-full bg-surface/90 backdrop-blur-md shadow-lg flex items-center justify-center text-on-surface hover:bg-surface pointer-events-auto transition-transform active:scale-95 border border-surface-variant/30"
          >
            <MaterialIcon name="arrow_back" className="text-[24px]" />
          </button>

          <div className="bg-surface/90 backdrop-blur-md shadow-lg px-6 py-3 rounded-full pointer-events-auto border border-surface-variant/30">
            <h1 className="font-headline-sm text-on-surface m-0 font-bold flex items-center gap-2">
              <MaterialIcon name="map" className="text-primary" />
              Explore Map
            </h1>
          </div>
          
          {/* Empty div for flex balance */}
          <div className="w-12 h-12"></div>
        </div>
      </header>

      {/* Map Container */}
      <main className="flex-1 w-full relative z-0">
        {error && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 bg-error-container text-on-error-container px-4 py-2 rounded-lg shadow-md font-body-sm">
            {error}
          </div>
        )}
        <RestaurantMap restaurants={restaurants} center={center} zoom={center ? 14 : 12} />
      </main>

      {/* Bottom Floating Bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-full px-4 max-w-md">
        <div className="bg-surface/90 backdrop-blur-md shadow-xl border border-surface-variant/30 rounded-2xl p-4 pointer-events-auto">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-on-surface-variant text-[12px] font-bold uppercase tracking-wider mb-1">
                Showing
              </p>
              <h2 className="text-on-surface font-headline-sm m-0">
                {loading ? "Loading..." : `${restaurants.length} Restaurants`}
              </h2>
            </div>
            {center && (
              <button 
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((pos) => {
                      setCenter([pos.coords.latitude, pos.coords.longitude]);
                    });
                  }
                }}
                className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors"
              >
                <MaterialIcon name="my_location" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen bg-surface"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
      <MapContent />
    </Suspense>
  );
}
