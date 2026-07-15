"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import MaterialIcon from "@/components/stitch/MaterialIcon";
import { uploadImageAction } from "@/app/actions/upload";
import { useAuth } from "@/contexts/AuthContext";

const IMAGE_LIBRARY = [
  { id: 1, url: 'https://images.unsplash.com/photo-1589302168068-96516f1964f5?q=80&w=1600&auto=format&fit=crop', category: 'Indian', tags: 'indian thali curry traditional desi food' },
  { id: 2, url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=1600&auto=format&fit=crop', category: 'Indian', tags: 'dosa idli south indian chutney sambar' },
  { id: 3, url: 'https://images.unsplash.com/photo-1606491956689-2ea866880c8e?q=80&w=1600&auto=format&fit=crop', category: 'Indian', tags: 'paneer curry gravy spicy masala' },
  { id: 4, url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=1600&auto=format&fit=crop', category: 'Indian', tags: 'paratha aloo bread punjabi breakfast' },
  { id: 5, url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=1600&auto=format&fit=crop', category: 'Restaurant', tags: 'restaurant interior dining table fine' },
  { id: 6, url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1600&auto=format&fit=crop', category: 'Restaurant', tags: 'bar lounge restro pub drink alcohol' },
  { id: 7, url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1600&auto=format&fit=crop', category: 'Fast Food', tags: 'burger fries fast food american' },
  { id: 8, url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1600&auto=format&fit=crop', category: 'Fast Food', tags: 'pizza italian cheese slice' },
  { id: 9, url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1600&auto=format&fit=crop', category: 'Cafe', tags: 'cafe coffee espresso pastry breakfast' },
  { id: 10, url: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=1600&auto=format&fit=crop', category: 'Cafe', tags: 'coffee latte cup table mug' },
  { id: 11, url: 'https://images.unsplash.com/photo-1495195134817-a165b63bc2e9?q=80&w=1600&auto=format&fit=crop', category: 'Abstract', tags: 'simple abstract ingredients dark moody' },
  { id: 12, url: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?q=80&w=1600&auto=format&fit=crop', category: 'Abstract', tags: 'simple minimal table setting light' },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const [restaurantId, setRestaurantId] = useState("");
  const [openNow, setOpenNow] = useState(true);
  const [priceForTwo, setPriceForTwo] = useState(500);
  const [timings, setTimings] = useState({ open: "11:00 AM", close: "11:00 PM" });
  const [holidays, setHolidays] = useState([]);
  
  // New profile fields
  const [name, setName] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [website, setWebsite] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [logoImage, setLogoImage] = useState("");
  const [story, setStory] = useState("");
  const [facilities, setFacilities] = useState("");
  const [socialLinks, setSocialLinks] = useState({ instagram: "", facebook: "", x: "" });
  const [menuUiSettings, setMenuUiSettings] = useState({});
  const [showTabs, setShowTabs] = useState(true);

  const [saveStatus, setSaveStatus] = useState("All changes synced");
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  
  const [showImageLibrary, setShowImageLibrary] = useState(false);
  const [imageSearchQuery, setImageSearchQuery] = useState("");
  const [activeImageCategory, setActiveImageCategory] = useState("All");

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
          setOpenNow(rest.openNow !== undefined ? rest.openNow : true);
          setPriceForTwo(rest.priceForTwo || 500);
          if (rest.timings) {
            setTimings({
              open: rest.timings.get ? rest.timings.get("open") || "11:00 AM" : rest.timings.open || "11:00 AM",
              close: rest.timings.get ? rest.timings.get("close") || "11:00 PM" : rest.timings.close || "11:00 PM",
            });
          }
          setHolidays(rest.holidays || []);
          
          setName(rest.name || "");
          setCuisine(rest.cuisine || "");
          setAddress(rest.address || "");
          setPhone(rest.phone || "");
          setWhatsapp(rest.whatsapp || "");
          setWebsite(rest.website || "");
          setHeroImage(rest.heroImage || "");
          setLogoImage(rest.logoImage || "");
          setStory(rest.story || "");
          setFacilities(rest.facilities ? rest.facilities.join(", ") : "");
          setSocialLinks(rest.socialLinks || { instagram: "", facebook: "", x: "" });
          setMenuUiSettings(rest.menuUiSettings || {});
          setShowTabs(rest.menuUiSettings?.showTabs ?? true);
        }
      } catch (err) {
        setLoadError("Could not load settings. Check backend connection.");
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [user?.restaurantId]);

  const handleUpload = async (e, setter, isLogo = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isLogo) setIsUploadingLogo(true);
    else setIsUploadingHero(true);

    setSaveStatus("Uploading image...");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadImageAction(formData);
      if (result.success) {
        setter(result.url);
        setSaveStatus("Upload complete!");
        setTimeout(() => setSaveStatus(""), 2000);
      } else {
        setSaveStatus(`Upload failed: ${result.error}`);
      }
    } catch (err) {
      console.error(err);
      setSaveStatus(`Upload failed: ${err.message}`);
    } finally {
      if (isLogo) setIsUploadingLogo(false);
      else setIsUploadingHero(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!restaurantId) return;
    setSaveStatus("Saving settings...");
    try {
      const payload = {
        name,
        cuisine,
        address,
        phone,
        whatsapp,
        story,
        facilities: facilities ? facilities.split(",").map(f => f.trim()).filter(Boolean) : [],
        socialLinks,
        openNow,
        priceForTwo: Number(priceForTwo),
        timings,
        holidays,
        menuUiSettings: { ...menuUiSettings, showTabs },
      };

      // Always send these fields so they can be cleared if empty
      payload.website = website || "";
      payload.heroImage = heroImage || "";
      payload.logoImage = logoImage || "";

      await api.patch(`/api/restaurants/id/${restaurantId}`, payload);
      setSaveStatus("Saved successfully!");
      setTimeout(() => setSaveStatus("All changes synced"), 2000);
    } catch (err) {
      setSaveStatus("Failed to save settings");
    }
  };

  const handleHolidayToggle = (day) => {
    setHolidays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-primary font-bold animate-pulse">Loading settings...</div>
      </div>
    );
  }

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <div className="space-y-8 pb-16">
      <div>
        <p className="font-label-sm text-label-sm uppercase text-secondary">Restaurant OS</p>
        <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary md:font-display-lg md:text-display-lg">General Settings</h1>
      </div>

      {loadError && (
        <div className="rounded-2xl border border-error-container bg-error-container/20 p-4 text-sm text-on-error-container">
          {loadError}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8 max-w-2xl">
        
        {/* Toggle Store Status */}
        <div className="bg-white p-6 rounded-3xl border border-surface-container shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-bold text-md text-on-surface">Store Operating Status</h3>
            <p className="text-xs text-on-surface-variant">Toggle whether your storefront is open to accept orders right now.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              className="sr-only"
              checked={openNow}
              onChange={() => setOpenNow(!openNow)}
            />
            <div className={`w-14 h-8 rounded-full transition-colors duration-200 ${openNow ? "bg-primary" : "bg-surface-variant"}`}>
              <div className={`w-6 h-6 bg-white rounded-full transition-transform duration-200 mt-1 ml-1 ${openNow ? "translate-x-6" : "translate-x-0"}`}></div>
            </div>
          </label>
        </div>

        {/* Toggle Dietary Filters */}
        <div className="bg-white p-6 rounded-3xl border border-surface-container shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-bold text-md text-on-surface">Show Dietary Filters</h3>
            <p className="text-xs text-on-surface-variant">Display the "All / Veg / Non-Veg" filter tabs on the menu page.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              className="sr-only"
              checked={showTabs}
              onChange={() => setShowTabs(!showTabs)}
            />
            <div className={`w-14 h-8 rounded-full transition-colors duration-200 ${showTabs ? "bg-primary" : "bg-surface-variant"}`}>
              <div className={`w-6 h-6 bg-white rounded-full transition-transform duration-200 mt-1 ml-1 ${showTabs ? "translate-x-6" : "translate-x-0"}`}></div>
            </div>
          </label>
        </div>

        {/* Basic Info */}
        <div className="bg-white p-6 rounded-3xl border border-surface-container shadow-sm space-y-4">
          <h3 className="font-bold text-md text-on-surface flex items-center gap-2">
            <MaterialIcon name="storefront" className="text-primary" />
            Basic Profile
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-2">Restaurant Name</label>
              <input
                className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary text-body-md"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-2">Cuisines</label>
              <input
                className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary text-body-md"
                type="text"
                placeholder="Italian, Cafe, Burgers"
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-2">Story / Description</label>
            <textarea
              className="w-full p-4 rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary text-body-md custom-scrollbar"
              rows={3}
              placeholder="Tell your restaurant's story..."
              value={story}
              onChange={(e) => setStory(e.target.value)}
            />
          </div>
        </div>

        {/* Branding Images */}
        <div className="bg-white p-6 rounded-3xl border border-surface-container shadow-sm space-y-4">
          <h3 className="font-bold text-md text-on-surface flex items-center gap-2">
            <MaterialIcon name="image" className="text-primary" />
            Branding Images
          </h3>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-2">Hero Image URL</label>
            <div className="flex gap-2">
              <input
                className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary text-body-md"
                type="url"
                placeholder="https://example.com/cover.jpg"
                value={heroImage}
                onChange={(e) => setHeroImage(e.target.value)}
              />
              <button type="button" onClick={() => setShowImageLibrary(true)} className="flex items-center justify-center h-12 px-4 bg-surface-variant text-on-surface-variant rounded-xl hover:bg-surface-variant/80 transition-colors font-bold whitespace-nowrap shadow-sm border border-outline-variant" title="Choose from library">
                <MaterialIcon name="photo_library" className="text-[20px]" />
              </button>
              <label className={`flex items-center justify-center h-12 px-4 bg-primary text-on-primary rounded-xl cursor-pointer hover:bg-primary/90 transition-colors font-bold whitespace-nowrap ${isUploadingHero ? 'opacity-70 cursor-not-allowed pointer-events-none' : ''}`}>
                {isUploadingHero ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <MaterialIcon name="upload" className="mr-2" />
                )}
                {isUploadingHero ? "Uploading..." : "Upload"}
                <input type="file" className="hidden" disabled={isUploadingHero} accept="image/*" onChange={(e) => handleUpload(e, setHeroImage, false)} />
              </label>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-3">Hero Banner Layout</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'rounded', label: 'Rounded Card', desc: 'Modern card with padding' },
                { id: 'full-width', label: 'Full Cover', desc: 'Edge-to-edge immersive' },
                { id: 'square', label: 'Tall Square', desc: 'Max height for mobile' }
              ].map(layout => {
                const isActive = (menuUiSettings.heroImageLayout || 'rounded') === layout.id;
                return (
                  <div 
                    key={layout.id}
                    onClick={() => setMenuUiSettings({ ...menuUiSettings, heroImageLayout: layout.id })}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-colors text-center ${isActive ? 'border-primary bg-primary/5' : 'border-outline-variant hover:border-primary/50'}`}
                  >
                    <div className={`w-full aspect-[4/3] mb-3 rounded-xl bg-surface-container flex items-center justify-center overflow-hidden ${layout.id === 'rounded' ? 'p-3' : ''}`}>
                       <div className={`w-full bg-primary/40 ${layout.id === 'rounded' ? 'h-full rounded-lg' : layout.id === 'square' ? 'h-full aspect-square scale-110' : 'h-full scale-110'}`}></div>
                    </div>
                    <div className="font-bold text-sm text-on-surface">{layout.label}</div>
                    <div className="text-xs text-on-surface-variant leading-tight mt-1">{layout.desc}</div>
                  </div>
                )
              })}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-2">Logo Image URL</label>
            <div className="flex gap-2">
              <input
                className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary text-body-md"
                type="url"
                placeholder="https://example.com/logo.png"
                value={logoImage}
                onChange={(e) => setLogoImage(e.target.value)}
              />
              <label className={`flex items-center justify-center h-12 px-4 bg-primary text-on-primary rounded-xl cursor-pointer hover:bg-primary/90 transition-colors font-bold whitespace-nowrap ${isUploadingLogo ? 'opacity-70 cursor-not-allowed pointer-events-none' : ''}`}>
                {isUploadingLogo ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <MaterialIcon name="upload" className="mr-2" />
                )}
                {isUploadingLogo ? "Uploading..." : "Upload"}
                <input type="file" className="hidden" disabled={isUploadingLogo} accept="image/*" onChange={(e) => handleUpload(e, setLogoImage, true)} />
              </label>
            </div>
          </div>
        </div>

        {/* Contact & Location */}
        <div className="bg-white p-6 rounded-3xl border border-surface-container shadow-sm space-y-4">
          <h3 className="font-bold text-md text-on-surface flex items-center gap-2">
            <MaterialIcon name="contact_phone" className="text-primary" />
            Contact & Location
          </h3>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-2">Full Address</label>
            <textarea
              className="w-full p-4 rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary text-body-md custom-scrollbar"
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-2">Phone</label>
              <input
                className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary text-body-md"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-2">WhatsApp</label>
              <input
                className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary text-body-md"
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Facilities */}
        <div className="bg-white p-6 rounded-3xl border border-surface-container shadow-sm space-y-4">
          <h3 className="font-bold text-md text-on-surface flex items-center gap-2">
            <MaterialIcon name="local_convenience_store" className="text-primary" />
            Facilities
          </h3>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-2">Facilities (comma separated)</label>
            <input
              className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary text-body-md"
              type="text"
              placeholder="AC, Parking, Family, Delivery"
              value={facilities}
              onChange={(e) => setFacilities(e.target.value)}
            />
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white p-6 rounded-3xl border border-surface-container shadow-sm space-y-4">
          <h3 className="font-bold text-md text-on-surface flex items-center gap-2">
            <MaterialIcon name="public" className="text-primary" />
            Social Links
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-2">Website</label>
              <input
                className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary text-body-md"
                type="url"
                placeholder="https://"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-2">Instagram URL</label>
              <input
                className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary text-body-md"
                type="url"
                placeholder="https://instagram.com/..."
                value={socialLinks.instagram}
                onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-2">Facebook URL</label>
              <input
                className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary text-body-md"
                type="url"
                placeholder="https://facebook.com/..."
                value={socialLinks.facebook}
                onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-2">X (Twitter) URL</label>
              <input
                className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary text-body-md"
                type="url"
                placeholder="https://x.com/..."
                value={socialLinks.x}
                onChange={(e) => setSocialLinks({ ...socialLinks, x: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Pricing & Operating Hours */}
        <div className="bg-white p-6 rounded-3xl border border-surface-container shadow-sm space-y-4">
          <h3 className="font-bold text-md text-on-surface flex items-center gap-2">
            <MaterialIcon name="payments" className="text-primary" />
            Pricing Configurations
          </h3>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-2">Average Price for Two (INR)</label>
            <input
              className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary text-body-md"
              type="number"
              required
              value={priceForTwo}
              onChange={(e) => setPriceForTwo(e.target.value)}
            />
          </div>
        </div>

        {/* Operating Hours */}
        <div className="bg-white p-6 rounded-3xl border border-surface-container shadow-sm space-y-4">
          <h3 className="font-bold text-md text-on-surface flex items-center gap-2">
            <MaterialIcon name="schedule" className="text-primary" />
            Operating Hours
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-2">Opening Time</label>
              <input
                className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary text-body-md"
                type="text"
                placeholder="11:00 AM"
                value={timings.open}
                onChange={(e) => setTimings((prev) => ({ ...prev, open: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-2">Closing Time</label>
              <input
                className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary text-body-md"
                type="text"
                placeholder="11:00 PM"
                value={timings.close}
                onChange={(e) => setTimings((prev) => ({ ...prev, close: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Weekly Holidays */}
        <div className="bg-white p-6 rounded-3xl border border-surface-container shadow-sm space-y-4">
          <h3 className="font-bold text-md text-on-surface flex items-center gap-2">
            <MaterialIcon name="calendar_today" className="text-primary" />
            Weekly Holidays
          </h3>
          <p className="text-xs text-on-surface-variant mb-4">Select days when your restaurant is closed weekly.</p>
          <div className="flex flex-wrap gap-2">
            {daysOfWeek.map((day) => {
              const activeHoliday = holidays.includes(day.slice(0, 3));
              return (
                <button
                  type="button"
                  key={day}
                  onClick={() => handleHolidayToggle(day.slice(0, 3))}
                  className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                    activeHoliday
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-outline-variant bg-white text-on-surface-variant hover:border-outline"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Save Controls */}
        <section className="bg-white rounded-3xl p-6 shadow-[0px_10px_30px_rgba(0,0,0,0.04)] border border-surface-container flex items-center justify-between gap-4">
          <span className="text-sm font-semibold text-primary">{saveStatus}</span>
          <button
            type="submit"
            className="px-8 h-12 rounded-full bg-primary text-white font-semibold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-95 cursor-pointer border-none outline-none"
          >
            <MaterialIcon name="save" className="text-white" />
            Save Configurations
          </button>
        </section>
      </form>

      {/* Image Library Modal */}
      {showImageLibrary && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowImageLibrary(false)}></div>
          <div className="relative bg-surface-container-lowest w-full max-w-4xl max-h-[90vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-reveal">
            
            {/* Header */}
            <div className="p-6 border-b border-surface-container flex items-center justify-between bg-white z-10 shrink-0">
              <h2 className="text-2xl font-bold text-on-surface flex items-center gap-2">
                <MaterialIcon name="photo_library" className="text-primary" />
                Image Library
              </h2>
              <button 
                onClick={() => setShowImageLibrary(false)}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-variant/50 transition-colors text-on-surface-variant"
              >
                <MaterialIcon name="close" className="text-2xl" />
              </button>
            </div>

            {/* Filters */}
            <div className="p-6 border-b border-surface-container bg-surface-container-lowest/50 shrink-0">
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                  <MaterialIcon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]" />
                  <input 
                    type="text" 
                    placeholder="Search e.g. idli, burger, fine dining..." 
                    className="w-full h-12 pl-12 pr-4 bg-white border border-outline-variant rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm font-body-md"
                    value={imageSearchQuery}
                    onChange={(e) => setImageSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar hide-scrollbar">
                {['All', 'Indian', 'Fast Food', 'Restaurant', 'Cafe', 'Abstract'].map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setActiveImageCategory(cat)}
                    className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-colors border ${activeImageCategory === cat ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white text-on-surface border-outline-variant hover:bg-surface-container-low'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Image Grid */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-surface-container-lowest">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {IMAGE_LIBRARY.filter(img => {
                  const matchCat = activeImageCategory === 'All' || img.category === activeImageCategory;
                  const matchSearch = !imageSearchQuery || img.tags.toLowerCase().includes(imageSearchQuery.toLowerCase());
                  return matchCat && matchSearch;
                }).map(img => (
                  <div 
                    key={img.id} 
                    className="relative group rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer shadow-sm border border-outline-variant/30 hover:shadow-lg transition-all"
                    onClick={() => {
                      setHeroImage(img.url);
                      setShowImageLibrary(false);
                    }}
                  >
                    <img src={img.url} alt={img.tags} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <div className="bg-white text-on-surface px-4 py-2 rounded-full font-bold text-sm transform scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all shadow-lg flex items-center gap-2">
                        <MaterialIcon name="check_circle" className="text-primary text-[18px]" />
                        Select
                      </div>
                    </div>
                  </div>
                ))}
                
                {IMAGE_LIBRARY.filter(img => {
                  const matchCat = activeImageCategory === 'All' || img.category === activeImageCategory;
                  const matchSearch = !imageSearchQuery || img.tags.toLowerCase().includes(imageSearchQuery.toLowerCase());
                  return matchCat && matchSearch;
                }).length === 0 && (
                  <div className="col-span-full py-16 flex flex-col items-center justify-center text-on-surface-variant">
                    <MaterialIcon name="search_off" className="text-5xl mb-4 opacity-50" />
                    <p className="font-bold">No images found for "{imageSearchQuery}"</p>
                    <p className="text-sm mt-1">Try a different category or keyword.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
