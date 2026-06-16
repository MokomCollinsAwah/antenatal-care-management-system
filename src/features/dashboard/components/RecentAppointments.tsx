import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { AppointmentStatusBadge } from "@/features/appointments/components/AppointmentStatusBadge";
import { formatDateTime } from "@/lib/utils";
import type { AppointmentSummary } from "@/types";

export function RecentAppointments({ appointments }: { appointments: AppointmentSummary[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>Recent Appointments</CardTitle></CardHeader>
      <CardContent>
        {appointments.length ? (
          <div className="space-y-3">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3">
                <div>
                  <p className="font-semibold text-slate-900">{appointment.patientName}</p>
                  <p className="text-sm text-slate-500">{appointment.appointmentType.replaceAll("_", " ")} · {formatDateTime(appointment.scheduledDateTime)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <AppointmentStatusBadge status={appointment.status} />
                  <Link href={`/appointments/${appointment.id}`} className="text-sm font-semibold text-teal-700">View</Link>
                </div>
              </div>
            ))}
          </div>
        ) : <EmptyState title="No upcoming appointments" description="Scheduled appointments will appear here." />}
      </CardContent>
    </Card>
  );
}
