import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { FollowUpOutcomeBadge } from "@/features/followups/components/FollowUpOutcomeBadge";
import { formatDateTime } from "@/lib/utils";
import type { FollowUpSummary } from "@/types";

export function FollowUpReport({ followUps }: { followUps: FollowUpSummary[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>Follow-up Report</CardTitle></CardHeader>
      <CardContent className="p-0">
        {followUps.length ? (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-max divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Patient</th><th className="px-5 py-3">Follow-up Date</th><th className="px-5 py-3">Method</th><th className="px-5 py-3">Outcome</th><th className="px-5 py-3">Followed By</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {followUps.map((item) => <tr key={item.id}><td className="px-5 py-4 font-semibold text-slate-900">{item.patientName}</td><td className="px-5 py-4 text-slate-600">{formatDateTime(item.followUpDate)}</td><td className="px-5 py-4 text-slate-600">{item.method.replaceAll("_", " ")}</td><td className="px-5 py-4"><FollowUpOutcomeBadge outcome={item.outcome} /></td><td className="px-5 py-4 text-slate-600">{item.followedByName}</td></tr>)}
              </tbody>
            </table>
          </div>
        ) : <div className="p-6"><EmptyState title="No follow-ups" description="No follow-up records match these filters." /></div>}
      </CardContent>
    </Card>
  );
}
