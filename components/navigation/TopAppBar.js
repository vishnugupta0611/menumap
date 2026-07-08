"use client";

import Link from "next/link";
import { MdRestaurant, MdSettings, MdNotifications, MdMenu } from "react-icons/md";
import IconButton from "../buttons/IconButton";

export default function TopAppBar({ title = "MenuMap", showActions = true, onMenuClick, isSidebarOpen }) {
  return (
    <header className="fixed top-0 right-0 left-0 md:left-72 z-30 bg-surface/80 backdrop-blur-xl shadow-sm transition-all duration-300">
      <div className="flex justify-between items-center px-6 md:px-12 lg:px-16 py-4 w-full mx-auto max-w-[1400px]">
        <div className="flex items-center gap-xs">
          <button
            onClick={onMenuClick}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-container-high active:scale-95 transition-all text-primary border-none bg-transparent cursor-pointer mr-2"
          >
            <MdMenu className="text-2xl" />
          </button>
          {/* Logo only visible on mobile, since sidebar shows logo on desktop */}
          <Link href="/" className="flex items-center gap-2 md:hidden">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary">
              <MdRestaurant className="text-xl" />
            </div>
          </Link>
          <h1 className="font-display-sm md:font-display-md text-display-sm md:text-display-md text-primary tracking-tight font-bold hidden md:block">
            {title}
          </h1>
        </div>
        {showActions && (
          <div className="flex items-center gap-3">
            <IconButton>
              <MdNotifications className="text-primary text-xl" />
            </IconButton>
            <IconButton>
              <MdSettings className="text-primary text-xl" />
            </IconButton>
          </div>
        )}
      </div>
    </header>
  );
}
