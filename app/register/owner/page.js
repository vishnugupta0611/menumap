"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import MaterialIcon from "@/components/stitch/MaterialIcon";

export default function OwnerRegisterPage() {
  const router = useRouter();
  const { registerOwner } = useAuth();
  
  // Restaurant Signup Multi-step state
  const [signupStep, setSignupStep] = useState(1);
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState("");
  
  // Step 1: Owner Details
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");

  // Step 2: Restaurant Profile
  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantCity, setRestaurantCity] = useState("kanpur");
  const [restaurantCuisines, setRestaurantCuisines] = useState("");
  const [restaurantStory, setRestaurantStory] = useState("");
  const [isVegOnly, setIsVegOnly] = useState(false);

  // Step 3: Location Coordinates
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState("");

  // Geolocation API fetcher
  const handleFetchLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setFetchingLocation(true);
    setLocationSuccess("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude.toFixed(6));
        setLng(position.coords.longitude.toFixed(6));
        setFetchingLocation(false);
        setLocationSuccess("Location fetched successfully!");
      },
      (error) => {
        console.error(error);
        setFetchingLocation(false);
        alert(`Could not fetch location: ${error.message}. Using default coordinates.`);
        setLat("26.4499");
        setLng("80.3319");
      }
    );
  };

  // Handle Owner Registration
  const handleOwnerRegister = async (e) => {
    e.preventDefault();
    setSignupLoading(true);
    setSignupError("");

    try {
      await registerOwner({
        name: ownerName,
        email: ownerEmail,
        password: ownerPassword,
        restaurantName,
        city: restaurantCity,
        cuisine: restaurantCuisines,
      });

      router.push("/admin/dashboard");
    } catch (err) {
      console.error(err);
      setSignupError(err.message || "Failed to register.");
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md relative overflow-x-hidden">
      <header className="fixed top-0 left-0 w-full z-40 flex justify-between items-center px-margin-mobile md:px-margin-desktop py-6">
        <Link href="/" className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-primary font-bold tracking-tight">
          MenuMap
        </Link>
        <Link href="/login" className="text-sm font-bold text-on-surface-variant hover:text-primary">
          Login
        </Link>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center pt-28 pb-12 px-margin-mobile md:px-margin-desktop relative hero-gradient">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
          
          <div className="lg:col-span-5 flex flex-col gap-6 text-center lg:text-left animate-fadeInUp">
            <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-on-background leading-tight">
              Create your <span className="text-primary">Restaurant</span> OS.
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md mx-auto lg:mx-0">
              Set up your digital presence and start managing orders in minutes.
            </p>
          </div>

          <div className="lg:col-span-7 w-full max-w-lg mx-auto">
            <div className="glass-card rounded-[32px] border border-outline-variant/30 shadow-2xl overflow-hidden bg-white p-6 md:p-8">
              
              <div className="space-y-6 animate-fadeInUp">
                
                {/* Step Indicator Bullets */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">Step {signupStep} of 3</span>
                  <div className="flex gap-1.5">
                    {[1, 2, 3].map((s) => (
                      <span key={s} className={`w-4 h-1.5 rounded-full transition-all ${signupStep >= s ? "bg-primary w-6" : "bg-surface-container-high"}`} />
                    ))}
                  </div>
                </div>

                {signupError && (
                  <div className="p-3 text-xs bg-error-container/20 border border-error-container text-error rounded-xl">
                    {signupError}
                  </div>
                )}

                {/* Step 1: Owner Details Form */}
                {signupStep === 1 && (
                  <div className="space-y-4 animate-reveal">
                    <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">Tell us about yourself</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant mb-2">Owner Name</label>
                        <input className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary" type="text" placeholder="Marcus Aurelius" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant mb-2">Owner Email</label>
                        <input className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary" type="email" placeholder="marcus@villa.com" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant mb-2">Password</label>
                        <input className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary" type="password" placeholder="SecurePass123!" value={ownerPassword} onChange={(e) => setOwnerPassword(e.target.value)} />
                      </div>
                    </div>
                    <button onClick={() => { if (!ownerName || !ownerEmail || !ownerPassword) { alert("Please fill all details"); return; } setSignupStep(2); }} className="w-full py-4 bg-primary text-on-primary rounded-xl font-bold cursor-pointer hover:opacity-90 transition-all border-none outline-none mt-4">
                      Next: Restaurant Profile
                    </button>
                  </div>
                )}

                {/* Step 2: Restaurant Profile Details */}
                {signupStep === 2 && (
                  <div className="space-y-4 animate-reveal">
                    <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">Restaurant Details</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant mb-2">Restaurant Name</label>
                        <input className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary" type="text" placeholder="Food Villa" value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-on-surface-variant mb-2">City</label>
                          <input className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary" type="text" placeholder="kanpur" value={restaurantCity} onChange={(e) => setRestaurantCity(e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-on-surface-variant mb-2">Type</label>
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            <button type="button" onClick={() => setIsVegOnly(true)} className={`py-2 text-xs font-bold rounded-lg border cursor-pointer ${isVegOnly ? "border-primary bg-primary/5 text-primary" : "border-outline-variant bg-white"}`}>Veg Only</button>
                            <button type="button" onClick={() => setIsVegOnly(false)} className={`py-2 text-xs font-bold rounded-lg border cursor-pointer ${!isVegOnly ? "border-primary bg-primary/5 text-primary" : "border-outline-variant bg-white"}`}>Veg & Non-Veg</button>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant mb-2">Cuisines (comma separated)</label>
                        <input className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary" type="text" placeholder="North Indian, Chinese, Cafe" value={restaurantCuisines} onChange={(e) => setRestaurantCuisines(e.target.value)} />
                      </div>
                    </div>
                    <div className="flex gap-4 mt-4">
                      <button onClick={() => setSignupStep(1)} className="flex-1 py-4 border border-outline-variant text-on-surface rounded-xl font-bold cursor-pointer hover:bg-surface-container-low transition-all bg-transparent">Back</button>
                      <button onClick={() => { if (!restaurantName || !restaurantCuisines) { alert("Please fill restaurant name & cuisines"); return; } setSignupStep(3); }} className="flex-2 py-4 bg-primary text-on-primary rounded-xl font-bold cursor-pointer hover:opacity-90 transition-all border-none outline-none">Next: Location Setup</button>
                    </div>
                  </div>
                )}

                {/* Step 3: Location Fetching */}
                {signupStep === 3 && (
                  <div className="space-y-4 animate-reveal">
                    <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">Storefront Geolocation</h3>
                    <p className="text-sm text-on-surface-variant">We need your restaurant's GPS coordinates to display it to discovery users nearby.</p>
                    
                    <div className="bg-surface-container p-6 rounded-2xl border border-outline-variant/30 flex flex-col items-center justify-center space-y-4 text-center">
                      <div className="w-16 h-16 rounded-full bg-primary-fixed text-primary flex items-center justify-center shadow-inner">
                        <MaterialIcon name="my_location" className="text-3xl" />
                      </div>
                      <button type="button" onClick={handleFetchLocation} disabled={fetchingLocation} className="px-6 py-3 bg-white border border-outline-variant text-on-surface rounded-xl font-bold cursor-pointer hover:border-primary hover:text-primary active:scale-95 transition-all flex items-center gap-2 shadow-sm font-semibold">
                        {fetchingLocation ? "Accessing GPS..." : "Fetch Current Location"}
                      </button>
                      
                      {locationSuccess && <p className="text-xs text-tertiary font-bold">{locationSuccess}</p>}
                    </div>

                    <div className="flex gap-4 mt-4">
                      <button onClick={() => setSignupStep(2)} className="flex-1 py-4 border border-outline-variant text-on-surface rounded-xl font-bold cursor-pointer hover:bg-surface-container-low transition-all bg-transparent">Back</button>
                      <button onClick={handleOwnerRegister} disabled={signupLoading} className="flex-2 py-4 bg-primary text-on-primary rounded-xl font-bold cursor-pointer hover:opacity-90 transition-all border-none outline-none">
                        {signupLoading ? "Creating OS..." : "Create Restaurant OS"}
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
