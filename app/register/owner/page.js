"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import MaterialIcon from "@/components/stitch/MaterialIcon";
import { useSignUp, useSignIn, useClerk } from "@clerk/nextjs";

export default function OwnerRegisterPage() {
  const router = useRouter();
  const { registerOwner } = useAuth();
  
  // Clerk Hooks
  const { isLoaded: isSignUpLoaded, signUp, setActive } = useSignUp();
  const { signIn } = useSignIn();
  const { signOut } = useClerk();
  
  // Force sign out of Clerk when arriving at the register page
  // to ensure a clean slate and avoid "You're already signed in" errors.
  useEffect(() => {
    if (isSignUpLoaded) {
      signOut();
    }
  }, [isSignUpLoaded, signOut]);

  useEffect(() => {
    const authError = sessionStorage.getItem("auth_error");
    if (authError) {
      setSignupError(authError);
      sessionStorage.removeItem("auth_error");
    }
  }, []);
  
  // Restaurant Signup Multi-step state
  const [signupStep, setSignupStep] = useState(1);
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  // Step 1: Owner Details
  const [ownerName, setOwnerName] = useState("");

  // Step 2: Restaurant Profile
  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantCity, setRestaurantCity] = useState("kanpur");
  const [restaurantCuisines, setRestaurantCuisines] = useState("");
  const [isVegOnly, setIsVegOnly] = useState(false);

  // Step 3: Location Coordinates
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState("");

  // Step 4: Clerk Auth Details
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  
  // Step 5: OTP Code
  const [code, setCode] = useState("");

  // Save current form state to sessionStorage before Google OAuth
  const saveStateToSession = () => {
    const onboardingData = {
      onboarding_ownerName: ownerName,
      onboarding_restaurantName: restaurantName,
      onboarding_restaurantCity: restaurantCity,
      onboarding_restaurantCuisines: restaurantCuisines,
      onboarding_lat: lat,
      onboarding_lng: lng,
    };

    Object.entries(onboardingData).forEach(([key, value]) => {
      sessionStorage.setItem(key, value);
      localStorage.setItem(key, value);
    });
    sessionStorage.setItem("oauth_flow", "owner-register");
    localStorage.setItem("oauth_flow", "owner-register");
  };

  // Handle Google OAuth
  const handleGoogleSSO = async () => {
    if (!isSignUpLoaded) return;
    if (!lat || !lng) {
      setSignupError("Please fetch your restaurant location before continuing with Google.");
      setSignupStep(3);
      return;
    }
    setIsGoogleLoading(true);
    saveStateToSession();
    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/register/owner/sso-callback",
      });
    } catch (err) {
      console.error(err);
      setSignupError("Google SSO failed to initialize.");
      setIsGoogleLoading(false);
    }
  };

  // Handle Email/Password creation (Step 4 -> 5)
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!isSignUpLoaded) return;
    setSignupLoading(true);
    setSignupError("");
    
    try {
      await signUp.create({
        emailAddress,
        password,
        firstName: ownerName.split(" ")[0] || "Owner",
        lastName: ownerName.split(" ").slice(1).join(" ") || "Name",
      });

      // Send the OTP
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      
      setPendingVerification(true);
      setSignupStep(5); // Move to OTP step
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      setSignupError(err.errors?.[0]?.longMessage || err.errors?.[0]?.message || "Failed to create account. Email might be in use.");
    } finally {
      setSignupLoading(false);
    }
  };

  // Handle OTP Verification (Step 5 -> Finish)
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!isSignUpLoaded) return;
    setSignupLoading(true);
    setSignupError("");

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status !== "complete") {
        console.log(JSON.stringify(completeSignUp, null, 2));
        setSignupError("Incomplete setup. Missing fields: " + (completeSignUp.missingFields?.join(", ") || completeSignUp.status));
        return;
      }

      // 1. Clerk Verification Success! Grab the Clerk ID and Email
      const clerkId = completeSignUp.createdUserId;
      const verifiedEmail = completeSignUp.emailAddress;

      // 2. We explicitly sign out of Clerk because we use a custom JWT in cookies
      await signOut();

      // 3. Register user in our MongoDB via Express API
      await registerOwner({
        name: ownerName,
        email: verifiedEmail || emailAddress,
        password: password, // Still sending to DB just in case, though optional
        clerkId: clerkId,
        restaurantName,
        city: restaurantCity,
        cuisine: restaurantCuisines,
        lat,
        lng,
      });

      // 4. Redirect to dashboard
      router.push("/admin/dashboard");

    } catch (err) {
      console.error(err);
      setSignupError(err.errors?.[0]?.longMessage || err.errors?.[0]?.message || err.message || "Invalid OTP Code.");
    } finally {
      setSignupLoading(false);
    }
  };

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
        setSignupError(`Could not fetch location: ${error.message}. Please allow location access and try again.`);
      }
    );
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
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">Step {signupStep} of 5</span>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
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
                    </div>
                    <button onClick={() => { if (!ownerName) { alert("Please enter your name"); return; } setSignupStep(2); }} className="w-full py-4 bg-primary text-on-primary rounded-xl font-bold cursor-pointer hover:opacity-90 transition-all border-none outline-none mt-4">
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
                      <button onClick={() => { if (!restaurantName || !restaurantCuisines) { alert("Please fill restaurant name & cuisines"); return; } setSignupStep(3); }} className="flex-2 py-4 bg-primary text-on-primary rounded-xl font-bold cursor-pointer hover:opacity-90 transition-all border-none outline-none">Next: Location</button>
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
                      <button onClick={() => { if (!lat || !lng) { setSignupError("Please fetch your restaurant location before continuing."); return; } setSignupError(""); setSignupStep(4); }} className="flex-2 py-4 bg-primary text-on-primary rounded-xl font-bold cursor-pointer hover:opacity-90 transition-all border-none outline-none">
                        Next: Secure Account
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 4: Clerk Auth (Email/Pass or Google SSO) */}
                {signupStep === 4 && (
                  <div className="space-y-4 animate-reveal">
                    <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">Secure your Account</h3>
                    <p className="text-sm text-on-surface-variant">Choose how you want to sign in to your MenuMap dashboard.</p>
                    
                    <button onClick={handleGoogleSSO} disabled={isGoogleLoading} type="button" className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-outline-variant rounded-xl font-bold hover:bg-surface-container-lowest transition-all bg-white text-on-surface cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed">
                      {isGoogleLoading ? (
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                      )}
                      {isGoogleLoading ? "Connecting to Google..." : "Continue with Google"}
                    </button>

                    <div className="flex items-center gap-4 my-4">
                      <div className="h-px bg-outline-variant flex-1"></div>
                      <span className="text-xs text-on-surface-variant font-bold">OR</span>
                      <div className="h-px bg-outline-variant flex-1"></div>
                    </div>

                    <div id="clerk-captcha"></div>

                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant mb-2">Email Address</label>
                        <input required className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary" type="email" placeholder="marcus@villa.com" value={emailAddress} onChange={(e) => setEmailAddress(e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant mb-2">Password</label>
                        <input required className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary" type="password" placeholder="SecurePass123!" value={password} onChange={(e) => setPassword(e.target.value)} />
                      </div>
                      
                      <div className="flex gap-4 mt-4">
                        <button type="button" onClick={() => setSignupStep(3)} className="flex-1 py-4 border border-outline-variant text-on-surface rounded-xl font-bold cursor-pointer hover:bg-surface-container-low transition-all bg-transparent">Back</button>
                        <button type="submit" disabled={signupLoading || !isSignUpLoaded} className="flex-2 py-4 bg-primary text-on-primary rounded-xl font-bold cursor-pointer hover:opacity-90 transition-all border-none outline-none">
                          {signupLoading ? "Sending OTP..." : "Continue with Email"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Step 5: OTP Verification */}
                {signupStep === 5 && (
                  <div className="space-y-4 animate-reveal">
                    <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">Verify your Email</h3>
                    <p className="text-sm text-on-surface-variant">We've sent a 6-digit verification code to <strong>{emailAddress}</strong>.</p>
                    
                    <form onSubmit={handleVerifyOTP} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant mb-2">Verification Code</label>
                        <input required className="w-full h-14 px-4 text-center tracking-[0.5em] font-display-md text-display-md rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary" type="text" maxLength={6} placeholder="------" value={code} onChange={(e) => setCode(e.target.value)} />
                      </div>
                      
                      <div className="flex gap-4 mt-4">
                        <button type="button" onClick={() => setSignupStep(4)} className="flex-1 py-4 border border-outline-variant text-on-surface rounded-xl font-bold cursor-pointer hover:bg-surface-container-low transition-all bg-transparent">Change Email</button>
                        <button type="submit" disabled={signupLoading || !isSignUpLoaded} className="flex-2 py-4 bg-primary text-on-primary rounded-xl font-bold cursor-pointer hover:opacity-90 transition-all border-none outline-none">
                          {signupLoading ? "Verifying..." : "Verify & Complete Setup"}
                        </button>
                      </div>
                    </form>
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
