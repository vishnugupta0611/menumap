"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function RestaurantTabs({ city, slug }) {
  const pathname = usePathname();

  const tabs = [
    { name: "Profile", href: `/${city}/${slug}` },
    { name: "Menu", href: `/${city}/${slug}/menu` },
  ];

  return (
    <nav className="sticky top-[65px] z-40 bg-white border-b border-surface-container mb-8">
      <div className="max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop flex items-center gap-1 overflow-x-auto hide-scrollbar">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`relative px-4 py-3.5 text-sm font-semibold whitespace-nowrap transition-colors ${
                isActive ? "text-primary" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {tab.name}
              {isActive && (
                <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}