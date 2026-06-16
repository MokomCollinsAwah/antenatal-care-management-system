import { Types } from "mongoose";
import {
  createHealthCentre,
  findDuplicateHealthCentre,
  findHealthCentreById,
  findHealthCentreOptions,
  findHealthCentresWithWorkerCounts,
  updateHealthCentre,
  type HealthCentreWriteInput,
} from "@/server/repositories/healthCentreRepository";
import { recordAdminAudit } from "@/server/services/auditLogService";
import { AdminServiceError } from "@/server/services/adminServiceError";
import type { HealthCentreOption, HealthCentreSummary } from "@/types";

const serializeHealthCentre = (centre: {
  _id: Types.ObjectId;
  name: string;
  location: string;
  phone?: string;
  healthWorkerCount: number;
  createdAt: Date;
  updatedAt: Date;
}): HealthCentreSummary => ({
  id: centre._id.toString(),
  name: centre.name,
  location: centre.location,
  phone: centre.phone,
  healthWorkerCount: centre.healthWorkerCount,
  createdAt: centre.createdAt.toISOString(),
  updatedAt: centre.updatedAt.toISOString(),
});

export async function listHealthCentres(): Promise<HealthCentreSummary[]> {
  const centres = await findHealthCentresWithWorkerCounts();
  return centres.map(serializeHealthCentre);
}

export async function getHealthCentre(id: string) {
  assertObjectId(id);
  const centre = await findHealthCentreById(id);

  if (!centre) {
    throw new AdminServiceError("Health centre not found.", "NOT_FOUND");
  }

  return serializeHealthCentre(centre);
}

export async function getHealthCentreOptions(): Promise<HealthCentreOption[]> {
  const centres = await findHealthCentreOptions();
  return centres.map((centre) => ({
    value: centre._id.toString(),
    label: `${centre.name} — ${centre.location}`,
  }));
}

export async function createHealthCentreRecord(
  input: HealthCentreWriteInput,
  actorId: string,
) {
  const duplicate = await findDuplicateHealthCentre(input.name, input.location);
  if (duplicate) {
    throw new AdminServiceError(
      "A health centre with this name already exists in this location.",
      "DUPLICATE",
    );
  }

  const centre = await createHealthCentre(normalizeHealthCentre(input));
  await recordAdminAudit({
    actorId,
    action: "HEALTH_CENTRE_CREATED",
    entityType: "HealthCentre",
    entityId: centre.id,
    description: `Created health centre ${centre.name}`,
  });

  return { id: centre.id };
}

export async function updateHealthCentreRecord(
  id: string,
  input: HealthCentreWriteInput,
  actorId: string,
) {
  assertObjectId(id);
  const duplicate = await findDuplicateHealthCentre(
    input.name,
    input.location,
    id,
  );
  if (duplicate) {
    throw new AdminServiceError(
      "A health centre with this name already exists in this location.",
      "DUPLICATE",
    );
  }

  const centre = await updateHealthCentre(id, normalizeHealthCentre(input));
  if (!centre) {
    throw new AdminServiceError("Health centre not found.", "NOT_FOUND");
  }

  await recordAdminAudit({
    actorId,
    action: "HEALTH_CENTRE_UPDATED",
    entityType: "HealthCentre",
    entityId: centre.id,
    description: `Updated health centre ${centre.name}`,
  });

  return { id: centre.id };
}

function normalizeHealthCentre(input: HealthCentreWriteInput) {
  return {
    name: input.name.trim(),
    location: input.location.trim(),
    phone: input.phone?.trim() || undefined,
  };
}

function assertObjectId(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new AdminServiceError("Invalid health centre id.", "INVALID_ID");
  }
}
