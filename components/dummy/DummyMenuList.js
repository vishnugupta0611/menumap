"use client";

import { useState } from "react";
import Link from "next/link";
import MaterialIcon from "@/components/stitch/MaterialIcon";
import { useCartStore } from "@/stores/cart-store";
import { useAuth } from "@/contexts/AuthContext";

export default function DummyMenuList({ restaurant, menu, offers = [] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [foodFilter, setFoodFilter] = useState("all"); // "all" | "veg" | "non-veg"
  const [activeCategory, setActiveCategory] = useState("");

  // Randomly pick one of 4 layouts on every mount/refresh
  const [randomLayout] = useState(() => {
    const layouts = ["bento", "list", "grid", "simple-list"];
    return layouts[Math.floor(Math.random() * layouts.length)];
  });

  const activeOffer = offers && offers.length > 0 ? offers[0] : null;

  const { cart, addItem, removeItem, getTotalAmount, getTotalItems } = useCartStore();
  const { user } = useAuth();
  const isOwner = user?.role === "owner";

  const categories = [...new Set(menu.map((item) => item.category))];
  const settings = {
    ...(restaurant.menuUiSettings || {
      colorPalette: "clay",
      font: "jakarta",
      showDescription: true,
      showBadges: true,
      showImage: true,
    }),
    layout: randomLayout, // always randomized, ignore any stored layout
    showBanner: false, // hero image disabled
  };

  // Filtering logic
  const filteredMenu = menu.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFoodType =
      foodFilter === "all" ||
      (foodFilter === "veg" && item.veg) ||
      (foodFilter === "non-veg" && !item.veg);

    return matchesSearch && matchesFoodType;
  });

  const getQuantity = (itemId) => {
    const cartItem = cart.find(i => i.menuItemId === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleAddItem = (item) => {
    if (isOwner) return;
    addItem(item);
  };

  const handleRemoveItem = (itemId) => {
    if (isOwner) return;
    removeItem(itemId);
  };

  return (
    <div className="custom-scrollbar menu-gradient-bg pb-28 relative">
      {/* Offer Ribbon */}
      {activeOffer && (
        <div className="fixed md:absolute top-24 md:top-6 right-0 z-50 overflow-hidden w-24 h-24 sm:w-32 sm:h-32 pointer-events-none">
          <div className="bg-primary text-white font-bold text-[9px] sm:text-[11px] text-center uppercase tracking-widest py-1 sm:py-1.5 w-32 sm:w-40 absolute top-6 sm:top-7 -right-8 sm:-right-9 rotate-45 shadow-lg border-y border-white/20 whitespace-nowrap z-50">
            {activeOffer.title || "Special Offer!"}
          </div>
        </div>
      )}

      <main className="pt-4 md:pt-8 px-4 sm:px-5 md:px-8 max-w-3xl mx-auto">
        {isOwner && (
          <section className="mb-6 rounded-3xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
            <MaterialIcon name="admin_panel_settings" className="text-primary text-[22px] mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-on-surface text-sm">Restaurant preview mode</p>
              <p className="text-sm text-on-surface-variant">
                Aap owner account se menu dekh rahe ho. Customer orders place karne ke liye customer account use karein.
              </p>
            </div>
          </section>
        )}

        {/* Search and Filter Section */}
        <section className="mt-4 md:mt-6 mb-6 space-y-4">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-primary/60 group-focus-within:text-primary transition-colors">
              search
            </span>
            <input
              className="w-full pl-12 sm:pl-14 pr-4 sm:pr-5 py-3.5 sm:py-4 md:py-5 bg-surface/80 backdrop-blur-md border-2 border-primary/30 hover:border-primary/50 rounded-[24px] sm:rounded-[28px] shadow-[0_8px_24px_rgba(0,0,0,0.03)] focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-on-surface-variant/80 font-body-md text-[15px] sm:text-[16px] text-on-surface font-medium"
              placeholder="Search for flavors..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {settings.showTabs !== false && (
            <div className="flex items-center justify-between p-1.5 bg-surface-container-low rounded-[24px] border border-surface-container-highest/30 shadow-inner">
              <button
              onClick={() => setFoodFilter("all")}
              className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-4 rounded-[20px] text-[12px] sm:text-[13px] font-bold tracking-wide transition-all duration-300 cursor-pointer ${
                foodFilter === "all"
                  ? "bg-primary text-on-primary shadow-md"
                  : "text-on-surface-variant hover:bg-surface-variant/50"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFoodFilter("veg")}
              className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-4 rounded-[20px] text-[12px] sm:text-[13px] font-bold tracking-wide transition-all duration-300 cursor-pointer ${
                foodFilter === "veg"
                  ? "bg-primary text-on-primary shadow-md"
                  : "text-on-surface-variant hover:bg-surface-variant/50"
              }`}
            >
              Veg
            </button>
            <button
              onClick={() => setFoodFilter("non-veg")}
              className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-4 rounded-[20px] text-[12px] sm:text-[13px] font-bold tracking-wide transition-all duration-300 cursor-pointer ${
                foodFilter === "non-veg"
                  ? "bg-primary text-on-primary shadow-md"
                  : "text-on-surface-variant hover:bg-surface-variant/50"
              }`}
            >
              Non-Veg
              </button>
            </div>
          )}
        </section>

        {/* Category Chips Scroll */}
        <nav className="overflow-x-auto no-scrollbar flex gap-2 sm:gap-3 sticky top-[64px] sm:top-[72px] md:top-[90px] py-3 sm:py-4 z-30 bg-background/85 backdrop-blur-xl border-b border-surface-container-highest/20 -mx-4 sm:-mx-5 px-4 sm:px-5 md:-mx-8 md:px-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <button
            onClick={() => setActiveCategory("")}
            className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-[12px] sm:text-[13px] whitespace-nowrap transition-all duration-300 cursor-pointer shrink-0 ${
              activeCategory === "" ? "bg-primary text-on-primary font-bold shadow-md" : "bg-surface-container-high text-on-surface-variant font-medium"
            }`}
          >
            All Items
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-[12px] sm:text-[13px] whitespace-nowrap transition-all duration-300 cursor-pointer shrink-0 ${
                activeCategory === category ? "bg-primary text-on-primary font-bold shadow-md" : "bg-surface-container-high text-on-surface-variant font-medium"
              }`}
            >
              {category}
            </button>
          ))}
        </nav>

        {/* Empty State */}
        {filteredMenu.length === 0 && (
          <div className="flex flex-col items-center justify-center pt-8 pb-16 text-center px-4">
            <span className="text-5xl sm:text-6xl mb-6 drop-shadow-md">🍽️</span>
            <h3 className="text-xl sm:text-2xl font-black text-on-surface mb-3 tracking-tight">Oops! No items found</h3>
            <p className="text-[14px] sm:text-[15px] text-on-surface-variant max-w-sm font-medium">
              {searchQuery || foodFilter !== "all" 
                ? "We couldn't find any items matching your current filters. Try clearing them to see everything."
                : "Sorry, this restaurant hasn't added any menu items yet!"}
            </p>
            
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-8">
              {(searchQuery || foodFilter !== "all" || activeCategory) && (
                <button 
                  onClick={() => { setSearchQuery(""); setFoodFilter("all"); setActiveCategory(""); }}
                  className="px-6 sm:px-8 py-2.5 sm:py-3 bg-primary text-white rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all cursor-pointer border-none outline-none text-sm sm:text-base"
                >
                  Clear Filters
                </button>
              )}
              
              <Link
                href={`/dummy?number=${restaurant.phone}`}
                className="px-6 sm:px-8 py-2.5 sm:py-3 bg-surface-container-high text-on-surface border border-outline-variant/50 rounded-full font-bold shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer no-underline text-sm sm:text-base"
              >
                View Profile
              </Link>
            </div>
          </div>
        )}

        {/* Menu Sections */}
        {filteredMenu.length > 0 && categories
          .filter((cat) => !activeCategory || cat === activeCategory)
          .map((cat) => {
            const categoryItems = filteredMenu.filter((item) => item.category === cat);
            if (categoryItems.length === 0) return null;

            return (
              <section key={cat} className="mb-10 sm:mb-12 mt-6 sm:mt-8 md:mt-10">
                <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6 md:mb-8">
                  <h2 className="font-headline-md text-xl sm:text-2xl md:text-3xl tracking-tight text-on-surface font-extrabold">{cat}</h2>
                  <div className="h-[1px] flex-grow bg-gradient-to-r from-surface-container-highest/80 to-transparent"></div>
                </div>
                <div className={
                  settings.layout === "list" ? "space-y-3 sm:space-y-4" :
                  settings.layout === "grid" ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5" :
                  settings.layout === "simple-list" ? "space-y-2.5 sm:space-y-3" :
                  "space-y-4 sm:space-y-5 md:space-y-6" // bento
                }>
                  {categoryItems.map((item, index) => (
                    <div
                      key={item.id}
                      className={`group overflow-hidden ${
                        settings.layout === "list" ? "bg-surface flex items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4 md:p-5 rounded-[20px] sm:rounded-[24px] border border-surface-container-highest/30 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-shadow duration-300" :
                        settings.layout === "grid" ? "bg-surface rounded-[20px] sm:rounded-[24px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all flex flex-col border border-surface-container-highest/20" :
                        settings.layout === "simple-list" ? "flex items-center justify-between py-2.5 sm:py-3 md:py-4 bg-transparent border-none rounded-none gap-3" :
                        "bg-surface p-4 sm:p-5 md:p-6 rounded-[24px] sm:rounded-[28px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-shadow duration-300 border border-surface-container-highest/30 flex items-start justify-between gap-4 sm:gap-5 md:gap-6"
                      }`}
                      onClick={() => {
                        // Allow clicking anywhere on simple-list to add if desired, or let it just be decorative
                        if (settings.layout === "simple-list" && getQuantity(item.id) === 0) handleAddItem(item);
                      }}
                    >
                      <div className={`flex-1 min-w-0 ${settings.layout === "grid" ? "p-3.5 sm:p-4 order-2" : "order-1 flex flex-col h-full"} ${settings.layout === "simple-list" ? "min-w-0" : ""}`}>
                        <div className={`flex items-center gap-2 ${settings.layout === "grid" ? "mb-1.5" : "mb-2"} ${settings.layout === "simple-list" ? "mb-0 truncate" : ""}`}>
                          {settings.showBadges && (
                            <span
                              className={`material-symbols-outlined ${settings.layout === "grid" ? "text-[14px]" : "text-[18px]"} ${settings.layout === "simple-list" ? "text-[14px] shrink-0" : ""} fill ${
                                item.veg ? "text-green-600" : "text-error"
                              }`}
                            >
                              fiber_manual_record
                            </span>
                          )}
                          <h3 className={`text-on-surface tracking-tight ${settings.layout === "grid" ? "font-bold text-[14px] sm:text-[15px] md:text-[17px] line-clamp-1" : settings.layout === "simple-list" ? "font-medium text-sm md:text-base truncate" : "font-bold text-base sm:text-lg md:text-xl line-clamp-2"}`}>
                            {item.name}
                          </h3>
                        </div>
                        {settings.showDescription && settings.layout !== "grid" && settings.layout !== "simple-list" && (
                          <p className={`text-on-surface-variant/80 line-clamp-2 leading-relaxed ${settings.layout === "list" ? "text-xs md:text-sm mb-2" : "text-[13px] sm:text-sm md:text-[15px] mb-2.5 sm:mb-3 md:mb-4"}`}>
                            {item.description}
                          </p>
                        )}
                        {settings.layout !== "simple-list" && (
                          <div className={`flex items-center justify-between mt-auto ${settings.layout === "grid" ? "pt-2" : ""}`}>
                          <span className={`text-primary font-bold ${settings.layout === "grid" || settings.layout === "list" ? "text-[14px] sm:text-[15px] md:text-[17px]" : "text-base sm:text-lg md:text-xl"}`}>Rs {item.price}</span>
                          
                          {/* Layout specific quick-add button for grid/list (optional styling tweak) */}
                          {(settings.layout === "grid" || settings.layout === "list") && (
                            <div className="bg-surface-container-low border border-surface-container-highest/50 rounded-xl px-1 py-1 w-20 sm:w-24 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                              {getQuantity(item.id) > 0 ? (
                                <>
                                  <button onClick={(e) => { e.stopPropagation(); handleRemoveItem(item.id); }} disabled={isOwner} className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-primary bg-primary-container rounded-lg font-bold active:scale-95 cursor-pointer transition-transform disabled:opacity-40 disabled:cursor-not-allowed">-</button>
                                  <span className="font-bold text-sm text-primary">{getQuantity(item.id)}</span>
                                  <button onClick={(e) => { e.stopPropagation(); handleAddItem(item); }} disabled={isOwner} className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-primary bg-primary-container rounded-lg font-bold active:scale-95 cursor-pointer transition-transform disabled:opacity-40 disabled:cursor-not-allowed">+</button>
                                </>
                              ) : (
                                <button onClick={(e) => { e.stopPropagation(); handleAddItem(item); }} disabled={isOwner} className="w-full py-1.5 text-primary font-bold text-[11px] text-center uppercase tracking-wider active:scale-95 cursor-pointer transition-transform disabled:opacity-40 disabled:cursor-not-allowed">{isOwner ? "VIEW" : "ADD"}</button>
                              )}
                            </div>
                          )}
                        </div>
                        )}
                      </div>

                      {settings.layout === "simple-list" && (
                        <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-2 order-2">
                          <span className="font-bold text-primary text-[13px] sm:text-[14px] md:text-[15px]">₹{item.price}</span>
                          {getQuantity(item.id) > 0 ? (
                            <div className="bg-surface-container-low border border-surface-container-highest/50 rounded-lg px-1 py-1 w-20 flex justify-between items-center" onClick={(e) => e.stopPropagation()}>
                              <button onClick={() => handleRemoveItem(item.id)} disabled={isOwner} className="w-6 h-6 flex items-center justify-center text-primary bg-primary-container rounded-md font-bold disabled:opacity-40">-</button>
                              <span className="font-bold text-xs text-primary">{getQuantity(item.id)}</span>
                              <button onClick={() => handleAddItem(item)} disabled={isOwner} className="w-6 h-6 flex items-center justify-center text-primary bg-primary-container rounded-md font-bold disabled:opacity-40">+</button>
                            </div>
                          ) : (
                            <button onClick={(e) => { e.stopPropagation(); handleAddItem(item); }} disabled={isOwner} className="bg-primary/10 text-primary px-3 sm:px-4 md:px-5 py-1.5 rounded-full font-bold text-[10px] sm:text-[11px] uppercase tracking-wider border border-primary/20 active:scale-95 transition-transform disabled:opacity-40 disabled:cursor-not-allowed">{isOwner ? "VIEW" : "ADD"}</button>
                          )}
                        </div>
                      )}

                      {settings.showImage && settings.layout !== "simple-list" && (
                        <div className={`flex flex-col items-center gap-2.5 sm:gap-3 shrink-0 ${
                          settings.layout === "grid" ? "order-1 w-full" : "order-2"
                        }`}>
                          <div className={`overflow-hidden flex-shrink-0 shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)] group-hover:scale-105 transition-transform duration-700 bg-surface-container-low ${
                            settings.layout === "list" ? "w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-xl sm:rounded-2xl md:rounded-[20px]" :
                            settings.layout === "grid" ? "w-full h-28 sm:h-36 md:h-44" :
                            settings.layout === "simple-list" ? "w-20 h-20 md:w-24 md:h-24 rounded-[16px]" :
                            "w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-xl sm:rounded-2xl md:rounded-[24px]"
                          }`}>
                            {item.image ? (
                              <img referrerPolicy="no-referrer"  alt={item.name} className="w-full h-full object-cover" src={item.image} />
                            ) : (
                              <img referrerPolicy="no-referrer"  alt={item.name} className="w-full h-full object-contain p-4 opacity-30" src="/images/notfound.png" />
                            )}
                          </div>
                          
                          {/* Add to Cart Control for Bento Layout */}
                          {settings.layout === "bento" && (
                            <div className="bg-surface-container-low border border-surface-container-highest/50 rounded-xl md:rounded-2xl px-1.5 py-1.5 w-full flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                              {getQuantity(item.id) > 0 ? (
                                <>
                                  <button onClick={() => handleRemoveItem(item.id)} disabled={isOwner} className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 flex items-center justify-center text-primary bg-primary-container rounded-lg font-bold active:scale-95 cursor-pointer transition-transform disabled:opacity-40 disabled:cursor-not-allowed">-</button>
                                  <span className="font-bold text-sm md:text-[15px] text-primary">{getQuantity(item.id)}</span>
                                  <button onClick={() => handleAddItem(item)} disabled={isOwner} className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 flex items-center justify-center text-primary bg-primary-container rounded-lg font-bold active:scale-95 cursor-pointer transition-transform disabled:opacity-40 disabled:cursor-not-allowed">+</button>
                                </>
                              ) : (
                                <button onClick={() => handleAddItem(item)} disabled={isOwner} className="w-full py-1.5 text-primary font-bold text-[12px] sm:text-[13px] md:text-sm text-center uppercase tracking-wider active:scale-95 cursor-pointer transition-transform disabled:opacity-40 disabled:cursor-not-allowed">{isOwner ? "VIEW" : "ADD"}</button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Edge case: When showImage is false, Bento layout still needs its ADD button below the content instead of underneath a non-existent image */}
                      {!settings.showImage && settings.layout === "bento" && (
                        <div className="flex flex-col justify-end w-28 sm:w-32 shrink-0 order-3">
                          <div className="bg-surface-container-low border border-surface-container-highest/50 rounded-xl md:rounded-2xl px-1.5 py-1.5 w-full flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                            {getQuantity(item.id) > 0 ? (
                              <>
                                <button onClick={() => handleRemoveItem(item.id)} disabled={isOwner} className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 flex items-center justify-center text-primary bg-primary-container rounded-lg font-bold active:scale-95 cursor-pointer transition-transform disabled:opacity-40 disabled:cursor-not-allowed">-</button>
                                <span className="font-bold text-sm md:text-[15px] text-primary">{getQuantity(item.id)}</span>
                                <button onClick={() => handleAddItem(item)} disabled={isOwner} className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 flex items-center justify-center text-primary bg-primary-container rounded-lg font-bold active:scale-95 cursor-pointer transition-transform disabled:opacity-40 disabled:cursor-not-allowed">+</button>
                              </>
                            ) : (
                              <button onClick={() => handleAddItem(item)} disabled={isOwner} className="w-full py-1.5 text-primary font-bold text-[12px] sm:text-[13px] md:text-sm text-center uppercase tracking-wider active:scale-95 cursor-pointer transition-transform disabled:opacity-40 disabled:cursor-not-allowed">{isOwner ? "VIEW" : "ADD"}</button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
      </main>

      {/* Floating Order Summary */}
      {!isOwner && getTotalItems() > 0 && (
        <div className="fixed bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-24px)] sm:w-[calc(100%-40px)] max-w-md z-50 transform transition-transform duration-500 translate-y-0 animate-reveal">
          <div className="bg-on-surface text-surface p-3 md:p-4 rounded-[18px] sm:rounded-[20px] md:rounded-3xl flex justify-between items-center shadow-2xl backdrop-blur-xl border border-white/10">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-primary text-on-primary rounded-lg md:rounded-xl flex items-center justify-center font-bold text-[12px] sm:text-[13px] md:text-sm">{getTotalItems()}</div>
              <div>
                <p className="text-[8px] sm:text-[9px] md:text-xs font-bold opacity-70 uppercase tracking-wider">Items in cart</p>
                <p className="text-[12px] sm:text-[13px] md:text-[16px] font-black">Rs {getTotalAmount()}</p>
              </div>
            </div>
            <button onClick={() => alert("This is a dummy menu page, you can't order from here")} className="bg-surface text-on-surface px-3 sm:px-4 md:px-6 py-2 md:py-2.5 rounded-xl md:rounded-2xl font-bold text-[10px] sm:text-[11px] md:text-sm flex items-center gap-1.5 active:scale-95 transition-transform cursor-pointer border-none outline-none shrink-0">
              View Cart
              <span className="material-symbols-outlined text-[13px] sm:text-[14px] md:text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}