import {
  LayoutDashboard,
  User,
  Settings,
  KeyRound,
  Mail,
  Smartphone,
  Layers,
  LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  description?: string;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview and activity summary",
  },
  {
    title: "Profile",
    href: "/profile",
    icon: User,
    description: "Personal credentials and info",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Security and account preferences",
  },
];

export const SETTINGS_NAV_ITEMS = [
  {
    id: "account",
    title: "Account Overview",
    icon: User,
    description: "General account settings and details",
  },
  {
    id: "password",
    title: "Change Password",
    icon: KeyRound,
    description: "Update your login password",
  },
  {
    id: "email",
    title: "Change Email",
    icon: Mail,
    description: "Update your verified email address",
  },
  {
    id: "sessions",
    title: "Active Sessions",
    icon: Layers,
    description: "Manage connected browsers and devices",
  },
  {
    id: "2fa",
    title: "Two-Factor Auth (2FA)",
    icon: Smartphone,
    description: "Secure your account with 2FA authenticator",
    badge: "Recommended",
  },
];

// Alias export for backward compatibility
export const NAV_ITEMS = MAIN_NAV_ITEMS;