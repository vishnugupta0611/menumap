"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import MaterialIcon from "@/components/stitch/MaterialIcon";
import { useAuth } from "@/contexts/AuthContext";

export default function GalleryPage() {
  const { user } = useAuth();
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  // Form state
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  
  const loadGallery = async () => {
    if (!user?.restaurantId) return;
    try {
      const res = await api.get(`/api/restaurants/id/${user.restaurantId}/gallery`);
      setGallery(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, [user?.restaurantId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!url || !alt) return;
    setAdding(true);
    try {
      await api.post(`/api/restaurants/id/${user.restaurantId}/gallery`, { url, alt });
      setUrl("");
      setAlt("");
      loadGallery();
    } catch (err) {
      alert("Failed to add image. Ensure it's a valid URL.");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Remove this image from the gallery?")) return;
    try {
      await api.delete(`/api/restaurants/gallery/${id}`);
      loadGallery();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-primary font-bold animate-pulse">Loading gallery...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <div>
        <p className="font-label-sm text-label-sm uppercase text-secondary">Restaurant OS</p>
        <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary md:font-display-lg md:text-display-lg">Photo Gallery</h1>
      </div>

      <form onSubmit={handleAdd} className="bg-white p-6 rounded-3xl border border-surface-container shadow-sm space-y-4 max-w-2xl">
        <h3 className="font-bold text-md text-on-surface flex items-center gap-2">
          <MaterialIcon name="add_a_photo" className="text-primary" />
          Add New Photo
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-2">Image URL</label>
            <input className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest text-body-md" type="url" required value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-2">Description / Alt Text</label>
            <input className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest text-body-md" type="text" required value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="e.g. Front Entrance" />
          </div>
        </div>
        <button type="submit" disabled={adding} className="px-6 h-12 rounded-xl bg-primary text-white font-bold transition-all hover:brightness-110 disabled:opacity-50">
          {adding ? "Adding..." : "Add to Gallery"}
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gallery.map(img => (
          <div key={img._id} className="group relative rounded-3xl overflow-hidden aspect-video border border-surface-container bg-surface-container shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button onClick={() => handleDelete(img._id)} className="bg-error text-white px-4 py-2 rounded-full font-bold text-sm hover:brightness-110 flex items-center gap-1">
                <MaterialIcon name="delete" /> Remove
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-white text-sm font-bold truncate">{img.alt}</p>
            </div>
          </div>
        ))}
        {gallery.length === 0 && (
          <div className="col-span-full p-12 text-center border-2 border-dashed border-outline-variant rounded-3xl text-on-surface-variant">
            <MaterialIcon name="image_not_supported" className="text-4xl mb-2 opacity-50" />
            <p className="font-bold">No photos in gallery</p>
            <p className="text-sm mt-1">Add some above to show off your restaurant.</p>
          </div>
        )}
      </div>
    </div>
  );
}
