import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { SupplementStatusBadge } from "@/features/supplements/components/SupplementStatusBadge";
import { formatDate } from "@/lib/utils";
import type { SupplementSummary } from "@/types";

export function SupplementTable({ supplements }: { supplements: SupplementSummary[] }) {
  if (!supplements.length) return <EmptyState title="No supplement records found" description="No supplement records match the current filters." />;
  return (
    <div className="responsive-table">
      <table className="w-full min-w-max divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-5 py-3">Patient</th>
            <th className="px-5 py-3">Supplement Name</th>
            <th className="px-5 py-3">Dosage</th>
            <th className="px-5 py-3">Frequency</th>
            <th className="px-5 py-3">Start Date</th>
            <th className="px-5 py-3">End Date</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3">Recorded By</th>
            <th className="px-5 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {supplements.map((record) => (
            <tr key={record.id} className="align-top hover:bg-slate-50/70">
              <td data-label="Patient" className="px-5 py-4"><p className="font-semibold text-slate-900">{record.patientName}</p><p className="text-slate-500">{record.patientPhone}</p></td>
              <td data-label="Supplement Name" className="px-5 py-4 text-slate-600">{record.supplementName}</td>
              <td data-label="Dosage" className="px-5 py-4 text-slate-600">{record.dosage}</td>
              <td data-label="Frequency" className="px-5 py-4 text-slate-600">{record.frequency}</td>
              <td data-label="Start Date" className="px-5 py-4 text-slate-600">{formatDate(record.startDate)}</td>
              <td data-label="End Date" className="px-5 py-4 text-slate-600">{record.endDate ? formatDate(record.endDate) : "—"}</td>
              <td data-label="Status" className="px-5 py-4"><SupplementStatusBadge status={record.status} /></td>
              <td data-label="Recorded By" className="px-5 py-4 text-slate-600">{record.recordedByName}</td>
              <td data-label="Actions" className="px-5 py-4 text-right">
                <div className="flex flex-col items-end gap-2">
                  <Link href={`/supplements/${record.id}/edit`} className="font-semibold text-teal-700 hover:text-teal-900">Edit</Link>
                  <Link href={`/patients/${record.patientId}`} className="font-semibold text-slate-600 hover:text-slate-900">View Patient</Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
