import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { getHealthCentreDetails } from "@/features/admin/health-centres/queries";
import { formatDateTime } from "@/lib/utils";
import { AdminServiceError } from "@/server/services/adminServiceError";

export default async function HealthCentreDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const centre = await loadHealthCentre(id);

  return (
    <div className="space-y-6">
      <PageHeader
        title={centre.name}
        description={centre.location}
        action={
          <div className="flex gap-3">
            <Link
              href="/admin/health-centres"
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="size-4" />
              Back
            </Link>
            <Link
              href={`/admin/health-centres/${centre.id}/edit`}
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800"
            >
              <Pencil className="size-4" />
              Edit
            </Link>
          </div>
        }
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Facility details</CardTitle>
            <CardDescription>
              Core identifying and contact information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-5 sm:grid-cols-2">
              <Detail label="Name" value={centre.name} />
              <Detail label="Location" value={centre.location} />
              <Detail label="Phone" value={centre.phone || "Not provided"} />
              <Detail
                label="Assigned Health Workers"
                value={String(centre.healthWorkerCount)}
              />
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Record history</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-5">
              <Detail
                label="Created"
                value={formatDateTime(centre.createdAt)}
              />
              <Detail
                label="Last Updated"
                value={formatDateTime(centre.updatedAt)}
              />
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-slate-900">{value}</dd>
    </div>
  );
}

async function loadHealthCentre(id: string) {
  try {
    return await getHealthCentreDetails(id);
  } catch (error) {
    if (error instanceof AdminServiceError) {
      notFound();
    }
    throw error;
  }
}
