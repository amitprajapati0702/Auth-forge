"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import {
  ShieldCheck,
  KeyRound,
  User,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Shield,
  Activity,
  Laptop,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white p-6 sm:p-8 md:p-10 shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium text-neutral-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Session Authenticated & Encrypted</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back,{" "}
              <span className="text-white underline decoration-emerald-500 decoration-2 underline-offset-4">
                {isLoading ? "..." : user?.fullName || "User"}
              </span>
            </h2>
            <p className="text-neutral-300 text-sm leading-relaxed">
              Manage your identity, active security credentials, and authentication sessions from your centralized hub.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/profile">
              <Button
                variant="secondary"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-medium h-10 px-4"
              >
                <User className="w-4 h-4 mr-2" />
                View Profile
              </Button>
            </Link>
            <Link href="/settings">
              <Button className="bg-white text-neutral-950 hover:bg-neutral-100 rounded-xl text-xs font-medium h-10 px-4">
                <KeyRound className="w-4 h-4 mr-2" />
                Security Settings
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-neutral-700/30 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Unverified Email Alert Banner (if applicable) */}
      {!isLoading && user && !user.isEmailVerified && (
        <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div className="text-xs">
              <span className="font-semibold">Email verification pending:</span> Please verify your email address (
              {user.email}) to unlock full access.
            </div>
          </div>
          <Link href="/verify-email">
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs h-8 px-3">
              Verify Now
            </Button>
          </Link>
        </div>
      )}

      {/* Metrics & Overview Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {/* Card 1: Account Status */}
        <Card className="border-neutral-200 dark:border-neutral-800 shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-all">
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Account Status</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-1">
            <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              {user?.isEmailVerified ? "Verified" : "Unverified"}
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              {user?.isEmailVerified ? "Full system privileges active" : "Action required to verify"}
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Security Role */}
        <Card className="border-neutral-200 dark:border-neutral-800 shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-all">
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Access Role</span>
            <div className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-1">
            <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100 capitalize">
              {user?.role || "Standard"}
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Default role permissions
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Active Session */}
        <Card className="border-neutral-200 dark:border-neutral-800 shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-all">
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Active Session</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Laptop className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-1">
            <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              1 Connected
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Current browser (Active now)
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Security Level */}
        <Card className="border-neutral-200 dark:border-neutral-800 shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-all">
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Protection Level</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-1">
            <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              Enhanced
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              JWT with auto-refresh token
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Quick Actions & Recent Security Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions (1 col) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Quick Shortcuts
            </h3>
          </div>

          <div className="space-y-3">
            <Link href="/profile" className="block group">
              <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-neutral-700 dark:group-hover:text-neutral-300">
                      Personal Profile
                    </h4>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      Manage name & email ID
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link href="/settings" className="block group">
              <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 flex items-center justify-center">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-neutral-700 dark:group-hover:text-neutral-300">
                      Security & 2FA
                    </h4>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      Password & multi-factor auth
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>

        {/* Security Audit Activity Feed (2 cols) */}
        <div className="lg:col-span-2">
          <Card className="border-neutral-200 dark:border-neutral-800 shadow-xs h-full">
            <CardHeader className="p-6 pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Recent Auth Activity</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Audit logs of your latest logins, token refreshes, and device sessions
                </CardDescription>
              </div>
              <span className="text-[11px] text-neutral-400 flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5" />
                Live Log
              </span>
            </CardHeader>
            <CardContent className="p-6 pt-2">
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                <div className="py-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <div>
                      <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                        Session token authenticated
                      </p>
                      <p className="text-[11px] text-neutral-400">
                        Browser session verified via secure cookie
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-neutral-400">Just now</span>
                </div>

                <div className="py-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <div>
                      <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                        User profile synced
                      </p>
                      <p className="text-[11px] text-neutral-400">
                        Role: {user?.role || "standard"} • Status: Active
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-neutral-400">Today</span>
                </div>

                <div className="py-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-neutral-400" />
                    <div>
                      <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                        Signed in from current device
                      </p>
                      <p className="text-[11px] text-neutral-400">
                        Email & password verification succeeded
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-neutral-400">Initial Login</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}