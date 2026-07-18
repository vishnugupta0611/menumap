"use client";

import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";
import MaterialIcon from "@/components/stitch/MaterialIcon";
import { uploadImageAction } from "@/app/actions/upload";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

import GlobalImageLibrary from "@/components/modals/GlobalImageLibrary";

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  
  // Tabs
  const [activeTab, setActiveTab] = useState("settings");
  
  // General State
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [restaurantId, setRestaurantId] = useState("");
  const [restaurant, setRestaurant] = useState(null);
  const [iframeKey, setIframeKey] = useState(0);
  
  // Fields
  const [openNow, setOpenNow] = useState(true);
  const [priceForTwo, setPriceForTwo] = useState(500);
  const [timings, setTimings] = useState({ open: "11:00 AM", close: "11:00 PM" });
  const [holidays, setHolidays] = useState([]);
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

  const [saveStatus, setSaveStatus] = useState("All changes synced");
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Image Upload State
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [imageTarget, setImageTarget] = useState(""); // "hero" or "logo"
  const [showImageLibrary, setShowImageLibrary] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Gallery State
  const [featuredGalleryUrls, setFeaturedGalleryUrls] = useState([]);
  const [showGalleryLibrary, setShowGalleryLibrary] = useState(false);

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

          let urls = rest?.menuUiSettings?.featuredGalleryIds || [];
          const isOldFormat = urls.some(u => u && !u.startsWith('http'));
          if (isOldFormat) {
             try {
                const galRes = await api.get(`/api/restaurants/id/${user.restaurantId}/gallery`);
                const pool = galRes.data.data || [];
                urls = urls.map(id => {
                   if (id.startsWith('http')) return id;
                   const found = pool.find(g => g._id === id);
                   return found ? found.url : id;
                }).filter(u => u && u.startsWith('http'));
             } catch(e){}
          }
          setFeaturedGalleryUrls(urls);
        }
      } catch (err) {
        setLoadError("Could not load settings. Check backend connection.");
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [user?.restaurantId]);

  const handleUploadClick = () => {
    setShowImageOptions(false);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setSaveStatus("Uploading image...");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadImageAction(formData);
      if (result.success) {
        if (imageTarget === "hero") setHeroImage(result.url);
        if (imageTarget === "logo") setLogoImage(result.url);
        setSaveStatus("Upload complete!");
        setTimeout(() => setSaveStatus("All changes synced"), 2000);
      } else {
        setSaveStatus(`Upload failed: ${result.error}`);
      }
    } catch (err) {
      console.error(err);
      setSaveStatus(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
      e.target.value = ""; // Reset input
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm("WARNING: This action is permanent. This will delete your restaurant, all menu items, all employee accounts, and your owner account. Are you absolutely sure?");
    if (!confirmDelete) return;

    setIsDeleting(true);
    setDeleteError("");
    try {
      await api.delete("/api/auth/me");
      await logout();
      router.push("/");
    } catch (err) {
      setDeleteError(err.response?.data?.error || "Failed to delete account");
      setIsDeleting(false);
    }
  };

  const getMaxCount = (style) => {
    if (style === "unlimited") return null;
    if (style === "aesthetic") return 5;
    if (style === "decent") return 4;
    return 3; // simple
  };

  const handleGalleryStyleChange = (newStyle) => {
    setMenuUiSettings({ ...menuUiSettings, galleryLayout: newStyle });
    const maxCount = getMaxCount(newStyle);
    if (maxCount && featuredGalleryUrls.length > maxCount) {
       setFeaturedGalleryUrls(featuredGalleryUrls.slice(0, maxCount));
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
        menuUiSettings: { ...menuUiSettings, featuredGalleryIds: featuredGalleryUrls },
      };

      payload.website = website || "";
      payload.heroImage = heroImage || "";
      payload.logoImage = logoImage || "";

      await api.patch(`/api/restaurants/id/${restaurantId}`, payload);
      setSaveStatus("Saved successfully!");
      setIframeKey(prev => prev + 1);
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
    <div className="space-y-6 pb-16 relative">
      {/* Header & Tabs */}
      <div className="flex flex-col gap-4">
        <div>
          <p className="font-label-sm text-label-sm uppercase text-secondary">Restaurant OS</p>
          <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary md:font-display-lg md:text-display-lg">General Settings</h1>
        </div>
        
        {/* Custom Tab Switcher */}
        <div className="flex bg-surface-container-low p-1.5 rounded-full w-max border border-outline-variant/30">
          <button 
            onClick={() => setActiveTab("settings")}
            className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 ${activeTab === "settings" ? "bg-white text-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
          >
            Settings
          </button>
          <button 
            onClick={() => setActiveTab("preview")}
            className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 ${activeTab === "preview" ? "bg-white text-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
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

      {/* Hidden File Input for Uploading */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileUpload} 
      />

      {/* Main Content Area */}
      <div className={activeTab === "settings" ? "block" : "hidden"}>
        <form onSubmit={handleSave} className="space-y-8 max-w-2xl">
          
          {/* 1. Profile Style Banner Editor */}
          <div className="bg-white p-6 rounded-3xl border border-surface-container shadow-[0_8px_30px_rgb(0,0,0,0.08)] space-y-6">
            <h3 className="font-bold text-md text-on-surface flex items-center gap-2">
              <MaterialIcon name="branding_watermark" className="text-primary" />
              Brand Identity
            </h3>
            
            {/* The Visual Editor */}
            <div className="w-full relative mt-4 pb-12">
               {/* Background (Hero) */}
               <div 
                 onClick={() => { setImageTarget("hero"); setShowImageOptions(true); }}
                 className="w-full aspect-[21/9] sm:aspect-[3/1] bg-surface-container rounded-[24px] border-2 border-dashed border-outline-variant hover:border-primary/50 cursor-pointer overflow-hidden relative group transition-all"
               >
                 {heroImage ? (
                   <img src={heroImage} alt="Hero Banner" className="w-full h-full object-cover group-hover:brightness-75 transition-all" />
                 ) : (
                   <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant/50">
                     <MaterialIcon name="wallpaper" className="text-4xl mb-2 opacity-50" />
                     <span className="text-xs font-bold">Add Cover Photo</span>
                   </div>
                 )}
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <span className="text-white font-bold bg-black/50 px-4 py-2 rounded-full text-sm flex items-center gap-2 shadow-lg">
                     <MaterialIcon name="edit" className="text-[16px]" /> Edit Cover
                   </span>
                 </div>
               </div>
               
               {/* Logo */}
               <div 
                 onClick={() => { setImageTarget("logo"); setShowImageOptions(true); }}
                 className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-24 sm:w-28 sm:h-28 bg-surface-container-lowest rounded-full border-4 border-white shadow-lg overflow-hidden cursor-pointer group z-10 hover:scale-105 transition-transform flex items-center justify-center"
               >
                 {logoImage ? (
                   <img src={logoImage} alt="Logo" className="w-full h-full object-cover group-hover:brightness-75 transition-all" />
                 ) : (
                   <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant/50 bg-surface-variant">
                     <MaterialIcon name="storefront" className="text-3xl mb-1 opacity-50" />
                     <span className="text-[10px] font-bold">Logo</span>
                   </div>
                 )}
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <MaterialIcon name="edit" className="text-white text-2xl drop-shadow-md" />
                 </div>
               </div>
            </div>

            {/* Hero Layout Selection */}
            <div className="pt-6 mt-6 border-t border-surface-container">
              <label className="block text-sm font-bold text-on-surface mb-1">Cover Photo Style</label>
              <p className="text-xs text-on-surface-variant mb-4">Choose how your banner looks on your public profile</p>
              
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                {[
                  { id: 'rounded', label: 'Rounded', desc: 'Modern card' },
                  { id: 'full-width', label: 'Full Width', desc: 'Edge to edge' },
                  { id: 'square', label: 'Square', desc: 'Tall banner' }
                ].map(layout => {
                  const isActive = (menuUiSettings.heroImageLayout || 'rounded') === layout.id;
                  return (
                    <div 
                      key={layout.id}
                      onClick={() => setMenuUiSettings({ ...menuUiSettings, heroImageLayout: layout.id })}
                      className={`p-2 sm:p-3 rounded-[20px] border-2 cursor-pointer transition-all text-center group ${isActive ? 'border-primary bg-primary/5' : 'border-outline-variant hover:border-primary/30'}`}
                    >
                      <div className={`w-full aspect-[4/5] mb-2 sm:mb-3 rounded-[12px] bg-white border shadow-sm flex flex-col overflow-hidden relative transition-all ${isActive ? 'border-primary/30 shadow-primary/10' : 'border-outline-variant/30'}`}>
                         {/* Mock Browser/App Header */}
                         <div className="w-full h-3 sm:h-4 bg-surface-container-lowest border-b border-outline-variant/20 flex items-center px-1.5 gap-1 shrink-0">
                           <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-outline-variant/40"></div>
                           <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-outline-variant/40"></div>
                         </div>
                         
                         {/* Layout Content */}
                         <div className={`flex-1 w-full flex flex-col relative bg-surface-container-lowest ${layout.id === 'rounded' ? 'p-1.5 sm:p-2' : ''}`}>
                            <div className={`w-full bg-primary/60 transition-all relative flex flex-col overflow-hidden ${
                               layout.id === 'rounded' ? 'h-[50%] rounded-md sm:rounded-lg justify-end p-2' : 
                               layout.id === 'square' ? 'h-[75%] justify-end p-2 sm:p-3' : 'h-[100%] justify-center items-center p-2 sm:p-3'
                            }`}>
                               {/* Gradient overlay simulation */}
                               <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
                               
                               {/* Mock Text Lines (Inside Image) */}
                               <div className={`w-full flex flex-col relative z-10 gap-1 sm:gap-1.5 ${layout.id === 'full-width' ? 'items-center' : 'items-start'}`}>
                                  <div className={`w-14 sm:w-20 h-1 sm:h-1.5 rounded-full bg-white ${layout.id === 'full-width' ? 'h-1.5 sm:h-2 w-20 sm:w-24 mb-1' : ''}`}></div>
                                  <div className="w-10 sm:w-14 h-1 sm:h-1.5 rounded-full bg-white/70"></div>
                                  
                                  {/* Mock Search Bar for Full-width */}
                                  {layout.id === 'full-width' && (
                                     <div className="w-[90%] h-3 sm:h-4 mt-2 bg-white/90 rounded-full shadow-sm"></div>
                                  )}
                               </div>
                            </div>
                         </div>
                      </div>
                      <div className={`font-bold text-[11px] sm:text-xs leading-tight ${isActive ? 'text-primary' : 'text-on-surface'}`}>{layout.label}</div>
                      <div className="text-[9px] sm:text-[10px] text-on-surface-variant leading-tight mt-0.5 sm:mt-1">{layout.desc}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Toggle Store Status */}
          <div className="bg-white p-6 rounded-3xl border border-surface-container shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex items-center justify-between">
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

          {/* Basic Info */}
          <div className="bg-white p-6 rounded-3xl border border-surface-container shadow-[0_8px_30px_rgb(0,0,0,0.08)] space-y-4">
            <h3 className="font-bold text-md text-on-surface flex items-center gap-2">
              <MaterialIcon name="info" className="text-primary" />
              Basic Profile Details
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

          {/* Contact & Location */}
          <div className="bg-white p-6 rounded-3xl border border-surface-container shadow-[0_8px_30px_rgb(0,0,0,0.08)] space-y-4">
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
          <div className="bg-white p-6 rounded-3xl border border-surface-container shadow-[0_8px_30px_rgb(0,0,0,0.08)] space-y-4">
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
          <div className="bg-white p-6 rounded-3xl border border-surface-container shadow-[0_8px_30px_rgb(0,0,0,0.08)] space-y-4">
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
          <div className="bg-white p-6 rounded-3xl border border-surface-container shadow-[0_8px_30px_rgb(0,0,0,0.08)] space-y-4">
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
          <div className="bg-white p-6 rounded-3xl border border-surface-container shadow-[0_8px_30px_rgb(0,0,0,0.08)] space-y-4">
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

          {/* Gallery Configuration */}
          <div className="bg-white p-6 rounded-3xl border border-surface-container shadow-[0_8px_30px_rgb(0,0,0,0.08)] space-y-6">
            <h3 className="font-bold text-md text-on-surface flex items-center gap-2">
              <MaterialIcon name="collections" className="text-primary" />
              Gallery Configuration
            </h3>
            
            {/* Gallery Layout Selection */}
            <div>
              <label className="block text-sm font-bold text-on-surface mb-1">Gallery Style</label>
              <p className="text-xs text-on-surface-variant mb-4">Choose how your gallery looks on the public profile</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {[
                  { id: 'unlimited', label: 'Marquee', desc: 'Auto-scrolling' },
                  { id: 'aesthetic', label: 'Aesthetic', desc: 'Max 5 images' },
                  { id: 'decent', label: 'Grid', desc: 'Max 4 images' },
                  { id: 'simple', label: 'Polaroid', desc: 'Max 3 images' }
                ].map(layout => {
                  const isActive = (menuUiSettings.galleryLayout || 'unlimited') === layout.id;
                  return (
                    <div 
                      key={layout.id}
                      onClick={() => handleGalleryStyleChange(layout.id)}
                      className={`p-2 sm:p-3 rounded-[20px] border-2 cursor-pointer transition-all text-center group ${isActive ? 'border-primary bg-primary/5' : 'border-outline-variant hover:border-primary/30'}`}
                    >
                      <div className={`w-full aspect-square mb-2 sm:mb-3 rounded-[12px] bg-white border shadow-sm flex flex-col items-center justify-center overflow-hidden relative transition-all p-2 ${isActive ? 'border-primary/30 shadow-primary/10' : 'border-outline-variant/30'}`}>
                         
                         {layout.id === 'unlimited' && (
                           <div className="flex gap-1 overflow-hidden w-full whitespace-nowrap">
                             <div className="w-[60%] h-10 bg-primary/40 rounded-md shrink-0"></div>
                             <div className="w-[60%] h-10 bg-primary/40 rounded-md shrink-0"></div>
                           </div>
                         )}

                         {layout.id === 'aesthetic' && (
                           <div className="grid grid-cols-2 gap-1 w-full h-full">
                             <div className="bg-primary/40 rounded-md h-full row-span-2"></div>
                             <div className="bg-primary/40 rounded-md"></div>
                             <div className="bg-primary/40 rounded-md"></div>
                           </div>
                         )}

                         {layout.id === 'decent' && (
                           <div className="grid grid-cols-2 gap-1 w-full h-full">
                             <div className="bg-primary/40 rounded-md"></div>
                             <div className="bg-primary/40 rounded-md"></div>
                             <div className="bg-primary/40 rounded-md"></div>
                             <div className="bg-primary/40 rounded-md"></div>
                           </div>
                         )}

                         {layout.id === 'simple' && (
                           <div className="relative w-full h-full flex items-center justify-center">
                             <div className="absolute w-8 h-10 bg-white border border-outline-variant/50 p-1 pb-2 rotate-[-15deg] shadow-sm -ml-4"><div className="w-full h-full bg-primary/40"></div></div>
                             <div className="absolute w-8 h-10 bg-white border border-outline-variant/50 p-1 pb-2 rotate-[15deg] shadow-sm ml-4"><div className="w-full h-full bg-primary/40"></div></div>
                             <div className="absolute w-10 h-12 bg-white border border-outline-variant/50 p-1 pb-3 shadow-md z-10"><div className="w-full h-full bg-primary/40"></div></div>
                           </div>
                         )}

                      </div>
                      <div className={`font-bold text-[11px] sm:text-xs leading-tight ${isActive ? 'text-primary' : 'text-on-surface'}`}>{layout.label}</div>
                      <div className="text-[9px] sm:text-[10px] text-on-surface-variant leading-tight mt-0.5 sm:mt-1">{layout.desc}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Selected Images Section */}
            <div className="pt-4 border-t border-surface-container">
               <label className="block text-sm font-bold text-on-surface mb-3 flex items-center gap-2">
                 Selected Images 
                 <span className="text-xs font-normal text-on-surface-variant bg-surface-variant/30 px-2 py-0.5 rounded-full">
                   {featuredGalleryUrls.length} {getMaxCount(menuUiSettings.galleryLayout || 'unlimited') ? `/ ${getMaxCount(menuUiSettings.galleryLayout || 'unlimited')}` : ''}
                 </span>
               </label>
               <div className="flex flex-wrap gap-3 mb-4">
                 {featuredGalleryUrls.map((url, i) => (
                    <img key={i} src={url} className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl shadow-sm border border-outline-variant/20" alt={`Gallery ${i}`} />
                 ))}
                 {featuredGalleryUrls.length === 0 && (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-surface-variant flex items-center justify-center text-on-surface-variant shadow-inner border border-outline-variant/20">
                       <MaterialIcon name="image" className="text-2xl opacity-50" />
                    </div>
                 )}
               </div>
               <button 
                 type="button"
                 onClick={() => setShowGalleryLibrary(true)} 
                 className="h-10 px-6 bg-surface-container hover:bg-surface-variant text-on-surface font-bold rounded-full transition-colors flex items-center gap-2 border border-outline-variant shadow-sm hover:shadow-md"
               >
                 <MaterialIcon name="photo_library" className="text-[18px]" />
                 Manage Gallery
               </button>
            </div>
          </div>

          {/* Weekly Holidays */}
          <div className="bg-white p-6 rounded-3xl border border-surface-container shadow-[0_8px_30px_rgb(0,0,0,0.08)] space-y-4">
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
          <section className="bg-white rounded-full p-2 pl-5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-surface-container flex items-center justify-between gap-3 sticky bottom-6 sm:bottom-10 z-20 w-full sm:w-max sm:ml-auto">
            <span className="text-xs sm:text-sm font-bold text-primary truncate">{saveStatus}</span>
            <button
              type="submit"
              className="px-5 h-10 rounded-full bg-primary text-white text-xs sm:text-sm font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-1.5 transition-all hover:brightness-110 active:scale-95 cursor-pointer border-none outline-none shrink-0"
            >
              <MaterialIcon name="save" className="text-white text-[18px]" />
              <span className="hidden sm:inline">Save Configurations</span>
              <span className="inline sm:hidden">Save</span>
            </button>
          </section>
        </form>

        {/* Danger Zone */}
        <div className="bg-error/5 p-6 rounded-3xl border border-error/20 space-y-4 mt-8 max-w-2xl">
          <h3 className="font-bold text-md text-error flex items-center gap-2">
            <MaterialIcon name="warning" className="text-error" />
            Danger Zone
          </h3>
          <p className="text-sm text-on-surface-variant max-w-xl">
            Deleting your account will permanently wipe your restaurant, all menu items, and all associated employee accounts from MenuMap. This action cannot be undone.
          </p>
          {deleteError && <p className="text-sm text-error font-bold">{deleteError}</p>}
          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="px-6 py-3 rounded-full bg-error text-white font-bold text-sm shadow-sm transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 cursor-pointer border-none outline-none"
          >
            {isDeleting ? "Deleting..." : "Permanently Delete Account"}
          </button>
        </div>
      </div>

      {/* Preview Content Area */}
      <div className={activeTab === "preview" ? "block w-full max-w-4xl" : "hidden"}>
        {restaurant ? (
          <div className="w-full h-max max-w-full overflow-hidden flex flex-col items-center pt-4">
            <div className="flex items-center justify-between mb-4 px-2 w-full max-w-[320px]">
              <div>
                <h3 className="font-bold text-on-surface">Live Preview</h3>
                <p className="text-xs text-on-surface-variant">See how your changes look</p>
              </div>
              <button 
                onClick={() => setIframeKey(prev => prev + 1)}
                className="flex items-center gap-1 text-xs font-bold bg-primary/10 text-primary px-3 py-1.5 rounded-full hover:bg-primary hover:text-white transition-colors border-none outline-none cursor-pointer shrink-0"
              >
                <MaterialIcon name="refresh" className="text-[14px]" /> Refresh
              </button>
            </div>
            
            <div className="w-[320px] h-[600px] border-[4px] border-black rounded-[40px] overflow-hidden shadow-2xl relative bg-background flex flex-col">
               <iframe 
                 key={iframeKey}
                 src={`/${(restaurant.city || '').toLowerCase().replace(/\s+/g, '-')}/${restaurant.slug || ''}`} 
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
        ) : (
          <div className="p-8 text-center text-on-surface-variant">Loading preview...</div>
        )}
      </div>

      {/* Bottom Sheet Modal for Image Options */}
      {showImageOptions && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center bg-black/40 backdrop-blur-sm transition-opacity">
          <div 
             className="absolute inset-0" 
             onClick={() => setShowImageOptions(false)}
          ></div>
          <div className="bg-surface-container-lowest w-full sm:w-[400px] rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl transform transition-transform z-10 animate-fadeInUp">
            <div className="w-12 h-1.5 bg-outline-variant/50 rounded-full mx-auto mb-6 sm:hidden"></div>
            <h3 className="font-bold text-xl text-on-surface mb-6 text-center">Update {imageTarget === 'hero' ? 'Cover Photo' : 'Logo'}</h3>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => { setShowImageOptions(false); setShowImageLibrary(true); }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-surface-container hover:bg-surface-variant transition-colors text-left border-none outline-none cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <MaterialIcon name="photo_library" />
                </div>
                <div>
                  <div className="font-bold text-on-surface">Select from Gallery</div>
                  <div className="text-xs text-on-surface-variant mt-0.5">Choose from your uploaded images</div>
                </div>
              </button>

              <button 
                onClick={handleUploadClick}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-surface-container hover:bg-surface-variant transition-colors text-left border-none outline-none cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  {isUploading ? (
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <MaterialIcon name="upload" />
                  )}
                </div>
                <div>
                  <div className="font-bold text-on-surface">{isUploading ? "Uploading..." : "Upload New Image"}</div>
                  <div className="text-xs text-on-surface-variant mt-0.5">Upload a file from your device</div>
                </div>
              </button>
            </div>
            
            <button 
              onClick={() => setShowImageOptions(false)}
              className="w-full mt-6 py-3 rounded-full font-bold text-on-surface hover:bg-surface-container transition-colors border-none outline-none cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Global Image Library */}
      <GlobalImageLibrary 
        isOpen={showImageLibrary}
        onClose={() => setShowImageLibrary(false)}
        onSelectImage={(url) => {
          if (imageTarget === "hero") setHeroImage(url);
          if (imageTarget === "logo") setLogoImage(url);
          setShowImageLibrary(false);
        }}
        multiSelect={false}
      />

      {/* Global Image Library (Multi Select for Gallery) */}
      <GlobalImageLibrary 
        isOpen={showGalleryLibrary} 
        onClose={() => setShowGalleryLibrary(false)}
        onSelectImages={(urls) => {
          setFeaturedGalleryUrls(urls);
          setShowGalleryLibrary(false);
        }}
        multiSelect={true}
        maxSelection={getMaxCount(menuUiSettings.galleryLayout || 'unlimited')}
        initialSelection={featuredGalleryUrls}
      />
    </div>
  );
}
