"use client";

import { useState, useEffect } from "react";
import { useMenuOcr } from "@/hooks/use-menu-ocr";
import { AdminPanel } from "@/components/admin/AdminPanel";
import MaterialIcon from "@/components/stitch/MaterialIcon";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import GlobalImageLibrary from "@/components/modals/GlobalImageLibrary";
import { galleryData } from "@/lib/galleryData";
import Fuse from "fuse.js";
import { uploadImageToCloudinary } from "@/app/actions/upload-actions";

export default function MenuOcrPage() {
  const [preview, setPreview] = useState("");
  const [file, setFile] = useState(null);
  const ocr = useMenuOcr();
  const { user } = useAuth();
  const router = useRouter();

  // State to hold editable items before saving
  const [editableItems, setEditableItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  
  // Gallery state
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [activeItemIndex, setActiveItemIndex] = useState(null);
  const [galleryQuery, setGalleryQuery] = useState("");

  // When OCR succeeds, populate editable items and auto-assign images
  const [isAssigning, setIsAssigning] = useState(false);
  useEffect(() => {
    if (ocr.data?.items) {
      setEditableItems(ocr.data.items.map(item => ({ ...item, selected: true })));
      
      // Automatically trigger auto-assign with a loading state
      setIsAssigning(true);
      setTimeout(() => {
        handleAutoAssignImages(ocr.data.items.map(item => ({ ...item, selected: true })));
        setIsAssigning(false);
      }, 1500);
    }
  }, [ocr.data]);

  function handleFile(event) {
    const selected = event.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setEditableItems([]);
    ocr.reset();
  }

  function handleItemChange(index, field, value) {
    const newItems = [...editableItems];
    newItems[index][field] = value;
    setEditableItems(newItems);
  }

  function handleRemoveItem(index) {
    const newItems = [...editableItems];
    newItems.splice(index, 1);
    setEditableItems(newItems);
  }

  function handleOpenGallery(index, itemName) {
    setActiveItemIndex(index);
    setGalleryQuery(itemName || "");
    setIsGalleryOpen(true);
  }

  function handleSelectGalleryImage(url) {
    if (activeItemIndex !== null) {
      handleItemChange(activeItemIndex, 'image', url);
    }
    setIsGalleryOpen(false);
    setActiveItemIndex(null);
  }

  async function handleFileUpload(index, event) {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Convert to base64 and upload immediately
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result;
        // Optimistically set to base64 for immediate preview
        handleItemChange(index, 'image', base64);
        
        const uploadRes = await uploadImageToCloudinary(base64);
        if (uploadRes?.url) {
          handleItemChange(index, 'image', uploadRes.url);
        }
      } catch (err) {
        console.error("Failed to upload image", err);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleAutoAssignImages(initialItems = null) {
    const fuse = new Fuse(galleryData, {
      keys: ['termName'],
      threshold: 0.5,
      includeScore: true,
      ignoreLocation: true
    });

    setEditableItems(prev => {
      const itemsToProcess = initialItems || prev;
      return itemsToProcess.map(item => {
        if (item.image) return item; // skip if already has image
        const results = fuse.search(item.name || "");
        if (results.length > 0) {
          // get decent matches up to 0.4 distance
          const decentMatches = results.filter(r => r.score !== undefined && r.score <= 0.4);
          const candidates = decentMatches.length > 0 ? decentMatches : [results[0]];
          
          // pick a random candidate among the decent ones
          const randomCandidate = candidates[Math.floor(Math.random() * candidates.length)].item;
          
          // pick a random image from that candidate's URLs to add variety
          if (randomCandidate.imageUrls.length > 0) {
            const urls = randomCandidate.imageUrls;
            const randomUrl = urls[Math.floor(Math.random() * urls.length)];
            return { ...item, image: randomUrl };
          }
        }
        
        // If no image match is found, leave it as is
        return item;
      });
    });
  }

  async function handleApproveAndSave() {
    if (!user?.restaurantId) return;
    setSaving(true);
    setSaveStatus("Saving items...");
    try {
      const itemsToSave = editableItems.filter(item => item.selected);
      let successCount = 0;
      
      for (const item of itemsToSave) {
        try {
          const payload = {
            name: item.name,
            description: item.description || "",
            price: Number(item.price) || 0,
            veg: Boolean(item.veg),
            category: item.category || "Uncategorized",
            available: true,
          };
          
          if (item.image && item.image !== "/images/notfound.png") {
            payload.image = item.image;
          }

          await api.post(`/api/restaurants/id/${user.restaurantId}/menu-items`, payload);
          successCount++;
        } catch (e) {
          console.error("Failed to save item:", item.name, e);
        }
      }
      
      setSaveStatus(`Successfully saved ${successCount} items!`);
      setTimeout(() => {
        router.push("/admin/menu");
      }, 1500);
      
    } catch (err) {
      console.error(err);
      setSaveStatus("An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8 pb-16">
      <div>
        <p className="font-label-sm text-label-sm uppercase text-secondary">AI Menu Import</p>
        <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary md:font-display-lg md:text-display-lg">Photo to Menu OCR</h1>
      </div>
      
      <div>
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-fixed text-primary">
              <MaterialIcon name="document_scanner" />
            </div>
            <div>
              <p className="font-label-sm text-label-sm uppercase text-secondary">AI assisted</p>
              <h2 className="font-headline-md text-headline-md text-on-surface">Upload or Capture Menu</h2>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <label className="flex min-h-[360px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-outline-variant p-8 text-center transition hover:border-primary">
            {preview ? (
              <img src={preview} alt="Menu upload preview" className="h-full max-h-[420px] w-full rounded-xl object-contain" />
            ) : (
              <>
                <MaterialIcon name="add_a_photo" className="mb-4 text-5xl text-primary" />
                <span className="font-headline-md text-headline-md text-on-surface">Click or upload menu photo</span>
                <span className="mt-2 text-sm text-on-surface-variant max-w-xs">Upload a clear photo of your printed menu from your gallery or camera. OCR output stays editable before publishing.</span>
              </>
            )}
            <input className="sr-only" type="file" accept="image/*" onChange={handleFile} />
          </label>
          
          <div className="flex flex-col">
            <button
              disabled={!file || ocr.isPending}
              onClick={() => ocr.mutate(file)}
              className="mb-6 flex w-full flex-shrink-0 items-center justify-center gap-3 rounded-full bg-primary px-6 py-4 font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
            >
              <MaterialIcon name={ocr.isPending ? "hourglass_empty" : "auto_awesome"} className={ocr.isPending ? "animate-spin" : ""} /> 
              {ocr.isPending ? "Reading menu with AI..." : "Extract menu with AI"}
            </button>
            
            {ocr.isError && (
              <div className="rounded-2xl border border-error-container bg-error-container/20 p-4 text-sm text-on-error-container mb-6">
                <p className="font-bold">Failed to extract menu.</p>
                <p>Please ensure you uploaded a clear image and try again.</p>
                {ocr.error?.message && (
                  <p className="mt-2 font-mono text-[10px] opacity-70 border-t border-error-container/30 pt-2">
                    {ocr.error.message}
                  </p>
                )}
              </div>
            )}

            {editableItems.length > 0 ? (
              <div className="w-full space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between sticky top-0 bg-surface-container-lowest/90 backdrop-blur-md pb-4 pt-2 z-10 border-b border-surface-container gap-3 sm:gap-0">
                  <p className="font-bold text-xs sm:text-sm text-primary flex items-center gap-1 sm:gap-2">
                    <MaterialIcon name="check_circle" className="text-primary text-[14px] sm:text-base" />
                    Found {editableItems.length} items
                  </p>
                  
                  <div className="flex items-center gap-2 sm:gap-3">
                    {isAssigning && (
                      <span className="text-[10px] sm:text-xs text-primary font-bold flex items-center gap-1 animate-pulse">
                        <MaterialIcon name="sync" className="animate-spin text-[12px] sm:text-[14px]" /> Assigning images...
                      </span>
                    )}
                    <button 
                      onClick={() => handleAutoAssignImages()}
                      disabled={isAssigning}
                      className="text-[10px] sm:text-xs font-bold bg-primary/10 text-primary hover:bg-primary hover:text-on-primary disabled:opacity-50 transition-colors px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-full flex items-center gap-1"
                    >
                      <MaterialIcon name="auto_awesome" className="text-[12px] sm:text-[14px]" /> Auto-Assign
                    </button>
                    <p className="text-[10px] sm:text-xs text-on-surface-variant font-bold bg-surface-container-highest px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-full">
                      Confidence: {Math.round((ocr.data?.confidence || 0) * 100)}%
                    </p>
                  </div>
                </div>
                
                {editableItems.map((item, index) => (
                  <div key={index} className="p-3 mb-3 rounded-xl border border-surface-container/80 bg-surface-container-lowest shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] relative group transition-all hover:border-primary/30 flex gap-3 sm:gap-4">
                    
                    {/* Image Preview Column */}
                    <div className="w-20 sm:w-24 shrink-0 flex flex-col gap-2">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-surface-variant/30 border border-outline-variant/30 flex items-center justify-center overflow-hidden relative">
                        <img 
                          src={item.image || "/images/notfound.png"} 
                          alt={item.name} 
                          className={`w-full h-full ${!item.image ? 'object-contain p-2 opacity-50' : 'object-cover'}`} 
                        />
                      </div>
                      <div className="flex gap-1">
                        <label className="flex-1 h-6 sm:h-7 bg-surface-container hover:bg-surface-container-high rounded cursor-pointer flex items-center justify-center text-on-surface-variant transition-colors" title="Upload Image">
                          <MaterialIcon name="upload" className="text-[12px] sm:text-[14px]" />
                          <input type="file" accept="image/*" className="sr-only" onChange={(e) => handleFileUpload(index, e)} />
                        </label>
                        <button 
                          onClick={() => handleOpenGallery(index, item.name)}
                          className="flex-1 h-6 sm:h-7 bg-surface-container hover:bg-surface-container-high rounded flex items-center justify-center text-on-surface-variant transition-colors" title="Choose from Gallery"
                        >
                          <MaterialIcon name="photo_library" className="text-[12px] sm:text-[14px]" />
                        </button>
                      </div>
                    </div>

                    {/* Data Column */}
                    <div className="flex-1 space-y-2 sm:space-y-3 pr-6 relative">
                      <button 
                        onClick={() => handleRemoveItem(index)}
                        className="absolute -top-1 -right-4 sm:-right-2 p-1.5 sm:p-2 rounded-full bg-error-container/50 text-error opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error hover:text-white"
                        title="Remove item"
                      >
                        <MaterialIcon name="close" className="text-[16px] sm:text-[18px]" />
                      </button>
                    
                    <div className="grid grid-cols-[1fr_70px] sm:grid-cols-[1fr_90px] gap-2 sm:gap-3 pr-2 sm:pr-8">
                      <div>
                        <label className="text-[9px] sm:text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Item Name</label>
                        <input 
                          type="text" 
                          value={item.name} 
                          onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                          className="w-full bg-transparent font-bold text-xs sm:text-sm text-on-surface border-b border-transparent focus:border-primary outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] sm:text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Price (₹)</label>
                        <input 
                          type="number" 
                          value={item.price} 
                          onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                          className="w-full bg-transparent font-bold text-sm sm:text-base text-primary border-b border-transparent focus:border-primary outline-none transition-colors"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-[1.5fr_1fr] sm:grid-cols-2 gap-2 sm:gap-3">
                      <div>
                        <label className="text-[9px] sm:text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Category</label>
                        <input 
                          type="text" 
                          value={item.category || ""} 
                          onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                          className="w-full text-[11px] sm:text-sm bg-surface-container-low px-2 py-1 sm:px-3 sm:py-1.5 rounded border border-outline-variant/40 focus:border-primary outline-none"
                          placeholder="e.g. Starters"
                        />
                      </div>
                      <div className="flex items-end pb-0.5 sm:pb-1">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={item.veg} 
                            onChange={(e) => handleItemChange(index, 'veg', e.target.checked)}
                            className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-outline-variant text-primary focus:ring-primary"
                          />
                          <span className="text-[11px] sm:text-sm font-bold text-on-surface flex items-center gap-1">
                            <span className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-[1.5px] p-[1px] flex items-center justify-center ${item.veg ? 'border-green-600' : 'border-red-600'}`}>
                              <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${item.veg ? 'bg-green-600' : 'bg-red-600'}`}></span>
                            </span>
                            {item.veg ? 'Veg' : 'Non'}
                          </span>
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <textarea 
                        value={item.description || ""} 
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className="w-full text-[11px] sm:text-xs bg-transparent border-b border-transparent focus:border-primary outline-none resize-none overflow-hidden h-4 sm:h-6 focus:h-12 transition-all placeholder:text-on-surface-variant/50 leading-tight"
                        placeholder="Description..."  />
                    </div>
                  </div>
                </div>
                ))}
                
                {/* Spacer so the last item isn't hidden behind the fixed button */}
                <div className="h-24"></div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-on-surface-variant">
                <MaterialIcon name="document_scanner" className="text-6xl mb-4 opacity-20" />
                <p className="font-bold">No items extracted yet</p>
                <p className="text-sm mt-2 max-w-xs">Upload a clear photo of your printed menu and click the extract button. AI will automatically digitize the dishes, prices, and categories.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Fixed Approve Button at the bottom */}
      {editableItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-6 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest to-transparent z-40 pointer-events-none flex justify-center">
          <div className="w-full max-w-4xl pointer-events-auto shadow-2xl rounded-full">
            <button 
              disabled={saving}
              onClick={handleApproveAndSave}
              className="w-full rounded-full bg-tertiary px-4 py-3 sm:px-6 sm:py-4 font-bold text-sm sm:text-base text-on-tertiary shadow-lg shadow-tertiary/30 flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
            >
              {saving ? (
                <><MaterialIcon name="hourglass_empty" className="animate-spin text-lg" /> Saving...</>
              ) : (
                <><MaterialIcon name="publish" className="text-lg" /> Approve & Add {editableItems.length} items</>
              )}
            </button>
            {saveStatus && <p className="text-center text-[11px] sm:text-sm font-bold text-primary mt-1.5 sm:mt-2 bg-surface-container-lowest/80 rounded-full">{saveStatus}</p>}
          </div>
        </div>
      )}

      {/* Global Image Library Modal */}
      <GlobalImageLibrary 
        isOpen={isGalleryOpen} 
        onClose={() => {
          setIsGalleryOpen(false);
          setActiveItemIndex(null);
        }}
        onSelectImage={handleSelectGalleryImage}
        defaultQuery={galleryQuery}
      />
    </div>
  );
}
