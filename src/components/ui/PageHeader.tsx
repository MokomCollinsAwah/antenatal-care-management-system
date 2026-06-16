import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 max-w-3xl text-sm text-slate-500 sm:text-base">
            {description}
          </p>
        )}
      </div>
      {action && <div className="w-full sm:w-auto sm:shrink-0">{action}</div>}
    </div>
  );
}
