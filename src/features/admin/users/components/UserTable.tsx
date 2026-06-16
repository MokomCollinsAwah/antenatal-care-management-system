import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { UserStatusButton } from "@/features/admin/users/components/UserStatusButton";
import { UserRole, UserStatus } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { AdminUserSummary } from "@/types";

export function UserTable({ users }: { users: AdminUserSummary[] }) {
  if (users.length === 0) {
    return (
      <EmptyState
        title="No users found"
        description="No users match the current search and filter criteria."
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
            <th className="px-5 py-3">Email</th>
            <th className="px-5 py-3">Role</th>
            <th className="px-5 py-3">Health Centre</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3">Created At</th>
            <th className="px-5 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {users.map((user) => {
            const isHealthWorker = user.role === UserRole.HEALTH_WORKER;
            return (
              <tr key={user.id} className="align-top hover:bg-slate-50/70">
                <td data-label="Full Name" className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900">
                  {user.fullName}
                </td>
                <td data-label="Phone" className="whitespace-nowrap px-5 py-4 text-slate-600">
                  {user.phone}
                </td>
                <td data-label="Email" className="whitespace-nowrap px-5 py-4 text-slate-600">
                  {user.email || "—"}
                </td>
                <td data-label="Role" className="whitespace-nowrap px-5 py-4">
                  <Badge variant="neutral">
                    {user.role.replaceAll("_", " ")}
                  </Badge>
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
                <td data-label="Actions" className="min-w-56 px-5 py-4">
                  <div className="flex flex-wrap justify-end gap-3">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="font-semibold text-teal-700 hover:text-teal-900"
                    >
                      View
                    </Link>
                    {isHealthWorker && (
                      <>
                        <Link
                          href={`/admin/users/${user.id}/edit`}
                          className="font-semibold text-slate-600 hover:text-slate-900"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/admin/users/${user.id}/reset-password`}
                          className="font-semibold text-slate-600 hover:text-slate-900"
                        >
                          Reset Password
                        </Link>
                        <UserStatusButton
                          userId={user.id}
                          status={user.status}
                        />
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
