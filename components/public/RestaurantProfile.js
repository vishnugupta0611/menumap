"use client";

import { useState } from "react";
import Link from "next/link";
import MaterialIcon from "@/components/stitch/MaterialIcon";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { QR_CHARACTERS } from "@/lib/qrCharacters";

export default function RestaurantProfile({ restaurant, menu, reviews = [], gallery = [] }) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const isOwner = user?.role === "owner";

  const qrCharacterId = restaurant?.menuUiSettings?.qrCharacter || "img1";
  const activeQrConfig = QR_CHARACTERS[qrCharacterId] || QR_CHARACTERS["img1"];

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please login to submit a review.");
      return;
    }
    if (rating < 1 || !reviewText.trim()) return;

    setSubmittingReview(true);
    try {
      await api.post(`/api/restaurants/${restaurant.city}/${restaurant.slug}/reviews`, {
        name: user.name || "Guest",
        rating,
        text: reviewText,
      });
      setReviewSuccess(true);
      setReviewText("");
      setRating(5);
      setTimeout(() => setReviewSuccess(false), 3000);
      window.location.reload();
    } catch (err) {
      alert("Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleQrClick = async () => {
    // If the permanent Cloudinary QR URL is already available, use it instantly!
    if (restaurant?.qrCodeUrl) {
      setQrDataUrl(restaurant.qrCodeUrl);
      setShowQrModal(true);
      return;
    }

    // Fallback: If not generated yet but fetched this session
    if (qrDataUrl) {
      setShowQrModal(true);
      return;
    }

    // Legacy dynamic generation fallback (will be hit if owner hasn't clicked Generate yet)
    setLoadingQr(true);
    try {
      const res = await api.get(`/api/qr/restaurants/${restaurant._id}`);
      setQrDataUrl(res.data.data.dataUrl);
      setShowQrModal(true);
    } catch (err) {
      console.error(err);
      alert("Failed to load QR code.");
    } finally {
      setLoadingQr(false);
    }
  };

  const menuPath = `/${restaurant.city}/${restaurant.slug}/menu`;
  const validFacilities = (restaurant.facilities || []).filter((facility) => {
    return typeof facility === "string" && facility.trim().length > 0;
  });
  const featuredItems = [...menu]
    .filter((item) => item && item.name && item.price !== undefined)
    .sort((a, b) => Number(Boolean(b.popular)) - Number(Boolean(a.popular)))
    .slice(0, 4);
  const heroLayout = restaurant.menuUiSettings?.heroImageLayout || "rounded";
  const galleryStyle = restaurant?.menuUiSettings?.galleryLayout || "unlimited";
  
  // Calculate displayGallery based on explicit featuredGalleryIds or fallback to pool slice
  const featuredIds = restaurant?.menuUiSettings?.featuredGalleryIds || [];
  let displayGallery = [];
  if (featuredIds.length > 0) {
    displayGallery = featuredIds
      .map(id => {
         if (id && id.startsWith('http')) return { url: id, alt: 'Gallery Image' };
         return gallery.find(g => g._id === id);
      })
      .filter(Boolean);
  }
  
  if (displayGallery.length === 0) {
    if (galleryStyle === "aesthetic") displayGallery = gallery.slice(0, 5);
    else if (galleryStyle === "decent") displayGallery = gallery.slice(0, 4);
    else if (galleryStyle === "simple") displayGallery = gallery.slice(0, 3);
    else displayGallery = gallery.slice(0, 10);
  }

  const formatTime = (t) => {
    if (!t) return null;
    return t.get ? t.get("open") : t;
  };

  const mapFacilityIcon = (facility) => {
    const name = facility.toLowerCase();
    if (name.includes("ac") || name.includes("air condition")) return "ac_unit";
    if (name.includes("park") || name.includes("valet")) return "local_parking";
    if (name.includes("family") || name.includes("kid")) return "family_restroom";
    if (name.includes("outdoor") || name.includes("deck") || name.includes("patio")) return "deck";
    if (name.includes("music") || name.includes("live")) return "music_note";
    if (name.includes("card") || name.includes("payment")) return "credit_card";
    if (name.includes("wifi") || name.includes("internet")) return "wifi";
    if (name.includes("deliver") || name.includes("takeaway")) return "delivery_dining";
    if (name.includes("drink") || name.includes("bar") || name.includes("alcohol")) return "local_bar";
    return "check_circle";
  };

  const getSocialLinks = () => {
    const links = [];
    const addLink = (key, label, icon, tone = "text-primary") => {
      const href = key === "website" ? restaurant.website : restaurant.socialLinks?.[key];
      if (typeof href === "string" && href.trim()) {
        links.push({ href: href.trim(), label, icon, tone });
      }
    };

    addLink("website", "Website", "language");
    addLink("instagram", "Instagram", "photo_camera", "text-pink-600");
    addLink("facebook", "Facebook", "thumb_up", "text-blue-600");
    addLink("x", "X", "alternate_email", "text-on-surface");

    return links;
  };

  const socialLinks = getSocialLinks();

  return (
    <>
      {/* Hero Section */}
      {restaurant.heroImage && (
        <section className={heroLayout === "rounded" ? "mb-8 max-w-4xl mx-auto px-margin-mobile pt-4" : "mb-8 w-full"}>
          <div className={`relative w-full overflow-hidden group ${
            heroLayout === "rounded" 
              ? "h-64 md:h-80 rounded-[32px] border border-surface-container shadow-sm" 
              : heroLayout === "square"
                ? "h-72 md:h-96"
                : "h-[calc(100vh-65px)]"
          }`}>
            <img
              src={restaurant.heroImage}
              alt={`${restaurant.name} in ${restaurant.city} - Restaurant Cover`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className={`absolute inset-0 ${heroLayout === "full-width" ? "bg-black/60" : "bg-gradient-to-t from-black/80 via-black/20 to-transparent"}`} />
            <div className={`absolute inset-0 flex flex-col text-white ${
              heroLayout === "full-width"
                ? "justify-center items-center text-center px-margin-mobile"
                : `justify-end pb-6 md:pb-8 ${heroLayout === "rounded" ? "px-6 md:px-8" : "w-full max-w-4xl mx-auto px-margin-mobile"}`
            }`}>
              <h1 className={`font-display-lg font-bold mb-2 leading-tight ${heroLayout === "full-width" ? "text-5xl md:text-7xl mb-4" : "text-4xl md:text-5xl"}`}>
                {restaurant.name}
              </h1>
              {restaurant.cuisine && (
                <p className={`font-body-md text-white/90 text-sm md:text-base mb-3 flex items-center gap-2 ${heroLayout === "full-width" ? "justify-center md:text-xl mb-6" : ""}`}>
                  <MaterialIcon name="restaurant" className="text-[18px]" />
                  {restaurant.cuisine}
                </p>
              )}
              <div className={`flex flex-nowrap gap-2 sm:gap-3 items-center overflow-x-auto hide-scrollbar w-full ${heroLayout === "full-width" ? "justify-center mb-10" : ""}`}>
                <span
                  className={`shrink-0 px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs font-bold tracking-wide uppercase rounded-full border ${
                    restaurant.openNow
                      ? "bg-green-500/20 text-green-300 border-green-500/30"
                      : "bg-red-500/20 text-red-300 border-red-500/30"
                  }`}
                >
                  {restaurant.openNow ? "Open Now" : "Closed"}
                </span>
                
                <button
                  onClick={handleQrClick}
                  disabled={loadingQr}
                  className="shrink-0 flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs font-bold tracking-wide uppercase rounded-full border border-white/30 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors cursor-pointer"
                >
                  {loadingQr ? (
                    <div className="w-3 h-3 border-2 border-white/60 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <MaterialIcon name="qr_code_2" className="text-[14px]" />
                  )}
                  View QR
                </button>

                {restaurant.priceForTwo && (
                  <span className="shrink-0 px-2 sm:px-2.5 py-1 text-[9px] sm:text-[11px] font-bold rounded-md bg-white/10 text-white/85 flex items-center gap-1">
                    ₹{restaurant.priceForTwo} for two
                  </span>
                )}
              </div>

              {heroLayout === "full-width" && (
                <div className="w-full max-w-3xl text-black">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative group flex-1">
                      <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[24px]">
                        search
                      </span>
                      <input
                        className="w-full pl-14 pr-6 py-4 sm:py-5 bg-white/95 backdrop-blur-md border-none focus:outline-none focus:ring-4 focus:ring-primary/50 transition-all font-body-lg text-[16px] sm:text-[18px] rounded-full shadow-2xl"
                        placeholder="Search the menu..."
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Link
                      href={menuPath}
                      className="h-14 sm:h-auto sm:py-0 py-4 px-8 bg-primary text-white font-bold rounded-full flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-xl shrink-0"
                    >
                      <MaterialIcon name="restaurant_menu" className="text-[20px]" />
                      Open Menu
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Search Bar & Actions */}
      {heroLayout !== "full-width" && (
        <div className={`px-margin-mobile mb-12 max-w-4xl mx-auto ${!restaurant.heroImage ? 'mt-6 md:mt-10' : ''}`}>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative group flex-1">
              <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[22px] group-focus-within:text-primary transition-colors">
                search
              </span>
              <input
                className="w-full pl-12 pr-4 h-14 bg-surface-container-lowest border border-outline-variant/50 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-body-lg text-[16px] rounded-2xl shadow-sm placeholder:text-on-surface-variant/50"
                placeholder="Search the menu..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Link
              href={menuPath}
              className="h-14 px-8 bg-primary text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-md shrink-0"
            >
              <MaterialIcon name="restaurant_menu" className="text-[20px]" />
              Open Menu
            </Link>
          </div>
        </div>
      )}

      {/* Story / About Us */}
      {restaurant.story && (
        <section className="px-margin-mobile mb-16 max-w-4xl mx-auto">
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold mb-6">Our story</h2>
          <div className="bg-surface-container-lowest p-6 md:p-7 rounded-2xl border border-surface-container">
            <p className="text-on-surface-variant font-body-md leading-relaxed">
              {restaurant.story}
            </p>
          </div>
        </section>
      )}

      {/* Menu Preview Section */}
      {menu.length === 0 && (
        <section className="px-margin-mobile mb-16 max-w-4xl mx-auto">
          <div className="py-12 md:py-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
              <MaterialIcon name="restaurant_menu" className="text-3xl" />
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-2">Oops! No items found</h3>
            <p className="text-on-surface-variant text-sm mb-6 max-w-md mx-auto">
              Sorry, this restaurant hasn't added any menu items yet!
            </p>
            {isOwner && (
              <Link
                href="/admin/menu"
                className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-2.5 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-sm"
              >
                <MaterialIcon name="add" className="text-[20px]" />
                Add Item
              </Link>
            )}
          </div>
        </section>
      )}
      
      {featuredItems.length > 0 && (
        <section className="px-margin-mobile mb-16 max-w-4xl mx-auto">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="min-w-0">
              <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">Popular picks</h2>
              <p className="text-sm text-on-surface-variant mt-1">A quick look at what this place serves</p>
            </div>
            <Link
              href={menuPath}
              className="hidden sm:flex items-center gap-1 rounded-full border border-outline-variant px-4 py-2 text-sm font-bold text-primary hover:bg-primary/5 transition-colors shrink-0"
            >
              Show more
              <MaterialIcon name="arrow_forward" className="text-[16px]" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:flex sm:overflow-x-auto hide-scrollbar sm:pb-4 sm:px-1 sm:-mx-1">
            {featuredItems
              .filter(
                (item) =>
                  !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((dish) => (
                <Link
                  key={dish.id || dish._id}
                  href={menuPath}
                  className="group relative rounded-[24px] overflow-hidden block sm:flex-none sm:w-44 md:w-52 aspect-[4/5] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Background Image */}
                  {dish.image ? (
                    <img
                      src={dish.image}
                      alt={`${dish.name} at ${restaurant.name} in ${restaurant.city}`}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-surface-variant">
                      <MaterialIcon
                        name="restaurant"
                        className="text-on-surface-variant opacity-30 text-5xl"
                      />
                    </div>
                  )}
                  
                  {/* Gradient Overlay for Text Visibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Veg/Non-veg Badge at Top Right */}
                  {dish.veg !== undefined && (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-1 rounded-md shadow-sm z-10">
                      <span className={`w-3 h-3 shrink-0 rounded-sm border-[1.5px] p-[1px] flex items-center justify-center ${dish.veg ? "border-green-600" : "border-red-600"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${dish.veg ? "bg-green-600" : "bg-red-600"}`} />
                      </span>
                    </div>
                  )}

                  {/* Content at Bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 transform transition-transform duration-300 z-10">
                    {dish.category && (
                      <p className="text-[10px] sm:text-[11px] font-bold text-white/80 uppercase tracking-wider mb-1 drop-shadow-md">
                        {dish.category}
                      </p>
                    )}
                    <h3 className="font-bold text-white text-sm sm:text-base leading-tight mb-2 line-clamp-2 drop-shadow-md">
                      {dish.name}
                    </h3>
                    <p className="text-white font-bold text-xs sm:text-sm bg-primary/90 backdrop-blur-md inline-block px-2.5 py-1 rounded-lg shadow-sm">
                      ₹{dish.price}
                    </p>
                  </div>
                </Link>
              ))}
          </div>
        </section>
      )}

      {/* Contact & Info Cards */}
      <section className="px-margin-mobile mb-16 max-w-4xl mx-auto">
        <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-6">Info & contact</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col justify-center bg-surface-container-low p-8 rounded-[32px] border border-outline-variant/30">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <MaterialIcon name="location_on" className="text-primary text-2xl" />
              </div>
              <div>
                <p className="font-bold text-on-surface mb-1 text-base">Address</p>
                <p className="text-on-surface-variant text-sm leading-relaxed max-w-[250px]">
                  {restaurant.address || `${restaurant.name}, ${restaurant.city}`}
                </p>
              </div>
            </div>
            {(restaurant.phone || restaurant.whatsapp) && (
              <div className="flex items-start gap-4 pt-6 border-t border-outline-variant/20">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <MaterialIcon name="call" className="text-primary text-2xl" />
                </div>
                <div>
                  <p className="font-bold text-on-surface mb-1 text-base">Contact</p>
                  {restaurant.phone && (
                    <p className="text-on-surface-variant font-medium">{restaurant.phone}</p>
                  )}
                  {restaurant.whatsapp && (
                    <p className="text-on-surface-variant font-medium mt-1">
                      WhatsApp: {restaurant.whatsapp}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center bg-surface-container-low p-8 rounded-[32px] border border-outline-variant/30">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <MaterialIcon name="schedule" className="text-primary text-2xl" />
              </div>
              <div>
                <p className="font-bold text-on-surface mb-1 text-base">Hours</p>
                <p className="text-on-surface-variant font-medium">
                  {restaurant.timings?.open
                    ? `${formatTime(restaurant.timings.open)} - ${formatTime(restaurant.timings.close)}`
                    : "11:00 AM - 11:00 PM"}
                </p>
                {restaurant.holidays && restaurant.holidays.length > 0 && (
                  <p className="text-error text-xs font-bold mt-2 uppercase tracking-wider">
                    Closed: {restaurant.holidays.join(", ")}
                  </p>
                )}
              </div>
            </div>

            {socialLinks.length > 0 && (
              <div className="flex items-start gap-4 pt-6 border-t border-outline-variant/20">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <MaterialIcon name="public" className="text-primary text-2xl" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-on-surface mb-3 text-base">Connect</p>
                  <div className="flex flex-wrap gap-2">
                    {socialLinks.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-outline-variant bg-white hover:border-primary hover:bg-primary/5 transition-all shadow-sm hover:shadow-md hover:-translate-y-1"
                        title={link.label}
                      >
                        <MaterialIcon name={link.icon} className={`${link.tone} text-[20px]`} />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      {validFacilities.length > 0 && (
        <section className="px-margin-mobile mb-16 max-w-4xl mx-auto">
          <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-6">Facilities</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {validFacilities.map((facility, idx) => (
              <div
                key={idx}
                className="bg-white p-4 rounded-xl flex flex-col items-center justify-center gap-2 border border-surface-container"
              >
                <MaterialIcon name={mapFacilityIcon(facility)} className="text-primary text-2xl" />
                <span className="font-semibold text-on-surface text-xs text-center">
                  {facility}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Move to Menu Button (Removed as it is now at the top) */}

      {/* Gallery Section */}
      {displayGallery && displayGallery.length > 0 && (
        <section className="px-margin-mobile mb-20 max-w-5xl mx-auto overflow-hidden">
        <div className="mb-12 animate-fadeInUp delay-300">
          <div className="flex items-center gap-2 mb-2 px-margin-mobile md:px-margin-desktop">
            <h2 className="font-heading-md text-heading-md sm:font-heading-lg sm:text-heading-lg font-bold text-on-surface">Moments & Vibe</h2>
            <MaterialIcon name="photo_camera" className="text-secondary" />
          </div>

          {/* Style 0: Unlimited (Marquee) */}
          {galleryStyle === "unlimited" && displayGallery.length > 0 && (
            <div className="w-full mt-4 overflow-hidden py-4 -mx-4 px-4 sm:mx-0 sm:px-0 bg-surface-container-low/30 backdrop-blur-sm">
               <div className="flex w-max animate-marquee gap-4">
                 {/* Repeat array multiple times to ensure enough width for seamless scrolling */}
                 {[...displayGallery, ...displayGallery, ...displayGallery, ...displayGallery].map((img, idx) => (
                    <div key={`${img.url || img._id}-${idx}`} className="w-[180px] h-[240px] sm:w-[260px] sm:h-[320px] rounded-[24px] overflow-hidden shrink-0 shadow-sm border border-outline-variant/30 hover:scale-[1.02] transition-transform duration-300">
                       <img src={img.url} alt={img.alt || `Gallery image of ${restaurant.name} in ${restaurant.city}`} className="w-full h-full object-cover pointer-events-none" />
                    </div>
                 ))}
               </div>
            </div>
          )}

          {/* Style 1: Aesthetic (Dynamic Flex Layout, max 5) */}
          {galleryStyle === "aesthetic" && (
            <div className="flex items-center gap-2 sm:gap-3 h-[300px] sm:h-[450px] w-full max-w-5xl mx-auto mt-4 px-2">
              {displayGallery.map((img, idx) => (
                <div
                  key={img._id || idx}
                  className="relative group transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] flex-1 hover:flex-[4] rounded-[24px] sm:rounded-[32px] overflow-hidden h-full cursor-pointer shadow-sm hover:shadow-xl"
                >
                  <img
                    className="h-full w-full object-cover object-center"
                    src={img.url}
                    alt={img.alt || `Gallery Image ${idx + 1}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                    <p className="text-white font-bold text-sm sm:text-lg whitespace-nowrap overflow-hidden text-ellipsis drop-shadow-md">{img.alt}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Style 2: Decent (Grid with Title, max 4) */}
          {galleryStyle === "decent" && (
            <div className="grid grid-cols-2 md:grid-cols-4 mt-4 gap-4 max-w-5xl mx-auto">
              {displayGallery.map((img, idx) => (
                <div
                  key={img._id || idx}
                  className="relative group rounded-[24px] sm:rounded-[32px] overflow-hidden w-full aspect-square md:aspect-[3/4] cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <img
                    src={img.url}
                    alt={img.alt || `Gallery Image ${idx + 1}`}
                    className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                    <div className="bg-white/20 backdrop-blur-md rounded-xl p-3 border border-white/30 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-xs sm:text-sm font-bold line-clamp-2 text-center drop-shadow-sm">{img.alt}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Style 3: Simple (Overlapping Polaroids, max 3) */}
          {galleryStyle === "simple" && (
            <div className="flex items-center justify-center mt-8 sm:mt-12 mb-8 relative max-w-2xl mx-auto min-h-[220px] sm:min-h-[300px]">
              {displayGallery.map((img, idx) => {
                const isLeft = idx === 0;
                const isCenter = idx === 1;
                const isRight = idx === 2;
                
                if (displayGallery.length === 1) {
                  return (
                    <div key={img._id || idx} className="relative bg-white p-2 sm:p-3 rounded-xl shadow-xl z-20 hover:scale-105 transition-transform duration-300 cursor-pointer">
                      <img src={img.url} alt={img.alt || `Photo at ${restaurant.name} ${restaurant.city}`} className="w-48 h-56 sm:w-64 sm:h-80 object-cover rounded-lg" />
                    </div>
                  );
                }
                
                if (gallery.length === 2) {
                   const transforms = isLeft ? "-rotate-3 -mr-6 sm:-mr-8 z-10" : "rotate-3 -ml-6 sm:-ml-8 z-20";
                   return (
                    <div key={img._id || idx} className={`relative bg-white p-2 sm:p-3 rounded-xl shadow-xl transition-all duration-500 hover:z-30 hover:scale-105 hover:rotate-0 cursor-pointer ${transforms}`}>
                      <img src={img.url} alt={img.alt || `Dining at ${restaurant.name} ${restaurant.city}`} className="w-40 h-48 sm:w-56 sm:h-72 object-cover rounded-lg" />
                    </div>
                  );
                }

                let transforms = "";
                if (isLeft) transforms = "-rotate-6 -mr-12 sm:-mr-16 mt-4 sm:mt-8 z-10";
                if (isCenter) transforms = "z-20 scale-105 shadow-2xl";
                if (isRight) transforms = "rotate-6 -ml-12 sm:-ml-16 mt-4 sm:mt-8 z-10";

                return (
                  <div
                    key={img._id || idx}
                    className={`relative bg-white p-2 sm:p-3 rounded-xl shadow-lg hover:z-30 hover:scale-110 hover:rotate-0 transition-all duration-300 cursor-pointer ${transforms}`}
                  >
                    <img
                      src={img.url}
                      alt={img.alt}
                      className="w-32 h-40 sm:w-56 sm:h-72 object-cover rounded-lg"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
        </section>
      )}

      {/* Reviews Section */}
      <section className="px-margin-mobile mb-24 max-w-4xl mx-auto" id="reviews">
        <div className="mb-8">
          <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">Reviews</h2>
        </div>

        {/* Add Review Form */}
        <div className="mb-16">
          {user ? (
            <>
              <h3 className="font-bold text-2xl text-on-surface mb-8">Rate your experience</h3>
              <form onSubmit={submitReview} className="w-full">
                <div className="flex mb-6 relative">
                  <div className="flex items-center gap-3">
                    {[1, 2, 3, 4, 5].map((star) => {
                      return (
                        <button
                          key={star}
                          type="button"
                          className={`transition-all hover:scale-110 focus:outline-none`}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                        >
                          <MaterialIcon 
                            name="star" 
                            fill={(hoverRating || rating) >= star} 
                            className={`text-4xl transition-colors drop-shadow-sm ${
                              (hoverRating || rating) >= star ? "text-primary" : "text-on-surface-variant/30"
                            }`} 
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="mb-6">
                  <textarea
                    className="w-full h-36 p-6 rounded-[24px] border border-outline-variant/50 bg-surface-container-lowest/50 focus:bg-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none text-body-lg shadow-sm"
                    placeholder="What was your experience like? Share the details..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    required
                  ></textarea>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-primary">{reviewSuccess ? "Review submitted! Reloading..." : ""}</span>
                  <button
                    type="submit"
                    disabled={submittingReview || !reviewText.trim()}
                    className="px-8 h-14 rounded-full bg-primary text-white font-bold transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center gap-2 text-base"
                  >
                    <MaterialIcon name="send" className="text-[20px]" />
                    {submittingReview ? "Submitting..." : "Post Review"}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="bg-surface-container-low p-8 sm:p-10 rounded-3xl text-center border border-outline-variant/30 mt-6 shadow-sm">
              <h3 className="font-bold text-xl sm:text-2xl text-on-surface mb-3">Share your experience</h3>
              <p className="text-on-surface-variant text-sm sm:text-base mb-8 max-w-md mx-auto">Your feedback helps others make better dining decisions. Log in to write a review and rate this restaurant.</p>
              <Link href="/login" className="inline-flex items-center justify-center h-12 sm:h-14 gap-2 px-8 bg-primary text-white font-bold rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_4px_16px_rgba(var(--primary-rgb),0.3)]">
                <MaterialIcon name="login" className="text-[20px]" />
                Log In to Review
              </Link>
            </div>
          )}
        </div>

        {/* Existing Reviews List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
          {/* HeyRestro Default Review */}
          <div className="flex flex-col relative">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white shrink-0 shadow-sm border border-primary/20">
                <MaterialIcon name="verified" className="text-[24px]" />
              </div>
              <div>
                <h4 className="font-bold text-on-surface text-base flex items-center gap-1.5">
                  HeyRestro Team
                  <MaterialIcon name="check_circle" className="text-primary text-[14px]" fill />
                </h4>
                <div className="flex text-primary mt-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <MaterialIcon key={star} name="star" fill className="text-[16px]" />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-on-surface-variant font-medium text-base leading-relaxed pl-1">
              "Welcome to HeyRestro! We wish you immense success and hope your business grows beautifully with us. ðŸš€"
            </p>
          </div>

          {reviews.map((review) => (
            <div
              key={review.id || review._id}
              className="flex flex-col relative"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0 border border-primary/20 shadow-sm">
                  {(review.name || "G").charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-on-surface text-base">{review.name}</h4>
                  <div className="flex text-primary/80 mt-0.5">
                    {Array.from({ length: review.rating || 5 }).map((_, index) => (
                      <MaterialIcon key={index} name="star" fill className="text-[16px]" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-on-surface-variant font-medium text-base leading-relaxed pl-1">
                "{review.text}"
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Custom QR Modal Overlay */}
      {showQrModal && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-6 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300 overflow-hidden"
          onClick={() => setShowQrModal(false)}
        >
          {/* Mobile Close Button (Fixed) */}
          <button 
            onClick={() => setShowQrModal(false)}
            className="fixed sm:hidden top-6 right-6 w-10 h-10 rounded-full bg-white/20 text-white hover:bg-white/40 flex items-center justify-center transition-all backdrop-blur-md z-[110]"
            aria-label="Close QR"
          >
            <MaterialIcon name="close" className="text-[24px]" />
          </button>

          <div 
            className="relative inline-flex flex-col items-center justify-center w-full max-w-full sm:w-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Desktop Close Button (Absolute) */}
            <button 
              onClick={() => setShowQrModal(false)}
              className="hidden sm:flex absolute top-[-18px] -right-12 w-10 h-10 rounded-full bg-white/20 text-white hover:bg-white/40 items-center justify-center transition-all backdrop-blur-md z-10"
              aria-label="Close QR"
            >
              <MaterialIcon name="close" className="text-[24px]" />
            </button>
            
            <div className={`relative inline-block w-full sm:w-auto sm:max-w-full max-h-[85vh] scale-[1.7] sm:scale-100 ${activeQrConfig.mobileOriginClass} sm:origin-center transition-transform`}>
              <img 
                src={activeQrConfig.src} 
                alt="Scan QR" 
                className="w-full sm:w-auto h-auto sm:max-h-[85vh] object-contain drop-shadow-2xl" 
                style={{ borderRadius: '24px' }}
              />
              
              {/* QR Code Container overlaying the white box */}
              <div 
                className="absolute flex items-center justify-center bg-white rounded-md overflow-hidden"
                style={activeQrConfig.style}
              >
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Restaurant QR" className="w-[92%] h-[92%] object-contain mix-blend-multiply" />
                ) : (
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

