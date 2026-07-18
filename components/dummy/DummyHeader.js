"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import MaterialIcon from "@/components/stitch/MaterialIcon";
import { useAuth } from "@/contexts/AuthContext";

export default function DummyHeader({ restaurant }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const isMenuPage = pathname?.endsWith("/menu");
  const isAdmin = user?.role === "owner" || user?.role === "employee" || user?.isEmployee;
  return (
 <nav className="fixed inset-x-0 top-0 z-[60] border-b border-surface-container bg-surface/90 backdrop-blur-md">
  <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">

    {/* Restaurant Info */}
    <Link
      href={`/dummy?number=${restaurant.phone}`}
      className="flex min-w-0 flex-1 items-center gap-3"
    >
      {/* Logo */}
      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-secondary shadow-md ring-2 ring-primary/20">
        {restaurant.logoImage ? (
          <img
            referrerPolicy="no-referrer"
            src={restaurant.logoImage}
            alt={restaurant.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="select-none text-base font-black tracking-wide text-white">
            {restaurant.name
              ?.trim()
              .split(/\s+/)
              .slice(0, 2)
              .map((word) => word[0])
              .join("")
              .toUpperCase()}
          </span>
        )}
      </div>

      {/* Name */}
      <div className="min-w-0">
        <h1 className="truncate text-[17px] font-extrabold text-on-surface">
          {restaurant.name}
        </h1>
        <p className="truncate text-xs text-on-surface-variant">
          Digital Menu
        </p>
      </div>
    </Link>

    {/* CTA */}
    <Link
      href="/"
      className="ml-4 inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-on-primary shadow-md transition-all duration-200 hover:scale-[1.03] hover:bg-primary/90 active:scale-95"
    >
      <MaterialIcon name="add_business" className="text-[18px]" />
      <span className="hidden sm:inline">Create Your Restro</span>
      <span className="sm:hidden">Create</span>
    </Link>

  </div>
</nav>
  );
}
