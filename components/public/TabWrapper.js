"use client";

import { usePathname } from "next/navigation";
import RestaurantTabs from "./RestaurantTabs";

export default function TabWrapper({ city, slug, showTabs }) {
  const pathname = usePathname();
  
  if (!showTabs) return null;

  // Only render tabs on the main navigation pages
  const allowedPaths = [
    `/${city}/${slug}`,
    `/${city}/${slug}/menu`
  ];

  if (!allowedPaths.includes(pathname)) return null;

  return <RestaurantTabs city={city} slug={slug} />;
}
