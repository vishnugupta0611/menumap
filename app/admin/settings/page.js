"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import MaterialIcon from "@/components/stitch/MaterialIcon";
import { uploadImageAction } from "@/app/actions/upload";
import { useAuth } from "@/contexts/AuthContext";

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

  const handleUpload = async (e, setter) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

      if (website && website.trim() !== "") payload.website = website;
      if (heroImage && heroImage.trim() !== "") payload.heroImage = heroImage;
      if (logoImage && logoImage.trim() !== "") payload.logoImage = logoImage;

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
              <label className="flex items-center justify-center h-12 px-4 bg-primary text-on-primary rounded-xl cursor-pointer hover:bg-primary/90 transition-colors font-bold whitespace-nowrap">
                <MaterialIcon name="upload" className="mr-2" />
                Upload
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, setHeroImage)} />
              </label>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-2">Hero Image Shape/Layout</label>
            <select
              className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary text-body-md"
              value={menuUiSettings.heroImageLayout || "rounded"}
              onChange={(e) => setMenuUiSettings({ ...menuUiSettings, heroImageLayout: e.target.value })}
            >
              <option value="rounded">Rounded Card (Default)</option>
              <option value="full-width">Full Width Cover</option>
              <option value="square">Full Width Square</option>
            </select>
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
              <label className="flex items-center justify-center h-12 px-4 bg-primary text-on-primary rounded-xl cursor-pointer hover:bg-primary/90 transition-colors font-bold whitespace-nowrap">
                <MaterialIcon name="upload" className="mr-2" />
                Upload
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, setLogoImage)} />
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
    </div>
  );
}
