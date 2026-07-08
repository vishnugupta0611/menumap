"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function CustomerRegisterPage() {
  const router = useRouter();
  const { registerCustomer } = useAuth();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill all fields");
      return;
    }
    setLoading(true);
    setError("");

    try {
      await registerCustomer({
        name,
        email,
        password,
      });

      router.push("/");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to register.");
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
              
              <form onSubmit={handleRegister} className="space-y-6 animate-fadeInUp">
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-surface font-semibold mb-2">Create an account</h3>
                  <p className="text-sm text-on-surface-variant">Join as a discovery user.</p>
                </div>
                
                {error && (
                  <div className="p-3 text-xs bg-error-container/20 border border-error-container text-error rounded-xl">
                    {error}
                  </div>
                )}
                
                <div className="relative">
                  <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-wide">Your Name</label>
                  <input className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-body-md" type="text" placeholder="e.g. Julian V." required value={name} onChange={(e) => setName(e.target.value)} />
                </div>

                <div className="relative">
                  <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-wide">Email Address</label>
                  <input className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-body-md" type="email" placeholder="julian@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>

                <div className="relative">
                  <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-wide">Password</label>
                  <input className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-body-md" type="password" placeholder="SecurePass123!" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>

                <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-3 bg-primary py-4 px-6 rounded-xl text-on-primary shadow-lg shadow-primary/20 hover:opacity-90 transition-all duration-200 active:scale-[0.98] cursor-pointer border-none outline-none font-bold">
                  {loading ? "Creating Account..." : "Continue to Discovery"}
                </button>
              </form>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
