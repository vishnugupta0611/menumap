"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import Link from "next/link";
import MaterialIcon from "@/components/stitch/MaterialIcon";
import L from "leaflet";

const createCustomIcon = (emoji) => {
  return L.divIcon({
    className: "custom-map-icon bg-transparent border-none",
    html: `<div style="background: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.3); border: 2.5px solid #FF4500; font-size: 22px;">${emoji}</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
    tooltipAnchor: [0, -20]
  });
};

const restroIcon = createCustomIcon("🍽️");
const userIcon = createCustomIcon("📍");

function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

export default function RestaurantMap({ restaurants, center, zoom = 13 }) {
  // Default to a central point if no center is provided
  const mapCenter = center || [25.4358, 81.8463]; // Allahabad fallback

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={mapCenter} zoom={zoom} />
        
        {/* Render a marker for the user's location if provided via center prop */}
        {center && (
          <Marker position={center} icon={userIcon} zIndexOffset={1000}>
            <Tooltip direction="top" opacity={1} permanent={false}>
              <div className="font-bold">You are here</div>
            </Tooltip>
          </Marker>
        )}

        {/* Render restaurant markers */}
        {restaurants.map((restaurant, index) => {
          let lat = restaurant.location?.lat;
          let lng = restaurant.location?.lng;
          
          if (!lat || !lng) {
            // Predictable offset based on index so they don't overlap randomly on re-render
            const offset = (index + 1) * 0.005;
            lat = mapCenter[0] + (index % 2 === 0 ? offset : -offset);
            lng = mapCenter[1] + (index % 3 === 0 ? offset : -offset);
          }
          
          return (
            <Marker
              key={restaurant._id || restaurant.id}
              position={[lat, lng]}
              icon={restroIcon}
            >
              <Tooltip direction="top" opacity={1} className="bg-transparent border-none shadow-none p-0">
                <div className="flex flex-col w-[160px] bg-white rounded-lg overflow-hidden shadow-lg border border-surface-container">
                  <div className="w-full h-24">
                    <img 
                      src={restaurant.heroImage || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500"} 
                      alt={restaurant.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-2">
                    <h3 className="font-bold text-[14px] text-on-surface m-0 leading-tight truncate">
                      {restaurant.name}
                    </h3>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-1 text-on-surface-variant text-[12px]">
                        <span className="text-[12px]">⭐</span>
                        <span className="font-bold">{restaurant.rating || "4.0"}</span>
                      </div>
                      <div className="text-primary font-bold text-[10px] uppercase tracking-wider">
                        View
                      </div>
                    </div>
                  </div>
                </div>
              </Tooltip>
              <Popup>
                <div className="flex flex-col min-w-[200px]">
                  <div className="w-full h-24 mb-2 rounded-lg overflow-hidden">
                    <img 
                      src={restaurant.heroImage || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500"} 
                      alt={restaurant.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-bold text-[16px] text-on-surface m-0 leading-tight">
                    {restaurant.name}
                  </h3>
                  <div className="flex items-center gap-1 text-on-surface-variant text-[12px] mt-1 mb-2">
                    <MaterialIcon name="star" className="text-[14px] text-primary" />
                    <span className="font-bold">{restaurant.rating || "4.0"}</span>
                    <span>• {restaurant.cuisine?.split(",")[0] || "Food"}</span>
                  </div>
                  <Link 
                    href={`/${restaurant.city || "kanpur"}/${restaurant.slug}`}
                    className="bg-primary text-on-primary py-1.5 px-3 rounded-md text-center font-bold text-[13px] no-underline block hover:bg-primary/90"
                  >
                    View Menu
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
