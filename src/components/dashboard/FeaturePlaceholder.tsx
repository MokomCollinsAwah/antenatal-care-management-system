import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";

interface FeaturePlaceholderProps {
  title: string;
  description: string;
}

export function FeaturePlaceholder({
  title,
  description,
}: FeaturePlaceholderProps) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <Card>
        <CardHeader>
          <CardTitle>{title} workspace</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            title={`${title} features are coming next`}
            description="This foundation includes the page structure only. Data workflows and actions will be added in a later implementation step."
          />
        </CardContent>
      </Card>
    </div>
  );
}
