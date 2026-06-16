import { getCareUser } from "@/features/appointments/queries";
import { listVisitsForUser } from "@/server/services/visitService";
import type { VisitListFilters } from "@/types";

export async function getVisits(filters: VisitListFilters) {
  return listVisitsForUser(await getCareUser(), filters);
}

export async function getVisitsForPatient(patientId: string) {
  return listVisitsForUser(await getCareUser(), { patientId });
}

export async function getPortalVisitsForPatient(patientId: string) {
  return listVisitsForUser({ id: "portal", role: "ADMIN" }, { patientId });
}
