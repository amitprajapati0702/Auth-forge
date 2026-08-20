"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { useLogout } from "@/hooks/auth/use-logout";
import {
  User as UserIcon,
  Settings,
  LogOut,
  ChevronDown,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";

export function UserDropdown() {
  const { user, isLoading } = useAuth();
  const logoutMutation = useLogout();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch {
      // Error handled inside useLogout toast
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = getInitials(user?.fullName);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 animate-pulse">
        <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700" />
        <div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-700 rounded" />
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-full md:rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 dark:focus-visible:ring-neutral-300"
        aria-expanded={isOpen}
        aria-label="User account menu"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-neutral-900 to-neutral-700 dark:from-neutral-100 dark:to-neutral-300 text-white dark:text-neutral-900 flex items-center justify-center font-semibold text-xs shadow-sm ring-2 ring-white dark:ring-neutral-900">
          {initials}
        </div>
        <div className="hidden md:flex flex-col text-left">
          <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate max-w-[120px]">
            {user?.fullName || "Account"}
          </span>
          <span className="text-[10px] text-neutral-500 dark:text-neutral-400 capitalize">
            {user?.role || "Member"}
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                {user?.fullName || "User Account"}
              </p>
              {user?.isEmailVerified ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 px-1.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 px-1.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                  <AlertCircle className="w-2.5 h-2.5" />
                  Unverified
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
              {user?.email || "No email available"}
            </p>
          </div>

          {/* Navigation Links */}
          <div className="py-1">
            {user?.role === "ADMIN" && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-4 py-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-indigo-500" />
                  <span>Admin Console</span>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                  ADMIN
                </span>
              </Link>
            )}

            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <UserIcon className="w-4 h-4 text-neutral-500" />
              <span>Profile Details</span>
            </Link>

            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Settings className="w-4 h-4 text-neutral-500" />
              <span>Account Settings</span>
            </Link>
          </div>

          {/* Logout Section */}
          <div className="pt-1 mt-1 border-t border-neutral-100 dark:border-neutral-800">
            <button
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer disabled:opacity-50"
            >
              {logoutMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin text-rose-600 dark:text-rose-400" />
              ) : (
                <LogOut className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              )}
              <span>{logoutMutation.isPending ? "Logging out..." : "Log out"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDropdown;