"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import MaterialIcon from "@/components/stitch/MaterialIcon";
import { useAuth } from "@/contexts/AuthContext";

export default function MenuUIPage() {
  const { user } = useAuth();
  const [restaurantId, setRestaurantId] = useState("");
  const [restaurant, setRestaurant] = useState(null);
  
  // Tabs & Preview
  const [activeTab, setActiveTab] = useState("settings");
  const [iframeKey, setIframeKey] = useState(0);
  const [settings, setSettings] = useState({
    colorPalette: "clay",
    font: "jakarta",
    layout: "bento",
    showBanner: true,
    showDescription: true,
    showBadges: true,
    showImage: true,
    galleryLayout: "simple",
    qrCharacter: "img1",
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
          setRestaurant(rest);
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
              qrCharacter: rest.menuUiSettings?.qrCharacter || "img1",
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
      setIframeKey(prev => prev + 1);
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
    <div className="space-y-8 pb-24 max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="font-label-sm text-label-sm uppercase text-secondary">Restaurant OS</p>
          <h1 className="font-heading-lg text-heading-lg font-bold text-on-surface">Menu UI</h1>
        </div>
        
        {/* Mobile Tabs (Only visible on small screens) */}
        <div className="lg:hidden flex bg-surface-container-low p-1 rounded-full border border-surface-container-highest/20 shadow-sm self-start">
          <button 
            onClick={() => setActiveTab("settings")}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'settings' ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest/20'} border-none outline-none`}
          >
            Settings
          </button>
          <button 
            onClick={() => setActiveTab("preview")}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'preview' ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest/20'} border-none outline-none`}
          >
            Preview
          </button>
        </div>
      </div>

      {loadError && (
        <div className="rounded-2xl border border-error-container bg-error-container/20 p-4 text-sm text-on-error-container">
          {loadError}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start relative">
        <form onSubmit={handleSave} className={`space-y-8 w-full max-w-3xl flex-1 ${activeTab === 'settings' ? 'block' : 'hidden lg:block'}`}>
        {/* Theming */}
        <div className="bg-white p-6 md:p-8 rounded-[32px] border border-surface-container-highest/20 shadow-[0_8px_30px_rgb(0,0,0,0.08)] space-y-6">
          <h3 className="font-bold text-lg text-on-surface flex items-center gap-3">
            <MaterialIcon name="palette" className="text-primary text-2xl" />
            Brand Theming
          </h3>
          
          <div>
            <label className="block text-sm font-bold text-on-surface mb-1">Color Palette</label>
            <p className="text-xs text-on-surface-variant mb-4">Select the primary color theme for your store</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'clay', label: 'Clay', hex: '#E06F4D', bgHex: '#fbf8f6' },
                { id: 'midnight', label: 'Midnight', hex: '#1e1e1e', bgHex: '#f8f9fa' },
                { id: 'rose', label: 'Rose Gold', hex: '#c57878', bgHex: '#fdf9f9' },
                { id: 'ocean', label: 'Ocean', hex: '#3b82f6', bgHex: '#f5f8ff' }
              ].map(color => {
                const isActive = settings.colorPalette === color.id;
                return (
                  <div 
                    key={color.id}
                    onClick={() => setSettings({ ...settings, colorPalette: color.id })}
                    className={`p-2 rounded-[20px] border-2 cursor-pointer transition-all text-center flex flex-col items-center gap-2 ${isActive ? 'border-primary bg-primary/5' : 'border-outline-variant hover:border-primary/30'}`}
                  >
                    <div className="w-full aspect-video rounded-xl border border-outline-variant/30 flex shadow-sm overflow-hidden" style={{ backgroundColor: color.bgHex }}>
                      <div className="w-1/3 h-full" style={{ backgroundColor: color.hex }}></div>
                      <div className="w-2/3 h-full flex flex-col justify-center items-center gap-1.5">
                         <div className="w-6 h-1.5 rounded-full" style={{ backgroundColor: color.hex }}></div>
                         <div className="w-10 h-1 rounded-full bg-black/10"></div>
                      </div>
                    </div>
                    <span className={`font-bold text-[11px] sm:text-xs ${isActive ? 'text-primary' : 'text-on-surface'}`}>{color.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-surface-container/50">
            <label className="block text-sm font-bold text-on-surface mb-1">Typography (Font)</label>
            <p className="text-xs text-on-surface-variant mb-4">Choose a font style for your store</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'jakarta', label: 'Jakarta', sample: 'Aa', desc: 'Modern & Clean' },
                { id: 'inter', label: 'Inter', sample: 'Aa', desc: 'Highly Legible' },
                { id: 'roboto', label: 'Roboto', sample: 'Aa', desc: 'Structured' },
                { id: 'outfit', label: 'Outfit', sample: 'Aa', desc: 'Geometric & Bold' }
              ].map(font => {
                const isActive = settings.font === font.id;
                return (
                  <div 
                    key={font.id}
                    onClick={() => setSettings({ ...settings, font: font.id })}
                    className={`p-3 sm:p-4 rounded-[20px] border-2 cursor-pointer transition-all flex items-center gap-3 ${isActive ? 'border-primary bg-primary/5' : 'border-outline-variant hover:border-primary/30'}`}
                  >
                    <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-lg sm:text-xl border shadow-sm font-theme-${font.id} ${isActive ? 'bg-primary text-white border-primary' : 'bg-surface-container-lowest text-on-surface border-outline-variant/30'}`}>
                      {font.sample}
                    </div>
                    <div className="flex flex-col text-left overflow-hidden">
                      <span className={`font-bold text-[11px] sm:text-[13px] truncate font-theme-${font.id} ${isActive ? 'text-primary' : 'text-on-surface'}`}>{font.label}</span>
                      <span className="text-[9px] sm:text-[10px] text-on-surface-variant truncate mt-0.5">{font.desc}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Layout */}
        <div className="bg-white p-6 md:p-8 rounded-[32px] border border-surface-container-highest/20 shadow-[0_8px_30px_rgb(0,0,0,0.08)] space-y-6">
          <h3 className="font-bold text-lg text-on-surface flex items-center gap-3">
            <MaterialIcon name="dashboard_customize" className="text-primary text-2xl" />
            Menu Layout
          </h3>
          
          <div>
            <label className="block text-sm font-bold text-on-surface mb-1">Item Display Style</label>
            <p className="text-xs text-on-surface-variant mb-4">How menu items should be displayed</p>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {[
                { id: 'bento', label: 'Bento Grid', desc: 'Modern & spacious', icon: 'view_comfy' },
                { id: 'list', label: 'Standard List', desc: 'Classic horizontal', icon: 'view_list' },
                { id: 'grid', label: 'Photo Grid', desc: 'Visual heavy', icon: 'grid_view' },
                { id: 'simple-list', label: 'Simple List', desc: 'Clean, text-focused', icon: 'notes' }
              ].map(layout => {
                const isActive = settings.layout === layout.id;
                return (
                  <div 
                    key={layout.id}
                    onClick={() => setSettings({ ...settings, layout: layout.id })}
                    className={`p-3 sm:p-4 rounded-[20px] border-2 cursor-pointer transition-all flex flex-col items-start gap-2 ${isActive ? 'border-primary bg-primary/5' : 'border-outline-variant hover:border-primary/30'}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1 ${isActive ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant'}`}>
                      <MaterialIcon name={layout.icon} className="text-[18px]" />
                    </div>
                    <div className="flex flex-col">
                      <span className={`font-bold text-xs sm:text-sm ${isActive ? 'text-primary' : 'text-on-surface'}`}>{layout.label}</span>
                      <span className="text-[10px] sm:text-xs text-on-surface-variant">{layout.desc}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-surface-container/50">
            <label className="block text-sm font-bold text-on-surface mb-1">Gallery Style</label>
            <p className="text-xs text-on-surface-variant mb-4">How the gallery section should appear</p>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {[
                { id: 'marquee', label: 'Marquee', desc: 'Infinite scroll', icon: 'view_carousel' },
                { id: 'aesthetic', label: 'Aesthetic', desc: 'Dynamic masonry', icon: 'auto_awesome' },
                { id: 'grid', label: 'Grid', desc: 'Clean 2x2 layout', icon: 'window' },
                { id: 'polaroid', label: 'Polaroid', desc: 'Overlapping cards', icon: 'style' }
              ].map(layout => {
                const isActive = settings.galleryLayout === layout.id;
                return (
                  <div 
                    key={layout.id}
                    onClick={() => setSettings({ ...settings, galleryLayout: layout.id })}
                    className={`p-3 sm:p-4 rounded-[20px] border-2 cursor-pointer transition-all flex flex-col items-start gap-2 ${isActive ? 'border-primary bg-primary/5' : 'border-outline-variant hover:border-primary/30'}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1 ${isActive ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant'}`}>
                      <MaterialIcon name={layout.icon} className="text-[18px]" />
                    </div>
                    <div className="flex flex-col">
                      <span className={`font-bold text-xs sm:text-sm ${isActive ? 'text-primary' : 'text-on-surface'}`}>{layout.label}</span>
                      <span className="text-[10px] sm:text-xs text-on-surface-variant">{layout.desc}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* QR Customization */}
        <div className="bg-white p-6 md:p-8 rounded-[32px] border border-surface-container-highest/20 shadow-[0_8px_30px_rgb(0,0,0,0.08)] space-y-6">
          <h3 className="font-bold text-lg text-on-surface flex items-center gap-3">
            <MaterialIcon name="qr_code_scanner" className="text-primary text-2xl" />
            QR Code Mascot
          </h3>
          
          <div>
            <label className="block text-sm font-bold text-on-surface mb-1">Mascot Character</label>
            <p className="text-xs text-on-surface-variant mb-4">Choose the character to hold your QR code when users scan</p>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {[
                { id: 'img1', label: 'Classic Waiter', src: '/images/img1.png' },
                { id: 'img2', label: 'Modern Waiter', src: '/images/img2.png' }
              ].map(char => {
                const isActive = settings.qrCharacter === char.id;
                return (
                  <div 
                    key={char.id}
                    onClick={() => setSettings({ ...settings, qrCharacter: char.id })}
                    className={`p-3 sm:p-4 rounded-[20px] border-2 cursor-pointer transition-all flex flex-col items-center gap-2 ${isActive ? 'border-primary bg-primary/5' : 'border-outline-variant hover:border-primary/30'}`}
                  >
                    <div className={`w-full aspect-[4/3] rounded-lg mb-2 overflow-hidden bg-surface-container flex items-center justify-center ${isActive ? 'border-2 border-primary' : ''}`}>
                      <img src={char.src} alt={char.label} className="w-full h-full object-cover object-top" />
                    </div>
                    <span className={`font-bold text-xs sm:text-sm ${isActive ? 'text-primary' : 'text-on-surface'}`}>{char.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="bg-white p-6 md:p-8 rounded-[32px] border border-surface-container-highest/20 shadow-[0_8px_30px_rgb(0,0,0,0.08)] space-y-6">
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
              <p className="text-xs text-on-surface-variant">This nav tab is used when restro wants to sell veg nonveg both</p>
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
        <section className="bg-white rounded-full p-2 pl-5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-surface-container flex items-center justify-between gap-3 sticky bottom-6 sm:bottom-10 z-20 w-full sm:w-max sm:ml-auto">
          <span className="text-xs sm:text-sm font-bold text-primary truncate">{saveStatus}</span>
          <button
            type="submit"
            className="px-5 h-10 rounded-full bg-primary text-white text-xs sm:text-sm font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-1.5 transition-all hover:brightness-110 active:scale-95 cursor-pointer border-none outline-none shrink-0"
          >
            <MaterialIcon name="save" className="text-white text-[18px]" />
            Save Configurations
          </button>
        </section>
      </form>

      {/* Mobile Preview Panel */}
      {restaurant && (
        <div className={`w-full flex flex-col items-center lg:block lg:w-[350px] shrink-0 lg:sticky lg:top-24 h-max max-w-full overflow-hidden ${activeTab === 'preview' ? 'block' : 'hidden lg:block'}`}>
          <div className="flex items-center justify-between mb-4 px-2 w-full max-w-[320px] lg:max-w-none">
            <div>
              <h3 className="font-bold text-on-surface">Live Preview</h3>
              <p className="text-xs text-on-surface-variant">See changes in real-time</p>
            </div>
            <button 
              type="button"
              onClick={() => setIframeKey(prev => prev + 1)}
              className="flex items-center gap-1 text-xs font-bold bg-primary/10 text-primary px-3 py-1.5 rounded-full hover:bg-primary hover:text-white transition-colors border-none outline-none cursor-pointer shrink-0"
            >
              <MaterialIcon name="refresh" className="text-[14px]" /> Refresh
            </button>
          </div>
          <div className="mx-auto w-full max-w-[320px] h-[600px] border-[4px] border-black rounded-[40px] overflow-hidden shadow-2xl relative bg-background flex flex-col">
             <iframe 
               key={iframeKey}
               src={`/${(restaurant.city || '').toLowerCase().replace(/\s+/g, '-')}/${restaurant.slug || ''}/menu`} 
               className="border-none"
               style={{
                 position: 'absolute',
                 top: 0,
                 left: 0,
                 width: '125%',
                 height: '125%',
                 transform: 'scale(0.8)',
                 transformOrigin: 'top left'
               }}
               onLoad={(e) => {
                 try {
                   const doc = e.target.contentWindow.document;
                   doc.body.classList.add('no-scrollbar');
                   doc.documentElement.classList.add('no-scrollbar');
                   const style = doc.createElement('style');
                   style.textContent = '::-webkit-scrollbar { display: none !important; } * { -ms-overflow-style: none !important; scrollbar-width: none !important; }';
                   doc.head.appendChild(style);
                 } catch (err) {}
               }}
             />
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
