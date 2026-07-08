"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { uploadImageAction } from "@/app/actions/upload";
import MaterialIcon from "@/components/stitch/MaterialIcon";

export default function CustomerProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [photo, setPhoto] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);
  
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [saveStatus, setSaveStatus] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/login");
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
      setOrders(data.data || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-surface-container-lowest pb-12 pt-6">
      <div className="max-w-4xl mx-auto px-4 md:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl border border-surface-container shadow-sm">
          <div className="flex items-center gap-4">
            <label className="relative w-20 h-20 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-3xl overflow-hidden shrink-0 cursor-pointer group shadow-sm border-2 border-surface-variant">
              {photo ? (
                <img src={photo} alt={name} className="w-full h-full object-cover" />
              ) : (
                name.charAt(0).toUpperCase()
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
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
        <div className="bg-white p-6 rounded-3xl border border-surface-container shadow-sm">
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
