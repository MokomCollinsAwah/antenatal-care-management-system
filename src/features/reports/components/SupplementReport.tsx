import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SupplementStatusBadge } from "@/features/supplements/components/SupplementStatusBadge";
import type { SupplementSummary } from "@/types";

export function SupplementReport({ supplements }: { supplements: SupplementSummary[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>Supplement Report</CardTitle></CardHeader>
      <CardContent className="p-0">
        {supplements.length ? (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-max divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Patient</th><th className="px-5 py-3">Supplement Name</th><th className="px-5 py-3">Dosage</th><th className="px-5 py-3">Frequency</th><th className="px-5 py-3">Status</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {supplements.map((item) => <tr key={item.id}><td className="px-5 py-4 font-semibold text-slate-900">{item.patientName}</td><td className="px-5 py-4 text-slate-600">{item.supplementName}</td><td className="px-5 py-4 text-slate-600">{item.dosage}</td><td className="px-5 py-4 text-slate-600">{item.frequency}</td><td className="px-5 py-4"><SupplementStatusBadge status={item.status} /></td></tr>)}
              </tbody>
            </table>
          </div>
        ) : <div className="p-6"><EmptyState title="No supplements" description="No supplement records match these filters." /></div>}
      </CardContent>
    </Card>
  );
}
