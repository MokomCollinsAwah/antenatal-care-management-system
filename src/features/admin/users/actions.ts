"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  actionFailure,
  getAdminActor,
} from "@/features/admin/action-utils";
import { UserStatus } from "@/lib/constants";
import {
  createHealthWorkerSchema,
  resetPasswordSchema,
  updateHealthWorkerSchema,
} from "@/lib/validations";
import {
  changeHealthWorkerStatus,
  createHealthWorkerRecord,
  resetHealthWorkerPassword,
  updateHealthWorkerRecord,
} from "@/server/services/userService";
import type { ActionResult } from "@/types";

type CreateHealthWorkerInput = z.infer<typeof createHealthWorkerSchema>;
type UpdateHealthWorkerInput = z.infer<typeof updateHealthWorkerSchema>;
type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export async function createHealthWorkerAction(
  input: CreateHealthWorkerInput,
): Promise<ActionResult<{ id: string }>> {
  const actor = await getAdminActor();
  if (!actor.authorized) {
    return actor.result;
  }

  const parsed = createHealthWorkerSchema.safeParse(input);
  if (!parsed.success) {
    return validationFailure(parsed.error.flatten().fieldErrors);
  }

  try {
    const data = await createHealthWorkerRecord(parsed.data, actor.userId);
    revalidatePath("/admin/users");
    return {
      success: true,
      message: "Health worker created successfully.",
      data,
    };
  } catch (error) {
    return actionFailure(error);
  }
}

export async function updateHealthWorkerAction(
  id: string,
  input: UpdateHealthWorkerInput,
): Promise<ActionResult<{ id: string }>> {
  const actor = await getAdminActor();
  if (!actor.authorized) {
    return actor.result;
  }

  const parsed = updateHealthWorkerSchema.safeParse(input);
  if (!parsed.success) {
    return validationFailure(parsed.error.flatten().fieldErrors);
  }

  try {
    const data = await updateHealthWorkerRecord(id, parsed.data, actor.userId);
    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${id}`);
    return {
      success: true,
      message: "Health worker updated successfully.",
      data,
    };
  } catch (error) {
    return actionFailure(error);
  }
}

export async function changeUserStatusAction(
  id: string,
  status: UserStatus,
): Promise<ActionResult<{ id: string }>> {
  const actor = await getAdminActor();
  if (!actor.authorized) {
    return actor.result;
  }

  if (!Object.values(UserStatus).includes(status)) {
    return { success: false, message: "Invalid user status." };
  }

  try {
    const data = await changeHealthWorkerStatus(id, status, actor.userId);
    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${id}`);
    return {
      success: true,
      message:
        status === UserStatus.ACTIVE
          ? "User activated successfully."
          : "User suspended successfully.",
      data,
    };
  } catch (error) {
    return actionFailure(error);
  }
}

export async function resetPasswordAction(
  id: string,
  input: ResetPasswordInput,
): Promise<ActionResult<{ id: string }>> {
  const actor = await getAdminActor();
  if (!actor.authorized) {
    return actor.result;
  }

  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return validationFailure(parsed.error.flatten().fieldErrors);
  }

  try {
    const data = await resetHealthWorkerPassword(
      id,
      parsed.data.password,
      actor.userId,
    );
    revalidatePath(`/admin/users/${id}`);
    return {
      success: true,
      message: "Password reset successfully.",
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
