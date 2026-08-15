"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import {
  User,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  KeyRound,
  ExternalLink,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopied(true);
      toast.success("User ID copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-48 rounded-3xl bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-64 rounded-3xl bg-neutral-200 dark:bg-neutral-800" />
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Profile Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-neutral-950 via-neutral-800 to-neutral-700 text-white flex items-center justify-center font-bold text-2xl sm:text-3xl shadow-md ring-4 ring-neutral-100 dark:ring-neutral-800">
              {getInitials(user?.fullName)}
            </div>
            {user?.isEmailVerified && (
              <div
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-2 ring-white dark:ring-neutral-900 shadow-xs"
                title="Verified Account"
              >
                <CheckCircle2 className="w-4 h-4" />
              </div>
            )}
          </div>

          {/* Name & Basic Info */}
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-50 truncate">
                {user?.fullName || "User Account"}
              </h2>
              {user?.isEmailVerified ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                  <AlertTriangle className="w-3 h-3" />
                  Unverified
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
              {user?.email || "No email available"}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 px-2.5 py-1 rounded-lg">
                Role: <strong className="capitalize">{user?.role || "Member"}</strong>
              </span>
            </div>
          </div>

          {/* Edit / Quick Link */}
          <div>
            <Link href="/settings">
              <Button variant="outline" className="rounded-xl text-xs h-9 px-4">
                <KeyRound className="w-3.5 h-3.5 mr-2" />
                Edit Settings
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Credentials */}
        <Card className="border-neutral-200 dark:border-neutral-800 shadow-xs">
          <CardHeader className="p-6 pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <User className="w-4 h-4 text-neutral-500" />
              Personal Credentials
            </CardTitle>
            <CardDescription className="text-xs">
              Primary identification details associated with this profile
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-2 space-y-4">
            <div>
              <label className="text-[11px] font-medium text-neutral-400 block mb-1">
                Full Legal Name
              </label>
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                {user?.fullName || "Not provided"}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-neutral-400 block mb-1">
                Email Address
              </label>
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center justify-between">
                <span>{user?.email || "Not provided"}</span>
                {user?.isEmailVerified ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Link
                    href="/verify-email"
                    className="text-[11px] font-medium text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    Verify Email
                  </Link>
                )}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-neutral-400 block mb-1">
                Unique User ID
              </label>
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 text-xs font-mono text-neutral-800 dark:text-neutral-200 flex items-center justify-between">
                <span className="truncate max-w-[200px]">{user?.id || "N/A"}</span>
                <button
                  onClick={handleCopyId}
                  className="p-1 rounded text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                  title="Copy User ID"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security & Access Overview */}
        <Card className="border-neutral-200 dark:border-neutral-800 shadow-xs">
          <CardHeader className="p-6 pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Shield className="w-4 h-4 text-neutral-500" />
              Security Summary
            </CardTitle>
            <CardDescription className="text-xs">
              Overview of security safeguards protecting this account
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-2 space-y-4">
            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500 dark:text-neutral-400">Password status:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Encrypted</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500 dark:text-neutral-400">2FA Authenticator:</span>
                <span className="font-semibold text-neutral-600 dark:text-neutral-400">Configurable</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500 dark:text-neutral-400">Active sessions:</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">1 Device active</span>
              </div>
            </div>

            <div className="pt-2">
              <Link href="/settings">
                <Button className="w-full rounded-xl text-xs font-semibold h-10">
                  Manage Account & Security
                  <ExternalLink className="w-3.5 h-3.5 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
