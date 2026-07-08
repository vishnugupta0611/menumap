"use client";

import { cn } from "@/lib/utils";

export default function FAB({ children, onClick, className }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed bottom-24 right-6 md:bottom-12 md:right-12 w-14 h-14 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 z-40",
        className
      )}
    >
      {children}
    </button>
  );
}
