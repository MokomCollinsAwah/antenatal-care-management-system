import { DashboardPlaceholder } from "@/components/dashboard/DashboardPlaceholder";
import { requireRole } from "@/lib/auth-utils";
import { UserRole } from "@/lib/constants";

export default async function DashboardPage() {
  const user = await requireRole([UserRole.ADMIN, UserRole.HEALTH_WORKER]);
  const subtitle =
    user.role === UserRole.ADMIN
      ? "Manage health centres, users, antenatal records, and system reports."
      : "Manage antenatal patients, appointments, visits, and follow-ups.";

  return (
    <DashboardPlaceholder fullName={user.fullName} subtitle={subtitle} />
  );
}
