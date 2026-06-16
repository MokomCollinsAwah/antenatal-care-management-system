"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bell,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
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
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}

export function Sidebar({
  role,
  mobile = false,
  onClose,
  collapsed = false,
  onToggleCollapsed,
}: SidebarProps) {
  const pathname = usePathname();
  const isCollapsed = !mobile && collapsed;
  const navigation =
    role === UserRole.ADMIN
      ? [...workspaceNavigation, ...adminNavigation]
      : workspaceNavigation;

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-slate-200 bg-white transition-all duration-200",
        isCollapsed ? "w-20" : "w-72",
        !mobile && "hidden lg:fixed lg:inset-y-0 lg:flex",
      )}
    >
      <div
        className={cn(
          "flex h-18 items-center gap-3 border-b border-slate-200",
          isCollapsed ? "justify-center px-3" : "px-5",
        )}
      >
        <span className="rounded-xl bg-teal-700 p-2 text-white">
          <HeartPulse className="size-5" aria-hidden="true" />
        </span>
        <div className={cn("min-w-0", isCollapsed && "hidden")}>
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
        {!mobile && onToggleCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapsed}
            className={cn(
              "rounded-lg p-2 text-slate-500 hover:bg-slate-100",
              !isCollapsed && "ml-auto",
            )}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="size-5" />
            ) : (
              <ChevronLeft className="size-5" />
            )}
          </button>
        )}
      </div>
      <nav className={cn("flex-1 space-y-1 overflow-y-auto", isCollapsed ? "p-3" : "p-4")}>
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
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "flex items-center rounded-lg text-sm font-medium transition-colors",
                isCollapsed
                  ? "justify-center px-2 py-3"
                  : "gap-3 px-3 py-2.5",
                active
                  ? "bg-teal-50 text-teal-800"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              <Icon className="size-4.5 shrink-0" aria-hidden="true" />
              <span className={cn(isCollapsed && "sr-only")}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
