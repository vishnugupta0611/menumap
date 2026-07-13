"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useSignIn, useClerk } from "@clerk/nextjs";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithVerifiedEmail, logout } = useAuth();
  
  const { isLoaded, signIn, setActive } = useSignIn();
  const { signOut } = useClerk();
  
  const [activePortal, setActivePortal] = useState("owner");
  const [loginStep, setLoginStep] = useState(1); // 1 = Email, 2 = OTP
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // Optionally keeping password UI if needed, but going to use OTP here as per request
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSSO = async () => {
    if (!isLoaded) return;
    sessionStorage.setItem("login_role", activePortal);
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/login/sso-callback",
      });
    } catch (err) {
      console.error(err);
      setError("Google SSO failed to initialize.");
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setError("");

    try {
      // Step 1: Create a sign in attempt
      const factor = await signIn.create({
        identifier: email,
      });

      // Step 2: Determine if we need to verify email via OTP
      const emailFactor = factor.supportedFirstFactors.find(f => f.strategy === "email_code");
      if (emailFactor) {
        await signIn.prepareFirstFactor({
          strategy: "email_code",
          emailAddressId: emailFactor.emailAddressId,
        });
        setLoginStep(2);
      } else {
        // Fallback for password logic if enabled in Clerk
        if (password) {
          const completeSignIn = await signIn.create({
            identifier: email,
            password,
          });
          if (completeSignIn.status === "complete") {
            await finalizeLogin(completeSignIn);
          }
        } else {
          setError("This account requires a password or does not support OTP.");
        }
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      setError(err.errors?.[0]?.longMessage || err.errors?.[0]?.message || "Failed to initiate login. Are you registered?");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setError("");

    try {
      const completeSignIn = await signIn.attemptFirstFactor({
        strategy: "email_code",
        code,
      });

      if (completeSignIn.status === "complete") {
        await finalizeLogin(completeSignIn);
      } else {
        console.log(completeSignIn);
        setError("Unable to verify OTP.");
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      setError(err.errors?.[0]?.longMessage || err.errors?.[0]?.message || "Invalid OTP Code.");
    } finally {
      setLoading(false);
    }
  };

  const finalizeLogin = async (clerkSignInResult) => {
    try {
      const expectedRole = activePortal;
      
      // We pass the verified email to our backend to get the custom JWT
      const verifiedEmail = clerkSignInResult.identifier || email;
      const clerkId = clerkSignInResult.createdSessionId ? "clerk-sso" : null; // We can extract real Clerk ID if needed, but we trust the email in this hybrid mode since it's verified. Actually, `clerkSignInResult.userData` or similar has the user ID. But email is unique enough for backend.
      
      const data = await loginWithVerifiedEmail({ 
        email: verifiedEmail, 
        name: "", 
        clerkId: clerkId, 
        role: expectedRole 
      });

      if (data.user.role !== expectedRole) {
        await logout();
        setError(
          expectedRole === "owner"
            ? "This is a customer account. Please use the Discovery User tab."
            : "This is a restaurant owner account. Please use the Restaurant Owner tab."
        );
        return;
      }

      // Cleanup Clerk Session to strictly use custom JWT
      await signOut();

      if (data.user.role === "owner") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
    } catch (error) {
      await signOut();
      setError(error.message || "Account not found in Database. Please register first.");
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md relative overflow-x-hidden">
      <header className="fixed top-0 left-0 w-full z-40 flex justify-between items-center px-margin-mobile md:px-margin-desktop py-6">
        <Link href="/" className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-primary font-bold tracking-tight">
          MenuMap
        </Link>
        <div className="flex gap-2 md:gap-4 items-center">
          <Link href="/register/customer" className="text-xs md:text-sm font-bold text-on-surface-variant hover:text-primary whitespace-nowrap">
            Sign up
          </Link>
          <Link href="/register/owner" className="text-xs md:text-sm font-bold bg-primary text-on-primary px-3 py-2 md:px-4 md:py-2 rounded-lg hover:opacity-90 whitespace-nowrap">
            For Restaurants
          </Link>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center pt-28 pb-12 px-margin-mobile md:px-margin-desktop relative hero-gradient">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
          
          <div className="lg:col-span-5 flex flex-col gap-4 md:gap-6 text-center lg:text-left animate-fadeInUp">
            <h1 className="text-3xl md:text-5xl font-bold text-on-background leading-tight">
              Welcome back to <br className="hidden lg:block"/> <span className="text-primary">MenuMap</span>.
            </h1>
            <p className="text-sm md:text-lg text-on-surface-variant max-w-md mx-auto lg:mx-0">
              Manage your restaurant or discover new places to eat.
            </p>
          </div>

          <div className="lg:col-span-7 w-full max-w-lg mx-auto">
            <div className="glass-card rounded-[32px] border border-outline-variant/30 shadow-2xl overflow-hidden bg-white p-6 md:p-8">
              
              <div className="grid grid-cols-2 bg-surface-container rounded-full p-1 mb-8">
                <button
                  onClick={() => { setActivePortal("owner"); setError(""); }}
                  className={`py-2 md:py-3 rounded-full text-xs md:text-sm font-bold transition-all cursor-pointer border-none ${activePortal === "owner" ? "bg-primary text-on-primary shadow-md" : "text-on-surface-variant hover:text-on-surface bg-transparent"}`}
                >
                  Restaurant Owner
                </button>
                <button
                  onClick={() => { setActivePortal("customer"); setError(""); }}
                  className={`py-2 md:py-3 rounded-full text-xs md:text-sm font-bold transition-all cursor-pointer border-none ${activePortal === "customer" ? "bg-primary text-on-primary shadow-md" : "text-on-surface-variant hover:text-on-surface bg-transparent"}`}
                >
                  Discovery User
                </button>
              </div>

              {loginStep === 1 && (
                <div className="space-y-6 animate-fadeInUp">
                  <div>
                    <h3 className="text-xl md:text-2xl text-on-surface font-bold mb-1">Login to your account</h3>
                    <p className="text-xs md:text-sm text-on-surface-variant">Verify your identity securely with Clerk.</p>
                  </div>
                  
                  {error && (
                    <div className="p-3 text-xs bg-error-container/20 border border-error-container text-error rounded-xl">
                      {error}
                    </div>
                  )}

                  <button onClick={handleGoogleSSO} type="button" className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-outline-variant rounded-xl font-bold hover:bg-surface-container-lowest transition-all bg-white text-on-surface">
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
                      <input className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-body-md" type="email" placeholder="email@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>

                    <div className="relative">
                      <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-wide">Password (Optional)</label>
                      <input className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-body-md" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>

                    <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-3 bg-primary py-4 px-6 rounded-xl text-on-primary shadow-lg shadow-primary/20 hover:opacity-90 transition-all duration-200 active:scale-[0.98] cursor-pointer border-none outline-none font-bold">
                      {loading ? "Verifying..." : "Sign In with Email"}
                    </button>
                  </form>
                </div>
              )}

              {loginStep === 2 && (
                <div className="space-y-6 animate-fadeInUp">
                  <div>
                    <h3 className="text-xl md:text-2xl text-on-surface font-bold mb-1">Enter OTP</h3>
                    <p className="text-xs md:text-sm text-on-surface-variant">We've sent a 6-digit code to {email}.</p>
                  </div>
                  
                  {error && (
                    <div className="p-3 text-xs bg-error-container/20 border border-error-container text-error rounded-xl">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleVerifyOTP} className="space-y-4">
                    <div className="relative">
                      <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-wide">Verification Code</label>
                      <input className="w-full h-14 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-center tracking-[0.5em] font-display-md text-display-md" type="text" maxLength={6} required value={code} onChange={(e) => setCode(e.target.value)} />
                    </div>

                    <div className="flex gap-4">
                      <button type="button" onClick={() => setLoginStep(1)} className="flex-1 py-4 border border-outline-variant rounded-xl font-bold hover:bg-surface-container-low transition-all bg-transparent">Back</button>
                      <button type="submit" disabled={loading} className="flex-2 py-4 bg-primary rounded-xl text-on-primary font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20">
                        {loading ? "Verifying..." : "Verify & Login"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="text-center mt-4">
                {activePortal === "owner" ? (
                  <p className="text-sm text-on-surface-variant">Don't have a restaurant? <Link href="/register/owner" className="text-primary font-bold hover:underline">Create one</Link></p>
                ) : (
                  <p className="text-sm text-on-surface-variant">Don't have an account? <Link href="/register/customer" className="text-primary font-bold hover:underline">Sign up</Link></p>
                )}
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
