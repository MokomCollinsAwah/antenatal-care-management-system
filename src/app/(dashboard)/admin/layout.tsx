import type { ReactNode } from "react";
import { requireRole } from "@/lib/auth-utils";
import { UserRole } from "@/lib/constants";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireRole([UserRole.ADMIN]);
  return children;
}
