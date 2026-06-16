"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bell,
  Building2,
  CalendarDays,
  ClipboardList,
  FileChartColumn,
  HeartPulse,
  LayoutDashboard,
  ScanLine,
  ShieldCheck,
  Stethoscope,
  Users,
  X,
} from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { UserRole } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { NavItem, UserRole as UserRoleValue } from "@/types";

const workspaceNavigation: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Patients", href: "/patients", icon: Users },
  { label: "Appointments", href: "/appointments", icon: CalendarDays },
  { label: "Visits", href: "/visits", icon: Stethoscope },
  { label: "Supplements", href: "/supplements", icon: Activity },
  { label: "Scans", href: "/scans", icon: ScanLine },
  { label: "Follow-ups", href: "/follow-ups", icon: ClipboardList },
  { label: "Reminders", href: "/reminders", icon: Bell },
  { label: "Reports", href: "/reports", icon: FileChartColumn },
];

const adminNavigation: NavItem[] = [
  { label: "Admin Users", href: "/admin/users", icon: ShieldCheck },
  { label: "Health Centres", href: "/admin/health-centres", icon: Building2 },
  { label: "Audit Logs", href: "/admin/audit-logs", icon: ClipboardList },
];

interface SidebarProps {
  role: UserRoleValue;
  mobile?: boolean;
  onClose?: () => void;
}

export function Sidebar({ role, mobile = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const navigation =
    role === UserRole.ADMIN
      ? [...workspaceNavigation, ...adminNavigation]
      : workspaceNavigation;

  return (
    <aside
      className={cn(
        "flex h-full w-72 flex-col border-r border-slate-200 bg-white",
        !mobile && "hidden lg:fixed lg:inset-y-0 lg:flex",
      )}
    >
      <div className="flex h-18 items-center gap-3 border-b border-slate-200 px-5">
        <span className="rounded-xl bg-teal-700 p-2 text-white">
          <HeartPulse className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-900">{APP_NAME}</p>
          <p className="text-xs text-slate-500">Clinical workspace</p>
        </div>
        {mobile && (
          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close navigation"
          >
            <X className="size-5" />
          </button>
        )}
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navigation.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-teal-50 text-teal-800"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              <Icon className="size-4.5 shrink-0" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
