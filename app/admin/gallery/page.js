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
  const [alt, setAlt] = useState("");
  const [imageBase64, setImageBase64] = useState("");
  const [galleryStyle, setGalleryStyle] = useState("simple");
  const [savingStyle, setSavingStyle] = useState(false);
  
  const loadGallery = async () => {
    if (!user?.restaurantId) return;
    try {
      const [galleryRes, restRes] = await Promise.all([
        api.get(`/api/restaurants/id/${user.restaurantId}/gallery`),
        api.get(`/api/restaurants/id/${user.restaurantId}`)
      ]);
      setGallery(galleryRes.data.data || []);
      setGalleryStyle(restRes.data.data?.menuUiSettings?.galleryLayout || "simple");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateGalleryStyle = async (newStyle) => {
    setGalleryStyle(newStyle);
    setSavingStyle(true);
    try {
      // In MongoDB, to update nested object properties partially, we can pass it, but since menuUiSettings is an object, 
      // we need to make sure we don't overwrite other settings. 
      // Fortunately, the backend uses Model.findByIdAndUpdate, which requires dot notation for partial updates.
      // Wait, Mongoose handles nested objects via merging if not strict? Actually, doing full fetch/merge is safer.
      const restRes = await api.get(`/api/restaurants/id/${user.restaurantId}`);
      const existingSettings = restRes.data.data?.menuUiSettings || {};
      await api.patch(`/api/restaurants/id/${user.restaurantId}`, {
        menuUiSettings: { ...existingSettings, galleryLayout: newStyle }
      });
    } catch (err) {
      console.error(err);
      alert("Failed to update layout");
    } finally {
      setSavingStyle(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, [user?.restaurantId]);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!imageBase64) return alert("Please upload an image file.");
    setAdding(true);
    try {
      const { uploadImageToCloudinary } = await import("@/app/actions/upload-actions");
      const uploadRes = await uploadImageToCloudinary(imageBase64);
      const finalUrl = uploadRes.url;
      const finalAlt = alt.trim() ? alt : "Gallery Image";
      
      await api.post(`/api/restaurants/id/${user.restaurantId}/gallery`, { url: finalUrl, alt: finalAlt });
      setAlt("");
      setImageBase64("");
      loadGallery();
    } catch (err) {
      alert("Failed to add image. Ensure it's a valid file.");
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
            <label className="block text-xs font-bold text-on-surface-variant mb-2">Upload Image File *</label>
            <input 
              type="file" 
              accept="image/*" 
              required
              onChange={handleImageSelect}
              className="w-full text-sm text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-container file:text-primary hover:file:bg-primary-container/80 cursor-pointer mb-2"
            />
            {imageBase64 && (
              <div className="w-full h-24 rounded-lg overflow-hidden border border-outline-variant mb-4">
                <img src={imageBase64} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-2">Description / Alt Text (Optional)</label>
            <input className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest text-body-md" type="text" value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="e.g. Front Entrance" />
          </div>
        </div>
        <button type="submit" disabled={adding} className="px-6 h-12 rounded-xl bg-primary text-white font-bold transition-all hover:brightness-110 disabled:opacity-50">
          {adding ? "Adding..." : "Add to Gallery"}
        </button>
      </form>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-10 mb-4 gap-4">
        <h2 className="font-bold text-lg text-on-surface">Your Photos</h2>
        <div className="flex items-center gap-3">
          <label className="text-sm font-bold text-on-surface-variant shrink-0">Gallery Layout:</label>
          <select 
            className="h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest text-body-md outline-none focus:border-primary disabled:opacity-50"
            value={galleryStyle}
            onChange={(e) => updateGalleryStyle(e.target.value)}
            disabled={savingStyle}
          >
            <option value="aesthetic">Aesthetic (Accordion - Max 5)</option>
            <option value="decent">Decent (Grid Titles - Max 4)</option>
            <option value="simple">Simple (Polaroids - Max 3)</option>
          </select>
        </div>
      </div>

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
