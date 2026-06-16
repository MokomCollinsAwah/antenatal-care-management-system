"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCareUser } from "@/features/appointments/queries";
import { createVisitRecordSchema } from "@/lib/validations";
import { AdminServiceError } from "@/server/services/adminServiceError";
import { createVisitForAppointment } from "@/server/services/visitService";
import type { ActionResult } from "@/types";

type VisitInput = z.input<typeof createVisitRecordSchema>;

export async function createVisitAction(input: VisitInput): Promise<ActionResult<{ id: string; appointmentId: string }>> {
  const parsed = createVisitRecordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please correct the highlighted fields.",
      errors: Object.fromEntries(Object.entries(parsed.error.flatten().fieldErrors).filter((entry): entry is [string, string[]] => Boolean(entry[1]))),
    };
  }
  try {
    const data = await createVisitForAppointment(parsed.data, await getCareUser());
    revalidatePath("/appointments");
    revalidatePath("/visits");
    revalidatePath(`/appointments/${data.appointmentId}`);
    return { success: true, message: "Visit record created successfully.", data };
  } catch (error) {
    if (error instanceof AdminServiceError) return { success: false, message: error.message };
    console.error("Visit action failed", error);
    return { success: false, message: "The request could not be completed. Please try again." };
  }
}
