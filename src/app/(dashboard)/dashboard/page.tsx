import { PageHeader } from "@/components/ui/PageHeader";
import { DashboardStats } from "@/features/dashboard/components/DashboardStats";
import { RecentAppointments } from "@/features/dashboard/components/RecentAppointments";
import { RecentDueReminders } from "@/features/dashboard/components/RecentDueReminders";
import { RecentFollowUps } from "@/features/dashboard/components/RecentFollowUps";
import { RecentMissedAppointments } from "@/features/dashboard/components/RecentMissedAppointments";
import { getDashboardSummary } from "@/features/dashboard/queries";
import { requireRole } from "@/lib/auth-utils";
import { UserRole } from "@/lib/constants";
import { runDashboardMaintenance } from "@/server/services/systemMaintenanceService";

export default async function DashboardPage() {
  const user = await requireRole([UserRole.ADMIN, UserRole.HEALTH_WORKER]);
  await runDashboardMaintenance();
  const data = await getDashboardSummary();
  const subtitle =
    user.role === UserRole.ADMIN
      ? "Global antenatal care activity and system follow-up priorities."
      : "Your authorized patients, care activity, and follow-up priorities.";

  return (
    <div className="space-y-6">
      <PageHeader title={`Welcome, ${user.fullName}`} description={subtitle} />
      <DashboardStats stats={data.stats} />
      <div className="grid gap-6 xl:grid-cols-2">
        <RecentAppointments appointments={data.recentAppointments} />
        <RecentMissedAppointments appointments={data.recentMissedAppointments} />
        <RecentFollowUps followUps={data.recentFollowUps} />
        <RecentDueReminders reminders={data.recentDueReminders} />
      </div>
    </div>
  );
}
