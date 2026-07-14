"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import Link from "next/link";
import MaterialIcon from "@/components/stitch/MaterialIcon";

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
        
        {/* Render a marker for the user's location if provided via center prop */}
        {center && (
          <Marker position={center} opacity={0.7}>
            <Popup>
              <div className="text-center font-bold">You are here</div>
            </Popup>
          </Marker>
        )}

        {/* Render restaurant markers */}
        {restaurants.map((restaurant) => {
          if (!restaurant.location?.lat || !restaurant.location?.lng) return null;
          
          return (
            <Marker
              key={restaurant._id || restaurant.id}
              position={[restaurant.location.lat, restaurant.location.lng]}
            >
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
