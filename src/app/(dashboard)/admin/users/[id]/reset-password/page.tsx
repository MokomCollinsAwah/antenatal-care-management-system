import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ResetPasswordForm } from "@/features/admin/users/components/ResetPasswordForm";
import { getUserDetails } from "@/features/admin/users/queries";
import { UserRole } from "@/lib/constants";
import { AdminServiceError } from "@/server/services/adminServiceError";

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await loadUser(id);

  if (user.role !== UserRole.HEALTH_WORKER) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Reset Password"
        description={`Set a new password for ${user.fullName}.`}
      />
      <Card>
        <CardContent className="pt-6">
          <ResetPasswordForm userId={user.id} />
        </CardContent>
      </Card>
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
