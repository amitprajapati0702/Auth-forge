"use client";

import { useState } from "react";
import Sidebar from "@/components/dashboard/sidebar";
import MobileSidebar from "@/components/dashboard/mobile-sidebar";
import Navbar from "@/components/dashboard/navbar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-neutral-50/60 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      {/* Desktop Fixed/Static Sidebar */}
      <Sidebar />

      {/* Mobile Drawer Sidebar */}
      <MobileSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}