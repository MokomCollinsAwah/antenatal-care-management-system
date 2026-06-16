"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCareUser } from "@/features/appointments/queries";
import { FollowUpMethod, FollowUpOutcome } from "@/lib/constants";
import { createFollowUpRecordSchema } from "@/lib/validations";
import { AdminServiceError } from "@/server/services/adminServiceError";
import { createFollowUp } from "@/server/services/clinicalSupportService";
import type { ActionResult } from "@/types";

type Input = z.input<typeof createFollowUpRecordSchema>;

export async function createFollowUpAction(input: Input): Promise<ActionResult<{ id: string }>> {
  const parsed = createFollowUpRecordSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error.flatten().fieldErrors);
  try {
    const data = await createFollowUp(
      {
        ...parsed.data,
        appointmentId: parsed.data.appointmentId || undefined,
        method: parsed.data.method as FollowUpMethod,
        outcome: parsed.data.outcome as FollowUpOutcome,
      },
      await getCareUser(),
    );
    revalidatePath("/follow-ups");
    revalidatePath(`/patients/${parsed.data.patientId}`);
    if (parsed.data.appointmentId) revalidatePath(`/appointments/${parsed.data.appointmentId}`);
    return { success: true, message: "Follow-up record created successfully.", data };
  } catch (error) {
    return actionFailure(error, "Follow-up action failed");
  }
}

function validationFailure(errors: Record<string, string[] | undefined>): ActionResult<never> {
  return { success: false, message: "Please correct the highlighted fields.", errors: Object.fromEntries(Object.entries(errors).filter((entry): entry is [string, string[]] => Boolean(entry[1]))) };
}

function actionFailure<T = never>(error: unknown, label: string): ActionResult<T> {
  if (error instanceof AdminServiceError) return { success: false, message: error.message };
  if (error instanceof Error && error.message === "Unauthorized") return { success: false, message: "You are not authorized to perform this action." };
  console.error(label, error);
  return { success: false, message: "The request could not be completed. Please try again." };
}
