"use client";

import { MdSearch } from "react-icons/md";
import { cn } from "@/lib/utils";

export default function SearchBar({ placeholder = "Search...", className, ...props }) {
  return (
    <div className={cn("relative w-full group", className)}>
      <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors text-xl" />
      <input
        type="text"
        placeholder={placeholder}
        className="w-full pl-12 pr-4 py-4 rounded-xl border-outline-variant bg-surface-container-lowest focus:ring-primary focus:border-primary transition-all shadow-sm outline-none"
        {...props}
      />
    </div>
  );
}
