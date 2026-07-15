"use client";

import { useState, useEffect } from "react";
import { useMenuOcr } from "@/hooks/use-menu-ocr";
import { AdminPanel } from "@/components/admin/AdminPanel";
import MaterialIcon from "@/components/stitch/MaterialIcon";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

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

  // When OCR succeeds, populate editable items
  useEffect(() => {
    if (ocr.data?.items) {
      setEditableItems(ocr.data.items.map(item => ({ ...item, selected: true })));
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

  async function handleApproveAndSave() {
    if (!user?.restaurantId) return;
    setSaving(true);
    setSaveStatus("Saving items...");
    try {
      const itemsToSave = editableItems.filter(item => item.selected);
      let successCount = 0;
      
      for (const item of itemsToSave) {
        try {
          await api.post(`/api/restaurants/id/${user.restaurantId}/menu-items`, {
            name: item.name,
            description: item.description || "",
            price: Number(item.price) || 0,
            veg: Boolean(item.veg),
            category: item.category || "Uncategorized",
            available: true,
          });
          successCount++;
        } catch (e) {
          console.error("Failed to save item:", item.name, e);
        }
      }
      
      setSaveStatus(`Successfully saved ${successCount} items!`);
      setTimeout(() => {
        router.push("/admin/menu/manage");
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
      
      <AdminPanel title="Upload or Capture Menu" eyebrow="AI assisted" icon="document_scanner">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <label className="flex min-h-[360px] cursor-pointer flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-outline-variant bg-surface-container-low p-8 text-center transition hover:border-primary">
            {preview ? (
              <img src={preview} alt="Menu upload preview" className="h-full max-h-[420px] w-full rounded-3xl object-contain bg-surface-container-lowest" />
            ) : (
              <>
                <MaterialIcon name="add_a_photo" className="mb-4 text-5xl text-primary" />
                <span className="font-headline-md text-headline-md text-on-surface">Click or upload menu photo</span>
                <span className="mt-2 text-sm text-on-surface-variant max-w-xs">Upload a clear photo of your printed menu from your gallery or camera. OCR output stays editable before publishing.</span>
              </>
            )}
            <input className="sr-only" type="file" accept="image/*" onChange={handleFile} />
          </label>
          
          <div className="rounded-[32px] bg-surface-container-low p-6 flex flex-col max-h-[80vh]">
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
              <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                <div className="flex items-center justify-between sticky top-0 bg-surface-container-low pb-2 z-10">
                  <p className="font-bold text-sm text-primary flex items-center gap-2">
                    <MaterialIcon name="check_circle" className="text-primary" />
                    Found {editableItems.length} items
                  </p>
                  <p className="text-xs text-on-surface-variant font-bold bg-surface-container-highest px-3 py-1 rounded-full">
                    Confidence: {Math.round((ocr.data?.confidence || 0) * 100)}%
                  </p>
                </div>
                
                {editableItems.map((item, index) => (
                  <div key={index} className="rounded-2xl bg-white p-4 shadow-sm border border-surface-container space-y-3 relative group transition-all hover:border-primary/30">
                    <button 
                      onClick={() => handleRemoveItem(index)}
                      className="absolute top-2 right-2 p-2 rounded-full bg-error-container/50 text-error opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error hover:text-white"
                      title="Remove item"
                    >
                      <MaterialIcon name="close" className="text-[18px]" />
                    </button>
                    
                    <div className="grid grid-cols-[1fr_100px] gap-3 pr-8">
                      <div>
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Item Name</label>
                        <input 
                          type="text" 
                          value={item.name} 
                          onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                          className="w-full bg-transparent font-bold text-on-surface border-b border-transparent focus:border-primary outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Price (₹)</label>
                        <input 
                          type="number" 
                          value={item.price} 
                          onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                          className="w-full bg-transparent font-bold text-primary border-b border-transparent focus:border-primary outline-none transition-colors"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Category</label>
                        <input 
                          type="text" 
                          value={item.category || ""} 
                          onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                          className="w-full text-sm bg-surface-container-lowest px-3 py-1.5 rounded-lg border border-outline-variant focus:border-primary outline-none"
                          placeholder="e.g. Starters"
                        />
                      </div>
                      <div className="flex items-end pb-1">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={item.veg} 
                            onChange={(e) => handleItemChange(index, 'veg', e.target.checked)}
                            className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
                          />
                          <span className="text-sm font-bold text-on-surface flex items-center gap-1">
                            <span className={`w-3 h-3 rounded-full border-2 p-[1px] flex items-center justify-center ${item.veg ? 'border-green-600' : 'border-red-600'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${item.veg ? 'bg-green-600' : 'bg-red-600'}`}></span>
                            </span>
                            {item.veg ? 'Veg' : 'Non-Veg'}
                          </span>
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Description</label>
                      <textarea 
                        value={item.description || ""} 
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className="w-full text-sm bg-transparent border-b border-transparent focus:border-primary outline-none resize-none overflow-hidden h-6 focus:h-12 transition-all placeholder:text-on-surface-variant/50"
                        placeholder="Add a short description..."
                      />
                    </div>
                  </div>
                ))}
                
                <div className="pt-4 sticky bottom-0 bg-gradient-to-t from-surface-container-low via-surface-container-low to-transparent pb-2">
                  <button 
                    disabled={saving || editableItems.length === 0}
                    onClick={handleApproveAndSave}
                    className="w-full rounded-full bg-tertiary px-6 py-4 font-bold text-on-tertiary shadow-lg shadow-tertiary/20 flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
                  >
                    {saving ? (
                      <><MaterialIcon name="hourglass_empty" className="animate-spin" /> Saving to database...</>
                    ) : (
                      <><MaterialIcon name="publish" /> Approve & Add {editableItems.length} items to Menu</>
                    )}
                  </button>
                  {saveStatus && <p className="text-center text-sm font-bold text-primary mt-2">{saveStatus}</p>}
                </div>
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
      </AdminPanel>
    </div>
  );
}
