import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { AuditLogFilters as AuditLogFiltersValue } from "@/types";

const actionOptions = [
  "HEALTH_CENTRE_CREATED",
  "HEALTH_CENTRE_UPDATED",
  "HEALTH_WORKER_CREATED",
  "HEALTH_WORKER_UPDATED",
  "HEALTH_WORKER_STATUS_CHANGED",
  "HEALTH_WORKER_PASSWORD_RESET",
  "PATIENT_CREATED",
  "PATIENT_UPDATED",
  "APPOINTMENT_CREATED",
  "APPOINTMENT_MARKED_MISSED",
  "APPOINTMENT_CANCELLED",
  "APPOINTMENT_AUTO_MARKED_MISSED",
  "VISIT_CREATED",
  "SUPPLEMENT_CREATED",
  "SCAN_CREATED",
  "FOLLOW_UP_CREATED",
  "REMINDER_STATUS_UPDATED",
].map((value) => ({ value, label: value.replaceAll("_", " ") }));

const entityOptions = [
  "HealthCentre",
  "User",
  "PatientProfile",
  "Appointment",
  "VisitRecord",
  "SupplementRecord",
  "ScanRecord",
  "FollowUpRecord",
  "Reminder",
].map((value) => ({ value, label: value }));

export function AuditLogFilters({ filters }: { filters: AuditLogFiltersValue }) {
  return (
    <form className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
      <Input name="search" defaultValue={filters.search} placeholder="Search description or actor" />
      <Select name="action" defaultValue={filters.action} placeholder="All actions" options={actionOptions} />
      <Select name="entityType" defaultValue={filters.entityType} placeholder="All entity types" options={entityOptions} />
      <Input name="startDate" type="date" defaultValue={filters.startDate} aria-label="Start date" />
      <Input name="endDate" type="date" defaultValue={filters.endDate} aria-label="End date" />
      <button className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
        <Search className="size-4" /> Filter
      </button>
    </form>
  );
}
