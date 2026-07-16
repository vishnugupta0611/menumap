"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminPanel, MetricCard } from "@/components/admin/AdminPanel";
import MaterialIcon from "@/components/stitch/MaterialIcon";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { io } from "socket.io-client";

export default function DashboardPage() {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [stats, setStats] = useState({ ordersToday: 0, revenueToday: 0, menuItemsCount: 0, qrScans: 0 });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);
  const [liveNotification, setLiveNotification] = useState("");

  useEffect(() => {
    if (user?.restaurantId) {
      Promise.all([
        api.get(`/api/restaurants/id/${user.restaurantId}`),
        api.get(`/api/restaurants/id/${user.restaurantId}/stats`)
      ])
        .then(([restRes, statsRes]) => {
          setRestaurant(restRes.data.data);
          if (statsRes.data?.data) {
            setStats(statsRes.data.data);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch dashboard data", err);
          setLoading(false);
        });

      // Socket.IO Integration for Live Orders
      const socket = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000');
      
      socket.on("connect", () => {
        socket.emit("restaurant:join", user.restaurantId);
      });

      socket.on("orders:new", (order) => {
        setStats(prev => ({ ...prev, ordersToday: prev.ordersToday + 1, revenueToday: prev.revenueToday + (order.totalAmount || 0) }));
        setRecentOrders(prev => [order, ...prev].slice(0, 4));
        
        // Show live notification
        setLiveNotification(`New order received for Rs ${order.totalAmount}!`);
        setTimeout(() => setLiveNotification(""), 5000);
      });

      socket.on("orders:status", (order) => {
        setRecentOrders(prev => prev.map(o => o._id === order._id ? order : o));
      });

      return () => {
        socket.disconnect();
      };
    } else {
      setLoading(false);
    }
  }, [user?.restaurantId]);

  if (loading) {
    return <div className="p-8 text-center text-on-surface-variant font-bold animate-pulse">Loading real-time dashboard...</div>;
  }

  const restaurantName = restaurant?.name || "Your Restaurant";

  return (
    <div className="space-y-8 animate-fadeInUp relative">
      {/* Live Toast Notification */}
      {liveNotification && (
        <div className="fixed top-24 right-8 z-50 bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-reveal">
          <MaterialIcon name="notifications_active" />
          <span className="font-bold">{liveNotification}</span>
        </div>
      )}

      <div>
        <p className="font-label-sm text-label-sm uppercase text-secondary">Restaurant Operating System</p>
        <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary md:font-display-lg md:text-display-lg">
          {restaurantName} Dashboard
        </h1>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard label="Orders Today" value={stats.ordersToday.toString()} icon="receipt_long" />
        <MetricCard label="Revenue Today" value={`Rs ${stats.revenueToday}`} icon="payments" tone="green" />
        <MetricCard label="Menu Items" value={stats.menuItemsCount.toString()} icon="restaurant_menu" />
      </div>
      <AdminPanel title="Live Order Flow" eyebrow="Realtime ready" icon="notifications_active" action={<Link href="/admin/orders" className="rounded-full bg-primary px-5 py-2 font-bold text-on-primary text-sm whitespace-nowrap">View All Orders</Link>}>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {recentOrders.length > 0 ? (
            recentOrders.map((order, i) => (
              <div key={order._id || i} className="rounded-2xl bg-surface-container-low p-5 shadow-sm border border-primary/20 bg-primary/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-2 h-full bg-primary"></div>
                <MaterialIcon name="room_service" className="mb-3 text-primary text-2xl" />
                <p className="font-bold truncate">{order.customerName || 'Guest'} - Rs {order.totalAmount}</p>
                <p className="text-sm text-primary font-semibold">{order.status}</p>
                <p className="text-xs text-on-surface-variant mt-1">{order.items?.length || 0} items</p>
              </div>
            ))
          ) : (
            <div className="col-span-4 rounded-2xl bg-surface-container-low p-8 text-center border border-dashed border-outline-variant">
              <MaterialIcon name="radio_button_checked" className="mb-3 text-primary text-4xl animate-pulse" />
              <p className="font-bold text-lg">Listening for Live Orders...</p>
              <p className="text-sm text-on-surface-variant">Socket.IO channel connected and waiting for customers.</p>
            </div>
          )}
        </div>
      </AdminPanel>
    </div>
  );
}
