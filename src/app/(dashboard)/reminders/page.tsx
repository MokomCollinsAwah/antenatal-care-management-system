import { Card, CardContent } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { PageHeader } from "@/components/ui/PageHeader";
import { ReminderFilters } from "@/features/reminders/components/ReminderFilters";
import { ReminderTable } from "@/features/reminders/components/ReminderTable";
import { getReminders } from "@/features/reminders/queries";
import { getPageNumber, paginate } from "@/lib/pagination";
import { runDueReminderChecker } from "@/server/services/systemMaintenanceService";
import type { ClinicalRecordFilters } from "@/types";

type ClinicalSearchParams = ClinicalRecordFilters & { page?: string | string[] };

export default async function RemindersPage({ searchParams }: { searchParams: Promise<ClinicalSearchParams> }) {
  await runDueReminderChecker();
  const filters = await searchParams;
  const reminders = await getReminders(filters);
  const page = paginate(reminders, getPageNumber(filters.page));
  return (
    <div className="space-y-6">
      <PageHeader title="Reminders" description="Review in-system care reminders and update their status." />
      <Card><CardContent className="pt-6"><ReminderFilters filters={filters} /></CardContent></Card>
      <Card><CardContent className="p-0"><ReminderTable reminders={page.items} /><Pagination {...page} searchParams={filters} /></CardContent></Card>
    </div>
  );
}
