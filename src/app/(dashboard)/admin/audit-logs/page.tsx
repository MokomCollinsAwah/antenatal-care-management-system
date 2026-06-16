import { Card, CardContent } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { PageHeader } from "@/components/ui/PageHeader";
import { AuditLogFilters } from "@/features/audit-logs/components/AuditLogFilters";
import { AuditLogTable } from "@/features/audit-logs/components/AuditLogTable";
import { getAuditLogs } from "@/features/audit-logs/queries";
import { requireRole } from "@/lib/auth-utils";
import { UserRole } from "@/lib/constants";
import { getPageNumber, paginate } from "@/lib/pagination";
import type { AuditLogFilters as AuditLogFiltersValue } from "@/types";

type AuditLogSearchParams = AuditLogFiltersValue & { page?: string | string[] };

export default async function AuditLogsPage({ searchParams }: { searchParams: Promise<AuditLogSearchParams> }) {
  await requireRole([UserRole.ADMIN]);
  const filters = await searchParams;
  const logs = await getAuditLogs(filters);
  const page = paginate(logs, getPageNumber(filters.page));
  return (
    <div className="space-y-6">
      <PageHeader title="Audit Logs" description="Review important system actions and accountability records." />
      <Card><CardContent className="pt-6"><AuditLogFilters filters={filters} /></CardContent></Card>
      <Card><CardContent className="p-0"><AuditLogTable logs={page.items} /><Pagination {...page} searchParams={filters} /></CardContent></Card>
    </div>
  );
}
