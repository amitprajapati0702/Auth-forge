"use client";

import { usePathname } from "next/navigation";
import { Menu, Search, Bell } from "lucide-react";
import { UserDropdown } from "./user-dropdown";

interface NavbarProps {
  onOpenMobileMenu?: () => void;
}

export function Navbar({ onOpenMobileMenu }: NavbarProps) {
  const pathname = usePathname();

  const getPageTitle = (path: string) => {
    if (path.includes("/settings")) return "Settings";
    if (path.includes("/profile") || path === "/p") return "Profile";
    if (path.includes("/dashboard")) return "Dashboard";
    return "Overview";
  };

  return (
    <header className="sticky top-0 z-30 h-16 w-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      <div className="h-full px-4 md:px-8 flex items-center justify-between gap-4">
        {/* Left Section: Mobile Menu Trigger + Page Title */}
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Open mobile navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <h1 className="text-base md:text-lg font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
              {getPageTitle(pathname)}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>
        </div>

        {/* Center/Right Section: Search + Notifications + User Menu */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Quick Search */}
          <div className="hidden lg:flex items-center relative">
            <Search className="w-4 h-4 absolute left-3 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search or press ⌘K..."
              className="w-56 xl:w-64 pl-9 pr-3 py-1.5 text-xs bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/80 rounded-xl text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-950 dark:focus:ring-neutral-400 focus:bg-white dark:focus:bg-neutral-900 transition-all"
            />
          </div>

          {/* Notification Trigger */}
          <button
            className="relative p-2 rounded-xl text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-neutral-900" />
          </button>

          <div className="h-5 w-[1px] bg-neutral-200 dark:bg-neutral-800 hidden sm:block" />

          {/* User Dropdown */}
          <UserDropdown />
        </div>
      </div>
    </header>
  );
}

export default Navbar;