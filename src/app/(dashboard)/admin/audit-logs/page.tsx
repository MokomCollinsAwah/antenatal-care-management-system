import { FeaturePlaceholder } from "@/components/dashboard/FeaturePlaceholder";
import { requireRole } from "@/lib/auth-utils";
import { UserRole } from "@/lib/constants";

export default async function AuditLogsPage() {
  await requireRole([UserRole.ADMIN]);

  return (
    <FeaturePlaceholder
      title="Audit Logs"
      description="Review important system actions and accountability records."
    />
  );
}
