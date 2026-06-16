import { getCareUser } from "@/features/appointments/queries";
import { UserRole } from "@/lib/constants";
import { listFollowUps } from "@/server/services/clinicalSupportService";
import type { ClinicalRecordFilters } from "@/types";

export async function getFollowUps(filters: ClinicalRecordFilters) {
  return listFollowUps(await getCareUser(), filters);
}

export async function getFollowUpsForPatient(patientId: string) {
  return listFollowUps(await getCareUser(), { patientId });
}

export async function getPortalFollowUpsForPatient(patientId: string) {
  return listFollowUps({ id: "portal", role: UserRole.ADMIN }, { patientId });
}
