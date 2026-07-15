"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { uploadImageAction } from "@/app/actions/upload";
import MaterialIcon from "@/components/stitch/MaterialIcon";
import { socket } from "@/lib/socket";

export default function CustomerProfilePage() {
  const { user, loading, updateProfile, logout } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [photo, setPhoto] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);
  
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [saveStatus, setSaveStatus] = useState("");

  useEffect(() => {
    if (loading) return; // Wait for auth to finish loading
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role === "owner") {
      router.push("/admin/dashboard");
      return;
    }
    setName(user.name || "");
    setLocation(user.location || "");
    setPhoto(user.photo || "");

    fetchOrders();
  }, [user, router]);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get("/api/orders/my-orders");
      const fetchedOrders = data.data || [];
      setOrders(fetchedOrders);
      
      if (!socket.connected) socket.connect();
      
      const uniqueRestaurantIds = [...new Set(fetchedOrders.map(o => o.restaurantId?._id).filter(Boolean))];
      uniqueRestaurantIds.forEach(id => socket.emit("restaurant:join", id));
      
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    socket.on("orders:status", (updatedOrder) => {
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    });

    return () => {
      socket.off("orders:status");
    };
  }, []);

  const handleFetchLocation = () => {
    if (!navigator.geolocation) {
      setSaveStatus("Geolocation is not supported by your browser");
      return;
    }
    setLoadingLocation(true);
    setSaveStatus("Locating...");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || "Unknown Location";
          setLocation(city);
          setSaveStatus("Location fetched!");
          setTimeout(() => setSaveStatus(""), 3000);
        } catch (error) {
          setSaveStatus("Failed to fetch address details");
        } finally {
          setLoadingLocation(false);
        }
      },
      (error) => {
        setSaveStatus("Location access denied or failed");
        setLoadingLocation(false);
      }
    );
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSaveStatus("Uploading image...");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadImageAction(formData);
      if (result.success) {
        setPhoto(result.url);
        setSaveStatus("Upload complete! Click Save to apply.");
      } else {
        setSaveStatus(`Upload failed: ${result.error}`);
      }
    } catch (err) {
      setSaveStatus(`Upload failed: ${err.message}`);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveStatus("Saving...");
    try {
      await updateProfile({ name, location, photo });
      setSaveStatus("Profile updated successfully!");
      setTimeout(() => setSaveStatus(""), 3000);
    } catch (err) {
      setSaveStatus(err.message || "Failed to update profile.");
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (!user || user.role === "owner") return null;

  return (
    <div className="min-h-screen bg-surface-container-lowest pb-12 font-body-md antialiased">
      {/* Top App Bar (Same as Landing Page) */}
      <header className="fixed top-0 left-0 w-full z-40 bg-surface/80 dark:bg-surface-dim/80 backdrop-blur-xl">
        <div className="flex justify-between items-center w-full px-4 md:px-8 py-4 max-w-7xl mx-auto">
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
            
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary shadow-sm flex items-center justify-center bg-primary text-on-primary font-bold">
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
            </div>
          </div>
        </div>
      </header>

      <div className="pt-24 max-w-4xl mx-auto px-4 md:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl border border-surface-container shadow-sm">
          <div className="flex items-center gap-5">
            <label className="relative w-24 h-24 rounded-full bg-primary text-on-primary flex items-center justify-center font-extrabold text-4xl overflow-hidden shrink-0 cursor-pointer group shadow-md border-4 border-white transition-transform hover:scale-105 active:scale-95">
              {photo ? (
                <img src={photo} alt={name} className="w-full h-full object-cover" />
              ) : (
                name ? name.charAt(0).toUpperCase() : "U"
              )}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <MaterialIcon name="edit" className="text-white text-[24px]" />
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
            </label>
            <div>
              <h1 className="text-2xl font-bold text-on-surface">{user.name}</h1>
              <p className="text-sm text-on-surface-variant">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-error-container text-on-error-container rounded-xl font-bold hover:bg-error-container/80 transition-colors"
          >
            <MaterialIcon name="logout" className="text-[18px]" />
            Logout
          </button>
        </div>

        {/* Profile Settings */}
        <div className="bg-white p-6 rounded-3xl border border-surface-container shadow-sm">
          <h2 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
            <MaterialIcon name="manage_accounts" className="text-primary" />
            Profile Settings
          </h2>
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-2">Full Name</label>
              <input
                type="text"
                className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary text-body-md"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-2">Location / Address</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary text-body-md"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Downtown, NY"
                />
                <button
                  type="button"
                  onClick={handleFetchLocation}
                  disabled={loadingLocation}
                  className="px-4 h-12 rounded-xl bg-surface-variant text-on-surface-variant font-bold hover:bg-surface-variant/80 transition-colors flex items-center justify-center gap-2 whitespace-nowrap border-none cursor-pointer"
                >
                  <MaterialIcon name="my_location" className="text-[18px]" />
                  <span className="hidden sm:inline">{loadingLocation ? "Locating..." : "Use Current"}</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4 pt-4">
              <span className="text-sm font-bold text-primary text-center sm:text-left">{saveStatus}</span>
              <button 
                type="submit"
                className="w-full sm:w-auto px-6 h-12 rounded-xl bg-primary text-on-primary font-bold hover:bg-primary/90 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* Order History */}
        <div id="orders" className="bg-white p-6 rounded-3xl border border-surface-container shadow-sm scroll-mt-24">
          <h2 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
            <MaterialIcon name="history" className="text-primary" />
            Order History
          </h2>
          
          {loadingOrders ? (
            <div className="py-8 text-center text-on-surface-variant">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="py-8 text-center text-on-surface-variant bg-surface-container-lowest rounded-2xl border border-dashed border-outline-variant">
              You haven't placed any orders yet.
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order._id} className="p-4 rounded-2xl border border-outline-variant bg-surface-container-lowest flex flex-col md:flex-row gap-4 md:items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-surface-variant flex items-center justify-center overflow-hidden shrink-0">
                       {order.restaurantId?.logoImage ? (
                         <img src={order.restaurantId.logoImage} alt="Restaurant" className="w-full h-full object-cover" />
                       ) : (
                         <MaterialIcon name="storefront" />
                       )}
                    </div>
                    <div>
                      <h3 className="font-bold text-on-surface">{order.restaurantId?.name || "Unknown Restaurant"}</h3>
                      <p className="text-xs text-on-surface-variant">
                        {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} items
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between md:justify-end gap-6">
                    <div className="text-right">
                      <p className="font-bold text-on-surface">₹{order.totalAmount}</p>
                      <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold mt-1
                        ${order.status === 'Pending' ? 'bg-orange-100 text-orange-800' :
                          order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    {/* View Details Button could go here */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
