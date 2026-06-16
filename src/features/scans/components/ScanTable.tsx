import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";
import type { ScanSummary } from "@/types";

export function ScanTable({ scans }: { scans: ScanSummary[] }) {
  if (!scans.length) return <EmptyState title="No scan records found" description="No scan records match the current filters." />;
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-max divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-5 py-3">Patient</th>
            <th className="px-5 py-3">Scan Type</th>
            <th className="px-5 py-3">Scan Date</th>
            <th className="px-5 py-3">Next Scan Date</th>
            <th className="px-5 py-3">Health Centre</th>
            <th className="px-5 py-3">Recorded By</th>
            <th className="px-5 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {scans.map((record) => (
            <tr key={record.id} className="align-top hover:bg-slate-50/70">
              <td className="px-5 py-4"><p className="font-semibold text-slate-900">{record.patientName}</p><p className="text-slate-500">{record.patientPhone}</p></td>
              <td className="px-5 py-4 text-slate-600">{record.scanType}</td>
              <td className="px-5 py-4 text-slate-600">{formatDate(record.scanDate)}</td>
              <td className="px-5 py-4 text-slate-600">{record.nextScanDate ? formatDate(record.nextScanDate) : "—"}</td>
              <td className="px-5 py-4 text-slate-600">{record.healthCentreName}</td>
              <td className="px-5 py-4 text-slate-600">{record.recordedByName}</td>
              <td className="px-5 py-4 text-right"><Link href={`/patients/${record.patientId}`} className="font-semibold text-teal-700 hover:text-teal-900">View Patient</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
