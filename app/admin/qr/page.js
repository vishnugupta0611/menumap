"use client";

import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { AdminPanel } from "@/components/admin/AdminPanel";
import MaterialIcon from "@/components/stitch/MaterialIcon";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

export default function QrCodePage() {
  const { user } = useAuth();
  const [qrData, setQrData] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [activeDesignIndex, setActiveDesignIndex] = useState(0);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [isDownloadingPng, setIsDownloadingPng] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const posterRef = useRef(null);

  useEffect(() => {
    if (!user?.restaurantId) return;

    const fetchData = async () => {
      try {
        const [qrRes, restRes] = await Promise.all([
          api.get(`/api/qr/restaurants/${user.restaurantId}`),
          api.get(`/api/restaurants/id/${user.restaurantId}`)
        ]);
        setQrData(qrRes.data.data);
        setRestaurant(restRes.data.data);
      } catch (err) {
        console.error("Failed to fetch data", err);
        setError("Failed to load QR data. Please check connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.restaurantId]);

  const generateImage = async () => {
    if (!posterRef.current) throw new Error("Poster ref not found");
    // Ensure scroll position doesn't mess up rendering
    window.scrollTo(0, 0);
    return await toPng(posterRef.current, {
      pixelRatio: 3,
      cacheBust: true,
      backgroundColor: bgColor,
    });
  };

  const handleDownloadPng = async () => {
    if (!qrData || !restaurant) return;
    setIsDownloadingPng(true);
    setIsDropdownOpen(false);
    try {
      const dataUrl = await generateImage();
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${restaurant.slug}-qr-poster.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download failed:", err);
      alert(`Failed to generate image. Error: ${err.message}`);
    } finally {
      setIsDownloadingPng(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!qrData || !restaurant) return;
    setIsDownloadingPdf(true);
    setIsDropdownOpen(false);
    try {
      const imgData = await generateImage();
      
      const width = posterRef.current.offsetWidth;
      const height = posterRef.current.offsetHeight;
      
      const pdf = new jsPDF({
        orientation: width > height ? "landscape" : "portrait",
        unit: "px",
        format: [width, height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      pdf.save(`${restaurant.slug}-qr-poster.pdf`);
    } catch (err) {
      console.error("PDF Download failed:", err);
      alert(`Failed to generate PDF. Error: ${err.message}`);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const designs = [
    { id: 0, name: "Minimalist" },
    { id: 1, name: "Branded Focus" },
    { id: 2, name: "Full Info Details" },
    { id: 3, name: "Vibrant Bold" },
    { id: 4, name: "Elegant Classic" },
    { id: 5, name: "Playful Pop" },
    { id: 6, name: "Modern Split" },
    { id: 7, name: "Rustic Charm" }
  ];

  const colors = [
    "#ffffff", // White
    "#f8f9fa", // Light Gray
    "#fffbeb", // Pastel Yellow
    "#f0fdf4", // Pastel Green
    "#eff6ff", // Pastel Blue
    "#fdf2f8", // Pastel Pink
    "#1a1a1a", // Dark
  ];

  const handlePrevDesign = () => {
    setActiveDesignIndex((prev) => (prev - 1 + designs.length) % designs.length);
  };

  const handleNextDesign = () => {
    setActiveDesignIndex((prev) => (prev + 1) % designs.length);
  };

  const activeDesign = designs[activeDesignIndex].id;
  const isDarkBg = bgColor === "#1a1a1a";
  const textColor = isDarkBg ? "text-white" : "text-gray-900";
  const subTextColor = isDarkBg ? "text-gray-300" : "text-gray-600";
  const borderColor = isDarkBg ? "border-white/20" : "border-gray-200";

  // Cache busting helper for external images to prevent CORS canvas tainting
  const getSafeImgUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("data:")) return url;
    return `${url}${url.includes('?') ? '&' : '?'}cb=${Date.now()}`;
  };

  return (
    <div className="space-y-8 pb-16">
      <div>
        <p className="font-label-sm text-label-sm uppercase text-secondary">Restaurant OS</p>
        <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary md:font-display-lg md:text-display-lg">QR Code Customizer</h1>
      </div>

      {error && (
        <div className="rounded-2xl border border-error-container bg-error-container/20 p-4 text-sm text-on-error-container">
          {error}
        </div>
      )}

      <AdminPanel title="Customize Your QR Poster" eyebrow="Print & Place" icon="palette">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-primary font-bold animate-pulse">Loading designs...</div>
          </div>
        ) : qrData && restaurant ? (
          <div className="space-y-10">

            {/* Top Bar (Download Button) */}
            <div className="flex justify-between items-center bg-surface-container-lowest p-4 rounded-3xl border border-outline-variant/30 shadow-sm relative">
              <div className="text-sm font-bold text-on-surface ml-2">Preview</div>
              
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  disabled={isDownloadingPng || isDownloadingPdf}
                  className="px-6 py-3 bg-primary text-white font-bold rounded-xl flex items-center gap-2 shadow-lg hover:opacity-90 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {(isDownloadingPng || isDownloadingPdf) ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <MaterialIcon name="download" />
                  )}
                  {(isDownloadingPng || isDownloadingPdf) ? "Generating..." : "Download"}
                  <MaterialIcon name="arrow_drop_down" className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setIsDropdownOpen(false)}
                    ></div>
                    <div className="absolute top-full mt-2 right-0 bg-white border border-outline-variant shadow-xl rounded-xl overflow-hidden flex flex-col w-56 z-50">
                      <button 
                        onClick={handleDownloadPng}
                        className="px-4 py-4 text-left hover:bg-surface-container-low font-bold text-sm text-on-surface flex items-center gap-3 transition-colors cursor-pointer border-b border-outline-variant/30"
                      >
                        <MaterialIcon name="image" className="text-primary text-[20px]" />
                        Download as PNG
                      </button>
                      <button 
                        onClick={handleDownloadPdf}
                        className="px-4 py-4 text-left hover:bg-surface-container-low font-bold text-sm text-on-surface flex items-center gap-3 transition-colors cursor-pointer"
                      >
                        <MaterialIcon name="picture_as_pdf" className="text-error text-[20px]" />
                        Download as PDF
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Poster Preview Area */}
            {/* We use a fixed size 400x500 box that scales down on mobile to prevent clipping issues */}
            <div className="flex justify-center w-full overflow-hidden">
              <div className="transform scale-[0.75] sm:scale-100 origin-top h-[375px] sm:h-[500px] w-full flex justify-center">
                
                <div 
                  ref={posterRef}
                  style={{ backgroundColor: bgColor }}
                  className={`w-[400px] h-[500px] shrink-0 relative overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.15)] transition-all duration-500`}
                >
                  {/* Design 0: Minimalist */}
                  {activeDesign === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                      <div className={`p-4 border-2 ${borderColor} rounded-2xl mb-8 bg-white`}>
                        <img src={qrData.dataUrl} alt="QR" className="w-48 h-48 sm:w-56 sm:h-56 object-contain" />
                      </div>
                      <h2 className={`text-2xl font-black ${textColor} tracking-tight mb-2 uppercase`}>Scan for Menu</h2>
                      <p className={`${subTextColor} font-medium text-sm`}>{qrData.url}</p>
                    </div>
                  )}

                  {/* Design 1: Branded Focus */}
                  {activeDesign === 1 && (
                    <div className={`absolute inset-0 flex flex-col items-center justify-between p-8 border-[12px] border-primary/20`}>
                      <div className="flex flex-col items-center mt-4">
                        {restaurant.logoImage ? (
                          <img src={getSafeImgUrl(restaurant.logoImage)} alt="Logo" className="w-20 h-20 rounded-full object-cover mb-4 shadow-sm border-2 border-white bg-white" crossOrigin="anonymous" />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <MaterialIcon name="restaurant" className="text-primary text-3xl" />
                          </div>
                        )}
                        <h2 className={`text-3xl font-black ${textColor} tracking-tight text-center leading-none`}>{restaurant.name}</h2>
                      </div>
                      
                      <div className="p-3 bg-white rounded-2xl shadow-xl shadow-black/5 mt-6 mb-6">
                        <img src={qrData.dataUrl} alt="QR" className="w-48 h-48 object-contain" />
                      </div>
                      
                      <div className="bg-primary text-white w-[120%] py-4 text-center transform -rotate-2">
                        <p className="font-bold tracking-widest uppercase text-sm">Scan to Order</p>
                      </div>
                    </div>
                  )}

                  {/* Design 2: Full Info Details */}
                  {activeDesign === 2 && (
                    <div className={`absolute inset-0 flex flex-col items-center p-8 border-x-4 border-b-4 ${borderColor}`}>
                      <div className={`w-full bg-primary absolute top-0 left-0 h-4`}></div>
                      <div className={`w-full border-b border-primary/30 pb-4 mt-6 mb-6 flex items-center justify-center gap-3`}>
                        {restaurant.logoImage && (
                          <img src={getSafeImgUrl(restaurant.logoImage)} alt="Logo" className="w-12 h-12 rounded-lg object-cover bg-white" crossOrigin="anonymous" />
                        )}
                        <h2 className={`text-2xl font-black ${textColor} tracking-tight truncate`}>{restaurant.name}</h2>
                      </div>
                      
                      <h3 className={`text-primary font-bold tracking-widest uppercase text-sm mb-4`}>View Our Menu</h3>
                      
                      <div className="bg-white p-2 rounded-xl shadow-sm mb-auto">
                        <img src={qrData.dataUrl} alt="QR" className="w-52 h-52 object-contain" />
                      </div>
                      
                      <div className={`w-full p-4 rounded-xl text-center mt-6 ${isDarkBg ? 'bg-white/10' : 'bg-black/5'}`}>
                        {restaurant.address && (
                          <p className={`text-xs ${subTextColor} font-medium mb-1 line-clamp-2`}>
                            <MaterialIcon name="location_on" className="text-[12px] align-middle mr-1" />
                            {restaurant.address}
                          </p>
                        )}
                        {restaurant.phone && (
                          <p className={`text-xs ${textColor} font-bold mt-2`}>
                            <MaterialIcon name="call" className="text-[12px] align-middle mr-1" />
                            {restaurant.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Design 3: Vibrant Bold */}
                  {activeDesign === 3 && (
                    <div className={`absolute inset-0 flex flex-col items-center justify-center p-8 overflow-hidden`}>
                      <div className="absolute top-[-50px] left-[-50px] w-48 h-48 bg-primary/20 rounded-full blur-3xl"></div>
                      <div className="absolute bottom-[-50px] right-[-50px] w-48 h-48 bg-blue-500/20 rounded-full blur-3xl"></div>
                      
                      <h2 className={`text-3xl font-black ${textColor} tracking-tight mb-2 z-10 text-center uppercase`}>{restaurant.name}</h2>
                      <p className={`text-primary font-black tracking-widest uppercase text-xs mb-8 z-10 bg-primary/10 px-4 py-1 rounded-full`}>Smart Menu</p>
                      
                      <div className={`p-4 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.1)] z-10 mb-8 border-[6px] border-primary/50 bg-white`}>
                        <img src={qrData.dataUrl} alt="QR" className="w-48 h-48 object-contain" />
                      </div>
                      
                      <p className={`${textColor} text-xs font-bold z-10 px-6 py-3 rounded-full border ${borderColor} backdrop-blur-md`}>
                        <MaterialIcon name="qr_code_scanner" className="text-[14px] align-middle mr-2 text-primary" />
                        Point your camera here
                      </p>
                    </div>
                  )}

                  {/* Design 4: Elegant Classic */}
                  {activeDesign === 4 && (
                    <div className={`absolute inset-0 flex flex-col items-center justify-center p-8 border-[16px] ${borderColor}`}>
                      <div className={`border border-primary/40 w-full h-full absolute inset-0 m-4`}></div>
                      
                      <h3 className={`text-xs font-medium tracking-[0.3em] uppercase ${subTextColor} mb-4 z-10`}>Welcome to</h3>
                      <h2 className={`text-3xl font-serif font-black ${textColor} tracking-tight mb-8 z-10 text-center italic`}>
                        {restaurant.name}
                      </h2>
                      
                      <div className="bg-white p-2 z-10">
                        <img src={qrData.dataUrl} alt="QR" className="w-56 h-56 object-contain" />
                      </div>
                      
                      <div className="flex items-center justify-center gap-4 w-full mt-10 z-10">
                        <div className={`h-px w-10 ${isDarkBg ? 'bg-white/30' : 'bg-black/20'}`}></div>
                        <MaterialIcon name="restaurant_menu" className={subTextColor} />
                        <div className={`h-px w-10 ${isDarkBg ? 'bg-white/30' : 'bg-black/20'}`}></div>
                      </div>
                    </div>
                  )}

                  {/* Design 5: Playful Pop */}
                  {activeDesign === 5 && (
                    <div className={`absolute inset-0 flex flex-col items-center p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] ${isDarkBg ? 'from-primary/20 via-black to-black' : 'from-primary/10 via-transparent to-transparent'}`}>
                      <div className="w-full h-24 bg-primary/20 absolute top-0 left-0 rounded-b-full shadow-inner"></div>
                      <h2 className={`text-3xl font-black ${textColor} tracking-tight mt-10 mb-2 z-10 text-center drop-shadow-md`}>
                        {restaurant.name}
                      </h2>
                      <div className={`px-4 py-1 bg-primary text-white rounded-xl font-bold text-sm mb-8 z-10 shadow-lg transform rotate-2`}>Let's Eat!</div>
                      <div className="bg-white p-3 rounded-[32px] z-10 shadow-xl border-4 border-primary">
                        <img src={qrData.dataUrl} alt="QR" className="w-48 h-48 object-contain rounded-2xl" />
                      </div>
                    </div>
                  )}

                  {/* Design 6: Modern Split */}
                  {activeDesign === 6 && (
                    <div className={`absolute inset-0 flex flex-col`}>
                      <div className="flex-1 bg-primary flex flex-col items-center justify-center p-8 text-white">
                        {restaurant.logoImage ? (
                          <img src={getSafeImgUrl(restaurant.logoImage)} alt="Logo" className="w-16 h-16 rounded-full object-cover shadow-sm bg-white mb-2" crossOrigin="anonymous" />
                        ) : (
                          <MaterialIcon name="restaurant" className="text-4xl mb-2" />
                        )}
                        <h2 className="text-3xl font-black tracking-tight text-center leading-tight">{restaurant.name}</h2>
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
                        <div className="absolute top-[-40px] bg-white p-2 rounded-xl shadow-xl">
                          <img src={qrData.dataUrl} alt="QR" className="w-40 h-40 object-contain" />
                        </div>
                        <p className={`mt-24 ${subTextColor} font-bold text-sm tracking-widest uppercase`}>Scan For Menu</p>
                      </div>
                    </div>
                  )}

                  {/* Design 7: Rustic Charm */}
                  {activeDesign === 7 && (
                    <div className={`absolute inset-0 flex flex-col items-center justify-center p-10 border-[8px] ${isDarkBg ? 'border-dashed border-white/20' : 'border-dashed border-[#8B4513]/30'}`}>
                      <MaterialIcon name="local_dining" className={`text-4xl ${isDarkBg ? 'text-white/50' : 'text-[#8B4513]/50'} mb-4`} />
                      <h2 className={`text-4xl font-serif font-bold ${isDarkBg ? 'text-white' : 'text-[#8B4513]'} tracking-tight mb-8 z-10 text-center`}>
                        {restaurant.name}
                      </h2>
                      <div className={`bg-white p-4 z-10 shadow-md ${isDarkBg ? '' : 'sepia-[.3]'}`}>
                        <img src={qrData.dataUrl} alt="QR" className="w-48 h-48 object-contain mix-blend-multiply" />
                      </div>
                      <p className={`mt-8 ${isDarkBg ? 'text-white/70' : 'text-[#8B4513]/70'} font-serif italic text-lg`}>Experience the taste.</p>
                    </div>
                  )}

                </div>
              </div>
            </div>
            
            {/* Controls Section (Moved Below Poster) */}
            <div className="flex flex-col items-center justify-center gap-6 p-6 bg-surface-container-lowest rounded-3xl border border-outline-variant/30 shadow-sm">
              
              {/* Arrow Selection UI */}
              <div className="w-full flex items-center justify-center gap-6">
                <button 
                  onClick={handlePrevDesign}
                  className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center hover:bg-primary hover:text-white transition-colors border border-outline-variant shadow-sm text-on-surface cursor-pointer"
                >
                  <MaterialIcon name="chevron_left" className="text-2xl" />
                </button>
                
                <div className="flex flex-col items-center min-w-[160px]">
                  <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Style {activeDesignIndex + 1} of 8</p>
                  <h3 className="font-black text-xl text-on-surface">{designs[activeDesignIndex].name}</h3>
                </div>

                <button 
                  onClick={handleNextDesign}
                  className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center hover:bg-primary hover:text-white transition-colors border border-outline-variant shadow-sm text-on-surface cursor-pointer"
                >
                  <MaterialIcon name="chevron_right" className="text-2xl" />
                </button>
              </div>

              <div className="w-full h-px bg-outline-variant/30"></div>

              {/* Color Palette UI */}
              <div className="w-full flex flex-col items-center">
                <p className="text-sm font-bold text-on-surface mb-3">Choose Background Color</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setBgColor(c)}
                      style={{ backgroundColor: c }}
                      className={`w-10 h-10 rounded-full border-2 transition-transform cursor-pointer ${
                        bgColor === c ? "border-primary scale-110 shadow-md" : "border-outline-variant/50 hover:scale-105"
                      }`}
                      title={c}
                    />
                  ))}
                </div>
              </div>
              
            </div>

          </div>
        ) : (
          <div className="text-center py-12 text-on-surface-variant font-bold">
            QR Code data is unavailable.
          </div>
        )}
      </AdminPanel>
    </div>
  );
}
