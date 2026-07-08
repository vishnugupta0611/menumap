"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import MaterialIcon from "@/components/stitch/MaterialIcon";
import { useCartStore } from "@/stores/cart-store";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { io } from "socket.io-client";

export default function ProfilePage() {
  const params = useParams();
  const { city, restaurant: slug } = params;
  const { customerInfo } = useCartStore();
  const { user } = useAuth();
  
  const displayEmail = user?.email || customerInfo?.email;
  const displayName = user?.name || customerInfo?.name;
  const displayPhoto = user?.photo;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (displayEmail) {
      api.get(`/api/orders/customer?email=${encodeURIComponent(displayEmail)}`)
        .then(res => {
          setOrders(res.data.data || []);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setError("Could not load your orders.");
          setLoading(false);
        });

      // Real-time tracking
      const socket = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000');
      
      socket.on("orders:status", (updatedOrder) => {
        setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
      });

      return () => {
        socket.disconnect();
      };
    } else {
      setLoading(false);
    }
  }, [displayEmail]);

  if (!displayEmail) {
    return (
      <div className="bg-background min-h-screen text-on-background flex flex-col items-center justify-center p-6 text-center">
        <MaterialIcon name="account_circle" className="text-6xl text-outline mb-4" />
        <h1 className="font-headline-md text-headline-md mb-2">Not logged in</h1>
        <p className="text-on-surface-variant mb-6">Place an order to create your profile and see your history.</p>
        <Link href={`/${city}/${slug}/menu`} className="bg-primary text-on-primary px-6 py-3 rounded-full font-bold">
          Go to Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <main className="max-w-2xl mx-auto px-margin-mobile pt-8 space-y-6">
        <Link href={`/${city}/${slug}/menu`} className="inline-flex items-center gap-2 text-primary hover:underline font-bold mb-2">
          <MaterialIcon name="arrow_back" />
          Back to Menu
        </Link>
        <h1 className="font-headline-lg text-headline-lg mb-6">My Profile</h1>
        
        <section className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-surface-container flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          <div className="w-24 h-24 bg-primary text-on-primary rounded-full flex items-center justify-center text-4xl font-bold uppercase shadow-inner overflow-hidden shrink-0">
            {displayPhoto ? (
              <img src={displayPhoto} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              displayName?.charAt(0) || "U"
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-bold text-on-surface mb-2">{displayName}</h2>
            <p className="text-on-surface-variant font-body-md bg-surface-container-low inline-block px-3 py-1 rounded-full text-sm mb-1">{displayEmail}</p>
            {customerInfo?.phone && <p className="text-on-surface-variant font-body-md text-sm mt-2">{customerInfo.phone}</p>}
          </div>
          {user && (
            <Link href="/customer/profile" className="px-5 py-2.5 bg-surface-variant text-on-surface-variant rounded-xl font-bold hover:bg-surface-variant/80 transition-colors whitespace-nowrap mt-4 md:mt-0">
              Edit Main Profile
            </Link>
          )}
        </section>

        <section>
          <div className="flex items-center gap-3 mb-4 pl-2">
            <div className="w-1.5 h-6 bg-primary rounded-full"></div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Order History</h3>
          </div>
          
          {loading ? (
            <div className="text-center py-12 text-on-surface-variant animate-pulse">Loading orders...</div>
          ) : error ? (
            <div className="text-center py-12 text-error">{error}</div>
          ) : orders.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl text-center border border-surface-container shadow-sm">
              <MaterialIcon name="receipt_long" className="text-4xl text-outline mb-3" />
              <p className="text-on-surface-variant">No orders found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order._id} className="bg-white p-5 rounded-3xl shadow-sm border border-surface-container">
                  <div className="flex justify-between items-start mb-3 border-b border-surface-container pb-3">
                    <div>
                      <p className="font-bold text-on-surface text-lg">{order.restaurantId?.name || "Restaurant"}</p>
                      <p className="text-sm text-on-surface-variant mt-1">{new Date(order.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
                      order.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' : 
                      order.status === 'Pending' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                      order.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                      'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="space-y-2 mb-3">
                    {order.items.map(item => (
                      <div key={item._id} className="flex justify-between text-sm">
                        <span className="text-on-surface-variant">{item.quantity}x {item.name}</span>
                        <span className="font-semibold">Rs {item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-surface-container mt-4">
                    <span className="font-bold text-on-surface-variant">Total</span>
                    <span className="font-bold text-primary text-xl">Rs {order.totalAmount}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <div>
       
      </div>
    </div>
  );
}
