import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  APPOINTMENT_STATUS_OPTIONS,
  APPOINTMENT_TYPE_OPTIONS,
} from "@/lib/constants";
import type { AppointmentListFilters, HealthCentreOption } from "@/types";

export function AppointmentFilters({
  filters,
  healthCentres,
}: {
  filters: AppointmentListFilters;
  healthCentres: HealthCentreOption[];
}) {
  return (
    <form className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_190px_170px_190px_160px_160px_auto]">
      <Input name="search" defaultValue={filters.search} placeholder="Search patient name or phone" />
      <Select name="appointmentType" defaultValue={filters.appointmentType} placeholder="All types" options={APPOINTMENT_TYPE_OPTIONS} />
      <Select name="status" defaultValue={filters.status} placeholder="All statuses" options={APPOINTMENT_STATUS_OPTIONS} />
      <Select name="healthCentreId" defaultValue={filters.healthCentreId} placeholder="All centres" options={healthCentres} />
      <Input name="dateFrom" type="date" defaultValue={filters.dateFrom} aria-label="Date from" />
      <Input name="dateTo" type="date" defaultValue={filters.dateTo} aria-label="Date to" />
      <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
        <Search className="size-4" /> Filter
      </button>
    </form>
  );
}
