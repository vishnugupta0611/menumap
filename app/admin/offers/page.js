"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import MaterialIcon from "@/components/stitch/MaterialIcon";
import { useAuth } from "@/contexts/AuthContext";

export default function OffersPage() {
  const { user } = useAuth();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [active, setActive] = useState(true);

  const loadOffers = async () => {
    if (!user?.restaurantId) return;
    try {
      const res = await api.get(`/api/restaurants/id/${user.restaurantId}/offers`);
      setOffers(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, [user?.restaurantId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title) return;
    setAdding(true);
    try {
      await api.post(`/api/restaurants/id/${user.restaurantId}/offers`, { 
        title, description, code, active 
      });
      setTitle("");
      setDescription("");
      setCode("");
      setActive(true);
      loadOffers();
    } catch (err) {
      alert("Failed to add offer.");
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (offer) => {
    try {
      await api.patch(`/api/restaurants/offers/${offer._id}`, { active: !offer.active });
      loadOffers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this offer permanently?")) return;
    try {
      await api.delete(`/api/restaurants/offers/${id}`);
      loadOffers();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-primary font-bold animate-pulse">Loading offers...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <div>
        <p className="font-label-sm text-label-sm uppercase text-secondary">Restaurant OS</p>
        <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary md:font-display-lg md:text-display-lg">Promotional Offers</h1>
      </div>

      <form onSubmit={handleAdd} className="bg-white p-6 rounded-3xl border border-surface-container shadow-sm space-y-4 max-w-2xl">
        <h3 className="font-bold text-md text-on-surface flex items-center gap-2">
          <MaterialIcon name="local_offer" className="text-primary" />
          Create New Offer
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-2">Offer Title</label>
            <input className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest text-body-md" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. 20% OFF on all Pizzas" />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-2">Description</label>
            <input className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest text-body-md" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Valid only on weekdays..." />
          </div>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs font-bold text-on-surface-variant mb-2">Coupon Code (Optional)</label>
              <input className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest text-body-md uppercase" value={code} onChange={(e) => setCode(e.target.value)} placeholder="PIZZA20" />
            </div>
            <button type="submit" disabled={adding} className="px-6 h-12 rounded-xl bg-primary text-white font-bold transition-all hover:brightness-110 disabled:opacity-50 whitespace-nowrap">
              {adding ? "Creating..." : "Create Offer"}
            </button>
          </div>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {offers.map(offer => (
          <div key={offer._id} className={`p-6 rounded-3xl border relative transition-colors ${offer.active ? 'bg-primary/5 border-primary/20' : 'bg-surface-container border-outline-variant/50 opacity-70'}`}>
            <div className="absolute top-4 right-4 flex gap-2">
              <button onClick={() => handleToggle(offer)} className="p-2 rounded-full hover:bg-surface-container-highest transition-colors text-on-surface-variant" title="Toggle active">
                <MaterialIcon name={offer.active ? "toggle_on" : "toggle_off"} className={offer.active ? "text-primary text-3xl" : "text-3xl"} />
              </button>
              <button onClick={() => handleDelete(offer._id)} className="p-2 rounded-full hover:bg-error-container hover:text-error transition-colors text-on-surface-variant" title="Delete">
                <MaterialIcon name="delete" />
              </button>
            </div>
            
            <div className="pr-20 space-y-2">
              <h4 className="font-bold text-lg text-on-surface">{offer.title}</h4>
              {offer.description && <p className="text-sm text-on-surface-variant">{offer.description}</p>}
              {offer.code && (
                <div className="inline-block mt-2 px-3 py-1 bg-surface-container-highest rounded-lg font-mono font-bold text-sm tracking-wider">
                  {offer.code}
                </div>
              )}
            </div>
          </div>
        ))}
        {offers.length === 0 && (
          <div className="col-span-full p-12 text-center border-2 border-dashed border-outline-variant rounded-3xl text-on-surface-variant">
            <MaterialIcon name="money_off" className="text-4xl mb-2 opacity-50" />
            <p className="font-bold">No active offers</p>
            <p className="text-sm mt-1">Create one above to attract more customers.</p>
          </div>
        )}
      </div>
    </div>
  );
}
