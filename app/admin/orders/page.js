"use client";

import { useEffect, useState } from "react";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { io } from "socket.io-client";

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.restaurantId) return;

    // Load initial orders
    api.get(`/api/orders?restaurantId=${user.restaurantId}`)
      .then(res => {
        setOrders(res.data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch orders", err);
        setLoading(false);
      });

    // Setup Socket.IO
    const socket = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000');
    
    socket.on("connect", () => {
      socket.emit("restaurant:join", user.restaurantId);
    });

    socket.on("orders:new", (order) => {
      setOrders(prev => [order, ...prev]);
      try {
        new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg').play().catch(() => {});
      } catch (e) {}
    });

    socket.on("orders:status", (updatedOrder) => {
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.restaurantId]);

  const updateStatus = async (id, newStatus) => {
    try {
      await api.patch(`/api/orders/${id}/status`, { status: newStatus });
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status: newStatus } : o));
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Failed to update order status");
    }
  };

  return (
    <AdminPanel title="Realtime Orders" eyebrow="Socket.IO ready" icon="notifications_active">
      {loading ? (
        <div className="p-8 text-center text-on-surface-variant font-bold animate-pulse">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="p-8 text-center text-on-surface-variant bg-surface-container-low rounded-2xl">
          No orders yet.
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order._id} className="flex flex-col gap-4 rounded-3xl bg-white border border-surface-container shadow-sm p-6">
              
              <div className="flex justify-between items-start border-b border-surface-container pb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="font-headline-sm text-xl font-bold text-on-surface">#{order._id.slice(-6).toUpperCase()}</h2>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      order.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' : 
                      order.status === 'Pending' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                      order.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                      'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-on-surface-variant font-bold mt-1">
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {order.customerName || 'Guest'} {order.tableNumber ? `• Table ${order.tableNumber}` : ''}
                  </p>
                </div>
                
                <select 
                  value={order.status} 
                  onChange={(event) => updateStatus(order._id, event.target.value)} 
                  className="rounded-xl border-2 border-outline-variant bg-surface-container-lowest px-4 py-2 outline-none focus:border-primary font-bold text-sm cursor-pointer hover:bg-surface-variant/20 transition-colors"
                >
                  {["Pending", "Accepted", "Preparing", "Ready", "Completed", "Cancelled"].map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">Order Items</h3>
                <ul className="space-y-3">
                  {order.items?.map((item, idx) => (
                    <li key={idx} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-3">
                        <span className="bg-surface-variant text-on-surface-variant font-bold w-7 h-7 flex items-center justify-center rounded-lg text-xs shrink-0">
                          {item.quantity}x
                        </span>
                        <span className="font-bold text-on-surface">{item.name}</span>
                      </div>
                      <span className="text-on-surface-variant font-bold">Rs {item.price * item.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-surface-container mt-2">
                <span className="font-bold text-on-surface">Total Amount</span>
                <span className="font-bold text-primary text-xl">Rs {order.totalAmount}</span>
              </div>
              
            </div>
          ))}
        </div>
      )}
    </AdminPanel>
  );
}
