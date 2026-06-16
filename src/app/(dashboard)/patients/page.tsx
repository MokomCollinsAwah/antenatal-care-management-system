import Link from "next/link";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { PageHeader } from "@/components/ui/PageHeader";
import { PatientSearchFilters } from "@/features/patients/components/PatientSearchFilters";
import { PatientTable } from "@/features/patients/components/PatientTable";
import { getHealthCentresForSelect } from "@/features/admin/health-centres/queries";
import { getAssignableHealthWorkers, getPatients } from "@/features/patients/queries";
import { getCurrentUser } from "@/lib/auth-utils";
import { UserRole } from "@/lib/constants";
import { getPageNumber, paginate } from "@/lib/pagination";
import type { PatientListFilters } from "@/types";

type PatientSearchParams = PatientListFilters & { page?: string | string[] };

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<PatientSearchParams>;
}) {
  const filters = await searchParams;
  const user = await getCurrentUser();
  const [patients, healthCentres, healthWorkers] = await Promise.all([
    getPatients(filters),
    getHealthCentresForSelect(),
    getAssignableHealthWorkers(),
  ]);
  const page = paginate(patients, getPageNumber(filters.page));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patients"
        description="Manage pregnant women registered for antenatal care."
        action={
          <Link
            href="/patients/new"
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800"
          >
            <Plus className="size-4" />
            Register Pregnant Woman
          </Link>
        }
      />
      <Card>
        <CardContent className="pt-6">
          <PatientSearchFilters
            filters={filters}
            healthCentres={healthCentres}
            healthWorkers={healthWorkers}
            showAssignmentFilters={user?.role === UserRole.ADMIN}
          />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-0">
          <PatientTable patients={page.items} />
          <Pagination {...page} searchParams={filters} />
        </CardContent>
      </Card>
    </div>
  );
}
