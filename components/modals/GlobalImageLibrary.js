"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Fuse from "fuse.js";
import { galleryData } from "@/lib/galleryData";
import MaterialIcon from "@/components/stitch/MaterialIcon";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

const PAGE_SIZE = 24;

export default function GlobalImageLibrary({ isOpen, onClose, onSelectImage, defaultQuery = "" }) {
  const { user } = useAuth();
  
  // Tabs: 'my-images' or 'theme-images'
  const [libraryTab, setLibraryTab] = useState("theme-images");
  
  // My Images state
  const [myImages, setMyImages] = useState([]);
  const [loadingMyImages, setLoadingMyImages] = useState(false);

  // Theme Images state
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [displayedCount, setDisplayedCount] = useState(PAGE_SIZE);

  // Initialize Fuse
  const fuse = useMemo(() => new Fuse(galleryData, {
    keys: ['termName'],
    threshold: 0.6,
    ignoreLocation: true,
    includeScore: true
  }), []);

  // Fetch My Images
  useEffect(() => {
    if (!isOpen || !user?.restaurantId) return;
    const fetchMyImages = async () => {
      setLoadingMyImages(true);
      try {
        const [galleryRes, restRes, menuRes] = await Promise.all([
          api.get(`/api/restaurants/id/${user.restaurantId}/gallery`),
          api.get(`/api/restaurants/id/${user.restaurantId}`),
          api.get(`/api/restaurants/id/${user.restaurantId}/menu-items`)
        ]);
        
        const urls = new Set();
        const rest = restRes.data.data;
        if (rest?.heroImage) urls.add(rest.heroImage);
        if (rest?.logoImage) urls.add(rest.logoImage);
        
        const menuItems = menuRes.data.data || [];
        menuItems.forEach(item => { if (item.image) urls.add(item.image); });
        
        const fetchedGallery = galleryRes.data.data || [];
        fetchedGallery.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        fetchedGallery.forEach(g => urls.add(g.url));
        
        setMyImages(Array.from(urls));
      } catch (err) {
        console.error("Failed to load my images:", err);
      } finally {
        setLoadingMyImages(false);
      }
    };
    fetchMyImages();
  }, [isOpen, user?.restaurantId]);

  // Sync defaultQuery
  useEffect(() => {
    if (isOpen && defaultQuery) {
      setSearchQuery(defaultQuery);
      setLibraryTab("theme-images");
    } else if (isOpen && !defaultQuery) {
      setSearchQuery("");
    }
  }, [isOpen, defaultQuery]);

  // Handle derived theme images
  const filteredThemeImages = useMemo(() => {
    let pool = [];
    if (activeCategory === "All" || activeCategory === "Food") {
       galleryData.forEach(cat => cat.imageUrls.forEach(url => pool.push({ term: cat.termName, url })));
    }

    if (searchQuery.trim()) {
      const results = fuse.search(searchQuery.trim());
      pool = [];
      results.forEach(res => {
         res.item.imageUrls.forEach(url => pool.push({ term: res.item.termName, url }));
      });
    }
    
    return pool;
  }, [activeCategory, searchQuery, fuse]);

  // Infinite Scroll setup
  const observerRef = useRef(null);
  
  const handleObserver = useCallback((entries) => {
    const target = entries[0];
    if (target.isIntersecting) {
      setDisplayedCount(prev => prev + PAGE_SIZE);
    }
  }, []);

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: "200px",
      threshold: 0
    };
    const observer = new IntersectionObserver(handleObserver, option);
    if (observerRef.current) observer.observe(observerRef.current);
    
    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current);
    };
  }, [handleObserver, filteredThemeImages]);

  // Reset pagination on filter change
  useEffect(() => {
    setDisplayedCount(PAGE_SIZE);
  }, [activeCategory, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>
      <div className="relative bg-surface-container-lowest w-full h-[90vh] rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden animate-slide-up">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-surface-container flex items-center justify-between bg-white z-10 shrink-0">
          <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
            <MaterialIcon name="photo_library" className="text-primary" />
            Image Library Vault
          </h2>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-variant/50 transition-colors text-on-surface-variant"
          >
            <MaterialIcon name="close" className="text-xl" />
          </button>
        </div>

        {/* Main Tabs */}
        <div className="flex border-b border-surface-container bg-white shrink-0">
          <button 
            onClick={() => setLibraryTab("theme-images")}
            className={`flex-1 py-4 text-xs sm:text-sm font-bold transition-colors border-b-2 ${libraryTab === "theme-images" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:bg-surface-variant/20"}`}
          >
            Theme Images
          </button>
          <button 
            onClick={() => setLibraryTab("my-images")}
            className={`flex-1 py-4 text-xs sm:text-sm font-bold transition-colors border-b-2 ${libraryTab === "my-images" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:bg-surface-variant/20"}`}
          >
            My Uploaded Images
          </button>
        </div>

        {/* Tab Contents */}
        {libraryTab === "theme-images" && (
          <div className="flex flex-col flex-1 overflow-hidden bg-surface-container-lowest">
            {/* Search & Categories */}
            <div className="p-4 border-b border-surface-container shrink-0 bg-white space-y-3">
              <div className="relative">
                <MaterialIcon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input 
                  type="text" 
                  placeholder="Search theme images (e.g., burger, pizza)..."
                  className="w-full h-10 pl-11 pr-4 rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary text-sm shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar hide-scrollbar">
                {['All', 'Food', 'Theme', 'Logo', 'Background'].map(cat => (
                  <button 
                    key={cat}
                    onClick={() => { setActiveCategory(cat); setSearchQuery(""); }}
                    className={`px-4 py-1.5 rounded-full font-bold text-[11px] whitespace-nowrap transition-colors border ${activeCategory === cat ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white text-on-surface border-outline-variant hover:bg-surface-container-low'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Image Grid */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              {filteredThemeImages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-on-surface-variant">
                  <MaterialIcon name="image_not_supported" className="text-5xl mb-4 opacity-50" />
                  <p className="font-bold">No images found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filteredThemeImages.slice(0, displayedCount).map((img, idx) => (
                    <div 
                      key={idx} 
                      className="relative group rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer shadow-sm border border-outline-variant/30 hover:shadow-lg transition-all hover:-translate-y-1"
                      onClick={() => onSelectImage(img.url)}
                    >
                      <img src={img.url} alt={img.term} loading="lazy" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <div className="bg-white text-on-surface px-3 py-1.5 rounded-full font-bold text-xs opacity-0 group-hover:opacity-100 transition-all shadow-lg flex items-center gap-1">
                          <MaterialIcon name="check_circle" className="text-primary text-[14px]" />
                          Select
                        </div>
                      </div>
                      <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="text-white text-[10px] font-bold truncate">{img.term}</div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Invisible div for infinite scrolling trigger */}
                  {displayedCount < filteredThemeImages.length && (
                    <div ref={observerRef} className="col-span-full h-10 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {libraryTab === "my-images" && (
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-surface-container-lowest">
            {loadingMyImages ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-primary font-bold animate-pulse flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  Loading your images...
                </div>
              </div>
            ) : myImages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-on-surface-variant">
                <MaterialIcon name="image_not_supported" className="text-5xl mb-4 opacity-50" />
                <p className="font-bold">No uploaded images found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4">
                {myImages.map((url, idx) => (
                  <div 
                    key={idx} 
                    className="relative group rounded-2xl overflow-hidden aspect-square cursor-pointer shadow-sm border border-outline-variant/30 hover:shadow-lg transition-all hover:-translate-y-1"
                    onClick={() => onSelectImage(url)}
                  >
                    <img src={url} alt="My Image" loading="lazy" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <div className="bg-white text-on-surface px-3 py-1.5 rounded-full font-bold text-xs opacity-0 group-hover:opacity-100 transition-all shadow-lg flex items-center gap-1">
                        <MaterialIcon name="check_circle" className="text-primary text-[14px]" />
                        Select
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
