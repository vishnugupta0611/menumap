"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import MaterialIcon from "@/components/stitch/MaterialIcon";
import { useAuth } from "@/contexts/AuthContext";

export default function MenuUIPage() {
  const { user } = useAuth();
  const [restaurantId, setRestaurantId] = useState("");
  const [settings, setSettings] = useState({
    colorPalette: "clay",
    font: "jakarta",
    layout: "bento",
    showBanner: true,
    showDescription: true,
    showBadges: true,
    showImage: true,
    galleryLayout: "simple",
  });

  const [saveStatus, setSaveStatus] = useState("All changes synced");
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      if (!user?.restaurantId) {
        setLoading(false);
        return;
      }
      try {
        const restRes = await api.get(`/api/restaurants/id/${user.restaurantId}`);
        const rest = restRes.data.data;
        if (rest) {
          setRestaurantId(rest._id);
          if (rest.menuUiSettings) {
            setSettings({
              colorPalette: rest.menuUiSettings.colorPalette || "clay",
              font: rest.menuUiSettings.font || "jakarta",
              layout: rest.menuUiSettings.layout || "bento",
              showBanner: rest.menuUiSettings?.showBanner ?? true,
              showDescription: rest.menuUiSettings?.showDescription ?? true,
              showBadges: rest.menuUiSettings?.showBadges ?? true,
              showImage: rest.menuUiSettings?.showImage ?? true,
              showTabs: rest.menuUiSettings?.showTabs ?? true,
              galleryLayout: rest.menuUiSettings?.galleryLayout || "simple",
            });
          }
        }
      } catch (err) {
        setLoadError("Could not load UI settings.");
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [user?.restaurantId]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!restaurantId) return;
    setSaveStatus("Saving settings...");
    try {
      await api.patch(`/api/restaurants/id/${restaurantId}`, {
        menuUiSettings: settings,
      });
      setSaveStatus("Saved successfully!");
      setTimeout(() => setSaveStatus("All changes synced"), 2000);
    } catch (err) {
      setSaveStatus("Failed to save settings");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-primary font-bold animate-pulse">Loading UI settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <div>
        <p className="font-label-sm text-label-sm uppercase text-secondary">Restaurant OS</p>
        <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary md:font-display-lg md:text-display-lg">Menu UI Customization</h1>
      </div>

      {loadError && (
        <div className="rounded-2xl border border-error-container bg-error-container/20 p-4 text-sm text-on-error-container">
          {loadError}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start relative">
        <form onSubmit={handleSave} className="space-y-8 w-full max-w-2xl flex-1">
        {/* Theming */}
        <div className="bg-white p-6 md:p-8 rounded-[32px] border border-surface-container-highest/20 shadow-[0_2px_24px_rgba(0,0,0,0.02)] space-y-6">
          <h3 className="font-bold text-lg text-on-surface flex items-center gap-3">
            <MaterialIcon name="palette" className="text-primary text-2xl" />
            Brand Theming
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-2">Color Palette</label>
              <select
                className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary text-body-md appearance-none"
                value={settings.colorPalette}
                onChange={(e) => setSettings({ ...settings, colorPalette: e.target.value })}
              >
                <option value="clay">Clay (Default)</option>
                <option value="midnight">Midnight Dark</option>
                <option value="rose">Rose Gold</option>
                <option value="ocean">Ocean Blue</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-2">Typography (Font)</label>
              <select
                className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary text-body-md appearance-none"
                value={settings.font}
                onChange={(e) => setSettings({ ...settings, font: e.target.value })}
              >
                <option value="jakarta">Plus Jakarta Sans (Default)</option>
                <option value="inter">Inter</option>
                <option value="roboto">Roboto</option>
                <option value="outfit">Outfit</option>
              </select>
            </div>
          </div>
        </div>

        {/* Layout */}
        <div className="bg-white p-6 md:p-8 rounded-[32px] border border-surface-container-highest/20 shadow-[0_2px_24px_rgba(0,0,0,0.02)] space-y-6">
          <h3 className="font-bold text-lg text-on-surface flex items-center gap-3">
            <MaterialIcon name="dashboard_customize" className="text-primary text-2xl" />
            Menu Layout
          </h3>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-2">Item Display Style</label>
            <select
              className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary text-body-md appearance-none"
              value={settings.layout}
              onChange={(e) => setSettings({ ...settings, layout: e.target.value })}
            >
              <option value="bento">Bento Grid (Modern)</option>
              <option value="list">Standard List</option>
              <option value="grid">Photo Grid</option>
              <option value="simple-list">Simple List (Clean)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-2 mt-4">Gallery Style</label>
            <select
              className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary text-body-md appearance-none"
              value={settings.galleryLayout}
              onChange={(e) => setSettings({ ...settings, galleryLayout: e.target.value })}
            >
              <option value="aesthetic">Aesthetic (Dynamic Accordion)</option>
              <option value="decent">Decent (Grid with Title)</option>
              <option value="simple">Simple (Overlapping Polaroids)</option>
            </select>
          </div>
        </div>

        {/* Toggles */}
        <div className="bg-white p-6 md:p-8 rounded-[32px] border border-surface-container-highest/20 shadow-[0_2px_24px_rgba(0,0,0,0.02)] space-y-6">
          <h3 className="font-bold text-lg text-on-surface flex items-center gap-3">
            <MaterialIcon name="toggle_on" className="text-primary text-2xl" />
            Visibility Settings
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-on-surface">Show Hero Banner</h3>
              <p className="text-xs text-on-surface-variant">Display your restaurant's cover photo at the top of the menu.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input type="checkbox" className="sr-only" checked={settings.showBanner} onChange={(e) => setSettings({ ...settings, showBanner: !settings.showBanner })} />
              <div className={`w-14 h-8 rounded-full transition-colors duration-200 ${settings.showBanner ? "bg-primary" : "bg-surface-variant"}`}>
                <div className={`w-6 h-6 bg-white rounded-full transition-transform duration-200 mt-1 ml-1 ${settings.showBanner ? "translate-x-6" : "translate-x-0"}`}></div>
              </div>
            </label>
          </div>
          
          <div className="flex items-center justify-between border-t border-outline-variant/30 pt-4">
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-on-surface">Show Item Descriptions</h3>
              <p className="text-xs text-on-surface-variant">Display the full text description below each menu item.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input type="checkbox" className="sr-only" checked={settings.showDescription} onChange={(e) => setSettings({ ...settings, showDescription: !settings.showDescription })} />
              <div className={`w-14 h-8 rounded-full transition-colors duration-200 ${settings.showDescription ? "bg-primary" : "bg-surface-variant"}`}>
                <div className={`w-6 h-6 bg-white rounded-full transition-transform duration-200 mt-1 ml-1 ${settings.showDescription ? "translate-x-6" : "translate-x-0"}`}></div>
              </div>
            </label>
          </div>
          
          <div className="flex items-center justify-between border-t border-outline-variant/30 pt-4">
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-on-surface">Show Badges (Veg/Non-Veg, Popular)</h3>
              <p className="text-xs text-on-surface-variant">Display visual indicators for dietary tags and bestsellers.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input type="checkbox" className="sr-only" checked={settings.showBadges} onChange={(e) => setSettings({ ...settings, showBadges: !settings.showBadges })} />
              <div className={`w-14 h-8 rounded-full transition-colors duration-200 ${settings.showBadges ? "bg-primary" : "bg-surface-variant"}`}>
                <div className={`w-6 h-6 bg-white rounded-full transition-transform duration-200 mt-1 ml-1 ${settings.showBadges ? "translate-x-6" : "translate-x-0"}`}></div>
              </div>
            </label>
          </div>

          <div className="flex items-center justify-between border-t border-outline-variant/30 pt-4">
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-on-surface">Show Item Images</h3>
              <p className="text-xs text-on-surface-variant">Display photos next to menu items. When off, items are text-only.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input type="checkbox" className="sr-only" checked={settings.showImage} onChange={(e) => setSettings({ ...settings, showImage: !settings.showImage })} />
              <div className={`w-14 h-8 rounded-full transition-colors duration-200 ${settings.showImage ? "bg-primary" : "bg-surface-variant"}`}>
                <div className={`w-6 h-6 bg-white rounded-full transition-transform duration-200 mt-1 ml-1 ${settings.showImage ? "translate-x-6" : "translate-x-0"}`}></div>
              </div>
            </label>
          </div>

          <div className="flex items-center justify-between border-t border-outline-variant/30 pt-4">
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-on-surface">Show Navigation Tabs</h3>
              <p className="text-xs text-on-surface-variant">Display the sticky navigation tabs (Profile, Menu, About, etc) at the top.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input type="checkbox" className="sr-only" checked={settings.showTabs} onChange={(e) => setSettings({ ...settings, showTabs: !settings.showTabs })} />
              <div className={`w-14 h-8 rounded-full transition-colors duration-200 ${settings.showTabs ? "bg-primary" : "bg-surface-variant"}`}>
                <div className={`w-6 h-6 bg-white rounded-full transition-transform duration-200 mt-1 ml-1 ${settings.showTabs ? "translate-x-6" : "translate-x-0"}`}></div>
              </div>
            </label>
          </div>

        </div>

        {/* Save Controls */}
        <section className="bg-white rounded-[32px] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.06)] border border-surface-container-highest/20 flex items-center justify-between gap-4 sticky bottom-8 z-20">
          <span className="text-[15px] font-semibold text-primary">{saveStatus}</span>
          <button
            type="submit"
            className="px-8 h-14 rounded-full bg-primary text-white font-bold shadow-[0_4px_16px_rgba(0,0,0,0.12)] flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer border-none outline-none"
          >
            <MaterialIcon name="save" className="text-white" />
            Save Configurations
          </button>
        </section>
      </form>

      {/* Mobile Preview Panel */}
      <div className="sticky top-24 w-full max-w-[340px] hidden lg:block self-start z-10 perspective-1000">
        <MenuPreview settings={settings} />
      </div>
      </div>
    </div>
  );
}

const MenuPreview = ({ settings }) => {
  return (
    <div className={`w-full max-w-[340px] rounded-[40px] border-[8px] border-inverse-surface shadow-2xl overflow-hidden bg-background h-[700px] relative flex flex-col theme-${settings.colorPalette} font-theme-${settings.font}`}>
      {/* Mock App Bar */}
      <div className="bg-surface/80 backdrop-blur-xl border-b border-surface-container p-4 flex items-center justify-between z-10 sticky top-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center overflow-hidden">
             <MaterialIcon name="restaurant" className="text-primary text-[16px]" />
          </div>
          <span className="font-bold text-primary text-sm">Restaurant</span>
        </div>
        <div className="flex gap-1">
          <MaterialIcon name="person" className="text-primary text-xl" />
          <MaterialIcon name="shopping_cart" className="text-primary text-xl" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar bg-background text-on-background pb-20">
        {settings.showBanner && (
          <div className="h-32 bg-surface-variant flex items-center justify-center relative overflow-hidden">
            <MaterialIcon name="image" className="text-on-surface-variant/30 text-4xl" />
          </div>
        )}

        <div className="p-4 space-y-4 mt-2">
          <div className="flex gap-2 overflow-x-hidden">
            <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">All Items</span>
            <span className="px-4 py-1.5 rounded-full bg-surface-container-high text-on-surface-variant text-[10px] font-medium">Starters</span>
            <span className="px-4 py-1.5 rounded-full bg-surface-container-high text-on-surface-variant text-[10px] font-medium">Mains</span>
          </div>

          <div>
            <h3 className="font-bold text-on-surface-variant mb-3 border-b border-outline-variant/30 pb-2 text-sm">Starters</h3>
            
            <div className={
              settings.layout === "list" ? "space-y-4" :
              settings.layout === "grid" ? "grid grid-cols-2 gap-4" :
              settings.layout === "simple-list" ? "space-y-3" :
              "space-y-5" // bento
            }>
              {/* Mock Item 1 */}
              <div className={`group overflow-hidden ${
                settings.layout === "list" ? "bg-white flex items-center justify-between gap-4 p-4 rounded-[20px] border border-surface-container-highest/30 shadow-[0_2px_12px_rgba(0,0,0,0.02)]" :
                settings.layout === "grid" ? "bg-white rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col border border-surface-container-highest/20" :
                settings.layout === "simple-list" ? "flex items-center justify-between py-3 bg-transparent border-none rounded-none" :
                "bg-white p-4 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-surface-container-highest/30 flex items-start justify-between gap-4"
              }`}>
                {/* Content (Order swapped for grid) */}
                <div className={`flex-1 ${settings.layout === "grid" ? "p-3 order-2" : "order-1 flex flex-col h-full"} ${settings.layout === "simple-list" ? "min-w-0" : ""}`}>
                  <div className={`flex items-center gap-1.5 ${settings.layout === "grid" ? "mb-1" : "mb-1.5"} ${settings.layout === "simple-list" ? "mb-0 truncate" : ""}`}>
                    {settings.showBadges && (
                      <span className={`material-symbols-outlined ${settings.layout === "grid" ? "text-[10px]" : "text-[12px]"} text-green-600 shrink-0`}>fiber_manual_record</span>
                    )}
                    <h4 className={`text-on-surface tracking-tight ${settings.layout === "grid" ? "text-[13px] line-clamp-1 font-bold" : settings.layout === "simple-list" ? "text-[12px] font-medium truncate" : "text-[15px] font-bold"}`}>Classic Burger</h4>
                  </div>
                  {settings.showDescription && settings.layout !== "grid" && settings.layout !== "simple-list" && (
                    <p className={`text-on-surface-variant/80 line-clamp-2 leading-relaxed ${settings.layout === "list" ? "text-[10px] mb-2" : "text-[11px] mb-3"}`}>Juicy patty with fresh lettuce, tomatoes, and secret sauce.</p>
                  )}
                  {settings.layout !== "simple-list" && (
                    <div className={`flex items-center justify-between mt-auto ${settings.layout === "grid" ? "pt-1" : ""}`}>
                      <span className={`font-bold text-primary ${settings.layout === "grid" || settings.layout === "list" ? "text-[13px]" : "text-[15px]"}`}>Rs 150</span>
                      
                      {/* List/Grid/Simple Add Button */}
                      {(settings.layout === "grid" || settings.layout === "list") && (
                        <button className="bg-primary-container text-primary w-6 h-6 rounded flex items-center justify-center font-bold text-[10px]">+</button>
                      )}
                    </div>
                  )}
                </div>

                {settings.layout === "simple-list" && (
                  <div className="flex items-center gap-2 shrink-0 ml-3 order-2">
                    <span className="font-bold text-primary text-[12px]">₹150</span>
                    <button className="bg-primary/10 text-primary px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider border border-primary/20">ADD</button>
                  </div>
                )}

                {/* Image */}
                {settings.showImage && settings.layout !== "simple-list" && (
                  <div className={`bg-surface-container-low overflow-hidden flex-shrink-0 shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)] flex items-center justify-center ${
                    settings.layout === "list" ? "w-16 h-16 rounded-xl order-2" :
                    settings.layout === "grid" ? "w-full h-24 order-1" :
                    "w-20 h-20 rounded-2xl order-2"
                  }`}>
                    <MaterialIcon name="fastfood" className="text-on-surface-variant/20" />
                  </div>
                )}
                
                {/* Add to Cart Control for Bento Layout */}
                {settings.layout === "bento" && (
                  <div className="order-3 col-span-full w-full mt-[-8px]">
                    <div className="bg-surface-container-low border border-surface-container-highest/50 rounded-lg px-1.5 py-1 w-full flex justify-between items-center shadow-sm">
                      <button className="w-full py-1 text-primary font-bold text-[11px] text-center uppercase tracking-wider">ADD</button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Mock Item 2 */}
              <div className={`group overflow-hidden ${
                settings.layout === "list" ? "bg-white flex items-center justify-between gap-4 p-4 rounded-[20px] border border-surface-container-highest/30 shadow-[0_2px_12px_rgba(0,0,0,0.02)]" :
                settings.layout === "grid" ? "bg-white rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col border border-surface-container-highest/20" :
                settings.layout === "simple-list" ? "flex items-center justify-between py-3 bg-transparent border-none rounded-none" :
                "bg-white p-4 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-surface-container-highest/30 flex items-start justify-between gap-4"
              }`}>
                {/* Content (Order swapped for grid) */}
                <div className={`flex-1 ${settings.layout === "grid" ? "p-3 order-2" : "order-1 flex flex-col h-full"} ${settings.layout === "simple-list" ? "min-w-0" : ""}`}>
                  <div className={`flex items-center gap-1.5 ${settings.layout === "grid" ? "mb-1" : "mb-1.5"} ${settings.layout === "simple-list" ? "mb-0 truncate" : ""}`}>
                    {settings.showBadges && (
                      <span className={`material-symbols-outlined ${settings.layout === "grid" ? "text-[10px]" : "text-[12px]"} text-red-600 shrink-0`}>fiber_manual_record</span>
                    )}
                    <h4 className={`text-on-surface tracking-tight ${settings.layout === "grid" ? "text-[13px] line-clamp-1 font-bold" : settings.layout === "simple-list" ? "text-[12px] font-medium truncate" : "text-[15px] font-bold"}`}>Pepperoni Pizza</h4>
                  </div>
                  {settings.showDescription && settings.layout !== "grid" && settings.layout !== "simple-list" && (
                    <p className={`text-on-surface-variant/80 line-clamp-2 leading-relaxed ${settings.layout === "list" ? "text-[10px] mb-2" : "text-[11px] mb-3"}`}>Wood-fired pizza with spicy pepperoni slices.</p>
                  )}
                  {settings.layout !== "simple-list" && (
                    <div className={`flex items-center justify-between mt-auto ${settings.layout === "grid" ? "pt-1" : ""}`}>
                      <span className={`font-bold text-primary ${settings.layout === "grid" || settings.layout === "list" ? "text-[13px]" : "text-[15px]"}`}>Rs 350</span>
                      
                      {/* List/Grid/Simple Add Button */}
                      {(settings.layout === "grid" || settings.layout === "list") && (
                         <button className="bg-primary-container text-primary w-6 h-6 rounded flex items-center justify-center font-bold text-[10px]">+</button>
                      )}
                    </div>
                  )}
                </div>

                {settings.layout === "simple-list" && (
                  <div className="flex items-center gap-2 shrink-0 ml-3 order-2">
                    <span className="font-bold text-primary text-[12px]">₹350</span>
                    <button className="bg-primary/10 text-primary px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider border border-primary/20">ADD</button>
                  </div>
                )}

                {/* Image */}
                {settings.showImage && settings.layout !== "simple-list" && (
                  <div className={`bg-surface-container-low overflow-hidden flex-shrink-0 shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)] flex items-center justify-center ${
                    settings.layout === "list" ? "w-16 h-16 rounded-xl order-2" :
                    settings.layout === "grid" ? "w-full h-24 order-1" :
                    "w-20 h-20 rounded-2xl order-2"
                  }`}>
                    <MaterialIcon name="local_pizza" className="text-on-surface-variant/20" />
                  </div>
                )}
                
                {/* Add to Cart Control for Bento Layout */}
                {settings.layout === "bento" && (
                  <div className="order-3 col-span-full w-full mt-[-8px]">
                    <div className="bg-surface-container-low border border-surface-container-highest/50 rounded-lg px-1.5 py-1 w-full flex justify-between items-center shadow-sm">
                      <button className="w-full py-1 text-primary font-bold text-[11px] text-center uppercase tracking-wider">ADD</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating Mock Action */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-on-surface text-white px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-3 shadow-xl whitespace-nowrap w-[90%] justify-between">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 bg-primary rounded text-white flex items-center justify-center">2</span>
          <span>Rs 500</span>
        </div>
        <span className="flex items-center gap-1">View Cart <MaterialIcon name="arrow_forward" className="text-[14px]" /></span>
      </div>
    </div>
  );
};
