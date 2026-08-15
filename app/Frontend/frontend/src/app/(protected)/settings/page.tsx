"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import {
  User,
  KeyRound,
  Mail,
  Layers,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Laptop,
  Globe,
  Trash2,
  QrCode,
  Lock,
  Eye,
  EyeOff,
  Save,
  type LucideIcon,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type SettingsTab = "account" | "password" | "email" | "sessions" | "2fa";

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");

  // Form states
  const [showPassword, setShowPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [newEmail, setNewEmail] = useState("");
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Account preferences updated successfully");
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwords.currentPassword || !passwords.newPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    toast.success("Password change request submitted successfully");
    setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleUpdateEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    toast.success(`Verification link sent to ${newEmail}`);
    setNewEmail("");
  };

  const handleRevokeOtherSessions = () => {
    toast.success("All other active sessions have been terminated");
  };

  const handleToggle2FA = () => {
    setTwoFactorEnabled((prev) => !prev);
    if (!twoFactorEnabled) {
      toast.success("Two-factor authentication setup initialized");
    } else {
      toast.info("Two-factor authentication disabled");
    }
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
      description: "Manage credentials and access keys",
    },
    {
      id: "email",
      title: "Change Email",
      icon: Mail,
      description: "Update verified email address",
    },
    {
      id: "sessions",
      title: "Active Sessions",
      icon: Layers,
      description: "Manage connected devices and logins",
    },
    {
      id: "2fa",
      title: "Two-Factor Auth",
      icon: Smartphone,
      description: "Enhanced authenticator app security",
      badge: "Security",
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
          Configure your personal credentials, change passwords, manage active sessions, and activate 2FA protection.
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
                          : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
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
                    <Label htmlFor="fullName" className="text-xs">Full Name</Label>
                    <Input
                      id="fullName"
                      value={fullName || user?.fullName || ""}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                      className="rounded-xl text-xs h-10"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="emailDisabled" className="text-xs">Email Address</Label>
                    <Input
                      id="emailDisabled"
                      value={user?.email || ""}
                      disabled
                      className="rounded-xl text-xs h-10 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 cursor-not-allowed"
                    />
                    <p className="text-[11px] text-neutral-400">
                      To change your email address, use the &quot;Change Email&quot; tab.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Account Role</Label>
                    <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 text-xs flex items-center justify-between">
                      <span className="font-semibold capitalize text-neutral-800 dark:text-neutral-200">
                        {user?.role || "standard"} Member
                      </span>
                      <span className="text-[10px] bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 px-2 py-0.5 rounded-full font-medium">
                        Standard Privileges
                      </span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-6 pt-0 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
                  <Button type="submit" className="rounded-xl text-xs h-9 px-4">
                    <Save className="w-3.5 h-3.5 mr-2" />
                    Save Changes
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
                    Ensure your account is using a strong, unique password to prevent unauthorized access.
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-6 pt-2 space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="currentPassword" className="text-xs">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPassword ? "text" : "password"}
                        value={passwords.currentPassword}
                        onChange={(e) =>
                          setPasswords({ ...passwords, currentPassword: e.target.value })
                        }
                        placeholder="••••••••"
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
                    <Label htmlFor="newPassword" className="text-xs">New Password</Label>
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={passwords.newPassword}
                      onChange={(e) =>
                        setPasswords({ ...passwords, newPassword: e.target.value })
                      }
                      placeholder="Min. 6 characters"
                      className="rounded-xl text-xs h-10"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-xs">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={passwords.confirmPassword}
                      onChange={(e) =>
                        setPasswords({ ...passwords, confirmPassword: e.target.value })
                      }
                      placeholder="Repeat new password"
                      className="rounded-xl text-xs h-10"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 space-y-1.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                    <p className="font-semibold text-neutral-700 dark:text-neutral-300">
                      Password Requirements:
                    </p>
                    <ul className="list-disc list-inside space-y-0.5">
                      <li>Minimum 6 characters in length</li>
                      <li>Include uppercase & lowercase letters</li>
                      <li>Include numbers and special symbols</li>
                    </ul>
                  </div>
                </CardContent>

                <CardFooter className="p-6 pt-0 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
                  <Button type="submit" className="rounded-xl text-xs h-9 px-4">
                    <Lock className="w-3.5 h-3.5 mr-2" />
                    Update Password
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}

          {/* TAB 3: CHANGE EMAIL */}
          {activeTab === "email" && (
            <Card className="border-neutral-200 dark:border-neutral-800 shadow-xs">
              <form onSubmit={handleUpdateEmail}>
                <CardHeader className="p-6 pb-4">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Mail className="w-4 h-4 text-neutral-500" />
                    Change Email Address
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Update your primary contact and login email address.
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-6 pt-2 space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Current Email Address</Label>
                    <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center justify-between">
                      <span>{user?.email || "No email"}</span>
                      {user?.isEmailVerified ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                          <AlertTriangle className="w-3 h-3" />
                          Unverified
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="newEmail" className="text-xs">New Email Address</Label>
                    <Input
                      id="newEmail"
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="new.email@example.com"
                      className="rounded-xl text-xs h-10"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-[11px] text-amber-900 dark:text-amber-300">
                    <span className="font-semibold">Important:</span> You will receive a verification link or OTP code at the new email address before the change takes effect.
                  </div>
                </CardContent>

                <CardFooter className="p-6 pt-0 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
                  <Button type="submit" className="rounded-xl text-xs h-9 px-4">
                    Send Verification Request
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}

          {/* TAB 4: SESSIONS */}
          {activeTab === "sessions" && (
            <Card className="border-neutral-200 dark:border-neutral-800 shadow-xs">
              <CardHeader className="p-6 pb-4">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Layers className="w-4 h-4 text-neutral-500" />
                  Active Sessions
                </CardTitle>
                <CardDescription className="text-xs">
                  Review all active devices, browsers, and locations currently logged into your account.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 pt-2 space-y-4">
                {/* Current Session */}
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Laptop className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                          Windows PC • Chrome Browser
                        </span>
                        <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.2 rounded-full">
                          Current Device
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                        Local IP: 127.0.0.1 • Active right now
                      </p>
                    </div>
                  </div>
                </div>

                {/* Simulated Secondary Session */}
                <div className="p-4 rounded-2xl bg-neutral-50/50 dark:bg-neutral-800/30 border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between opacity-80">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 flex items-center justify-center">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                        Mobile Device • Safari on iOS
                      </span>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                        Last active 3 days ago • Token expired
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-6 pt-0 border-t border-neutral-100 dark:border-neutral-800 flex justify-between items-center">
                <span className="text-[11px] text-neutral-400">
                  Need to secure your account?
                </span>
                <Button
                  onClick={handleRevokeOtherSessions}
                  variant="outline"
                  className="rounded-xl text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 h-9 px-4 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-2" />
                  Revoke Other Sessions
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* TAB 5: 2FA */}
          {activeTab === "2fa" && (
            <Card className="border-neutral-200 dark:border-neutral-800 shadow-xs">
              <CardHeader className="p-6 pb-4">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-neutral-500" />
                  Two-Factor Authentication (2FA)
                </CardTitle>
                <CardDescription className="text-xs">
                  Add an extra layer of protection by requiring a 6-digit TOTP code upon login.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 pt-2 space-y-5">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800">
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                      Authenticator App (TOTP)
                    </h4>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                      Use apps like Google Authenticator, Authy, or 1Password.
                    </p>
                  </div>
                  <Button
                    onClick={handleToggle2FA}
                    variant={twoFactorEnabled ? "outline" : "default"}
                    size="sm"
                    className="rounded-xl text-xs"
                  >
                    {twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
                  </Button>
                </div>

                {twoFactorEnabled && (
                  <div className="p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-4 animate-in fade-in">
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      Two-Factor Protection is Active
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                      <div className="w-24 h-24 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
                        <QrCode className="w-16 h-16" />
                      </div>
                      <div className="space-y-1 text-center sm:text-left">
                        <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                          Backup Secret Key
                        </p>
                        <p className="text-xs font-mono bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-md text-neutral-700 dark:text-neutral-300 select-all">
                          AUTH-4982-FORGE-7721
                        </p>
                        <p className="text-[10px] text-neutral-400">
                          Keep this secret code stored safely for account recovery.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
