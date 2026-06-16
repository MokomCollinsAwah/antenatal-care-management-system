import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { FollowUpOutcomeBadge } from "@/features/followups/components/FollowUpOutcomeBadge";
import { formatDateTime } from "@/lib/utils";
import type { FollowUpSummary } from "@/types";

export function RecentFollowUps({ followUps }: { followUps: FollowUpSummary[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>Recent Follow-ups</CardTitle></CardHeader>
      <CardContent>
        {followUps.length ? (
          <div className="space-y-3">
            {followUps.map((record) => (
              <div key={record.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-900">{record.patientName}</p>
                  <FollowUpOutcomeBadge outcome={record.outcome} />
                </div>
                <p className="mt-1 text-sm text-slate-500">{record.method.replaceAll("_", " ")} · {formatDateTime(record.followUpDate)}</p>
              </div>
            ))}
          </div>
        ) : <EmptyState title="No follow-ups" description="Follow-up records will appear here." />}
      </CardContent>
    </Card>
  );
}
