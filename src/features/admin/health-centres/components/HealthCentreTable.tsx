import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";
import type { HealthCentreSummary } from "@/types";

export function HealthCentreTable({
  healthCentres,
}: {
  healthCentres: HealthCentreSummary[];
}) {
  if (healthCentres.length === 0) {
    return (
      <EmptyState
        title="No health centres yet"
        description="Add the first health centre to begin assigning health workers."
        action={
          <Link
            href="/admin/health-centres/new"
            className="inline-flex h-10 items-center rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800"
          >
            Add Health Centre
          </Link>
        }
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-5 py-3">Name</th>
            <th className="px-5 py-3">Location</th>
            <th className="px-5 py-3">Phone</th>
            <th className="px-5 py-3">Health Workers</th>
            <th className="px-5 py-3">Created At</th>
            <th className="px-5 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {healthCentres.map((centre) => (
            <tr key={centre.id} className="hover:bg-slate-50/70">
              <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900">
                {centre.name}
              </td>
              <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                {centre.location}
              </td>
              <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                {centre.phone || "—"}
              </td>
              <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                {centre.healthWorkerCount}
              </td>
              <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                {formatDate(centre.createdAt)}
              </td>
              <td className="whitespace-nowrap px-5 py-4 text-right">
                <div className="flex justify-end gap-3">
                  <Link
                    href={`/admin/health-centres/${centre.id}`}
                    className="font-semibold text-teal-700 hover:text-teal-900"
                  >
                    View
                  </Link>
                  <Link
                    href={`/admin/health-centres/${centre.id}/edit`}
                    className="font-semibold text-slate-600 hover:text-slate-900"
                  >
                    Edit
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
