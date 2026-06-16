import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { UserRole, UserStatus } from "@/lib/constants";
import type { UserRole as UserRoleValue } from "@/types";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user || user.status !== UserStatus.ACTIVE) {
    redirect("/login");
  }

  return user;
}

export async function requireRole(allowedRoles: UserRoleValue[]) {
  const user = await requireAuth();

  if (!allowedRoles.includes(user.role)) {
    redirect(getDefaultRedirectForRole(user.role));
  }

  return user;
}

export function getDefaultRedirectForRole(role: UserRoleValue): string {
  return role === UserRole.PREGNANT_WOMAN ? "/portal" : "/dashboard";
}
