import { Card, CardContent } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { getHealthCentresForSelect } from "@/features/admin/health-centres/queries";
import { FollowUpReport } from "@/features/reports/components/FollowUpReport";
import { MissedAppointmentsReport } from "@/features/reports/components/MissedAppointmentsReport";
import { ReportFilters } from "@/features/reports/components/ReportFilters";
import { ReportSummaryCards } from "@/features/reports/components/ReportSummaryCards";
import { ScanReport } from "@/features/reports/components/ScanReport";
import { SupplementReport } from "@/features/reports/components/SupplementReport";
import { UpcomingAppointmentsReport } from "@/features/reports/components/UpcomingAppointmentsReport";
import { getReports } from "@/features/reports/queries";
import { requireRole } from "@/lib/auth-utils";
import { UserRole } from "@/lib/constants";
import { runDashboardMaintenance } from "@/server/services/systemMaintenanceService";
import type { ReportFilters as ReportFiltersValue } from "@/types";

export default async function ReportsPage({ searchParams }: { searchParams: Promise<ReportFiltersValue> }) {
  const user = await requireRole([UserRole.ADMIN, UserRole.HEALTH_WORKER]);
  await runDashboardMaintenance();
  const filters = await searchParams;
  const [data, healthCentres] = await Promise.all([
    getReports(filters),
    user.role === UserRole.ADMIN ? getHealthCentresForSelect() : Promise.resolve([]),
  ]);
  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="View service activity and antenatal care summaries." />
      <Card><CardContent className="pt-6"><ReportFilters filters={filters} healthCentres={healthCentres} /></CardContent></Card>
      <ReportSummaryCards summary={data.summary} />
      <div className="space-y-6">
        <UpcomingAppointmentsReport appointments={data.upcomingAppointments} />
        <MissedAppointmentsReport appointments={data.missedAppointments} />
        <FollowUpReport followUps={data.followUps} />
        <SupplementReport supplements={data.supplements} />
        <ScanReport scans={data.scans} />
      </div>
    </div>
  );
}
