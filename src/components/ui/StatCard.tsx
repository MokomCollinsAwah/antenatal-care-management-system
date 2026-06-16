import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex min-h-28 items-start justify-between gap-2 p-4 sm:min-h-32 sm:gap-4 sm:p-6">
        <div className="min-w-0">
          <p className="text-xs font-medium leading-snug text-slate-500 sm:text-sm">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {value}
          </p>
          {description && (
            <p className="mt-2 text-xs text-slate-500">{description}</p>
          )}
        </div>
        {Icon && (
          <span className="shrink-0 rounded-xl bg-teal-50 p-2 text-teal-700 sm:p-3">
            <Icon className="size-4 sm:size-5" aria-hidden="true" />
          </span>
        )}
      </CardContent>
    </Card>
  );
}
