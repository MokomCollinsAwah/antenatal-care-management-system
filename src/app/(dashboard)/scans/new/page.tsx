import { PageHeader } from "@/components/ui/PageHeader";
import { getHealthCentresForSelect } from "@/features/admin/health-centres/queries";
import { getAppointmentPatientOptions } from "@/features/appointments/queries";
import { ScanForm } from "@/features/scans/components/ScanForm";

export default async function NewScanPage({ searchParams }: { searchParams: Promise<{ patientId?: string }> }) {
  const [{ patientId }, patients, healthCentres] = await Promise.all([searchParams, getAppointmentPatientOptions(), getHealthCentresForSelect()]);
  return (
    <div className="space-y-6">
      <PageHeader title="New Scan Record" description="Record scan information without diagnostic conclusions." />
      <ScanForm patients={patients} healthCentres={healthCentres} initialPatientId={patientId} />
    </div>
  );
}
