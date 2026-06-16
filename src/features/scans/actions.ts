"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCareUser } from "@/features/appointments/queries";
import { createScanRecordSchema } from "@/lib/validations";
import { AdminServiceError } from "@/server/services/adminServiceError";
import { createScan } from "@/server/services/clinicalSupportService";
import type { ActionResult } from "@/types";

type Input = z.input<typeof createScanRecordSchema>;

export async function createScanAction(input: Input): Promise<ActionResult<{ id: string }>> {
  const parsed = createScanRecordSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error.flatten().fieldErrors);
  try {
    const data = await createScan(parsed.data, await getCareUser());
    revalidatePath("/scans");
    revalidatePath("/reminders");
    revalidatePath(`/patients/${parsed.data.patientId}`);
    return { success: true, message: "Scan record created successfully.", data };
  } catch (error) {
    return actionFailure(error, "Scan action failed");
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
