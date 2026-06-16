import { getCurrentUser } from "@/lib/auth-utils";
import { UserRole } from "@/lib/constants";
import {
  getAppointmentForUser,
  getPatientOptionsForAppointments,
  listAppointmentsForUser,
  type CurrentCareUser,
} from "@/server/services/appointmentService";
import type { AppointmentListFilters } from "@/types";

export async function getCareUser(): Promise<CurrentCareUser> {
  const user = await getCurrentUser();
  if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.HEALTH_WORKER)) {
    throw new Error("Unauthorized");
  }
  return { id: user.id, role: user.role, healthCentreId: user.healthCentreId };
}

export async function getAppointments(filters: AppointmentListFilters) {
  return listAppointmentsForUser(await getCareUser(), filters);
}

export async function getAppointmentDetails(id: string) {
  return getAppointmentForUser(id, await getCareUser());
}

export async function getAppointmentPatientOptions() {
  return getPatientOptionsForAppointments(await getCareUser());
}

export async function getAppointmentsForPatient(patientId: string) {
  return listAppointmentsForUser(await getCareUser(), { patientId });
}

export async function getPortalAppointmentsForPatient(patientId: string) {
  return listAppointmentsForUser(
    { id: "portal", role: UserRole.ADMIN },
    { patientId },
  );
}
