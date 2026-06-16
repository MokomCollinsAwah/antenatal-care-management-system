"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { updateOwnReminderStatusAction, updateReminderStatusAction } from "@/features/reminders/actions";
import { ReminderStatus } from "@/lib/constants";
import type { ReminderSummary } from "@/types";

type UpdatableReminderStatus =
  | ReminderStatus.DUE
  | ReminderStatus.READ
  | ReminderStatus.DISMISSED;

export function ReminderStatusActions({ reminder, portal = false }: { reminder: ReminderSummary; portal?: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);
  const canMarkDue = !portal && reminder.status === ReminderStatus.PENDING;
  const canClose = reminder.status === ReminderStatus.PENDING || reminder.status === ReminderStatus.DUE;
  const run = (status: UpdatableReminderStatus) => {
    setMessage(null);
    setSuccess(null);
    startTransition(async () => {
      const action = portal ? updateOwnReminderStatusAction : updateReminderStatusAction;
      const result = await action({ reminderId: reminder.id, status });
      setMessage(result.message);
      setSuccess(result.success);
    });
  };
  if (!canMarkDue && !canClose) return null;
  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
        {canMarkDue && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            loading={isPending}
            className="w-full sm:w-auto"
            onClick={() => run(ReminderStatus.DUE)}
          >
            Mark Due
          </Button>
        )}
        {canClose && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            loading={isPending}
            className="w-full sm:w-auto"
            onClick={() => run(ReminderStatus.READ)}
          >
            Mark Read
          </Button>
        )}
        {canClose && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            loading={isPending}
            className="w-full sm:w-auto"
            onClick={() => run(ReminderStatus.DISMISSED)}
          >
            Dismiss
          </Button>
        )}
      </div>
      {message && (
        <p className={success ? "text-right text-xs font-medium text-teal-700" : "text-right text-xs font-medium text-red-600"}>
          {message}
        </p>
      )}
    </div>
  );
}
