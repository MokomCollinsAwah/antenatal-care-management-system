"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";

export function LogoutButton({ compact = false }: { compact?: boolean }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={compact ? "size-9 px-0" : undefined}
      onClick={() => signOut({ callbackUrl: "/login" })}
      aria-label={compact ? "Log out" : undefined}
    >
      <LogOut className="size-4" />
      {!compact && "Logout"}
    </Button>
  );
}
