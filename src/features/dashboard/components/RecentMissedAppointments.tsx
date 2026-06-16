import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDateTime } from "@/lib/utils";
import type { AppointmentSummary } from "@/types";

export function RecentMissedAppointments({ appointments }: { appointments: AppointmentSummary[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>Recent Missed Appointments</CardTitle></CardHeader>
      <CardContent>
        {appointments.length ? (
          <div className="space-y-3">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="rounded-lg border border-red-100 bg-red-50/50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{appointment.patientName}</p>
                    <p className="text-sm text-slate-500">{formatDateTime(appointment.scheduledDateTime)}</p>
                  </div>
                  <Link href={`/follow-ups/new?appointmentId=${appointment.id}`} className="text-sm font-semibold text-teal-700">Create Follow-up</Link>
                </div>
              </div>
            ))}
          </div>
        ) : <EmptyState title="No missed appointments" description="Missed appointments will appear here." />}
      </CardContent>
    </Card>
  );
}
