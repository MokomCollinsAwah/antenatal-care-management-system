"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { changeUserStatusAction } from "@/features/admin/users/actions";
import { Button } from "@/components/ui/Button";
import { FeedbackAlert } from "@/components/ui/FeedbackAlert";
import { UserStatus } from "@/lib/constants";
import type { ActionResult, UserStatus as UserStatusValue } from "@/types";

export function UserStatusButton({
  userId,
  status,
  userName,
  className,
}: {
  userId: string;
  status: UserStatusValue;
  userName?: string;
  className?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult<{ id: string }>>();
  const nextStatus =
    status === UserStatus.ACTIVE ? UserStatus.SUSPENDED : UserStatus.ACTIVE;

  const changeStatus = () => {
    startTransition(async () => {
      const response = await changeUserStatusAction(userId, nextStatus);
      setResult(response);
      if (response.success) {
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant={nextStatus === UserStatus.SUSPENDED ? "danger" : "secondary"}
        size="sm"
        loading={isPending}
        onClick={changeStatus}
        className={className}
        title={`${nextStatus === UserStatus.SUSPENDED ? "Suspend" : "Activate"}${userName ? ` ${userName}` : ""}`}
      >
        {nextStatus === UserStatus.SUSPENDED ? "Suspend" : "Activate"}
      </Button>
      {!result?.success && <FeedbackAlert message={result?.message} />}
    </div>
  );
}
