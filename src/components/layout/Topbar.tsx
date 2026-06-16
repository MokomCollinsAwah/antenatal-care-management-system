import type { Session } from "next-auth";
import { Bell, Menu } from "lucide-react";
import { LogoutButton } from "@/components/layout/LogoutButton";
import { APP_NAME } from "@/lib/constants";
import { getInitials } from "@/lib/utils";

const roleLabels = {
  ADMIN: "Administrator",
  HEALTH_WORKER: "Health Worker",
  PREGNANT_WOMAN: "Pregnant Woman",
};

interface TopbarProps {
  user: Session["user"];
  onMenuClick: () => void;
}

export function Topbar({ user, onMenuClick }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        className="mr-3 rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="size-5" />
      </button>
      <p className="hidden text-sm font-semibold text-slate-800 sm:block">
        {APP_NAME}
      </p>
      <div className="ml-auto flex items-center gap-3">
        <button
          type="button"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          aria-label="Notifications"
        >
          <Bell className="size-5" />
        </button>
        <div className="h-8 w-px bg-slate-200" />
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-800">
            {getInitials(user.fullName)}
          </span>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-800">
              {user.fullName}
            </p>
            <p className="text-xs text-slate-500">
              {roleLabels[user.role]}
              {user.healthCentreId ? " · Assigned health centre" : ""}
            </p>
          </div>
        </div>
        <LogoutButton compact />
      </div>
    </header>
  );
}
