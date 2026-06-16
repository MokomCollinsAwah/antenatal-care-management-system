import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { FollowUpOutcomeBadge } from "@/features/followups/components/FollowUpOutcomeBadge";
import { formatDateTime } from "@/lib/utils";
import type { FollowUpSummary } from "@/types";

export function FollowUpTable({ followUps }: { followUps: FollowUpSummary[] }) {
  if (!followUps.length) return <EmptyState title="No follow-up records found" description="No follow-up records match the current filters." />;
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-max divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-5 py-3">Patient</th>
            <th className="px-5 py-3">Follow-up Date</th>
            <th className="px-5 py-3">Method</th>
            <th className="px-5 py-3">Outcome</th>
            <th className="px-5 py-3">Related Appointment</th>
            <th className="px-5 py-3">Followed By</th>
            <th className="px-5 py-3">Notes</th>
            <th className="px-5 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {followUps.map((record) => (
            <tr key={record.id} className="align-top hover:bg-slate-50/70">
              <td className="px-5 py-4"><p className="font-semibold text-slate-900">{record.patientName}</p><p className="text-slate-500">{record.patientPhone}</p></td>
              <td className="px-5 py-4 text-slate-600">{formatDateTime(record.followUpDate)}</td>
              <td className="px-5 py-4 text-slate-600">{record.method.replaceAll("_", " ")}</td>
              <td className="px-5 py-4"><FollowUpOutcomeBadge outcome={record.outcome} /></td>
              <td className="px-5 py-4">{record.appointmentId ? <Link href={`/appointments/${record.appointmentId}`} className="font-semibold text-teal-700">View Appointment</Link> : <span className="text-slate-500">—</span>}</td>
              <td className="px-5 py-4 text-slate-600">{record.followedByName}</td>
              <td className="px-5 py-4 text-slate-600">{record.notes || "—"}</td>
              <td className="px-5 py-4 text-right"><Link href={`/patients/${record.patientId}`} className="font-semibold text-teal-700 hover:text-teal-900">View Patient</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
