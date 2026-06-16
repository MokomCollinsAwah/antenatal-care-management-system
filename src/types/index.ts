import type { LucideIcon } from "lucide-react";
import type {
  AppointmentStatus as AppointmentStatusEnum,
  AppointmentType as AppointmentTypeEnum,
  FollowUpMethod as FollowUpMethodEnum,
  FollowUpOutcome as FollowUpOutcomeEnum,
  ReminderStatus as ReminderStatusEnum,
  ReminderType as ReminderTypeEnum,
  SupplementStatus as SupplementStatusEnum,
  UserRole as UserRoleEnum,
  UserStatus as UserStatusEnum,
} from "@/lib/constants";

export type UserRole = `${UserRoleEnum}`;
export type UserStatus = `${UserStatusEnum}`;
export type AppointmentType = `${AppointmentTypeEnum}`;
export type AppointmentStatus = `${AppointmentStatusEnum}`;
export type SupplementStatus = `${SupplementStatusEnum}`;
export type ReminderType = `${ReminderTypeEnum}`;
export type ReminderStatus = `${ReminderStatusEnum}`;
export type FollowUpMethod = `${FollowUpMethodEnum}`;
export type FollowUpOutcome = `${FollowUpOutcomeEnum}`;

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface DashboardStat {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
}

export type ActionResult<T = undefined> = {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
};

export interface HealthCentreSummary {
  id: string;
  name: string;
  location: string;
  phone?: string;
  healthWorkerCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface HealthCentreOption {
  value: string;
  label: string;
}

export interface AdminUserSummary {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  role: UserRole;
  status: UserStatus;
  healthCentreId?: string;
  healthCentreName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HealthWorkerOption {
  value: string;
  label: string;
  healthCentreId?: string;
}

export interface PatientSummary {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  email?: string;
  status: UserStatus;
  age: number;
  address: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  healthCentreId: string;
  healthCentreName: string;
  assignedHealthWorkerId: string;
  assignedHealthWorkerName: string;
  lastMenstrualPeriod: string;
  expectedDeliveryDate: string;
  gravidity?: number;
  parity?: number;
  bloodGroup?: string;
  riskNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientListFilters {
  search?: string;
  healthCentreId?: string;
  assignedHealthWorkerId?: string;
  expectedDeliveryDateFrom?: string;
  expectedDeliveryDateTo?: string;
}

export interface PatientOption {
  value: string;
  label: string;
  phone: string;
  healthCentreId: string;
}

export interface AppointmentSummary {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  healthCentreId: string;
  healthCentreName: string;
  appointmentType: AppointmentType;
  scheduledDateTime: string;
  status: AppointmentStatus;
  reason?: string;
  notes?: string;
  createdById: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  visit?: VisitSummary;
}

export interface AppointmentListFilters {
  search?: string;
  patientId?: string;
  appointmentType?: AppointmentType;
  status?: AppointmentStatus;
  healthCentreId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface VisitSummary {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  healthCentreId: string;
  healthCentreName: string;
  appointmentType: AppointmentType;
  visitDate: string;
  weightKg?: number;
  systolicBP?: number;
  diastolicBP?: number;
  complaint?: string;
  advice?: string;
  notes?: string;
  nextAppointmentDate?: string;
  recordedById: string;
  recordedByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface VisitListFilters {
  search?: string;
  patientId?: string;
  healthCentreId?: string;
  dateFrom?: string;
  dateTo?: string;
}
