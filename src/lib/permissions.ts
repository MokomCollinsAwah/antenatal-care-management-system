import { UserRole } from "@/lib/constants";
import type { UserRole as UserRoleValue } from "@/types";

export const isAdmin = (role: UserRoleValue) => role === UserRole.ADMIN;

export const isHealthWorker = (role: UserRoleValue) =>
  role === UserRole.HEALTH_WORKER;

export const isPregnantWoman = (role: UserRoleValue) =>
  role === UserRole.PREGNANT_WOMAN;

export const canAccessDashboard = (role: UserRoleValue) =>
  isAdmin(role) || isHealthWorker(role);

export const canManageUsers = (role: UserRoleValue) => isAdmin(role);

export const canManagePatients = (role: UserRoleValue) =>
  isAdmin(role) || isHealthWorker(role);

export const canViewReports = (role: UserRoleValue) =>
  isAdmin(role) || isHealthWorker(role);
