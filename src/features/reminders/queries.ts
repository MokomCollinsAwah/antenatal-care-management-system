import { getCareUser } from "@/features/appointments/queries";
import { UserRole } from "@/lib/constants";
import { listReminders } from "@/server/services/clinicalSupportService";
import type { ClinicalRecordFilters } from "@/types";

export async function getReminders(filters: ClinicalRecordFilters) {
  return listReminders(await getCareUser(), filters);
}

export async function getRemindersForPatient(patientId: string) {
  return listReminders(await getCareUser(), { patientId });
}

export async function getPortalRemindersForPatient(patientId: string) {
  return listReminders({ id: "portal", role: UserRole.ADMIN }, { patientId });
}
