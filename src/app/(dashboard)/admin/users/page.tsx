import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import { getHealthCentresForSelect } from "@/features/admin/health-centres/queries";
import { UserTable } from "@/features/admin/users/components/UserTable";
import { getUsers } from "@/features/admin/users/queries";
import { USER_STATUS_OPTIONS, UserRole, UserStatus } from "@/lib/constants";
import { getPageNumber, paginate } from "@/lib/pagination";

interface UsersPageProps {
  searchParams: Promise<{
    search?: string;
    healthCentreId?: string;
    status?: string;
    page?: string | string[];
  }>;
}

export default async function AdminUsersPage({
  searchParams,
}: UsersPageProps) {
  const params = await searchParams;
  const status = Object.values(UserStatus).includes(params.status as UserStatus)
    ? (params.status as UserStatus)
    : undefined;
  const [users, healthCentres] = await Promise.all([
    getUsers({
    search: params.search?.trim() || undefined,
      role: UserRole.HEALTH_WORKER,
      healthCentreId: params.healthCentreId || undefined,
    status,
    }),
    getHealthCentresForSelect(),
  ]);
  const page = paginate(users, getPageNumber(params.page));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Health Workers"
        description="Manage health worker accounts and facility assignments."
        action={
          <Link
            href="/admin/users/new"
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800"
          >
            <Plus className="size-4" />
            Add Health Worker
          </Link>
        }
      />
      <Card>
        <CardContent className="pt-6">
          <form className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
            <Input
              name="search"
              defaultValue={params.search}
              placeholder="Search name or phone"
              aria-label="Search health workers"
            />
            <Select
              name="healthCentreId"
              defaultValue={params.healthCentreId}
              placeholder="All health centres"
              options={healthCentres}
              aria-label="Filter by health centre"
            />
            <Select
              name="status"
              defaultValue={status}
              placeholder="All statuses"
              options={USER_STATUS_OPTIONS}
              aria-label="Filter by status"
            />
            <button
              type="submit"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Search className="size-4" />
              Filter
            </button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-0">
          <UserTable users={page.items} />
          <Pagination {...page} searchParams={params} />
        </CardContent>
      </Card>
    </div>
  );
}
