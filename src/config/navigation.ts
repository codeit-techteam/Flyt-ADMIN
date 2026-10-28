import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BarChart3,
  Bell,
  Car,
  FileText,
  LayoutDashboard,
  MapPinned,
  Megaphone,
  Radio,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Ticket,
  LifeBuoy,
  Users,
  UserCog,
  Wallet,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    id: "overview",
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Live Operations", href: "/live-operations", icon: Radio },
      { label: "Analytics & Reports", href: "/analytics", icon: BarChart3 },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    items: [
      { label: "Rides", href: "/rides", icon: Activity },
      { label: "Customers", href: "/customers", icon: Users },
      { label: "Pilots", href: "/pilots", icon: ShieldCheck },
      { label: "Vehicles", href: "/vehicles", icon: Car },
      { label: "Service Areas", href: "/service-areas", icon: MapPinned },
    ],
  },
  {
    id: "commerce",
    label: "Commerce",
    items: [
      { label: "Pricing & Promotions", href: "/pricing", icon: Ticket },
      { label: "Payments & Payouts", href: "/payments", icon: Wallet },
      { label: "CMS", href: "/cms", icon: Megaphone },
    ],
  },
  {
    id: "trust",
    label: "Trust & Support",
    items: [
      { label: "Safety & SOS", href: "/safety", icon: ShieldAlert },
      { label: "Support Tickets", href: "/support", icon: LifeBuoy },
      { label: "Notifications", href: "/notifications", icon: Bell },
    ],
  },
  {
    id: "admin",
    label: "Administration",
    items: [
      { label: "Admin Users & Roles", href: "/admin-users", icon: UserCog },
      { label: "Audit Logs", href: "/audit-logs", icon: FileText },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export const flatNavItems = navGroups.flatMap((group) => group.items);

export function getNavLabel(pathname: string): string {
  const exact = flatNavItems.find((item) => item.href === pathname);
  if (exact) return exact.label;
  const nested = flatNavItems.find(
    (item) => pathname.startsWith(`${item.href}/`) && item.href !== "/",
  );
  return nested?.label ?? "Admin Console";
}
