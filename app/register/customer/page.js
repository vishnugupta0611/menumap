"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useSignUp, useSignIn } from "@clerk/nextjs";

export default function CustomerRegisterPage() {
  const router = useRouter();
  const { registerCustomer } = useAuth();
  
  // Clerk Hooks
  const { isLoaded: isSignUpLoaded, signUp, setActive } = useSignUp();
  
  // Registration State
  const [signupStep, setSignupStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Step 1: User Details
  const [name, setName] = useState("");

  // Step 2: Auth Details
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  
  // Step 3: OTP Code
  const [code, setCode] = useState("");

  // Save current form state to sessionStorage before Google OAuth
  const saveStateToSession = () => {
    sessionStorage.setItem("onboarding_customerName", name);
  };

  const handleGoogleSSO = async () => {
    if (!isSignUpLoaded) return;
    saveStateToSession();
    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/register/customer/sso-callback",
      });
    } catch (err) {
      console.error(err);
      setError("Google SSO failed to initialize.");
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!isSignUpLoaded) return;
    if (!name) {
      setError("Please enter your name before continuing.");
      setSignupStep(1);
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      await signUp.create({
        emailAddress,
        password,
        firstName: name.split(" ")[0] || "User",
        lastName: name.split(" ").slice(1).join(" ") || "Name",
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      
      setSignupStep(3); // Move to OTP
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      setError(err.errors?.[0]?.longMessage || err.errors?.[0]?.message || "Failed to create account. Email might be in use or password is too weak.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!isSignUpLoaded) return;
    setLoading(true);
    setError("");

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status !== "complete") {
        console.log(JSON.stringify(completeSignUp, null, 2));
        setError("Incomplete setup. Missing fields: " + (completeSignUp.missingFields?.join(", ") || completeSignUp.status));
        return;
      }

      // Grab the Clerk ID and Email
      const clerkId = completeSignUp.createdUserId;
      const verifiedEmail = completeSignUp.emailAddress;

      // Register user in our MongoDB via Express API
      await registerCustomer({
        name,
        email: verifiedEmail || emailAddress,
        password, // optional in backend, passing it just in case
        clerkId,
      });

      // Redirect to discovery
      router.push("/");

    } catch (err) {
      console.error(err);
      setError(err.errors?.[0]?.longMessage || err.errors?.[0]?.message || err.message || "Invalid OTP Code.");
    } finally {
      setLoading(false);
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
              Discover great <span className="text-primary">food</span> around you.
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md mx-auto lg:mx-0">
              Sign up to explore digital menus, place orders, and save your favorite restaurants.
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

                {error && (
                  <div className="p-4 text-sm bg-error-container/20 border border-error-container text-error rounded-xl font-medium flex items-start gap-2">
                    <span className="material-symbols-outlined text-base mt-0.5">error</span>
                    <span>{error}</span>
                  </div>
                )}

                {/* Step 1: User Details Form */}
                {signupStep === 1 && (
                  <div className="space-y-4 animate-reveal">
                    <div>
                      <h3 className="font-headline-md text-headline-md text-on-surface font-semibold mb-2">Create an account</h3>
                      <p className="text-sm text-on-surface-variant">Join as a discovery user.</p>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-wide">Your Name</label>
                      <input className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-body-md" type="text" placeholder="e.g. Julian V." required value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    
                    <button onClick={() => { if (!name) { setError("Please enter your name"); return; } setError(""); setSignupStep(2); }} className="w-full py-4 bg-primary text-on-primary rounded-xl font-bold cursor-pointer hover:opacity-90 transition-all border-none outline-none mt-4">
                      Next: Secure Account
                    </button>
                  </div>
                )}

                {/* Step 2: Clerk Auth Form */}
                {signupStep === 2 && (
                  <div className="space-y-4 animate-reveal">
                    <div>
                      <h3 className="font-headline-md text-headline-md text-on-surface font-semibold mb-2">Secure your Account</h3>
                      <p className="text-sm text-on-surface-variant">Choose how you want to sign in.</p>
                    </div>
                    
                    <button onClick={handleGoogleSSO} type="button" className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-outline-variant rounded-xl font-bold hover:bg-surface-container-lowest transition-all bg-white text-on-surface cursor-pointer">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Continue with Google
                    </button>

                    <div className="flex items-center gap-4 my-4">
                      <div className="h-px bg-outline-variant flex-1"></div>
                      <span className="text-xs text-on-surface-variant font-bold">OR</span>
                      <div className="h-px bg-outline-variant flex-1"></div>
                    </div>

                    <div id="clerk-captcha"></div>

                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                      <div className="relative">
                        <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-wide">Email Address</label>
                        <input className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-body-md" type="email" placeholder="julian@example.com" required value={emailAddress} onChange={(e) => setEmailAddress(e.target.value)} />
                      </div>

                      <div className="relative">
                        <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-wide">Password</label>
                        <input className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-body-md" type="password" placeholder="SecurePass123!" required value={password} onChange={(e) => setPassword(e.target.value)} />
                      </div>
                      
                      <div className="flex gap-4 mt-4">
                        <button type="button" onClick={() => setSignupStep(1)} disabled={loading} className="flex-1 py-4 border border-outline-variant text-on-surface rounded-xl font-bold cursor-pointer hover:bg-surface-container-low transition-all bg-transparent">Back</button>
                        <button type="submit" disabled={loading || !isSignUpLoaded} className="flex-2 py-4 bg-primary text-on-primary rounded-xl font-bold cursor-pointer hover:opacity-90 transition-all border-none outline-none disabled:opacity-50">
                          {loading ? "Sending OTP..." : "Continue with Email"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Step 3: OTP Verification */}
                {signupStep === 3 && (
                  <div className="space-y-4 animate-reveal">
                    <div>
                      <h3 className="font-headline-md text-headline-md text-on-surface font-semibold mb-2">Verify your Email</h3>
                      <p className="text-sm text-on-surface-variant">We've sent a 6-digit verification code to <strong>{emailAddress}</strong>.</p>
                    </div>
                    
                    <form onSubmit={handleVerifyOTP} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-wide">Verification Code</label>
                        <input required className="w-full h-14 px-4 text-center tracking-[0.5em] font-display-md text-display-md rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary" type="text" maxLength={6} placeholder="------" value={code} onChange={(e) => setCode(e.target.value)} />
                      </div>
                      
                      <div className="flex gap-4 mt-4">
                        <button type="button" onClick={() => setSignupStep(2)} disabled={loading} className="flex-1 py-4 border border-outline-variant text-on-surface rounded-xl font-bold cursor-pointer hover:bg-surface-container-low transition-all bg-transparent">Change Email</button>
                        <button type="submit" disabled={loading || !isSignUpLoaded} className="flex-2 py-4 bg-primary text-on-primary rounded-xl font-bold cursor-pointer hover:opacity-90 transition-all border-none outline-none disabled:opacity-50">
                          {loading ? "Verifying..." : "Verify & Complete Setup"}
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
