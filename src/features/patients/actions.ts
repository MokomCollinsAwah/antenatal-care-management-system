"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth-utils";
import { UserRole } from "@/lib/constants";
import {
  createPatientWithProfileSchema,
  updatePatientWithProfileSchema,
} from "@/lib/validations";
import { AdminServiceError } from "@/server/services/adminServiceError";
import {
  createPatientRecord,
  resetPatientPassword,
  updatePatientRecord,
} from "@/server/services/patientService";
import type { ActionResult, UserRole as UserRoleValue } from "@/types";

type CreatePatientInput = z.input<typeof createPatientWithProfileSchema>;
type UpdatePatientInput = z.input<typeof updatePatientWithProfileSchema>;

async function getCareTeamActor(): Promise<
  | {
      authorized: true;
      user: {
        id: string;
        role: UserRoleValue;
        healthCentreId?: string;
      };
    }
  | { authorized: false; result: ActionResult<never> }
> {
  const user = await getCurrentUser();
  if (
    !user ||
    (user.role !== UserRole.ADMIN && user.role !== UserRole.HEALTH_WORKER)
  ) {
    return {
      authorized: false,
      result: {
        success: false,
        message: "You are not authorized to perform this action.",
      },
    };
  }

  return {
    authorized: true,
    user: {
      id: user.id,
      role: user.role,
      healthCentreId: user.healthCentreId,
    },
  };
}

export async function createPatientAction(
  input: CreatePatientInput,
): Promise<ActionResult<{ id: string }>> {
  const actor = await getCareTeamActor();
  if (!actor.authorized) {
    return actor.result;
  }

  const parsed = createPatientWithProfileSchema.safeParse(input);
  if (!parsed.success) {
    return validationFailure(parsed.error.flatten().fieldErrors);
  }

  try {
    const data = await createPatientRecord(parsed.data, actor.user);
    revalidatePath("/patients");
    return {
      success: true,
      message: "Pregnant woman registered successfully.",
      data,
    };
  } catch (error) {
    return actionFailure(error);
  }
}

export async function updatePatientAction(
  id: string,
  input: UpdatePatientInput,
): Promise<ActionResult<{ id: string }>> {
  const actor = await getCareTeamActor();
  if (!actor.authorized) {
    return actor.result;
  }

  const parsed = updatePatientWithProfileSchema.safeParse(input);
  if (!parsed.success) {
    return validationFailure(parsed.error.flatten().fieldErrors);
  }

  try {
    const data = await updatePatientRecord(id, parsed.data, actor.user);
    revalidatePath("/patients");
    revalidatePath(`/patients/${id}`);
    return {
      success: true,
      message: "Patient profile updated successfully.",
      data,
    };
  } catch (error) {
    return actionFailure(error);
  }
}

export async function resetPatientPasswordAction(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  const actor = await getCareTeamActor();
  if (!actor.authorized) {
    return actor.result;
  }

  try {
    const data = await resetPatientPassword(id, actor.user);
    revalidatePath("/patients");
    revalidatePath(`/patients/${id}`);
    return {
      success: true,
      message: "Patient password reset successfully.",
      data,
    };
  } catch (error) {
    return actionFailure(error);
  }
}

function validationFailure(
  errors: Record<string, string[] | undefined>,
): ActionResult<never> {
  return {
    success: false,
    message: "Please correct the highlighted fields.",
    errors: Object.fromEntries(
      Object.entries(errors).filter(
        (entry): entry is [string, string[]] => Boolean(entry[1]),
      ),
    ),
  };
}

function actionFailure<T = never>(error: unknown): ActionResult<T> {
  if (error instanceof AdminServiceError) {
    return { success: false, message: error.message };
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  ) {
    return {
      success: false,
      message: "A user with these unique details already exists.",
    };
  }

  console.error("Patient action failed", error);
  return {
    success: false,
    message: "The request could not be completed. Please try again.",
  };
}
