import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { UserStatus } from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/utils";
import type { PatientSummary } from "@/types";

export function PatientProfileDetails({ patient }: { patient: PatientSummary }) {
  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Patient Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-5">
            <Detail label="Full Name" value={patient.fullName} />
            <Detail label="Phone" value={patient.phone} />
            <Detail label="Email" value={patient.email || "Not provided"} />
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </dt>
              <dd className="mt-2">
                <Badge
                  variant={
                    patient.status === UserStatus.ACTIVE
                      ? "active"
                      : "suspended"
                  }
                >
                  {patient.status}
                </Badge>
              </dd>
            </div>
            <Detail label="Created At" value={formatDateTime(patient.createdAt)} />
          </dl>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-5">
            <Detail label="Age" value={String(patient.age)} />
            <Detail label="Address" value={patient.address} />
            <Detail
              label="Emergency Contact Name"
              value={patient.emergencyContactName || "Not provided"}
            />
            <Detail
              label="Emergency Contact Phone"
              value={patient.emergencyContactPhone || "Not provided"}
            />
          </dl>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Antenatal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-5">
            <Detail label="Health Centre" value={patient.healthCentreName} />
            <Detail
              label="Assigned Health Worker"
              value={patient.assignedHealthWorkerName}
            />
            <Detail
              label="Last Menstrual Period"
              value={formatDate(patient.lastMenstrualPeriod)}
            />
            <Detail
              label="Expected Delivery Date"
              value={formatDate(patient.expectedDeliveryDate)}
            />
            <Detail label="Gravidity" value={valueOrDash(patient.gravidity)} />
            <Detail label="Parity" value={valueOrDash(patient.parity)} />
            <Detail label="Blood Group" value={patient.bloodGroup || "—"} />
            <Detail label="Risk Note" value={patient.riskNote || "—"} />
          </dl>
        </CardContent>
      </Card>
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

function valueOrDash(value?: number) {
  return typeof value === "number" ? String(value) : "—";
}
