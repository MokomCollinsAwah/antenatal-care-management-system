import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate, formatDateTime } from "@/lib/utils";
import type { VisitSummary } from "@/types";

export function VisitTable({ visits }: { visits: VisitSummary[] }) {
  if (visits.length === 0) return <EmptyState title="No visit records found" description="Visit records will appear after appointments are marked attended." />;
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-max divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-5 py-3">Patient</th>
            <th className="px-5 py-3">Visit Date</th>
            <th className="px-5 py-3">Appointment Type</th>
            <th className="px-5 py-3">Weight</th>
            <th className="px-5 py-3">Blood Pressure</th>
            <th className="px-5 py-3">Recorded By</th>
            <th className="px-5 py-3">Created At</th>
            <th className="px-5 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {visits.map((visit) => (
            <tr key={visit.id}>
              <td className="px-5 py-4 font-semibold text-slate-900">{visit.patientName}</td>
              <td className="px-5 py-4 text-slate-600">{formatDate(visit.visitDate)}</td>
              <td className="px-5 py-4 text-slate-600">{visit.appointmentType.replaceAll("_", " ")}</td>
              <td className="px-5 py-4 text-slate-600">{visit.weightKg ? `${visit.weightKg} kg` : "—"}</td>
              <td className="px-5 py-4 text-slate-600">{visit.systolicBP && visit.diastolicBP ? `${visit.systolicBP}/${visit.diastolicBP}` : "—"}</td>
              <td className="px-5 py-4 text-slate-600">{visit.recordedByName}</td>
              <td className="px-5 py-4 text-slate-600">{formatDateTime(visit.createdAt)}</td>
              <td className="px-5 py-4 text-right">
                <div className="flex justify-end gap-3">
                  <Link href={`/appointments/${visit.appointmentId}`} className="font-semibold text-teal-700">View appointment</Link>
                  <Link href={`/patients/${visit.patientId}`} className="font-semibold text-slate-600">View patient</Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
