"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import MaterialIcon from "@/components/stitch/MaterialIcon";
import { socket } from "@/lib/socket";

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const observer = useRef();

  const lastOrderElementRef = useCallback(node => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loadingMore, hasMore]);

  // Load Paginated Orders
  useEffect(() => {
    if (!user?.restaurantId) return;

    const fetchOrders = async () => {
      try {
        if (page > 1) setLoadingMore(true);
        const res = await api.get(`/api/orders?restaurantId=${user.restaurantId}&page=${page}&limit=10`);
        const newOrders = res.data.data || [];
        
        setOrders(prev => {
          if (page === 1) return newOrders;
          const seen = new Set(prev.map(o => o._id));
          const deduplicated = newOrders.filter(o => !seen.has(o._id));
          return [...prev, ...deduplicated];
        });
        const meta = res.data.meta;
        setHasMore(meta ? meta.page < meta.pages : false);
      } catch (err) {
        console.error("Failed to fetch orders", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    fetchOrders();
  }, [user?.restaurantId, page]);

  // Setup Socket.IO
  useEffect(() => {
    if (!user?.restaurantId) return;

    if (!socket.connected) {
      socket.connect();
    }
    socket.emit("restaurant:join", user.restaurantId);


    socket.on("orders:new", (order) => {
      setOrders(prev => {
        if (prev.find(o => o._id === order._id)) return prev;
        return [order, ...prev];
      });
      try {
        new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg').play().catch(() => {});
      } catch (e) {}
    });

    socket.on("orders:status", (updatedOrder) => {
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    });

    return () => {
      socket.off("orders:new");
      socket.off("orders:status");
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

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'Pending': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <AdminPanel title="Live Orders" eyebrow="Real-time Management" icon="notifications_active">
      
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant pb-4">
        <div>
          <h2 className="text-lg font-bold text-on-surface">Order Management</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            <span className="text-xs font-medium text-on-surface-variant">Listening for live updates...</span>
          </div>
        </div>
        <div className="text-sm font-medium text-on-surface-variant bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/50">
          Showing {orders.length} Orders
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-48 bg-surface-container-low rounded-xl animate-pulse border border-outline-variant"></div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center bg-surface-container-lowest border border-outline-variant rounded-xl flex flex-col items-center">
          <MaterialIcon name="inbox" className="text-5xl text-outline mb-3" />
          <h3 className="text-lg font-bold text-on-surface">No orders found</h3>
          <p className="text-sm text-on-surface-variant max-w-sm mt-1">When an order is placed, it will automatically appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, index) => {
            const isLastElement = orders.length === index + 1;
            
            return (
              <div 
                ref={isLastElement ? lastOrderElementRef : null}
                key={order._id} 
                className="bg-white border border-outline-variant rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-outline-variant pb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-on-surface text-lg">#{order._id.slice(-6).toUpperCase()}</h3>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${getStatusBadgeColor(order.status)}`}>
                        {order.status}
                      </span>
                      {order.tableNumber && (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-surface-variant text-on-surface-variant border border-outline-variant">
                          Table {order.tableNumber}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-on-surface-variant mt-1.5 flex items-center gap-2">
                      <MaterialIcon name="schedule" className="text-[14px]" />
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                      <span>•</span>
                      <MaterialIcon name="person" className="text-[14px]" />
                      {order.customerName || 'Guest'}
                    </div>
                  </div>
                  
                  <div className="w-full md:w-auto shrink-0 flex flex-col items-end gap-2">
                    <select 
                      value={order.status} 
                      onChange={(event) => updateStatus(order._id, event.target.value)} 
                      className="w-full md:w-auto rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-1.5 outline-none focus:border-primary text-sm font-medium cursor-pointer"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Preparing">Preparing</option>
                      <option value="Ready">Ready</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Order Items</h4>
                    <ul className="space-y-2">
                      {order.items?.map((item, idx) => (
                        <li key={idx} className="flex justify-between items-start text-sm">
                          <div className="flex items-start gap-2">
                            <span className="font-bold text-on-surface bg-surface-container-low px-1.5 py-0.5 rounded text-xs">
                              {item.quantity}x
                            </span>
                            <span className="text-on-surface mt-0.5">{item.name}</span>
                          </div>
                          <span className="text-on-surface-variant font-medium mt-0.5">Rs {item.price * item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col justify-end items-start md:items-end md:border-l border-outline-variant md:pl-6 pt-4 md:pt-0">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Total</p>
                    <p className="text-2xl font-bold text-on-surface leading-none">Rs {order.totalAmount}</p>
                    
                    <div className="mt-4 flex gap-2 w-full justify-end">
                      {order.status === 'Pending' && (
                        <button onClick={() => updateStatus(order._id, 'Accepted')} className="w-full md:w-auto px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors">
                          Accept
                        </button>
                      )}
                      {order.status === 'Accepted' && (
                        <button onClick={() => updateStatus(order._id, 'Preparing')} className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors">
                          Cook
                        </button>
                      )}
                      {order.status === 'Preparing' && (
                        <button onClick={() => updateStatus(order._id, 'Ready')} className="w-full md:w-auto px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition-colors">
                          Ready
                        </button>
                      )}
                      {order.status === 'Ready' && (
                        <button onClick={() => updateStatus(order._id, 'Completed')} className="w-full md:w-auto px-4 py-2 bg-green-700 text-white text-sm font-bold rounded-lg hover:bg-green-800 transition-colors">
                          Finish
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {loadingMore && (
            <div className="py-4 flex justify-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      )}
    </AdminPanel>
  );
}
