"use client";

import { useState } from "react";
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
  const { cart, addItem, removeItem, getTotalAmount, customerInfo, setCustomerInfo, clearCart } = useCartStore();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: customerInfo?.name || "",
    email: customerInfo?.email || "",
    phone: customerInfo?.phone || "",
    tableNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    const finalName = user?.name || formData.name;
    const finalEmail = user?.email || formData.email;

    if (!finalName || !finalEmail) {
      setError("Please provide at least your name and email.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Save info
      setCustomerInfo({ name: finalName, email: finalEmail, phone: formData.phone });

      // First we need the restaurantId, since params only has city/slug.
      // But we can hit an endpoint that takes city/slug, or we can fetch restaurant details first.
      const resData = await api.get(`/api/restaurants/${city}/${slug}`);
      const restaurantId = resData.data.data._id;

      const orderPayload = {
        restaurantId,
        customerName: finalName,
        customerEmail: finalEmail,
        customerPhone: formData.phone,
        tableNumber: formData.tableNumber,
        items: cart.map(item => ({
          menuItemId: item.menuItemId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      await api.post(`/api/orders`, orderPayload);

      clearCart();
      router.push(`/${city}/${slug}/profile`);
    } catch (err) {
      console.error(err);
      setError("Failed to place order. Please try again.");
      setLoading(false);
    }
  };

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
                      <button onClick={() => addItem({ id: item.menuItemId })} className="w-8 h-8 flex items-center justify-center text-primary hover:bg-primary/10 rounded-lg active:scale-95">+</button>
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
                  <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 flex items-center gap-3 shadow-inner">
                    <MaterialIcon name="check_circle" className="text-primary text-[24px]" />
                    <div>
                      <p className="font-bold text-on-surface text-sm">Ordering as {user.name}</p>
                      <p className="text-xs text-on-surface-variant">{user.email}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-on-surface-variant mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-on-surface-variant mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        placeholder="john@example.com"
                      />
                    </div>
                  </>
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
            <button
              type="submit"
              form="checkout-form"
              disabled={loading}
              className="flex-[2] bg-primary text-on-primary py-4 rounded-2xl font-bold shadow-lg shadow-primary/30 active:scale-[0.98] transition-transform disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? "Processing..." : "Place Order"}
              {!loading && <MaterialIcon name="check_circle" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
