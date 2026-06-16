import { getCareUser } from "@/features/appointments/queries";
import { UserRole } from "@/lib/constants";
import { listSupplements } from "@/server/services/clinicalSupportService";
import type { ClinicalRecordFilters } from "@/types";

export async function getSupplements(filters: ClinicalRecordFilters) {
  return listSupplements(await getCareUser(), filters);
}

export async function getSupplementsForPatient(patientId: string) {
  return listSupplements(await getCareUser(), { patientId });
}

export async function getPortalSupplementsForPatient(patientId: string) {
  return listSupplements({ id: "portal", role: UserRole.ADMIN }, { patientId });
}
