import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant =
  | "scheduled"
  | "attended"
  | "missed"
  | "cancelled"
  | "active"
  | "suspended"
  | "completed"
  | "stopped"
  | "pending"
  | "due"
  | "read"
  | "neutral";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  scheduled: "bg-teal-50 text-teal-700 ring-teal-600/20",
  attended: "bg-teal-50 text-teal-700 ring-teal-600/20",
  missed: "bg-slate-100 text-slate-700 ring-slate-600/20",
  cancelled: "bg-red-50 text-red-700 ring-red-600/20",
  active: "bg-teal-50 text-teal-700 ring-teal-600/20",
  suspended: "bg-red-50 text-red-700 ring-red-600/20",
  completed: "bg-teal-50 text-teal-700 ring-teal-600/20",
  stopped: "bg-slate-100 text-slate-700 ring-slate-600/20",
  pending: "bg-slate-100 text-slate-700 ring-slate-600/20",
  due: "bg-slate-100 text-slate-700 ring-slate-600/20",
  read: "bg-slate-100 text-slate-700 ring-slate-600/20",
  neutral: "bg-slate-100 text-slate-700 ring-slate-600/20",
};

export function Badge({
  className,
  variant = "neutral",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
