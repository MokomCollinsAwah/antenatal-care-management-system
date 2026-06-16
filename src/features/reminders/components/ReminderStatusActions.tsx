"use client";

import { useTransition } from "react";
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
  const canMarkDue = !portal && reminder.status === ReminderStatus.PENDING;
  const canClose = reminder.status === ReminderStatus.PENDING || reminder.status === ReminderStatus.DUE;
  const run = (status: UpdatableReminderStatus) => {
    startTransition(async () => {
      const action = portal ? updateOwnReminderStatusAction : updateReminderStatusAction;
      await action({ reminderId: reminder.id, status });
    });
  };
  if (!canMarkDue && !canClose) return null;
  return (
    <div className="flex flex-wrap justify-end gap-2">
      {canMarkDue && <Button type="button" size="sm" variant="outline" loading={isPending} onClick={() => run(ReminderStatus.DUE)}>Mark Due</Button>}
      {canClose && <Button type="button" size="sm" variant="outline" loading={isPending} onClick={() => run(ReminderStatus.READ)}>Mark Read</Button>}
      {canClose && <Button type="button" size="sm" variant="ghost" loading={isPending} onClick={() => run(ReminderStatus.DISMISSED)}>Dismiss</Button>}
    </div>
  );
}
