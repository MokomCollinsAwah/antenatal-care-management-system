import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { ReminderStatusActions } from "@/features/reminders/components/ReminderStatusActions";
import { ReminderStatusBadge } from "@/features/reminders/components/ReminderStatusBadge";
import { formatDateTime } from "@/lib/utils";
import type { ReminderSummary } from "@/types";

export function ReminderTable({ reminders }: { reminders: ReminderSummary[] }) {
  if (!reminders.length) return <EmptyState title="No reminders found" description="No reminders match the current filters." />;
  return (
    <div className="responsive-table">
      <table className="w-full min-w-max divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-5 py-3">Patient</th>
            <th className="px-5 py-3">Title</th>
            <th className="px-5 py-3">Type</th>
            <th className="px-5 py-3">Due Date/Time</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3">Message</th>
            <th className="px-5 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {reminders.map((reminder) => (
            <tr key={reminder.id} className="align-top hover:bg-slate-50/70">
              <td data-label="Patient" className="px-5 py-4"><p className="font-semibold text-slate-900">{reminder.patientName}</p><p className="text-slate-500">{reminder.patientPhone}</p></td>
              <td data-label="Title" className="px-5 py-4 text-slate-600">{reminder.title}</td>
              <td data-label="Type" className="px-5 py-4 text-slate-600">{reminder.reminderType.replaceAll("_", " ")}</td>
              <td data-label="Due Date/Time" className="px-5 py-4 text-slate-600">{formatDateTime(reminder.dueDateTime)}</td>
              <td data-label="Status" className="px-5 py-4"><ReminderStatusBadge status={reminder.status} /></td>
              <td data-label="Message" className="max-w-sm px-5 py-4 text-slate-600">{reminder.message}</td>
              <td data-label="Actions" className="px-5 py-4">
                <div className="flex flex-col items-end gap-2">
                  <ReminderStatusActions reminder={reminder} />
                  <Link href={`/patients/${reminder.patientId}`} className="font-semibold text-teal-700 hover:text-teal-900">View Patient</Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
