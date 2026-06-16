import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";
import type { PatientSummary } from "@/types";

export function PatientTable({ patients }: { patients: PatientSummary[] }) {
  if (patients.length === 0) {
    return (
      <EmptyState
        title="No patients found"
        description="No pregnant women match the current search and filter criteria."
        action={
          <Link
            href="/patients/new"
            className="inline-flex h-10 items-center rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800"
          >
            Register Pregnant Woman
          </Link>
        }
      />
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-max divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-5 py-3">Full Name</th>
            <th className="px-5 py-3">Phone</th>
            <th className="px-5 py-3">Age</th>
            <th className="px-5 py-3">Address</th>
            <th className="px-5 py-3">Health Centre</th>
            <th className="px-5 py-3">Assigned Health Worker</th>
            <th className="px-5 py-3">Expected Delivery Date</th>
            <th className="px-5 py-3">Created At</th>
            <th className="px-5 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {patients.map((patient) => (
            <tr key={patient.id} className="hover:bg-slate-50/70">
              <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900">
                {patient.fullName}
              </td>
              <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                {patient.phone}
              </td>
              <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                {patient.age}
              </td>
              <td className="min-w-48 px-5 py-4 text-slate-600">
                {patient.address}
              </td>
              <td className="min-w-48 px-5 py-4 text-slate-600">
                {patient.healthCentreName}
              </td>
              <td className="min-w-48 px-5 py-4 text-slate-600">
                {patient.assignedHealthWorkerName}
              </td>
              <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                {formatDate(patient.expectedDeliveryDate)}
              </td>
              <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                {formatDate(patient.createdAt)}
              </td>
              <td className="whitespace-nowrap px-5 py-4 text-right">
                <div className="flex justify-end gap-3">
                  <Link
                    href={`/patients/${patient.id}`}
                    className="font-semibold text-teal-700 hover:text-teal-900"
                  >
                    View
                  </Link>
                  <Link
                    href={`/patients/${patient.id}/edit`}
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
