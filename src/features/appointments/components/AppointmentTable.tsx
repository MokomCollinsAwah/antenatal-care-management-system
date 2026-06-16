import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { AppointmentStatusActions } from "@/features/appointments/components/AppointmentStatusActions";
import { AppointmentStatusBadge } from "@/features/appointments/components/AppointmentStatusBadge";
import { formatDateTime } from "@/lib/utils";
import type { AppointmentSummary } from "@/types";

export function AppointmentTable({ appointments }: { appointments: AppointmentSummary[] }) {
  if (appointments.length === 0) {
    return <EmptyState title="No appointments found" description="No appointments match the current filters." />;
  }
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-max divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-5 py-3">Patient</th>
            <th className="px-5 py-3">Phone</th>
            <th className="px-5 py-3">Type</th>
            <th className="px-5 py-3">Scheduled</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3">Health Centre</th>
            <th className="px-5 py-3">Created By</th>
            <th className="px-5 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {appointments.map((appointment) => (
            <tr key={appointment.id} className="align-top hover:bg-slate-50/70">
              <td className="px-5 py-4 font-semibold text-slate-900">{appointment.patientName}</td>
              <td className="px-5 py-4 text-slate-600">{appointment.patientPhone}</td>
              <td className="px-5 py-4 text-slate-600">{appointment.appointmentType.replaceAll("_", " ")}</td>
              <td className="px-5 py-4 text-slate-600">{formatDateTime(appointment.scheduledDateTime)}</td>
              <td className="px-5 py-4"><AppointmentStatusBadge status={appointment.status} /></td>
              <td className="px-5 py-4 text-slate-600">{appointment.healthCentreName}</td>
              <td className="px-5 py-4 text-slate-600">{appointment.createdByName}</td>
              <td className="px-5 py-4">
                <div className="flex flex-col items-end gap-2">
                  <Link href={`/appointments/${appointment.id}`} className="font-semibold text-teal-700 hover:text-teal-900">View</Link>
                  <AppointmentStatusActions appointment={appointment} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
