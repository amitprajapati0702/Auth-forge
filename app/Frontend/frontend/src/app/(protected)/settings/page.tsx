"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import {
  User,
  KeyRound,
  Layers,
  Laptop,
  Smartphone as MobileIcon,
  Globe,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  Save,
  Loader2,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useSessions, useDeleteSession, useLogoutAllSessions } from "@/hooks/sessions/use-sessions";
import { useChangePassword, useUpdateProfile } from "@/hooks/users/use-users";
import { toast } from "sonner";

type SettingsTab = "account" | "password" | "sessions";

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");

  // Account tab state
  const [fullName, setFullName] = useState(user?.fullName || "");
  const updateProfileMutation = useUpdateProfile();

  // Password tab state
  const [showPassword, setShowPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const changePasswordMutation = useChangePassword();

  // Sessions state & hooks
  const { data: sessions, isLoading: isLoadingSessions, refetch: refetchSessions } = useSessions();
  const deleteSessionMutation = useDeleteSession();
  const logoutAllMutation = useLogoutAllSessions();
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);
  const [showRevokeAllDialog, setShowRevokeAllDialog] = useState(false);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Full name cannot be empty");
      return;
    }
    await updateProfileMutation.mutateAsync({ fullName: fullName.trim() });
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwords.currentPassword || !passwords.newPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwords.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch {
      // Error handled by hook toast
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await deleteSessionMutation.mutateAsync(sessionId);
      toast.success("Session terminated");
      setRevokingSessionId(null);
    } catch {
      toast.error("Failed to revoke session");
    }
  };

  const handleRevokeAllOtherSessions = async () => {
    try {
      await logoutAllMutation.mutateAsync();
      toast.success("All other active sessions have been terminated");
      setShowRevokeAllDialog(false);
      refetchSessions();
    } catch {
      toast.error("Failed to revoke sessions");
    }
  };

  const getDeviceIcon = (ua?: string) => {
    if (!ua) return Globe;
    const lower = ua.toLowerCase();
    if (lower.includes("mobile") || lower.includes("android") || lower.includes("iphone")) {
      return MobileIcon;
    }
    return Laptop;
  };

  const formatUserAgent = (ua?: string) => {
    if (!ua) return "Unknown Browser / Client";
    if (ua.includes("Chrome") && !ua.includes("Edg")) return "Chrome on " + getOS(ua);
    if (ua.includes("Firefox")) return "Firefox on " + getOS(ua);
    if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari on " + getOS(ua);
    if (ua.includes("Edg")) return "Edge on " + getOS(ua);
    return "Browser on " + getOS(ua);
  };

  const getOS = (ua: string) => {
    if (ua.includes("Windows")) return "Windows";
    if (ua.includes("Mac OS") || ua.includes("Macintosh")) return "macOS";
    if (ua.includes("Linux")) return "Linux";
    if (ua.includes("Android")) return "Android";
    if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
    return "Device";
  };

  const navItems: { id: SettingsTab; title: string; icon: LucideIcon; description: string; badge?: string }[] = [
    {
      id: "account",
      title: "Account Settings",
      icon: User,
      description: "Profile information & display preferences",
    },
    {
      id: "password",
      title: "Change Password",
      icon: KeyRound,
      description: "Manage account credentials",
    },
    {
      id: "sessions",
      title: "Active Sessions",
      icon: Layers,
      description: "Manage connected devices and logins",
      badge: sessions ? `${sessions.length} Active` : undefined,
    },
  ];

  return (
    <div className="space-y-6 md:space-y-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Account & Security Settings
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Configure personal credentials, change passwords, and manage active sessions across devices.
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Navigation Tabs (4 cols) */}
        <div className="md:col-span-4 space-y-1.5">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-2 shadow-xs space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-sm"
                      : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <div>
                      <div className="font-semibold">{item.title}</div>
                      <div
                        className={`text-[10px] truncate max-w-[170px] ${
                          isActive
                            ? "text-neutral-300 dark:text-neutral-600"
                            : "text-neutral-400 dark:text-neutral-500"
                        }`}
                      >
                        {item.description}
                      </div>
                    </div>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        isActive
                          ? "bg-neutral-700 text-neutral-200 dark:bg-neutral-300 dark:text-neutral-800"
                          : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Content Area (8 cols) */}
        <div className="md:col-span-8">
          {/* TAB 1: ACCOUNT SETTINGS */}
          {activeTab === "account" && (
            <Card className="border-neutral-200 dark:border-neutral-800 shadow-xs">
              <form onSubmit={handleSaveGeneral}>
                <CardHeader className="p-6 pb-4">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <User className="w-4 h-4 text-neutral-500" />
                    Account Settings
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Basic account identification details and preferences
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-6 pt-2 space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName" className="text-xs font-medium">Full Name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                      disabled={updateProfileMutation.isPending}
                      className="rounded-xl text-xs h-10"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="emailDisabled" className="text-xs font-medium">Email Address</Label>
                    <Input
                      id="emailDisabled"
                      value={user?.email || ""}
                      disabled
                      className="rounded-xl text-xs h-10 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Account Role & Privileges</Label>
                    <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 text-xs flex items-center justify-between">
                      <span className="font-semibold capitalize text-neutral-800 dark:text-neutral-200">
                        {user?.role || "USER"} Member
                      </span>
                      <span className="text-[10px] bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 px-2 py-0.5 rounded-full font-medium">
                        {user?.isEmailVerified ? "Verified Account" : "Unverified"}
                      </span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-6 pt-0 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="rounded-xl text-xs h-9 px-4 font-semibold"
                  >
                    {updateProfileMutation.isPending ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Saving...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Save className="w-3.5 h-3.5" />
                        Save Changes
                      </span>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}

          {/* TAB 2: CHANGE PASSWORD */}
          {activeTab === "password" && (
            <Card className="border-neutral-200 dark:border-neutral-800 shadow-xs">
              <form onSubmit={handleUpdatePassword}>
                <CardHeader className="p-6 pb-4">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-neutral-500" />
                    Change Password
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Update your account password.
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-6 pt-2 space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="currentPassword" className="text-xs font-medium">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPassword ? "text" : "password"}
                        value={passwords.currentPassword}
                        onChange={(e) =>
                          setPasswords({ ...passwords, currentPassword: e.target.value })
                        }
                        placeholder="••••••••"
                        disabled={changePasswordMutation.isPending}
                        className="rounded-xl text-xs h-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="newPassword" className="text-xs font-medium">New Password</Label>
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={passwords.newPassword}
                      onChange={(e) =>
                        setPasswords({ ...passwords, newPassword: e.target.value })
                      }
                      placeholder="Min. 8 characters"
                      disabled={changePasswordMutation.isPending}
                      className="rounded-xl text-xs h-10"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-xs font-medium">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={passwords.confirmPassword}
                      onChange={(e) =>
                        setPasswords({ ...passwords, confirmPassword: e.target.value })
                      }
                      placeholder="Repeat new password"
                      disabled={changePasswordMutation.isPending}
                      className="rounded-xl text-xs h-10"
                    />
                  </div>
                </CardContent>

                <CardFooter className="p-6 pt-0 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
                  <Button
                    type="submit"
                    disabled={changePasswordMutation.isPending}
                    className="rounded-xl text-xs h-9 px-4 font-semibold"
                  >
                    {changePasswordMutation.isPending ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Updating...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        Update Password
                      </span>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}

          {/* TAB 3: SESSIONS */}
          {activeTab === "sessions" && (
            <Card className="border-neutral-200 dark:border-neutral-800 shadow-xs">
              <CardHeader className="p-6 pb-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Layers className="w-4 h-4 text-neutral-500" />
                    Active Sessions
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Connected devices and browsers currently logged into your account in Redis.
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => refetchSessions()}
                  className="rounded-lg text-xs h-8 px-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>
              </CardHeader>

              <CardContent className="p-6 pt-2 space-y-3">
                {isLoadingSessions ? (
                  <div className="py-8 flex flex-col items-center justify-center gap-2 text-neutral-400 text-xs">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Loading active sessions...</span>
                  </div>
                ) : !sessions || sessions.length === 0 ? (
                  <div className="p-6 text-center text-xs text-neutral-500">
                    No active sessions found.
                  </div>
                ) : (
                  sessions.map((session) => {
                    const DeviceIcon = getDeviceIcon(session.userAgent);
                    return (
                      <div
                        key={session.sessionId}
                        className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          session.isCurrent
                            ? "bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700"
                            : "bg-white dark:bg-neutral-900 border-neutral-200/80 dark:border-neutral-800 opacity-90"
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              session.isCurrent
                                ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                            }`}
                          >
                            <DeviceIcon className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
                                {formatUserAgent(session.userAgent)}
                              </span>
                              {session.isCurrent && (
                                <span className="text-[9px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                                  Current Device
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
                              IP: {session.ipAddress || "Unknown"} • Last active:{" "}
                              {session.lastActivityAt
                                ? new Date(session.lastActivityAt).toLocaleString()
                                : "Recently"}
                            </p>
                          </div>
                        </div>

                        {!session.isCurrent && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setRevokingSessionId(session.sessionId)}
                            disabled={deleteSessionMutation.isPending}
                            className="rounded-lg text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 h-8 px-2.5 shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                            Revoke
                          </Button>
                        )}
                      </div>
                    );
                  })
                )}
              </CardContent>

              {sessions && sessions.length > 1 && (
                <CardFooter className="p-6 pt-0 border-t border-neutral-100 dark:border-neutral-800 flex justify-between items-center">
                  <span className="text-[11px] text-neutral-400">
                    Multiple devices detected
                  </span>
                  <Button
                    onClick={() => setShowRevokeAllDialog(true)}
                    variant="outline"
                    className="rounded-xl text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 h-9 px-4 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-2" />
                    Revoke All Other Sessions
                  </Button>
                </CardFooter>
              )}
            </Card>
          )}
        </div>
      </div>

      {/* Confirmation Dialog for Revoking a Single Session */}
      <ConfirmationDialog
        isOpen={revokingSessionId !== null}
        onClose={() => setRevokingSessionId(null)}
        onConfirm={() => {
          if (revokingSessionId) handleRevokeSession(revokingSessionId);
        }}
        title="Revoke Active Session"
        description="Are you sure you want to disconnect this device? The user will be required to log in again."
        confirmText="Revoke Session"
        variant="danger"
        isLoading={deleteSessionMutation.isPending}
      />

      {/* Confirmation Dialog for Revoking All Other Sessions */}
      <ConfirmationDialog
        isOpen={showRevokeAllDialog}
        onClose={() => setShowRevokeAllDialog(false)}
        onConfirm={() => handleRevokeAllOtherSessions()}
        title="Revoke All Other Sessions"
        description="This will instantly log out every other device and browser connected to your account. Your current session will remain active."
        confirmText="Revoke All Others"
        variant="danger"
        isLoading={logoutAllMutation.isPending}
      />
    </div>
  );
}
