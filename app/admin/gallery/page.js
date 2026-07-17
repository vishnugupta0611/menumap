"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import GlobalImageLibrary from "@/components/modals/GlobalImageLibrary";
import MaterialIcon from "@/components/stitch/MaterialIcon";
import { useAuth } from "@/contexts/AuthContext";

export default function GalleryPage() {
  const { user } = useAuth();
  const [gallery, setGallery] = useState([]);
  const [featuredGalleryIds, setFeaturedGalleryIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  // Form state for general pool
  const [alt, setAlt] = useState("");
  const [imageBase64, setImageBase64] = useState("");
  const [galleryStyle, setGalleryStyle] = useState("simple");
  const [savingStyle, setSavingStyle] = useState(false);
  
  // Library State for general pool
  const [showLibrary, setShowLibrary] = useState(false);

  // Selection Modal State
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [uploadingInModal, setUploadingInModal] = useState(false);

  const getRequiredCount = (style) => {
    if (style === "aesthetic") return 5;
    if (style === "decent") return 4;
    return 3;
  };

  const loadGallery = async () => {
    if (!user?.restaurantId) return;
    try {
      const [galleryRes, restRes, menuRes] = await Promise.all([
        api.get(`/api/restaurants/id/${user.restaurantId}/gallery`),
        api.get(`/api/restaurants/id/${user.restaurantId}`),
        api.get(`/api/restaurants/id/${user.restaurantId}/menu-items`)
      ]);
      
      const fetchedGallery = galleryRes.data.data || [];
      fetchedGallery.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      setGallery(fetchedGallery);
      
      const rest = restRes.data.data;
      setGalleryStyle(rest?.menuUiSettings?.galleryLayout || "simple");
      setFeaturedGalleryIds(rest?.menuUiSettings?.featuredGalleryIds || []);
      // We no longer extract myImages here since GlobalImageLibrary handles it
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateGalleryStyle = async (newStyle) => {
    setGalleryStyle(newStyle);
    setFeaturedGalleryIds([]); // Clear selection immediately
    setSavingStyle(true);
    try {
      const restRes = await api.get(`/api/restaurants/id/${user.restaurantId}`);
      const existingSettings = restRes.data.data?.menuUiSettings || {};
      await api.patch(`/api/restaurants/id/${user.restaurantId}`, {
        menuUiSettings: { ...existingSettings, galleryLayout: newStyle, featuredGalleryIds: [] }
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
      
      const maxSort = gallery.reduce((max, g) => Math.max(max, g.sortOrder || 0), -1);
      await api.post(`/api/restaurants/id/${user.restaurantId}/gallery`, { url: finalUrl, alt: finalAlt, sortOrder: maxSort + 1 });
      
      setAlt("");
      setImageBase64("");
      await loadGallery();
    } catch (err) {
      alert("Failed to add image. Ensure it's a valid file.");
    } finally {
      setAdding(false);
    }
  };
  
  const handleAddFromLibraryUrl = async (url) => {
    setAdding(true);
    setShowLibrary(false);
    try {
      const maxSort = gallery.reduce((max, g) => Math.max(max, g.sortOrder || 0), -1);
      await api.post(`/api/restaurants/id/${user.restaurantId}/gallery`, { url, alt: "Gallery Image", sortOrder: maxSort + 1 });
      await loadGallery();
    } catch (err) {
      alert("Failed to add image.");
    } finally {
      setAdding(false);
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Remove this image from the gallery completely?")) return;
    try {
      await api.delete(`/api/restaurants/gallery/${id}`);
      
      // If deleted image was in featured layout, update settings
      if (featuredGalleryIds.includes(id)) {
        const newIds = featuredGalleryIds.filter(fId => fId !== id);
        setFeaturedGalleryIds(newIds);
        const restRes = await api.get(`/api/restaurants/id/${user.restaurantId}`);
        const existingSettings = restRes.data.data?.menuUiSettings || {};
        await api.patch(`/api/restaurants/id/${user.restaurantId}`, {
          menuUiSettings: { ...existingSettings, featuredGalleryIds: newIds }
        });
      }
      
      await loadGallery();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSelection = (id) => {
    const requiredCount = getRequiredCount(galleryStyle);
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(sel => sel !== id));
    } else {
      if (selectedIds.length >= requiredCount) {
        return alert(`You can only select up to ${requiredCount} images for the ${galleryStyle} layout.`);
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  const saveSelection = async () => {
    const requiredCount = getRequiredCount(galleryStyle);
    if (selectedIds.length !== requiredCount) {
      return alert(`Please select exactly ${requiredCount} images.`);
    }
    
    setSavingStyle(true);
    try {
      const restRes = await api.get(`/api/restaurants/id/${user.restaurantId}`);
      const existingSettings = restRes.data.data?.menuUiSettings || {};
      await api.patch(`/api/restaurants/id/${user.restaurantId}`, {
        menuUiSettings: { ...existingSettings, featuredGalleryIds: selectedIds }
      });
      setFeaturedGalleryIds(selectedIds);
      setShowSelectionModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save selection");
    } finally {
      setSavingStyle(false);
    }
  };
  
  const uploadFromModal = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingInModal(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise((resolve) => {
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
      
      const { uploadImageToCloudinary } = await import("@/app/actions/upload-actions");
      const uploadRes = await uploadImageToCloudinary(base64);
      
      const maxSort = gallery.reduce((max, g) => Math.max(max, g.sortOrder || 0), -1);
      const res = await api.post(`/api/restaurants/id/${user.restaurantId}/gallery`, { url: uploadRes.url, alt: "Gallery Image", sortOrder: maxSort + 1 });
      
      const newImage = res.data.data;
      setGallery([...gallery, newImage]);
      
      // Auto select it if space available
      const requiredCount = getRequiredCount(galleryStyle);
      if (selectedIds.length < requiredCount) {
        setSelectedIds([...selectedIds, newImage._id]);
      }
    } catch (err) {
      alert("Failed to upload image.");
    } finally {
      setUploadingInModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-primary font-bold animate-pulse">Loading gallery...</div>
      </div>
    );
  }

  const requiredCount = getRequiredCount(galleryStyle);
  const isSelectionValid = featuredGalleryIds.length === requiredCount;
  
  // The images actually displayed based on explicit selection
  const displayedImages = featuredGalleryIds
    .map(id => gallery.find(g => g._id === id))
    .filter(Boolean);

  return (
    <div className="space-y-8 pb-16">
      <div>
        <p className="font-label-sm text-label-sm uppercase text-secondary">Restaurant OS</p>
        <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary md:font-display-lg md:text-display-lg">Photo Gallery</h1>
      </div>

      <form onSubmit={handleAdd} className="bg-white p-6 rounded-3xl border border-surface-container shadow-sm space-y-4 max-w-2xl">
        <h3 className="font-bold text-md text-on-surface flex items-center gap-2">
          <MaterialIcon name="add_a_photo" className="text-primary" />
          Add Photo to Gallery Pool
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-2">Upload or Choose Image *</label>
            <div className="flex gap-2 mb-4">
              <label className="flex-1 flex items-center justify-center h-12 bg-primary-container text-primary rounded-xl cursor-pointer hover:bg-primary-container/80 transition-colors font-bold whitespace-nowrap">
                <MaterialIcon name="upload" className="mr-2" />
                Upload File
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
              <button 
                type="button" 
                onClick={() => setShowLibrary(true)} 
                className="flex items-center justify-center h-12 px-4 bg-surface-variant text-on-surface rounded-xl hover:bg-surface-variant/80 transition-colors font-bold whitespace-nowrap border border-outline-variant shadow-sm"
                title="Choose from library"
              >
                <MaterialIcon name="photo_library" className="text-[20px]" />
              </button>
            </div>
            
            {imageBase64 && (
              <div className="w-full h-24 rounded-lg overflow-hidden border border-outline-variant mb-4">
                <img src={imageBase64} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-2">Description / Alt Text (Optional)</label>
            <input className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest text-body-md outline-none focus:border-primary" type="text" value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="e.g. Front Entrance" />
          </div>
        </div>
        <button type="submit" disabled={adding || !imageBase64} className="px-6 h-12 rounded-xl bg-primary text-white font-bold transition-all hover:brightness-110 disabled:opacity-50">
          {adding ? "Adding..." : "Add to Pool"}
        </button>
      </form>

      <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="font-bold text-lg text-on-surface">Featured Images Layout</h2>
            <p className="text-sm text-on-surface-variant mt-1">Select exactly {requiredCount} images to display on your public profile.</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-bold text-on-surface-variant shrink-0">Gallery Layout:</label>
            <select 
              className="h-12 px-4 rounded-xl border border-outline-variant bg-white text-body-md outline-none focus:border-primary disabled:opacity-50 font-bold"
              value={galleryStyle}
              onChange={(e) => updateGalleryStyle(e.target.value)}
              disabled={savingStyle}
            >
              <option value="aesthetic">Aesthetic (Max 5)</option>
              <option value="decent">Decent (Max 4)</option>
              <option value="simple">Simple (Max 3)</option>
            </select>
          </div>
        </div>

        {!isSelectionValid ? (
          <div className="py-16 text-center border-2 border-dashed border-primary/30 rounded-2xl bg-primary/5 flex flex-col items-center">
            <MaterialIcon name="photo_library" className="text-5xl mb-4 text-primary opacity-80" />
            <h3 className="text-xl font-bold text-on-surface mb-2">No Images Selected</h3>
            <p className="text-on-surface-variant mb-6 max-w-md">
              The <strong>{galleryStyle}</strong> layout requires exactly <strong>{requiredCount}</strong> featured images. Please select them from your gallery pool.
            </p>
            <button 
              onClick={() => {
                setSelectedIds(featuredGalleryIds);
                setShowSelectionModal(true);
              }}
              className="px-8 h-12 rounded-full bg-primary text-white font-bold transition-all hover:bg-primary/90 shadow-md flex items-center gap-2"
            >
              <MaterialIcon name="touch_app" />
              Choose {requiredCount} Images
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-sm text-primary flex items-center gap-2">
                <MaterialIcon name="check_circle" className="text-[18px]" />
                {requiredCount} out of {requiredCount} images selected
              </span>
              <button 
                onClick={() => {
                  setSelectedIds(featuredGalleryIds);
                  setShowSelectionModal(true);
                }}
                className="text-primary font-bold text-sm hover:underline flex items-center gap-1"
              >
                <MaterialIcon name="edit" className="text-[16px]" />
                Edit Selection
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedImages.map((img, idx) => (
                <div key={img._id} className="group relative rounded-2xl overflow-hidden aspect-[4/3] border border-surface-container bg-surface-container shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-white font-bold text-xs border border-white/20">
                    Featured #{idx + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pool Library Modal (from top upload section) */}
      <GlobalImageLibrary 
        isOpen={showLibrary} 
        onClose={() => setShowLibrary(false)} 
        onSelectImage={handleAddFromLibraryUrl} 
      />

      {/* Featured Selection Modal (Bottom section) */}
      {showSelectionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowSelectionModal(false)}></div>
          <div className="relative bg-surface-container-lowest w-full max-w-4xl h-[85vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-reveal">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-surface-container flex items-center justify-between bg-white z-10 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
                  Choose Featured Images
                </h2>
                <p className="text-sm text-on-surface-variant mt-1">
                  Selected {selectedIds.length} of {requiredCount}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={saveSelection}
                  disabled={selectedIds.length !== requiredCount || savingStyle}
                  className="px-6 h-10 rounded-full bg-primary text-white font-bold transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingStyle ? "Saving..." : "Done"}
                </button>
                <button 
                  onClick={() => setShowSelectionModal(false)}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-variant/50 transition-colors text-on-surface-variant"
                >
                  <MaterialIcon name="close" className="text-2xl" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-surface-container-lowest">
              {gallery.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto">
                  <MaterialIcon name="collections" className="text-6xl text-primary opacity-20 mb-4" />
                  <h3 className="text-xl font-bold text-on-surface mb-2">Your Gallery Pool is Empty</h3>
                  <p className="text-on-surface-variant mb-8">You need to add some images to your gallery pool before you can select them for your layout.</p>
                  
                  <label className="px-8 h-12 rounded-full bg-primary text-white font-bold transition-all hover:bg-primary/90 shadow-md flex items-center justify-center gap-2 cursor-pointer w-full max-w-xs">
                    {uploadingInModal ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <MaterialIcon name="upload" />
                        Upload Image Now
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={uploadFromModal} className="hidden" disabled={uploadingInModal} />
                  </label>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {gallery.map(img => {
                      const isSelected = selectedIds.includes(img._id);
                      return (
                        <div 
                          key={img._id} 
                          className={`relative group rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer transition-all border-4 ${isSelected ? 'border-primary shadow-md scale-[0.98]' : 'border-transparent shadow-sm hover:border-primary/30'}`}
                          onClick={() => toggleSelection(img._id)}
                        >
                          <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                          <div className={`absolute inset-0 bg-black/40 transition-opacity flex items-center justify-center ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                            <MaterialIcon name={isSelected ? "check_circle" : "add_circle"} className={`text-4xl ${isSelected ? 'text-white' : 'text-white/80'}`} />
                          </div>
                          
                          {/* Only show delete in modal so they can manage the pool */}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(img._id);
                            }}
                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error"
                            title="Delete permanently"
                          >
                            <MaterialIcon name="delete" className="text-[18px]" />
                          </button>
                        </div>
                      );
                    })}
                    
                    {/* Add new button inside modal for convenience */}
                    <label className="relative rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer transition-all border-2 border-dashed border-outline-variant hover:border-primary hover:bg-primary/5 flex flex-col items-center justify-center text-on-surface-variant hover:text-primary">
                      {uploadingInModal ? (
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <MaterialIcon name="add" className="text-4xl mb-2" />
                          <span className="font-bold text-sm">Upload New</span>
                        </>
                      )}
                      <input type="file" accept="image/*" onChange={uploadFromModal} className="hidden" disabled={uploadingInModal} />
                    </label>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
