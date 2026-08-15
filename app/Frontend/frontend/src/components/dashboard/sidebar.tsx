"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MAIN_NAV_ITEMS } from "@/constants/navigation";
import { ShieldCheck, Sparkles, ExternalLink } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 min-h-screen select-none shrink-0 transition-all">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-neutral-200 dark:border-neutral-800">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-neutral-900 dark:bg-neutral-50 text-white dark:text-neutral-900 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-neutral-900 dark:text-neutral-50 block leading-tight">
              AuthForge
            </span>
            <span className="text-[10px] text-neutral-400 font-medium tracking-wide block uppercase">
              Security Hub
            </span>
          </div>
        </Link>
        <span className="text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 px-2 py-0.5 rounded-full border border-neutral-200 dark:border-neutral-700">
          v1.0
        </span>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          Main Menu
        </div>

        {MAIN_NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-sm"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 hover:text-neutral-900 dark:hover:text-neutral-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive
                      ? "text-white dark:text-neutral-900"
                      : "text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-neutral-200"
                  }`}
                />
                <span>{item.title}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                    isActive
                      ? "bg-neutral-800 text-neutral-200 dark:bg-neutral-200 dark:text-neutral-800"
                      : "bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom Pro / Security Card */}
      <div className="p-3 border-t border-neutral-200 dark:border-neutral-800">
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800/60 dark:to-neutral-900/60 border border-neutral-200 dark:border-neutral-700/60">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-200">
              System Shield Active
            </span>
          </div>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-snug mb-2.5">
            Role: <span className="font-semibold capitalize">{user?.role || "Standard"}</span> • Encrypted
          </p>
          <Link
            href="/settings"
            className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white inline-flex items-center gap-1 hover:underline"
          >
            Review Security Settings
            <ExternalLink className="w-2.5 h-2.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;