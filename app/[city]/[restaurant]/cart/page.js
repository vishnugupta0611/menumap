"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import MaterialIcon from "@/components/stitch/MaterialIcon";
import { useCartStore } from "@/stores/cart-store";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

export default function CartPage() {
  const router = useRouter();
  const params = useParams();
  const { city, restaurant: slug } = params;
  const { cart, restaurantId, addItem, removeItem, getTotalAmount, clearCart } = useCartStore();
  const { user, loading: authLoading } = useAuth();
  const isOwner = user?.role === "owner";
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    tableNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [restaurant, setRestaurant] = useState(null);
  const [loadingRestaurant, setLoadingRestaurant] = useState(true);

  // Load restaurant settings and guest details from localStorage
  useEffect(() => {
    async function init() {
      try {
        const resData = await api.get(`/api/restaurants/${city}/${slug}`);
        setRestaurant(resData.data.data);
      } catch (err) {
        console.error("Failed to load restaurant", err);
      } finally {
        setLoadingRestaurant(false);
      }
      
      const guestName = localStorage.getItem("guestName") || "";
      const guestPhone = localStorage.getItem("guestPhone") || "";
      setFormData(prev => ({ ...prev, name: guestName, phone: guestPhone }));
    }
    init();
  }, [city, slug]);

  useEffect(() => {
    if (!authLoading && isOwner) {
      clearCart();
    }
  }, [authLoading, isOwner, clearCart]);

  const allowGuestOrders = restaurant?.menuUiSettings?.allowGuestOrders === true;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (isOwner) {
      setError("Restaurant owner account se customer order place nahi ho sakta. Please customer account se login karein.");
      return;
    }
    
    if (!user && !allowGuestOrders) {
      router.push("/login");
      return;
    }
    
    if (!user && allowGuestOrders && !formData.name.trim()) {
      setError("Please enter your name to place the order.");
      return;
    }

    if (cart.length === 0) return;
    
    setLoading(true);
    setError("");

    try {
      if (!user && allowGuestOrders) {
        localStorage.setItem("guestName", formData.name);
        localStorage.setItem("guestPhone", formData.phone);
      }

      const orderPayload = {
        restaurantId: restaurant._id,
        customerName: user ? user.name : formData.name,
        customerEmail: user ? user.email : undefined,
        customerPhone: formData.phone,
        tableNumber: formData.tableNumber,
        items: cart.map(item => ({
          menuItemId: item.menuItemId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      const res = await api.post(`/api/orders`, orderPayload);
      const newOrder = res.data.data;

      clearCart();
      if (user) {
        router.push(`/${city}/${slug}/profile`);
      } else {
        // Track guest order
        if (newOrder && newOrder._id) {
          const storageKey = `guestOrders_${restaurant._id}`;
          const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");
          existing.push(newOrder._id);
          localStorage.setItem(storageKey, JSON.stringify(existing));
        }
        setOrderSuccess(true);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to place order. Please try again.");
      setLoading(false);
    }
  };

  if (authLoading || loadingRestaurant) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-fadeInUp">
        <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-inner border-4 border-green-100">
          <MaterialIcon name="check_circle" className="text-6xl" />
        </div>
        <h1 className="font-headline-lg text-headline-lg mb-3 text-on-surface">Order Placed Successfully!</h1>
        <p className="text-on-surface-variant mb-8 max-w-sm text-base">
          Thank you, <span className="font-bold text-on-surface">{formData.name}</span>! Your order has been sent to the kitchen and is being prepared.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
          <Link href={`/${city}/${slug}/profile`} className="flex-1 bg-surface-variant text-on-surface-variant px-6 py-3.5 rounded-full font-bold shadow-sm hover:shadow-md active:scale-95 transition-all text-sm uppercase tracking-wide">
            Track Order
          </Link>
          <Link href={`/${city}/${slug}/menu`} className="flex-1 bg-primary text-on-primary px-6 py-3.5 rounded-full font-bold shadow-lg hover:shadow-xl active:scale-95 transition-all text-sm uppercase tracking-wide">
            Back to Menu
          </Link>
        </div>
      </div>
    );
  }

  if (isOwner) {
    return (
      <div className="pb-32">
        <main className="max-w-2xl mx-auto animate-fadeInUp px-margin-mobile pt-8">
          <Link href={`/${city}/${slug}/menu`} className="inline-flex items-center gap-2 text-primary hover:underline font-bold mb-4">
            <MaterialIcon name="arrow_back" />
            Back to Menu
          </Link>
          <div className="rounded-3xl border border-primary/20 bg-primary/5 p-8 text-center">
            <MaterialIcon name="admin_panel_settings" className="text-primary text-5xl mb-4" />
            <h1 className="text-2xl font-bold text-on-surface mb-2">Owner preview mode</h1>
            <p className="text-on-surface-variant mb-6">
              Restaurant account se apne ya kisi restaurant ko customer order nahi bheja ja sakta.
            </p>
            <Link href="/admin/dashboard" className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 font-bold text-on-primary">
              Go to Admin Panel
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (cart.length > 0 && restaurantId && restaurant?._id && restaurantId !== restaurant._id) {
    return (
      <div className="pb-32">
        <main className="max-w-2xl mx-auto space-y-8 animate-fadeInUp px-margin-mobile pt-16 text-center">
          <MaterialIcon name="error_outline" className="text-6xl text-error mb-4" />
          <h1 className="font-headline-lg text-headline-lg mb-4 text-on-surface">Different Restaurant</h1>
          <p className="text-on-surface-variant mb-8 max-w-md mx-auto">
            You have items in your cart from another restaurant. Please clear your cart if you'd like to order from <strong className="text-on-surface">{restaurant.name}</strong>.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href={`/${city}/${slug}/menu`} className="bg-surface-variant text-on-surface-variant px-6 py-3.5 rounded-full font-bold active:scale-95 transition-transform uppercase tracking-wide text-sm">
              Go Back
            </Link>
            <button onClick={clearCart} className="bg-error text-white px-6 py-3.5 rounded-full font-bold shadow-lg hover:shadow-xl active:scale-95 transition-all uppercase tracking-wide text-sm">
              Clear Cart
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="pb-32">
      <main className="max-w-2xl mx-auto space-y-8 animate-fadeInUp px-margin-mobile pt-8">
        <Link href={`/${city}/${slug}/menu`} className="inline-flex items-center gap-2 text-primary hover:underline font-bold mb-4">
          <MaterialIcon name="arrow_back" />
          Back to Menu
        </Link>
        <h1 className="font-headline-lg text-headline-lg mb-8">Your Cart</h1>
        {cart.length === 0 ? (
          <div className="text-center py-20 bg-surface-container-low rounded-3xl border border-dashed border-outline-variant">
            <MaterialIcon name="remove_shopping_cart" className="text-6xl text-outline mb-4" />
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">Cart is empty</h2>
            <p className="text-on-surface-variant mb-6">Looks like you haven't added anything yet.</p>
            <Link href={`/${city}/${slug}/menu`} className="bg-primary text-on-primary px-6 py-3 rounded-full font-bold">
              Browse Menu
            </Link>
          </div>
        ) : (
          <>
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-surface-container space-y-6">
              <h2 className="font-headline-sm text-headline-sm text-on-surface border-b border-surface-container pb-4">Order Details</h2>
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.menuItemId} className="flex gap-4 items-center border-b border-surface-container/50 last:border-0 pb-4 last:pb-0">
                    <div className="flex-1">
                      <h3 className="font-bold text-on-surface">{item.name}</h3>
                      <p className="text-primary font-bold text-sm">Rs {item.price}</p>
                    </div>
                    <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl px-2 py-1 flex items-center gap-3 shadow-inner">
                      <button onClick={() => removeItem(item.menuItemId)} className="w-8 h-8 flex items-center justify-center text-primary hover:bg-primary/10 rounded-lg active:scale-95">-</button>
                      <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                      <button onClick={() => addItem({ id: item.menuItemId, name: item.name, price: item.price, image: item.image })} className="w-8 h-8 flex items-center justify-center text-primary hover:bg-primary/10 rounded-lg active:scale-95">+</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-surface-container pt-4 flex justify-between items-center">
                <span className="font-headline-sm text-on-surface">Total Amount</span>
                <span className="font-display-sm text-primary">Rs {getTotalAmount()}</span>
              </div>
            </section>

            <section className="bg-white p-6 rounded-3xl shadow-sm border border-surface-container">
              <h2 className="font-headline-sm text-headline-sm text-on-surface mb-6">Your Details</h2>
              {error && <div className="bg-error-container text-on-error-container p-4 rounded-xl mb-4 text-sm">{error}</div>}
              <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
                
                {user ? (
                  <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 flex items-center gap-3 shadow-inner mb-4">
                    <MaterialIcon name="check_circle" className="text-primary text-[24px]" />
                    <div>
                      <p className="font-bold text-on-surface text-sm">Ordering as {user.name}</p>
                      <p className="text-xs text-on-surface-variant">{user.email}</p>
                    </div>
                  </div>
                ) : allowGuestOrders ? (
                  <>
                    <div className="bg-primary/10 text-primary p-4 rounded-xl mb-4 flex items-start gap-3">
                      <MaterialIcon name="info" className="mt-0.5" />
                      <p className="text-sm font-medium">You are ordering as a guest. Your name will be remembered for your next visit.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-on-surface-variant mb-1">Name (Required)</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        placeholder="Enter your name"
                      />
                    </div>
                  </>
                ) : (
                  <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 text-center mb-4">
                    <MaterialIcon name="account_circle" className="text-outline text-3xl mb-2" />
                    <p className="font-bold text-on-surface text-sm mb-1">Login Required</p>
                    <p className="text-xs text-on-surface-variant mb-4">Please login to securely place your order.</p>
                    <Link href="/login" className="inline-flex bg-primary text-on-primary px-6 py-2 rounded-full font-bold text-sm">
                      Login to Continue
                    </Link>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-1">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="9876543210"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-1">Table Number (Optional)</label>
                  <input
                    type="text"
                    value={formData.tableNumber}
                    onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="e.g. Table 4"
                  />
                </div>
              </form>
            </section>
          </>
        )}
      </main>

      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t border-surface-container z-40">
          <div className="max-w-2xl mx-auto flex gap-4">
            <div className="flex-1 flex flex-col justify-center px-2">
              <span className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Total to Pay</span>
              <span className="font-display-sm text-on-surface">Rs {getTotalAmount()}</span>
            </div>
            {user || allowGuestOrders ? (
              <button
                type="submit"
                form="checkout-form"
                disabled={loading}
                className="flex-[2] bg-primary text-on-primary py-4 rounded-2xl font-bold shadow-lg shadow-primary/30 active:scale-[0.98] transition-transform disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
              >
                {loading ? "Processing..." : "Place Order"}
                {!loading && <MaterialIcon name="check_circle" />}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="flex-[2] bg-primary text-on-primary py-4 rounded-2xl font-bold shadow-lg shadow-primary/30 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
              >
                Login to Order
                <MaterialIcon name="login" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
