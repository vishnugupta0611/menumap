"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TopAppBar from "@/components/navigation/TopAppBar";
import SideNavigation from "@/components/navigation/SideNavigation";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminLayout({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "owner") {
        router.push("/");
      }
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== "owner") {
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
