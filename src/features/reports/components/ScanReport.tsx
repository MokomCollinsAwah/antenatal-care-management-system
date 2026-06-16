import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";
import type { ScanSummary } from "@/types";

export function ScanReport({ scans }: { scans: ScanSummary[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>Scan Report</CardTitle></CardHeader>
      <CardContent className="p-0">
        {scans.length ? (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-max divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Patient</th><th className="px-5 py-3">Scan Type</th><th className="px-5 py-3">Scan Date</th><th className="px-5 py-3">Next Scan Date</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {scans.map((item) => <tr key={item.id}><td className="px-5 py-4 font-semibold text-slate-900">{item.patientName}</td><td className="px-5 py-4 text-slate-600">{item.scanType}</td><td className="px-5 py-4 text-slate-600">{formatDate(item.scanDate)}</td><td className="px-5 py-4 text-slate-600">{item.nextScanDate ? formatDate(item.nextScanDate) : "—"}</td></tr>)}
              </tbody>
            </table>
          </div>
        ) : <div className="p-6"><EmptyState title="No scans" description="No scan records match these filters." /></div>}
      </CardContent>
    </Card>
  );
}
