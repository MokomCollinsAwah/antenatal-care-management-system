import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import { UserTable } from "@/features/admin/users/components/UserTable";
import { getUsers } from "@/features/admin/users/queries";
import {
  ROLE_OPTIONS,
  USER_STATUS_OPTIONS,
  UserRole,
  UserStatus,
} from "@/lib/constants";

interface UsersPageProps {
  searchParams: Promise<{
    search?: string;
    role?: string;
    status?: string;
  }>;
}

export default async function AdminUsersPage({
  searchParams,
}: UsersPageProps) {
  const params = await searchParams;
  const role = Object.values(UserRole).includes(params.role as UserRole)
    ? (params.role as UserRole)
    : undefined;
  const status = Object.values(UserStatus).includes(params.status as UserStatus)
    ? (params.status as UserStatus)
    : undefined;
  const users = await getUsers({
    search: params.search?.trim() || undefined,
    role,
    status,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage system users and health worker accounts."
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
          <form className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px_220px_auto]">
            <Input
              name="search"
              defaultValue={params.search}
              placeholder="Search name, phone, or email"
              aria-label="Search users"
            />
            <Select
              name="role"
              defaultValue={role}
              placeholder="All roles"
              options={ROLE_OPTIONS}
              aria-label="Filter by role"
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
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Search className="size-4" />
              Filter
            </button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-0">
          <UserTable users={users} />
        </CardContent>
      </Card>
    </div>
  );
}
