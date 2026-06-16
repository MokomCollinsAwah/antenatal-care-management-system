import { EmptyState } from "@/components/ui/EmptyState";
import { ReminderStatusActions } from "@/features/reminders/components/ReminderStatusActions";
import { ReminderStatusBadge } from "@/features/reminders/components/ReminderStatusBadge";
import { ReminderStatus } from "@/lib/constants";
import { cn, formatDateTime } from "@/lib/utils";
import type { ReminderSummary } from "@/types";

export function PatientReminderList({ reminders, portal = false }: { reminders: ReminderSummary[]; portal?: boolean }) {
  if (!reminders.length) return <EmptyState title="No reminders" description="Reminders will appear here when created by your care team." />;
  return (
    <div className="space-y-3">
      {reminders.map((reminder) => (
        <div
          key={reminder.id}
          className={cn(
            "rounded-xl border p-4",
            reminder.status === ReminderStatus.DUE
              ? "border-amber-200 bg-amber-50"
              : "border-slate-200 bg-white",
          )}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="font-semibold text-slate-900">{reminder.title}</p>
              <p className="mt-1 text-sm text-slate-500">
                {formatDateTime(reminder.dueDateTime)} · {reminder.reminderType.replaceAll("_", " ")}
              </p>
            </div>
            <div className="shrink-0">
              <ReminderStatusBadge status={reminder.status} />
            </div>
          </div>
          <p className="mt-3 break-words text-sm leading-6 text-slate-600">{reminder.message}</p>
          <div className="mt-3">
            <ReminderStatusActions reminder={reminder} portal={portal} />
          </div>
        </div>
      ))}
    </div>
  );
}
