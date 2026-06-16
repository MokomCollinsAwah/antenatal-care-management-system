import { getCurrentUser } from "@/lib/auth-utils";
import { UserRole } from "@/lib/constants";
import {
  getHealthWorkerOptionsForUser,
  getPatientForUser,
  getPortalPatientProfile,
  listPatientsForUser,
} from "@/server/services/patientService";
import type { PatientListFilters } from "@/types";

async function requireCareTeamScope() {
  const user = await getCurrentUser();
  if (
    !user ||
    (user.role !== UserRole.ADMIN && user.role !== UserRole.HEALTH_WORKER)
  ) {
    throw new Error("Unauthorized");
  }
  return {
    id: user.id,
    role: user.role,
    healthCentreId: user.healthCentreId,
  };
}

export async function getPatients(filters: PatientListFilters) {
  const scope = await requireCareTeamScope();
  return listPatientsForUser(scope, filters);
}

export async function getPatientDetails(id: string) {
  const scope = await requireCareTeamScope();
  return getPatientForUser(id, scope);
}

export async function getAssignableHealthWorkers() {
  const scope = await requireCareTeamScope();
  return getHealthWorkerOptionsForUser(scope);
}

export async function getCurrentPortalPatientProfile(userId: string) {
  return getPortalPatientProfile(userId);
}
