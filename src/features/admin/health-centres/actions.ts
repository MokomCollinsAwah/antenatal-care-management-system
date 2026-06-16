"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  actionFailure,
  getAdminActor,
} from "@/features/admin/action-utils";
import {
  createHealthCentreSchema,
  updateHealthCentreSchema,
} from "@/lib/validations";
import {
  createHealthCentreRecord,
  updateHealthCentreRecord,
} from "@/server/services/healthCentreService";
import type { ActionResult } from "@/types";

type HealthCentreInput = z.infer<typeof createHealthCentreSchema>;

export async function createHealthCentreAction(
  input: HealthCentreInput,
): Promise<ActionResult<{ id: string }>> {
  const actor = await getAdminActor();
  if (!actor.authorized) {
    return actor.result;
  }

  const parsed = createHealthCentreSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please correct the highlighted fields.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const data = await createHealthCentreRecord(parsed.data, actor.userId);
    revalidatePath("/admin/health-centres");
    return {
      success: true,
      message: "Health centre created successfully.",
      data,
    };
  } catch (error) {
    return actionFailure(error);
  }
}

export async function updateHealthCentreAction(
  id: string,
  input: HealthCentreInput,
): Promise<ActionResult<{ id: string }>> {
  const actor = await getAdminActor();
  if (!actor.authorized) {
    return actor.result;
  }

  const parsed = updateHealthCentreSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please correct the highlighted fields.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const data = await updateHealthCentreRecord(id, parsed.data, actor.userId);
    revalidatePath("/admin/health-centres");
    revalidatePath(`/admin/health-centres/${id}`);
    return {
      success: true,
      message: "Health centre updated successfully.",
      data,
    };
  } catch (error) {
    return actionFailure(error);
  }
}
