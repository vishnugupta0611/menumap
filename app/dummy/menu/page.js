"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import DummyHeader from "@/components/dummy/DummyHeader";
import DummyMenuList from "@/components/dummy/DummyMenuList";

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

function getMockMenu() {
  return [
    // Starters
    {
      _id: "menu1",
      name: "Classic Paneer Tikka",
      description: "Soft paneer marinated with Indian spices",
      price: 250,
      category: "Starters",
      popular: true,
      veg: true,
      image: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
      _id: "menu2",
      name: "Veg Spring Rolls",
      description: "Crispy rolls stuffed with fresh vegetables",
      price: 180,
      category: "Starters",
      popular: true,
      veg: true,
      image: "https://images.pexels.com/photos/2092906/pexels-photo-2092906.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
      _id: "menu3",
      name: "Chicken Wings",
      description: "Spicy grilled chicken wings with dip",
      price: 320,
      category: "Starters",
      popular: true,
      veg: false,
      image: "https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?auto=compress&cs=tinysrgb&w=800"
    },

    // Mains
    {
      _id: "menu4",
      name: "Chicken Biryani",
      description: "Aromatic basmati rice cooked with tender chicken",
      price: 350,
      category: "Mains",
      popular: true,
      veg: false,
      image: "https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
      _id: "menu5",
      name: "Paneer Butter Masala",
      description: "Creamy tomato gravy with soft paneer cubes",
      price: 290,
      category: "Mains",
      popular: true,
      veg: true,
      image: "https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
      _id: "menu6",
      name: "Veg Fried Rice",
      description: "Wok tossed rice with fresh vegetables",
      price: 220,
      category: "Mains",
      popular: false,
      veg: true,
      image: "https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
      _id: "menu7",
      name: "Butter Chicken",
      description: "Rich buttery tomato gravy with tender chicken",
      price: 380,
      category: "Mains",
      popular: true,
      veg: false,
      image: "https://images.pexels.com/photos/7625056/pexels-photo-7625056.jpeg?auto=compress&cs=tinysrgb&w=800"
    },

    // Breads
    {
      _id: "menu8",
      name: "Butter Naan",
      description: "Soft Indian bread glazed with butter",
      price: 50,
      category: "Breads",
      popular: true,
      veg: true,
      image: "https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
      _id: "menu9",
      name: "Garlic Naan",
      description: "Fresh naan topped with roasted garlic",
      price: 70,
      category: "Breads",
      popular: true,
      veg: true,
      image: "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
      _id: "menu10",
      name: "Tandoori Roti",
      description: "Whole wheat bread baked in tandoor",
      price: 30,
      category: "Breads",
      popular: false,
      veg: true,
      image: "https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=800"
    },

    // Desserts
    {
      _id: "menu11",
      name: "Chocolate Brownie",
      description: "Warm chocolate brownie with vanilla ice cream",
      price: 180,
      category: "Desserts",
      popular: true,
      veg: true,
      image: "https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
      _id: "menu12",
      name: "Gulab Jamun",
      description: "Soft milk dumplings soaked in sugar syrup",
      price: 120,
      category: "Desserts",
      popular: true,
      veg: true,
      image: "https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
      _id: "menu13",
      name: "Ice Cream Sundae",
      description: "Vanilla ice cream with chocolate sauce and nuts",
      price: 160,
      category: "Desserts",
      popular: false,
      veg: true,
      image: "https://images.pexels.com/photos/1352278/pexels-photo-1352278.jpeg?auto=compress&cs=tinysrgb&w=800"
    }
  ];
}

function DummyMenuContent() {
  const searchParams = useSearchParams();
  const number = searchParams.get("number");
  
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

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
    const menu = getMockMenu();

    setData({
      restaurant,
      menu
    });

    setLoading(false);
  }, [number]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-primary">Loading Menu Preview...</div>;
  }

  if (error || !data) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-error">{error || "Failed to load"}</div>;
  }

  const { restaurant, menu } = data;
  const settings = restaurant.menuUiSettings || { colorPalette: "clay", font: "jakarta", showTabs: true };

  return (
    <div className={`min-h-screen bg-background pb-8 text-on-surface theme-${settings.colorPalette} font-theme-${settings.font}`}>
      <DummyHeader restaurant={restaurant} />
      <div className="pt-[65px]">
        <DummyMenuList restaurant={restaurant} menu={menu} offers={[]} />
      </div>
    </div>
  );
}

export default function DummyMenuPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold">Loading...</div>}>
      <DummyMenuContent />
    </Suspense>
  );
}