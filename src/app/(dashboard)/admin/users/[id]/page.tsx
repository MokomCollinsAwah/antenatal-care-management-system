import Link from "next/link";
import { ArrowLeft, KeyRound, Pencil } from "lucide-react";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { UserStatusButton } from "@/features/admin/users/components/UserStatusButton";
import { getUserDetails } from "@/features/admin/users/queries";
import { UserRole, UserStatus } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import { AdminServiceError } from "@/server/services/adminServiceError";

export default async function UserDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await loadUser(id);
  const isHealthWorker = user.role === UserRole.HEALTH_WORKER;

  return (
    <div className="space-y-6">
      <PageHeader
        title={user.fullName}
        description="User account details and administrative actions."
        action={
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/users"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="size-4" />
              Back
            </Link>
            {isHealthWorker && (
              <>
                <Link
                  href={`/admin/users/${user.id}/edit`}
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Pencil className="size-4" />
                  Edit
                </Link>
                <Link
                  href={`/admin/users/${user.id}/reset-password`}
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-teal-700 px-3 text-sm font-semibold text-white hover:bg-teal-800"
                >
                  <KeyRound className="size-4" />
                  Reset Password
                </Link>
                <UserStatusButton userId={user.id} status={user.status} />
              </>
            )}
          </div>
        }
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Account information</CardTitle>
            <CardDescription>
              Safe account details. Password hashes are never displayed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-5 sm:grid-cols-2">
              <Detail label="Full Name" value={user.fullName} />
              <Detail label="Phone" value={user.phone} />
              <Detail label="Email" value={user.email || "Not provided"} />
              <Detail
                label="Health Centre"
                value={user.healthCentreName || "Not assigned"}
              />
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Role
                </dt>
                <dd className="mt-2">
                  <Badge variant="neutral">
                    {user.role.replaceAll("_", " ")}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </dt>
                <dd className="mt-2">
                  <Badge
                    variant={
                      user.status === UserStatus.ACTIVE
                        ? "active"
                        : "suspended"
                    }
                  >
                    {user.status}
                  </Badge>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Record history</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-5">
              <Detail label="Created" value={formatDateTime(user.createdAt)} />
              <Detail
                label="Last Updated"
                value={formatDateTime(user.updatedAt)}
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

async function loadUser(id: string) {
  try {
    return await getUserDetails(id);
  } catch (error) {
    if (error instanceof AdminServiceError) {
      notFound();
    }
    throw error;
  }
}
