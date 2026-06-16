"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAppointmentSchema } from "@/lib/validations";
import { AppointmentType } from "@/lib/constants";
import { AdminServiceError } from "@/server/services/adminServiceError";
import {
  cancelAppointmentRecord,
  createAppointmentRecord,
  markAppointmentMissed,
} from "@/server/services/appointmentService";
import { getCareUser } from "@/features/appointments/queries";
import type { ActionResult } from "@/types";

type CreateAppointmentInput = z.input<typeof createAppointmentSchema>;

export async function createAppointmentAction(
  input: CreateAppointmentInput,
): Promise<ActionResult<{ id: string }>> {
  const parsed = createAppointmentSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error.flatten().fieldErrors);
  try {
    const data = await createAppointmentRecord(
      { ...parsed.data, appointmentType: parsed.data.appointmentType as AppointmentType },
      await getCareUser(),
    );
    revalidatePath("/appointments");
    return { success: true, message: "Appointment scheduled successfully.", data };
  } catch (error) {
    return actionFailure(error);
  }
}

export async function markAppointmentMissedAction(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    const data = await markAppointmentMissed(id, await getCareUser());
    revalidatePath("/appointments");
    revalidatePath(`/appointments/${id}`);
    return { success: true, message: "Appointment marked as missed.", data };
  } catch (error) {
    return actionFailure(error);
  }
}

export async function cancelAppointmentAction(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    const data = await cancelAppointmentRecord(id, await getCareUser());
    revalidatePath("/appointments");
    revalidatePath(`/appointments/${id}`);
    return { success: true, message: "Appointment cancelled successfully.", data };
  } catch (error) {
    return actionFailure(error);
  }
}

function validationFailure(errors: Record<string, string[] | undefined>): ActionResult<never> {
  return {
    success: false,
    message: "Please correct the highlighted fields.",
    errors: Object.fromEntries(Object.entries(errors).filter((entry): entry is [string, string[]] => Boolean(entry[1]))),
  };
}

function actionFailure<T = never>(error: unknown): ActionResult<T> {
  if (error instanceof AdminServiceError) return { success: false, message: error.message };
  console.error("Appointment action failed", error);
  return { success: false, message: "The request could not be completed. Please try again." };
}
