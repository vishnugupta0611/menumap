"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function SimpleHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 transition-all duration-300 ${
        scrolled ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-outline-variant/20" : "bg-transparent"
      }`}
    >
      <Link href="/" className="font-display-lg-mobile md:font-display-lg text-primary font-bold tracking-tight">
        <img src="/images/logo.png" alt="HeyRestro" className="h-12 w-auto" />
      </Link>
      <div className="flex gap-4 md:gap-6 items-center">
        <Link href="/login" className="text-xs md:text-sm font-bold text-on-surface hover:text-primary transition-colors whitespace-nowrap">
          Login
        </Link>
        <Link href="/register/owner" className="hidden sm:block text-xs md:text-sm font-bold bg-primary text-on-primary px-4 py-2 rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap">
          For Restaurants
        </Link>
      </div>
    </header>
  );
}

