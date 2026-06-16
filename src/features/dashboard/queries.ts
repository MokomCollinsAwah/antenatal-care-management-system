import { getCareUser } from "@/features/appointments/queries";
import { getDashboardData } from "@/server/services/dashboardService";

export async function getDashboardSummary() {
  return getDashboardData(await getCareUser());
}
