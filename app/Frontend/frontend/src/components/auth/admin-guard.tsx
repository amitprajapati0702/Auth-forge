"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { ShieldAlert, ArrowLeft, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center animate-pulse">
          <Loader2 className="w-6 h-6 text-neutral-500 animate-spin" />
        </div>
        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
          Verifying security authorization...
        </p>
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] p-6 text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-xl shadow-rose-500/10">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center shadow-md">
            <Lock className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="max-w-md space-y-2 mb-8">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 mb-2">
            403 Forbidden • RBAC Protected
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Administrator Access Required
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
            You do not have the required administrative clearance to access this portal. Your current role is{" "}
            <span className="font-semibold text-neutral-800 dark:text-neutral-200 capitalize">
              {user?.role || "standard user"}
            </span>.
          </p>
        </div>

        <Link href="/dashboard">
          <Button className="bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 rounded-xl px-5 py-2.5 text-xs font-semibold shadow-md inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Return to Safe Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
