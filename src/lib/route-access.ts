import { UserRole } from "@/lib/constants";
import type { UserRole as UserRoleValue } from "@/types";

const DASHBOARD_ROUTES = [
  "/dashboard",
  "/patients",
  "/appointments",
  "/visits",
  "/supplements",
  "/scans",
  "/follow-ups",
  "/reminders",
  "/reports",
];

const ADMIN_ROUTES = [
  "/admin/users",
  "/admin/health-centres",
  "/admin/audit-logs",
];

const matchesRoute = (pathname: string, route: string) =>
  pathname === route || pathname.startsWith(`${route}/`);

export const isPublicRoute = (pathname: string) => pathname === "/";

export const isAuthRoute = (pathname: string) =>
  matchesRoute(pathname, "/login");

export const isAdminRoute = (pathname: string) =>
  ADMIN_ROUTES.some((route) => matchesRoute(pathname, route));

export const isDashboardRoute = (pathname: string) =>
  DASHBOARD_ROUTES.some((route) => matchesRoute(pathname, route)) ||
  isAdminRoute(pathname);

export const isPortalRoute = (pathname: string) =>
  matchesRoute(pathname, "/portal");

export function canRoleAccessPath(
  role: UserRoleValue,
  pathname: string,
): boolean {
  if (isPortalRoute(pathname)) {
    return role === UserRole.PREGNANT_WOMAN;
  }

  if (isAdminRoute(pathname)) {
    return role === UserRole.ADMIN;
  }

  if (isDashboardRoute(pathname)) {
    return role === UserRole.ADMIN || role === UserRole.HEALTH_WORKER;
  }

  return true;
}

export function getUnauthorizedRedirect(role: UserRoleValue): string {
  return role === UserRole.PREGNANT_WOMAN ? "/portal" : "/dashboard";
}
