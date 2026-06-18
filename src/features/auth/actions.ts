"use server";

import { z } from "zod";
import { getCurrentUser } from "@/lib/auth-utils";
import { comparePassword, hashPassword } from "@/lib/password";
import { changePasswordSchema } from "@/lib/validations";
import {
  findUserPasswordById,
  updateOwnPassword,
} from "@/server/repositories/userRepository";
import { recordAdminAudit } from "@/server/services/auditLogService";
import type { ActionResult } from "@/types";

type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export async function changeOwnPasswordAction(
  input: ChangePasswordInput,
): Promise<ActionResult> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return {
      success: false,
      message: "You must be signed in to change your password.",
    };
  }

  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return validationFailure(parsed.error.flatten().fieldErrors);
  }

  const user = await findUserPasswordById(currentUser.id);
  if (!user) {
    return { success: false, message: "User account was not found." };
  }

  const currentPasswordMatches = await comparePassword(
    parsed.data.currentPassword,
    user.passwordHash,
  );
  if (!currentPasswordMatches) {
    return {
      success: false,
      message: "Please correct the highlighted fields.",
      errors: { currentPassword: ["Current password is incorrect"] },
    };
  }

  await updateOwnPassword(
    currentUser.id,
    await hashPassword(parsed.data.password),
    false,
  );

  await recordAdminAudit({
    actorId: currentUser.id,
    action: "PASSWORD_CHANGED",
    entityType: "User",
    entityId: currentUser.id,
    description: `Changed password for ${currentUser.fullName}.`,
  });

  return {
    success: true,
    message: "Password changed successfully. Please sign in again.",
  };
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
