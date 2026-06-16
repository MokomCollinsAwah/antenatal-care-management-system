import Link from "next/link";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { AppointmentFilters } from "@/features/appointments/components/AppointmentFilters";
import { AppointmentTable } from "@/features/appointments/components/AppointmentTable";
import { getAppointments } from "@/features/appointments/queries";
import { getHealthCentresForSelect } from "@/features/admin/health-centres/queries";
import type { AppointmentListFilters } from "@/types";

export default async function AppointmentsPage({ searchParams }: { searchParams: Promise<AppointmentListFilters> }) {
  const filters = await searchParams;
  const [appointments, healthCentres] = await Promise.all([
    getAppointments(filters),
    getHealthCentresForSelect(),
  ]);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointments"
        description="Schedule and manage antenatal appointments."
        action={
          <div className="flex flex-wrap gap-2">
            <Link href="/appointments?status=MISSED" className="inline-flex h-11 items-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">View Missed Appointments</Link>
            <Link href="/appointments/new" className="inline-flex h-11 items-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800"><Plus className="size-4" /> New Appointment</Link>
          </div>
        }
      />
      <Card><CardContent className="pt-6"><AppointmentFilters filters={filters} healthCentres={healthCentres} /></CardContent></Card>
      <Card><CardContent className="p-0"><AppointmentTable appointments={appointments} /></CardContent></Card>
    </div>
  );
}
