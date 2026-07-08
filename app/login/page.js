"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, logout } = useAuth();
  
  // Tab states: "owner" or "customer"
  const [activePortal, setActivePortal] = useState("owner");
  
  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const data = await login(email, password);
      const expectedRole = activePortal === "owner" ? "owner" : "customer";
      if (data.user.role !== expectedRole) {
        await logout();
        setError(
          expectedRole === "owner"
            ? "This account is a customer account. Please use the Discovery User tab."
            : "This account is a restaurant owner account. Please use the Restaurant Owner tab."
        );
        return;
      }

      if (data.user.role === "owner") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to sign in. Please verify credentials.");
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

              <form onSubmit={handleLogin} className="space-y-6 animate-fadeInUp">
                <div>
                  <h3 className="text-xl md:text-2xl text-on-surface font-bold mb-1">Login to your account</h3>
                  <p className="text-xs md:text-sm text-on-surface-variant">Enter your details to continue.</p>
                </div>
                
                {error && (
                  <div className="p-3 text-xs bg-error-container/20 border border-error-container text-error rounded-xl">
                    {error}
                  </div>
                )}
                
                <div className="relative">
                  <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-wide">Email Address</label>
                  <input className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-body-md" type="email" placeholder="email@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>

                <div className="relative">
                  <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-wide">Password</label>
                  <input className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-body-md" type="password" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>

                <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-3 bg-primary py-4 px-6 rounded-xl text-on-primary shadow-lg shadow-primary/20 hover:opacity-90 transition-all duration-200 active:scale-[0.98] cursor-pointer border-none outline-none font-bold">
                  {loading ? "Verifying..." : "Sign In"}
                </button>
                
                <div className="text-center mt-4">
                  {activePortal === "owner" ? (
                    <p className="text-sm text-on-surface-variant">Don't have a restaurant? <Link href="/register/owner" className="text-primary font-bold hover:underline">Create one</Link></p>
                  ) : (
                    <p className="text-sm text-on-surface-variant">Don't have an account? <Link href="/register/customer" className="text-primary font-bold hover:underline">Sign up</Link></p>
                  )}
                </div>
              </form>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
