"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import TopAppBar from "@/components/navigation/TopAppBar";
import SideNavigation from "@/components/navigation/SideNavigation";
import { useAuth } from "@/contexts/AuthContext";
import { adminRoutes } from "@/constants/routes";

export default function AdminLayout({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        return router.push("/login");
      } 
      
      if (user.role !== "owner" && user.role !== "employee") {
        return router.push("/");
      }

      if (user.role === "employee") {
        // Find the route they are trying to access
        const currentRoute = adminRoutes.reduce((acc, route) => {
          if (pathname.startsWith(route.href) || pathname === route.href) {
            if (!acc || route.href.length > acc.href.length) return route;
          }
          return acc;
        }, null);
        
        if (currentRoute) {
          if (currentRoute.ownerOnly || !user.permissions?.includes(currentRoute.label)) {
            // Unauthorized access attempt
            return router.push("/admin/dashboard");
          }
        }
      }
    }
  }, [user, loading, router, pathname]);

  if (loading || !user || !["owner", "employee"].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background text-on-background">
      <SideNavigation isOpen={isOpen} onClose={() => setIsOpen(false)} />
      
      {/* Main Container taking up remaining space beside sidebar */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-300 md:ml-72">
        <TopAppBar title="MenuMap OS" onMenuClick={() => setIsOpen(true)} isSidebarOpen={isOpen} />
        
        {/* The actual page content wrapper */}
        <main className="flex-1 w-full pt-24 sm:pt-28 pb-10 sm:pb-12 px-4 sm:px-6 md:px-10 lg:px-16 mx-auto max-w-[1400px]">
          {children}
        </main>
      </div>
    </div>
  );
}
