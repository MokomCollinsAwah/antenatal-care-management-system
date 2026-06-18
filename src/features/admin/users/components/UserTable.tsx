import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { UserStatusButton } from "@/features/admin/users/components/UserStatusButton";
import { UserStatus } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { AdminUserSummary } from "@/types";

export function UserTable({ users }: { users: AdminUserSummary[] }) {
  if (users.length === 0) {
    return (
      <EmptyState
        title="No health workers found"
        description="No health workers match the current search and filter criteria."
      />
    );
  }

  return (
    <div className="responsive-table">
      <table className="w-full min-w-max divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-5 py-3">Full Name</th>
            <th className="px-5 py-3">Phone</th>
            <th className="px-5 py-3">Health Centre</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3">Created At</th>
            <th className="px-5 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {users.map((user) => (
              <tr key={user.id} className="align-top hover:bg-slate-50/70">
                <td data-label="Full Name" className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900">
                  {user.fullName}
                </td>
                <td data-label="Phone" className="whitespace-nowrap px-5 py-4 text-slate-600">
                  {user.phone}
                </td>
                <td data-label="Health Centre" className="min-w-48 px-5 py-4 text-slate-600">
                  {user.healthCentreName || "—"}
                </td>
                <td data-label="Status" className="whitespace-nowrap px-5 py-4">
                  <Badge
                    variant={
                      user.status === UserStatus.ACTIVE
                        ? "active"
                        : "suspended"
                    }
                  >
                    {user.status}
                  </Badge>
                </td>
                <td data-label="Created At" className="whitespace-nowrap px-5 py-4 text-slate-600">
                  {formatDate(user.createdAt)}
                </td>
                <td data-label="Actions" className="w-32 px-5 py-4 text-right">
                  <HealthWorkerActions user={user} />
                </td>
              </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HealthWorkerActions({ user }: { user: AdminUserSummary }) {
  const menuItemClass =
    "inline-flex h-9 w-full items-center rounded-lg px-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100";

  return (
    <details className="group relative ml-auto w-fit">
      <summary
        className="inline-flex size-9 cursor-pointer list-none items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 [&::-webkit-details-marker]:hidden"
        aria-label={`Open actions for ${user.fullName}`}
        title={`Actions for ${user.fullName}`}
      >
        <MoreHorizontal className="size-5" aria-hidden="true" />
      </summary>
      <div className="absolute right-0 top-11 z-30 grid min-w-48 gap-1 rounded-lg border border-slate-200 bg-white p-1 text-left shadow-lg">
        <Link
          href={`/admin/users/${user.id}`}
          title={`View ${user.fullName}`}
          className={menuItemClass}
        >
          View
        </Link>
        <Link
          href={`/admin/users/${user.id}/edit`}
          title={`Edit ${user.fullName}`}
          className={menuItemClass}
        >
          Edit
        </Link>
        <Link
          href={`/admin/users/${user.id}/reset-password`}
          title={`Reset password for ${user.fullName}`}
          className={menuItemClass}
        >
          Reset Password
        </Link>
        <UserStatusButton
          userId={user.id}
          status={user.status}
          userName={user.fullName}
          className="h-9 w-full justify-start px-3"
        />
      </div>
    </details>
  );
}
