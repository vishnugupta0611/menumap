"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { adminRoutes } from "@/constants/routes";
import { cn } from "@/lib/utils";
import MaterialIcon from "@/components/stitch/MaterialIcon";
import { useAuth } from "@/contexts/AuthContext";

export default function SideNavigation({ isOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <>
      {/* Backdrop overlay for mobile drawer */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-xs transition-opacity md:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen w-72 flex-col bg-surface-container-lowest py-6 shadow-md transition-transform duration-300 md:translate-x-0 border-r border-outline-variant/30",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center gap-3 px-8 mb-8 mt-2">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-sm">
            <MaterialIcon name="restaurant" className="text-xl" />
          </div>
          <h1 className="font-display-md text-display-md text-primary tracking-tight font-bold">
            MenuMap
          </h1>
        </div>
        
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 pb-4">
          {adminRoutes
            .filter((item) => {
              if (user?.role === "owner") return true;
              if (item.ownerOnly) return false;
              if (user?.isEmployee && user?.permissions) {
                return user.permissions.includes(item.label);
              }
              return false; // Default safe block
            })
            .map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "mx-2 flex items-center gap-sm rounded-lg px-4 py-3 transition-all",
                  isActive ? "bg-primary-container font-bold text-on-primary-container" : "text-on-surface-variant hover:bg-surface-container-high"
                )}
              >
                <MaterialIcon name={item.icon} className="text-xl" />
                <span className="font-body-md">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto flex items-center justify-between border-t border-outline-variant/30 px-6 py-4 mb-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-container text-secondary">
              <MaterialIcon name="person" />
            </div>
            <div className="flex flex-col min-w-0 pr-2">
              <p className="font-bold text-sm text-on-surface truncate">{user?.name || "Restaurant Owner"}</p>
              <p className="text-[11px] font-medium text-on-surface-variant truncate">
                {user?.isEmployee ? `@${user?.username}` : (user?.email || "No Email")}
              </p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-error hover:bg-error-container transition-colors"
            title="Logout"
          >
            <MaterialIcon name="logout" className="text-[20px]" />
          </button>
        </div>
      </aside>
    </>
  );
}
