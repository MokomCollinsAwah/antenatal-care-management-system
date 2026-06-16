import type { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { UserRole } from "@/lib/constants";
import { requireRole } from "@/lib/auth-utils";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireRole([UserRole.ADMIN, UserRole.HEALTH_WORKER]);
  return <DashboardShell user={user}>{children}</DashboardShell>;
}
