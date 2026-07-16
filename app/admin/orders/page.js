"use client";

import { useEffect, useState, useRef, useCallback } from "react";
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

  // POS State
  const [isPosOpen, setIsPosOpen] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [posCart, setPosCart] = useState([]);
  const [tableNumber, setTableNumber] = useState("");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [mobileTab, setMobileTab] = useState('menu'); // 'menu' or 'cart'

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
        const res = await api.get(`/api/orders?restaurantId=${user.restaurantId}&page=${page}&limit=15`);
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

  // Load Menu Items for POS when opened
  useEffect(() => {
    if (isPosOpen && menuItems.length === 0 && user?.restaurantId) {
      api.get(`/api/restaurants/id/${user.restaurantId}/menu-items`).then(res => {
        setMenuItems(res.data.data || []);
      }).catch(console.error);
    }
  }, [isPosOpen, menuItems.length, user?.restaurantId]);

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

  // POS Functions
  const addToPosCart = (item) => {
    setPosCart(prev => {
      const existing = prev.find(i => i.menuItemId === item._id);
      if (existing) {
        return prev.map(i => i.menuItemId === item._id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { menuItemId: item._id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const removeFromPosCart = (itemId) => {
    setPosCart(prev => {
      const existing = prev.find(i => i.menuItemId === itemId);
      if (existing.quantity > 1) {
        return prev.map(i => i.menuItemId === itemId ? { ...i, quantity: i.quantity - 1 } : i);
      }
      return prev.filter(i => i.menuItemId !== itemId);
    });
  };

  const submitPosOrder = async () => {
    if (posCart.length === 0) return;
    setIsSubmittingOrder(true);
    try {
      const payload = {
        restaurantId: user.restaurantId,
        customerName: "Walk-in Customer",
        tableNumber: tableNumber.trim() || undefined,
        items: posCart
      };
      
      const res = await api.post("/api/orders", payload);
      const newOrder = res.data.data;
      setOrders(prev => {
        if (prev.find(o => o._id === newOrder._id)) return prev;
        return [newOrder, ...prev];
      });
      
      // Reset POS
      setPosCart([]);
      setTableNumber("");
      setIsPosOpen(false);
      
    } catch (error) {
      console.error("Failed to create POS order", error);
      alert("Failed to create order");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const posTotal = posCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="w-[95%] mx-auto pb-10">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-surface-container bg-white p-4 md:p-6 shadow-sm">
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
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsPosOpen(true)}
            className="flex items-center gap-2 bg-primary text-on-primary px-3 py-1.5 rounded-lg font-bold text-xs shadow-sm hover:bg-primary/90 transition-colors cursor-pointer"
          >
            <MaterialIcon name="add_circle" className="text-[16px]" />
            Create Order
          </button>
          <div className="text-sm font-medium text-on-surface-variant bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/50">
            Showing {orders.length} Orders
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center bg-surface-container-lowest border border-outline-variant rounded-xl flex flex-col items-center">
          <MaterialIcon name="inbox" className="text-5xl text-outline mb-3" />
          <h3 className="text-lg font-bold text-on-surface">No orders found</h3>
          <p className="text-sm text-on-surface-variant max-w-sm mt-1">When an order is placed, it will automatically appear here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-outline-variant text-xs text-on-surface-variant">
                <th className="py-3 px-4 font-bold uppercase tracking-wider">Order ID</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider">Customer / Table</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider">Items</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider">Total</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider">Time</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50">
              {orders.map((order, index) => {
                const isLastElement = orders.length === index + 1;
                return (
                  <tr ref={isLastElement ? lastOrderElementRef : null} key={order._id} className="hover:bg-surface-container-lowest transition-colors border-b border-outline-variant/30">
                    <td className="py-2.5 px-3 font-bold text-xs">#{order._id.slice(-6).toUpperCase()}</td>
                    <td className="py-2.5 px-3">
                      <div className="text-xs font-semibold">{order.customerName || 'Guest'}</div>
                      {order.tableNumber && <div className="text-[10px] text-on-surface-variant">Table {order.tableNumber}</div>}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="text-xs max-w-[200px] truncate text-on-surface-variant" title={order.items?.map(i => `${i.quantity}x ${i.name}`).join(', ')}>
                        {order.items?.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-xs">Rs {order.totalAmount}</td>
                    <td className="py-2.5 px-3">
                      <select 
                        value={order.status} 
                        onChange={(event) => updateStatus(order._id, event.target.value)} 
                        className={`text-xs font-bold px-2 py-1 rounded-md border outline-none cursor-pointer ${getStatusBadgeColor(order.status)}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Ready">Ready</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-on-surface-variant">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {order.status === 'Pending' && (
                        <button onClick={() => updateStatus(order._id, 'Accepted')} className="px-2 py-1 bg-primary text-white text-[11px] font-bold rounded hover:bg-primary/90 cursor-pointer border-none">Accept</button>
                      )}
                      {order.status === 'Accepted' && (
                        <button onClick={() => updateStatus(order._id, 'Preparing')} className="px-2 py-1 bg-blue-600 text-white text-[11px] font-bold rounded hover:bg-blue-700 cursor-pointer border-none">Cook</button>
                      )}
                      {order.status === 'Preparing' && (
                        <button onClick={() => updateStatus(order._id, 'Ready')} className="px-2 py-1 bg-emerald-600 text-white text-[11px] font-bold rounded hover:bg-emerald-700 cursor-pointer border-none">Ready</button>
                      )}
                      {order.status === 'Ready' && (
                        <button onClick={() => updateStatus(order._id, 'Completed')} className="px-2 py-1 bg-green-700 text-white text-[11px] font-bold rounded hover:bg-green-800 cursor-pointer border-none">Finish</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {loadingMore && (
            <div className="py-4 flex justify-center border-t border-outline-variant">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      )}

      {/* POS Modal */}
      {isPosOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-0 md:p-6">
          <div className="bg-surface w-full h-full md:h-[85vh] md:max-h-[900px] md:max-w-6xl md:rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden border-none md:border border-outline-variant relative">
            
            {/* Mobile Tab Bar */}
            <div className="md:hidden flex bg-surface-container-low p-2 gap-2 shadow-sm z-10 shrink-0">
              <button 
                onClick={() => setMobileTab('menu')} 
                className={`flex-1 py-3 font-bold rounded-xl transition-all cursor-pointer ${mobileTab === 'menu' ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant hover:bg-surface-variant'}`}
              >
                Menu
              </button>
              <button 
                onClick={() => setMobileTab('cart')} 
                className={`flex-1 py-3 font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${mobileTab === 'cart' ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant hover:bg-surface-variant'}`}
              >
                Cart <span className={`${mobileTab === 'cart' ? 'bg-white/20 text-white' : 'bg-surface-variant text-on-surface'} px-2 py-0.5 rounded-full text-xs`}>{posCart.length}</span>
              </button>
              <button onClick={() => setIsPosOpen(false)} className="w-12 flex items-center justify-center rounded-xl bg-surface-variant text-on-surface-variant cursor-pointer hover:bg-outline-variant/30">
                <MaterialIcon name="close" />
              </button>
            </div>

            {/* Menu Items Section */}
            <div className={`${mobileTab === 'menu' ? 'flex' : 'hidden'} md:flex flex-1 flex-col min-h-0 overflow-hidden bg-surface-container-lowest`}>
              <div className="p-5 border-b border-outline-variant/50 bg-white/50 backdrop-blur-md flex justify-between items-center shrink-0 z-10 sticky top-0">
                <div>
                  <h3 className="font-bold text-xl text-on-surface">Menu Items</h3>
                  <p className="text-xs text-on-surface-variant font-medium mt-0.5">Tap an item to add it to the order</p>
                </div>
                <button onClick={() => setIsPosOpen(false)} className="hidden md:flex w-9 h-9 items-center justify-center rounded-full bg-surface-variant cursor-pointer text-on-surface-variant hover:bg-outline-variant/30 transition-colors">
                  <MaterialIcon name="close" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-surface-container-lowest min-h-0">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {menuItems.filter(i => i.available).map(item => (
                  <button 
                    key={item._id} 
                    onClick={() => addToPosCart(item)}
                    className="p-4 md:p-5 border border-outline-variant rounded-2xl bg-white text-left hover:border-primary hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between h-full group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10">
                      <div className="text-[10px] md:text-xs font-black text-primary mb-1.5 uppercase tracking-widest">{item.category}</div>
                      <div className="font-bold text-sm md:text-base line-clamp-2 text-on-surface leading-tight">{item.name}</div>
                    </div>
                    <div className="mt-4 font-black text-on-surface relative z-10 flex justify-between items-center">
                      <span className="text-base">Rs {item.price}</span>
                      <div className="w-8 h-8 rounded-full bg-surface-variant group-hover:bg-primary group-hover:text-white text-on-surface-variant flex items-center justify-center transition-colors">
                        <MaterialIcon name="add" className="text-[18px]" />
                      </div>
                    </div>
                  </button>
                ))}
                {menuItems.length === 0 && (
                  <div className="col-span-full py-16 text-center text-on-surface-variant flex flex-col items-center justify-center">
                    <MaterialIcon name="restaurant_menu" className="text-5xl text-outline mb-3 opacity-50" />
                    <span className="font-semibold">No menu items found</span>
                  </div>
                )}
                </div>
              </div>
            </div>

            {/* Cart Section */}
            <div className={`${mobileTab === 'cart' ? 'flex' : 'hidden'} md:flex w-full md:w-[400px] lg:w-[450px] flex-col shrink-0 border-l border-outline-variant/50 bg-surface min-h-0 relative z-10 shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.05)]`}>
              <div className="p-5 border-b border-outline-variant/50 bg-white/50 backdrop-blur-md flex justify-between items-center shrink-0">
                <h3 className="font-bold text-xl text-on-surface">Current Order</h3>
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">{posCart.length} Items</span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-surface min-h-0">
                <div className="space-y-3 h-full">
                  {posCart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-on-surface-variant opacity-60 min-h-[200px]">
                    <MaterialIcon name="local_mall" className="text-6xl mb-4 text-outline" />
                    <p className="font-bold text-base">Cart is empty</p>
                    <p className="text-sm mt-1">Select items from the menu</p>
                  </div>
                ) : (
                  posCart.map(item => (
                    <div key={item.menuItemId} className="flex items-center justify-between bg-white p-3.5 border border-outline-variant rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex-1 min-w-0 pr-3">
                        <div className="font-bold text-sm truncate text-on-surface">{item.name}</div>
                        <div className="text-xs text-primary font-black mt-1">Rs {item.price}</div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 bg-surface-container-lowest rounded-xl p-1 border border-outline-variant">
                        <button onClick={() => removeFromPosCart(item.menuItemId)} className="w-8 h-8 rounded-lg bg-surface hover:bg-surface-variant flex items-center justify-center cursor-pointer transition-colors border-none">
                          <MaterialIcon name="remove" className="text-[18px] text-on-surface" />
                        </button>
                        <span className="font-black text-sm w-6 text-center text-on-surface">{item.quantity}</span>
                        <button onClick={() => addToPosCart({ _id: item.menuItemId, name: item.name, price: item.price })} className="w-8 h-8 rounded-lg bg-primary text-white hover:bg-primary/90 flex items-center justify-center cursor-pointer transition-colors border-none">
                          <MaterialIcon name="add" className="text-[18px]" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
                </div>
              </div>

              <div className="p-5 md:p-6 border-t border-outline-variant/50 bg-white space-y-5 shrink-0 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
                <div>
                  <label className="text-xs font-bold text-on-surface-variant mb-2 block uppercase tracking-wider">Table Number</label>
                  <input 
                    type="text" 
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder="e.g. Table 12 (Optional)"
                    className="w-full border-2 border-outline-variant/50 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary focus:bg-primary/5 bg-surface-container-lowest font-semibold transition-all"
                  />
                </div>
                <div className="w-full h-px bg-outline-variant/50"></div>
                <div className="flex justify-between items-center font-black text-2xl text-on-surface">
                  <span>Total</span>
                  <span className="text-primary">Rs {posTotal}</span>
                </div>
                <button 
                  onClick={submitPosOrder}
                  disabled={posCart.length === 0 || isSubmittingOrder}
                  className="w-full py-4 bg-primary text-white font-black text-base rounded-2xl shadow-[0_8px_16px_rgba(var(--color-primary-rgb),0.3)] disabled:opacity-50 disabled:shadow-none hover:bg-primary/90 hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmittingOrder ? (
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <MaterialIcon name="bolt" className="text-[20px]" />
                      Place Order Instantly
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
