"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/display/Logo";
import { MdStar } from "react-icons/md";

export default function SplashPage() {
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => router.push("/login"), 500);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <main className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden">
      {/* Background Layer: Gradients and Atmospheric Blurs */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-tertiary/5 blur-[100px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#fcf9f8_70%)]"></div>
      </div>

      {/* Background Layer: Subtle Illustrations */}
      <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-20 left-10 text-primary/10 select-none animate-float" style={{ fontSize: "120px" }}>
          🍽️
        </div>
        <div className="absolute bottom-40 right-20 text-tertiary/10 select-none animate-float" style={{ animationDelay: "-2s", fontSize: "160px" }}>
          🍴
        </div>
        <div className="absolute top-1/2 left-[15%] text-primary/5 select-none animate-float" style={{ animationDelay: "-4s", fontSize: "80px" }}>
          🥐
        </div>
      </div>

      {/* Center Stage Content */}
      <div className="relative z-10 flex flex-col items-center px-margin-mobile text-center">
        {/* Premium Logo Animation Container */}
        <div className="relative group animate-reveal">
          {/* Outer Glow */}
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
          
          {/* Logo Frame */}
          <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-[40px] glass-panel p-8 shadow-[0px_20px_50px_rgba(0,0,0,0.06)] border border-white/40 overflow-hidden">
            {/* Internal Shine Effect */}
            <div className="absolute top-0 h-full w-20 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 animate-shine"></div>
            
            {/* Main Logo */}
            <div className="w-full h-full drop-shadow-2xl transition-transform duration-700 group-hover:scale-105">
              <Logo />
            </div>
          </div>
        </div>

        {/* Brand Name & Identity */}
        <div className="mt-lg animate-reveal delay-300 opacity-0" style={{ animationFillMode: "forwards" }}>
          <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-primary tracking-tighter mb-2">
            MenuMap
          </h1>
          <div className="flex items-center justify-center space-x-2">
            <span className="h-[1px] w-8 bg-outline-variant"></span>
            <p className="font-body-lg text-body-lg text-on-surface-variant font-medium tracking-wide uppercase text-[14px]">
              Find Food. Discover Restaurants.
            </p>
            <span className="h-[1px] w-8 bg-outline-variant"></span>
          </div>
        </div>

        {/* Loading Indicator */}
        <div className="mt-xl animate-reveal delay-500 opacity-0 flex flex-col items-center" style={{ animationFillMode: "forwards" }}>
          <div className="w-48 h-1.5 bg-surface-container rounded-full overflow-hidden relative">
            <div 
              className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="mt-4 font-label-sm text-label-sm text-on-secondary-container/60 tracking-widest uppercase">
            Initializing Concierge
          </p>
        </div>
      </div>

      {/* Footer / Legal Branding */}
      <div className="absolute bottom-12 z-10 animate-reveal delay-500 opacity-0 flex items-center space-x-2" style={{ animationFillMode: "forwards" }}>
        <MdStar className="text-primary text-[20px]" />
        <span className="font-label-sm text-label-sm text-on-secondary-fixed-variant">
          CRAFTED FOR CULINARY EXCELLENCE
        </span>
      </div>
    </main>
  );
}
