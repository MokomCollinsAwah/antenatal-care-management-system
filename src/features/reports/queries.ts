import { getCareUser } from "@/features/appointments/queries";
import { getReportData } from "@/server/services/reportService";
import type { ReportFilters } from "@/types";

export async function getReports(filters: ReportFilters) {
  return getReportData(await getCareUser(), filters);
}
