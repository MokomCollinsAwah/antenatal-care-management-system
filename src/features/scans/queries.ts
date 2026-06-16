import { getCareUser } from "@/features/appointments/queries";
import { UserRole } from "@/lib/constants";
import { listScans } from "@/server/services/clinicalSupportService";
import type { ClinicalRecordFilters } from "@/types";

export async function getScans(filters: ClinicalRecordFilters) {
  return listScans(await getCareUser(), filters);
}

export async function getScansForPatient(patientId: string) {
  return listScans(await getCareUser(), { patientId });
}

export async function getPortalScansForPatient(patientId: string) {
  return listScans({ id: "portal", role: UserRole.ADMIN }, { patientId });
}
