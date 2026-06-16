import { UserRole, UserStatus } from "@/lib/constants";
import { getCurrentUser } from "@/lib/auth-utils";
import { AdminServiceError } from "@/server/services/adminServiceError";
import type { ActionResult } from "@/types";

export async function getAdminActor(): Promise<
  | { authorized: true; userId: string }
  | { authorized: false; result: ActionResult<never> }
> {
  const user = await getCurrentUser();

  if (
    !user ||
    user.role !== UserRole.ADMIN ||
    user.status !== UserStatus.ACTIVE
  ) {
    return {
      authorized: false,
      result: {
        success: false,
        message: "You are not authorized to perform this action.",
      },
    };
  }

  return { authorized: true, userId: user.id };
}

export function actionFailure<T = never>(error: unknown): ActionResult<T> {
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
      message: "A record with the same unique details already exists.",
    };
  }

  console.error("Admin action failed", error);
  return {
    success: false,
    message: "The request could not be completed. Please try again.",
  };
}
