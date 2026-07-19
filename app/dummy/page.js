"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import DummyHeader from "@/components/dummy/DummyHeader";
import DummyProfile from "@/components/dummy/DummyProfile";
import DummyPromoPopup from "@/components/dummy/DummyPromoPopup";

// Direct import of dummy data
import dummyRestaurants from "@/app/api/data.json";

function transformToRestaurantDetail(restaurant) {
  return {
    _id: "dummy_res_" + restaurant.mobileNumber.replace(/\D/g, '').slice(-4),
    name: restaurant.restaurantName,
    city: "dummy",
    slug: "dummy",
    phone: restaurant.mobileNumber,
    address: restaurant.location,
    rating: parseFloat(restaurant.rating),
    heroImage: restaurant.imageUrls[0],
    logoImage: "https://img.freepik.com/premium-vector/restaurant-logo-design-template_79169-56.jpg",
    story: "Welcome to " + restaurant.restaurantName + ". This is a preview generated just for you. Take a look at our amazing menu and facilities!",
    cuisine: "Multi-Cuisine",
    openNow: true,
    priceForTwo: 500,
    facilities: ["Free WiFi", "AC", "Outdoor Seating", "Parking Available"],
    website: "https://example.com",
    socialLinks: {
      instagram: "https://instagram.com/dummy",
      facebook: "https://facebook.com/dummy",
      x: "https://x.com/dummy"
    },
    menuUiSettings: {
      colorPalette: "clay",
      font: "jakarta",
      layout: "bento",
      showBanner: true,
      showDescription: true,
      showBadges: true,
      showImage: true,
      galleryLayout: "aesthetic",
      showTabs: true
    }
  };
}

function transformToGallery(imageUrls) {
  return imageUrls.map((url, index) => ({
    _id: "gal_" + index,
    url: url,
    caption: `Gallery image ${index + 1}`
  }));
}

function getMockReviews() {
  return [
    { _id: "rev1", name: "Rahul Singh", rating: 5, text: "Amazing food and great ambiance!", createdAt: new Date().toISOString() },
    { _id: "rev2", name: "Priya Sharma", rating: 4, text: "Loved the starters, will visit again.", createdAt: new Date(Date.now() - 86400000).toISOString() },
    { _id: "rev3", name: "Aman Gupta", rating: 5, text: "Best place in town!", createdAt: new Date(Date.now() - 172800000).toISOString() }
  ];
}

function getMockMenu() {
  return [
    { _id: "menu1", name: "Classic Paneer Tikka", description: "Soft paneer marinated with Indian spices", price: 250, category: "Starters", popular: true, veg: true, image: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400" },
    { _id: "menu2", name: "Chicken Biryani", description: "Aromatic basmati rice cooked with tender chicken", price: 350, category: "Mains", popular: true, veg: false, image: "https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=400" },
    { _id: "menu3", name: "Butter Naan", description: "Soft Indian bread glazed with butter", price: 50, category: "Breads", popular: false, veg: true, image: "https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&cs=tinysrgb&w=400" },
    { _id: "menu4", name: "Chocolate Brownie", description: "Warm chocolate brownie with a scoop of vanilla ice cream", price: 180, category: "Desserts", popular: true, veg: true, image: "https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?auto=compress&cs=tinysrgb&w=400" }
  ];
}

function DummyContent() {
  const searchParams = useSearchParams();
  const number = searchParams.get("number");
  
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPromo, setShowPromo] = useState(false);

  useEffect(() => {
    if (!number) {
      setError("Please provide a mobile number in the URL (?number=xxx)");
      setLoading(false);
      return;
    }

    // Find restaurant by mobile number from local data
    const normalizedNumber = number.replace(/\s+/g, '');
    const rawData = dummyRestaurants.find(r => 
      r.mobileNumber.replace(/\s+/g, '') === normalizedNumber
    );

    if (!rawData) {
      setError("Restaurant not found or error loading dummy data.");
      setLoading(false);
      return;
    }

    const restaurant = transformToRestaurantDetail(rawData);
    const gallery = transformToGallery(rawData.imageUrls);
    const reviews = getMockReviews();
    const menu = getMockMenu();

    setData({
      restaurant,
      gallery,
      reviews,
      menu
    });

    setLoading(false);
  }, [number]);

  // Show promo popup 5 seconds after the page has loaded successfully
  useEffect(() => {
    if (!loading && data) {
      const timer = setTimeout(() => setShowPromo(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [loading, data]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-primary">Loading Preview...</div>;
  }

  if (error || !data) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-error">{error || "Failed to load"}</div>;
  }

  const { restaurant, menu, reviews, gallery } = data;
  const settings = restaurant.menuUiSettings || { colorPalette: "clay", font: "jakarta", showTabs: true };

  return (
    <div className={`min-h-screen bg-background pb-8 text-on-surface theme-${settings.colorPalette} font-theme-${settings.font}`}>
      <DummyHeader restaurant={restaurant} />
      <div className="pt-[65px]">
        <DummyProfile restaurant={restaurant} menu={menu} reviews={reviews} gallery={gallery} />
      </div>
      <DummyPromoPopup show={showPromo} onClose={() => setShowPromo(false)} />
    </div>
  );
}

export default function DummyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold">Loading...</div>}>
      <DummyContent />
    </Suspense>
  );
}