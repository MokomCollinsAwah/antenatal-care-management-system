import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

const sections = [
  "Supplements",
  "Scans",
  "Reminders",
  "Follow-ups",
];

export function PatientFutureSections() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {sections.map((section) => (
        <Card key={section}>
          <CardHeader>
            <CardTitle>{section}</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              title={`${section} will be managed later`}
              description={`${section} will be managed in the next implementation step.`}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
