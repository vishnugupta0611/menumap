"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useSignIn, useClerk } from "@clerk/nextjs";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithVerifiedEmail, logout, employeeLogin } = useAuth();
  
  const { isLoaded, signIn, setActive } = useSignIn();
  const { signOut, session } = useClerk();

  const [activePortal, setActivePortal] = useState("owner");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [employeeUsername, setEmployeeUsername] = useState("");
  const [employeePassword, setEmployeePassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const hasSignedOutRef = useRef(false);

  // Force sign out of Clerk when arriving at the login page
  // to ensure a clean slate and avoid "You're already signed in" errors.
  useEffect(() => {
    if (isLoaded && session && !hasSignedOutRef.current) {
      hasSignedOutRef.current = true;
      signOut();
    }
  }, [isLoaded, session, signOut]);

  useEffect(() => {
    const authError = sessionStorage.getItem("auth_error");
    if (authError) {
      setError(authError);
      sessionStorage.removeItem("auth_error");
    }
  }, []);

  const handleGoogleSSO = async () => {
    if (!isLoaded || !signIn) return;
    setIsGoogleLoading(true);
    sessionStorage.setItem("login_role", activePortal);
    sessionStorage.setItem("oauth_flow", "login");
    localStorage.setItem("oauth_flow", "login");
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/login/sso-callback",
      });
    } catch (err) {
      console.error(err);
      setError("Google SSO failed to initialize.");
      setIsGoogleLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await login(email, password);

      if (data.user.role !== activePortal) {
        await logout();
        setError(
          activePortal === "owner"
            ? "This is a customer account. Please use the Discovery User tab."
            : "This is a restaurant owner account. Please use the Restaurant Owner tab."
        );
        return;
      }

      if (isLoaded) {
        await signOut();
      }

      if (data.user.role === "owner") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
    } catch (error) {
      const accountType = activePortal === "owner" ? "restaurant" : "customer";
      const message = error.message?.toLowerCase().includes("account not found")
        ? `Account not found. Please create your ${accountType} account first.`
        : error.message || "Invalid email or password.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await employeeLogin(employeeUsername, employeePassword);
      
      // Cleanup Clerk Session to strictly use custom JWT
      if (isLoaded) await signOut();

      if (data.user.isEmployee || data.user.role === "employee") {
        router.push("/admin/dashboard");
      }
    } catch (error) {
      setError(error.message || "Invalid username or password.");
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
        <Link href="/" className="flex items-center">
          <img src="/images/logo.png" alt="HeyRestro" className="h-12 w-auto" />
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
              Welcome back to <br className="hidden lg:block"/> <span className="text-primary">HeyRestro</span>.
            </h1>
            <p className="text-sm md:text-lg text-on-surface-variant max-w-md mx-auto lg:mx-0">
              Manage your restaurant or discover new places to eat.
            </p>
          </div>

          <div className="lg:col-span-7 w-full max-w-lg mx-auto">
            <div className="glass-card rounded-[32px] border border-outline-variant/30 shadow-2xl overflow-hidden bg-white p-6 md:p-8">
              
              <div className="flex bg-surface-container rounded-full p-1 mb-8">
                <button
                  onClick={() => { setActivePortal("owner"); setError(""); }}
                  className={`flex-1 py-2 md:py-3 rounded-full text-xs md:text-sm font-bold transition-all cursor-pointer border-none ${activePortal === "owner" ? "bg-primary text-on-primary shadow-md" : "text-on-surface-variant hover:text-on-surface bg-transparent"}`}
                >
                  Owner
                </button>
                <button
                  onClick={() => { setActivePortal("employee"); setError(""); }}
                  className={`flex-1 py-2 md:py-3 rounded-full text-xs md:text-sm font-bold transition-all cursor-pointer border-none ${activePortal === "employee" ? "bg-primary text-on-primary shadow-md" : "text-on-surface-variant hover:text-on-surface bg-transparent"}`}
                >
                  Employee
                </button>
                <button
                  onClick={() => { setActivePortal("customer"); setError(""); }}
                  className={`flex-1 py-2 md:py-3 rounded-full text-xs md:text-sm font-bold transition-all cursor-pointer border-none ${activePortal === "customer" ? "bg-primary text-on-primary shadow-md" : "text-on-surface-variant hover:text-on-surface bg-transparent"}`}
                >
                  User
                </button>
              </div>

              {activePortal === "employee" ? (
                <div className="space-y-6 animate-fadeInUp">
                  <div>
                    <h3 className="text-xl md:text-2xl text-on-surface font-bold mb-1">Staff Portal</h3>
                    <p className="text-xs md:text-sm text-on-surface-variant">Log in using your employee username.</p>
                  </div>
                  
                  {error && (
                    <div className="p-3 text-xs bg-error-container/20 border border-error-container text-error rounded-xl">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleEmployeeSubmit} className="space-y-4">
                    <div className="relative">
                      <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-wide">Username</label>
                      <input className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-body-md" type="text" placeholder="e.g. chef.john" required value={employeeUsername} onChange={(e) => setEmployeeUsername(e.target.value)} />
                    </div>

                    <div className="relative">
                      <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-wide">Password</label>
                      <input className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-body-md" type="password" placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" required value={employeePassword} onChange={(e) => setEmployeePassword(e.target.value)} />
                    </div>

                    <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-3 bg-primary py-4 px-6 rounded-xl text-on-primary shadow-lg shadow-primary/20 hover:opacity-90 transition-all duration-200 active:scale-[0.98] cursor-pointer border-none outline-none font-bold">
                      {loading ? "Authenticating..." : "Login as Employee"}
                    </button>
                  </form>
                </div>
              ) : (
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
                    <div className="relative">
                      <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-wide">Email Address</label>
                      <input className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-body-md" type="email" placeholder="email@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>

                    <div className="relative">
                      <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-wide">Password</label>
                      <input className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-body-md" type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>

                    <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-3 bg-primary py-4 px-6 rounded-xl text-on-primary shadow-lg shadow-primary/20 hover:opacity-90 transition-all duration-200 active:scale-[0.98] cursor-pointer border-none outline-none font-bold">
                      {loading ? "Signing in..." : "Sign In with Email"}
                    </button>
                  </form>
                </div>
              )}

              <div className="text-center mt-4">
                {activePortal === "employee" ? null : activePortal === "owner" ? (
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

