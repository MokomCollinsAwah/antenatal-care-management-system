import { EmptyState } from "@/components/ui/EmptyState";
import { ReminderStatusActions } from "@/features/reminders/components/ReminderStatusActions";
import { ReminderStatusBadge } from "@/features/reminders/components/ReminderStatusBadge";
import { formatDateTime } from "@/lib/utils";
import type { ReminderSummary } from "@/types";

export function PatientReminderList({ reminders, portal = false }: { reminders: ReminderSummary[]; portal?: boolean }) {
  if (!reminders.length) return <EmptyState title="No reminders" description="Reminders will appear here when created by your care team." />;
  return (
    <div className="space-y-3">
      {reminders.map((reminder) => (
        <div key={reminder.id} className="rounded-lg border border-slate-200 p-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-slate-900">{reminder.title}</p>
              <p className="text-sm text-slate-500">{formatDateTime(reminder.dueDateTime)} · {reminder.reminderType.replaceAll("_", " ")}</p>
            </div>
            <ReminderStatusBadge status={reminder.status} />
          </div>
          <p className="mt-2 text-sm text-slate-600">{reminder.message}</p>
          <div className="mt-3">
            <ReminderStatusActions reminder={reminder} portal={portal} />
          </div>
        </div>
      ))}
    </div>
  );
}
