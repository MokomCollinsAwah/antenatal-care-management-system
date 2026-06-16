"use client";

import { useState, type ReactNode } from "react";
import type { Session } from "next-auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

interface DashboardShellProps {
  children: ReactNode;
  user: Session["user"];
}

export function DashboardShell({ children, user }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        role={user.role}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((value) => !value)}
      />
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/40"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation overlay"
          />
          <div className="relative h-full w-72">
            <Sidebar
              role={user.role}
              mobile
              onClose={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}
      <div
        className={
          sidebarCollapsed
            ? "min-w-0 overflow-x-hidden lg:pl-20"
            : "min-w-0 overflow-x-hidden lg:pl-72"
        }
      >
        <Topbar user={user} onMenuClick={() => setMobileOpen(true)} />
        <main className="min-w-0 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
