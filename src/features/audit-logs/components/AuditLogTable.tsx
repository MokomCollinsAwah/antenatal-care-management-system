import { EmptyState } from "@/components/ui/EmptyState";
import { formatDateTime } from "@/lib/utils";
import type { AuditLogSummary } from "@/types";

export function AuditLogTable({ logs }: { logs: AuditLogSummary[] }) {
  if (!logs.length) {
    return <EmptyState title="No audit logs found" description="No audit logs match the current filters." />;
  }
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-max divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-5 py-3">Date/Time</th>
            <th className="px-5 py-3">Actor</th>
            <th className="px-5 py-3">Action</th>
            <th className="px-5 py-3">Entity Type</th>
            <th className="px-5 py-3">Entity ID</th>
            <th className="px-5 py-3">Description</th>
            <th className="px-5 py-3">IP Address</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {logs.map((log) => (
            <tr key={log.id} className="align-top hover:bg-slate-50/70">
              <td className="px-5 py-4 text-slate-600">{formatDateTime(log.createdAt)}</td>
              <td className="px-5 py-4 font-semibold text-slate-900">{log.actorName}</td>
              <td className="px-5 py-4 text-slate-600">{log.action.replaceAll("_", " ")}</td>
              <td className="px-5 py-4 text-slate-600">{log.entityType}</td>
              <td className="px-5 py-4 font-mono text-xs text-slate-500">{log.entityId || "—"}</td>
              <td className="max-w-md px-5 py-4 text-slate-600">{log.description || "—"}</td>
              <td className="px-5 py-4 text-slate-600">{log.ipAddress || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
