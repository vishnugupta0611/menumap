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
    <nav className="fixed top-0 left-0 w-full z-[60] bg-surface/90 backdrop-blur-md flex justify-between items-center px-margin-mobile py-3.5 border-b border-surface-container max-w-7xl mx-auto">
      <Link href={`/dummy?number=${restaurant.phone}`} className="flex items-center gap-2 md:gap-3 min-w-0 flex-1 mr-2">
        <div className="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center overflow-hidden shrink-0">
          {restaurant.logoImage ? (
            <img referrerPolicy="no-referrer"  src={restaurant.logoImage} alt={restaurant.name} className="w-full h-full object-cover" />
          ) : (
            <MaterialIcon name="restaurant_menu" className="text-primary text-[18px]" />
          )}
        </div>
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="font-display-lg-mobile text-[19px] leading-tight text-on-surface font-bold truncate">
            {restaurant.name}
          </span>
          <span className="px-1.5 py-0.5 text-[10px] uppercase font-black bg-yellow-400 text-yellow-900 rounded shadow-sm shrink-0">
            Dummy
          </span>
        </div>
      </Link>
      <div className="flex items-center gap-1 md:gap-3 shrink-0">
        {/* Navigation Links */}
        <div className="flex items-center">
          {isMenuPage ? (
            <Link href={`/dummy?number=${restaurant.phone}`} className="px-2.5 py-1.5 rounded-lg text-sm font-bold text-on-surface hover:bg-surface-variant transition-colors whitespace-nowrap">
              Home
            </Link>
          ) : (
            <Link href={`/dummy/menu?number=${restaurant.phone}`} className="px-2.5 py-1.5 rounded-lg text-sm font-bold text-on-surface hover:bg-surface-variant transition-colors whitespace-nowrap">
              Menu
            </Link>
          )}
        </div>

        {!isAdmin && (
          <Link
            href={`/dummy?number=${restaurant.phone}`}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-variant/60 transition-colors text-on-surface-variant"
            title="Cart"
          >
            <MaterialIcon name="shopping_cart" className="text-[20px]" />
          </Link>
        )}
        {user ? (
          <Link
            href={isAdmin ? "/admin/dashboard" : "/customer/profile"}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-primary text-on-primary hover:bg-primary/90 transition-colors font-bold overflow-hidden"
            title={isAdmin ? "Admin Panel" : "My Profile"}
          >
            {isAdmin ? (
              <MaterialIcon name="admin_panel_settings" className="text-[18px]" />
            ) : user.photo ? (
              <img referrerPolicy="no-referrer"  src={user.photo} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <img referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                alt={user.name}
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=random`}
              />
            )}
          </Link>
        ) : (
          <Link
            href="/login"
            className="px-3 h-9 flex items-center justify-center gap-1.5 rounded-full border border-outline-variant shadow-sm text-on-surface hover:bg-surface-variant transition-colors font-bold"
          >
            <MaterialIcon name="login" className="text-[16px]" />
            <span className="text-sm">Login</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
