import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { AppointmentStatusBadge } from "@/features/appointments/components/AppointmentStatusBadge";
import { formatDateTime } from "@/lib/utils";
import type { AppointmentSummary } from "@/types";

export function UpcomingAppointmentsReport({ appointments }: { appointments: AppointmentSummary[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>Upcoming Appointments Report</CardTitle></CardHeader>
      <CardContent className="p-0">
        {appointments.length ? (
          <div className="responsive-table">
            <table className="w-full min-w-max divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Patient</th><th className="px-5 py-3">Phone</th><th className="px-5 py-3">Appointment Type</th><th className="px-5 py-3">Scheduled Date</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Health Centre</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((item) => <tr key={item.id}><td data-label="Patient" className="px-5 py-4 font-semibold text-slate-900">{item.patientName}</td><td data-label="Phone" className="px-5 py-4 text-slate-600">{item.patientPhone}</td><td data-label="Appointment Type" className="px-5 py-4 text-slate-600">{item.appointmentType.replaceAll("_", " ")}</td><td data-label="Scheduled Date" className="px-5 py-4 text-slate-600">{formatDateTime(item.scheduledDateTime)}</td><td data-label="Status" className="px-5 py-4"><AppointmentStatusBadge status={item.status} /></td><td data-label="Health Centre" className="px-5 py-4 text-slate-600">{item.healthCentreName}</td></tr>)}
              </tbody>
            </table>
          </div>
        ) : <div className="p-6"><EmptyState title="No upcoming appointments" description="No upcoming appointments match these filters." /></div>}
      </CardContent>
    </Card>
  );
}
