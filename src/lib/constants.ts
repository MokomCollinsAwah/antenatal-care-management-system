export enum UserRole {
  ADMIN = "ADMIN",
  HEALTH_WORKER = "HEALTH_WORKER",
  PREGNANT_WOMAN = "PREGNANT_WOMAN",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
}

export enum AppointmentType {
  ANTENATAL_VISIT = "ANTENATAL_VISIT",
  SCAN = "SCAN",
  SUPPLEMENT_CHECK = "SUPPLEMENT_CHECK",
  FOLLOW_UP = "FOLLOW_UP",
}

export enum AppointmentStatus {
  SCHEDULED = "SCHEDULED",
  ATTENDED = "ATTENDED",
  MISSED = "MISSED",
  CANCELLED = "CANCELLED",
}

export enum SupplementStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  STOPPED = "STOPPED",
}

export enum ReminderType {
  APPOINTMENT = "APPOINTMENT",
  SCAN = "SCAN",
  SUPPLEMENT = "SUPPLEMENT",
  FOLLOW_UP = "FOLLOW_UP",
}

export enum ReminderStatus {
  PENDING = "PENDING",
  DUE = "DUE",
  READ = "READ",
  DISMISSED = "DISMISSED",
}

export enum FollowUpMethod {
  CALL = "CALL",
  SMS = "SMS",
  WHATSAPP = "WHATSAPP",
  PHYSICAL_VISIT = "PHYSICAL_VISIT",
  OTHER = "OTHER",
}

export enum FollowUpOutcome {
  CONTACTED = "CONTACTED",
  NOT_REACHED = "NOT_REACHED",
  RESCHEDULED = "RESCHEDULED",
  VISITED = "VISITED",
  PENDING = "PENDING",
}

export const BLOOD_GROUP_VALUES = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;

const toLabel = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const enumOptions = <T extends Record<string, string>>(values: T) =>
  Object.values(values).map((value) => ({ value, label: toLabel(value) }));

export const ROLE_OPTIONS = enumOptions(UserRole);
export const USER_STATUS_OPTIONS = enumOptions(UserStatus);
export const APPOINTMENT_TYPE_OPTIONS = enumOptions(AppointmentType);
export const APPOINTMENT_STATUS_OPTIONS = enumOptions(AppointmentStatus);
export const SUPPLEMENT_STATUS_OPTIONS = enumOptions(SupplementStatus);
export const REMINDER_TYPE_OPTIONS = enumOptions(ReminderType);
export const REMINDER_STATUS_OPTIONS = enumOptions(ReminderStatus);
export const FOLLOW_UP_METHOD_OPTIONS = enumOptions(FollowUpMethod);
export const FOLLOW_UP_OUTCOME_OPTIONS = enumOptions(FollowUpOutcome);
export const BLOOD_GROUP_OPTIONS = BLOOD_GROUP_VALUES.map((value) => ({
  value,
  label: value,
}));

export const DEFAULT_TEMPORARY_PASSWORD = "12345678";

export const APP_NAME =
  process.env.APP_NAME ?? "Antenatal Care Management System";
