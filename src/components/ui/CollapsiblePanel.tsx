import type { ReactNode } from "react";
import { ChevronDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsiblePanelProps {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
  defaultOpen?: boolean;
  tone?: "default" | "teal";
}

export function CollapsiblePanel({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
  tone = "default",
}: CollapsiblePanelProps) {
  return (
    <details
      open={defaultOpen}
      className={cn(
        "group min-w-0 rounded-2xl border bg-white shadow-sm",
        tone === "teal" ? "border-teal-200" : "border-slate-200",
      )}
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 marker:hidden sm:px-6">
        <span
          className={cn(
            "rounded-lg p-2",
            tone === "teal" ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-700",
          )}
        >
          <Icon className="size-5" />
        </span>
        <h2 className="min-w-0 flex-1 text-base font-bold text-slate-900">{title}</h2>
        <ChevronDown className="size-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
      </summary>
      <div className="border-t border-slate-100 px-5 py-5 sm:px-6">{children}</div>
    </details>
  );
}
