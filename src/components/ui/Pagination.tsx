import Link from "next/link";
import { cn } from "@/lib/utils";

type SearchParams = object;

function pageHref(searchParams: SearchParams, page: number) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "page") continue;
    if (Array.isArray(value)) {
      value.filter(Boolean).forEach((item) => params.append(key, String(item)));
    } else if (typeof value === "string" && value) {
      params.set(key, value);
    }
  }
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `?${query}` : "?";
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  searchParams,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  searchParams: SearchParams;
}) {
  if (totalPages <= 1) {
    return (
      <p className="px-4 py-3 text-sm text-slate-500">
        Showing {totalItems} {totalItems === 1 ? "record" : "records"}
      </p>
    );
  }

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-slate-500">
        Showing {start}-{end} of {totalItems}
      </p>
      <div className="flex flex-wrap gap-2">
        <PageLink disabled={currentPage <= 1} href={pageHref(searchParams, currentPage - 1)}>
          Previous
        </PageLink>
        <span className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 font-semibold text-slate-700">
          Page {currentPage} of {totalPages}
        </span>
        <PageLink disabled={currentPage >= totalPages} href={pageHref(searchParams, currentPage + 1)}>
          Next
        </PageLink>
      </div>
    </div>
  );
}

function PageLink({
  disabled,
  href,
  children,
}: {
  disabled: boolean;
  href: string;
  children: string;
}) {
  if (disabled) {
    return (
      <span className="inline-flex h-9 cursor-not-allowed items-center rounded-lg border border-slate-200 bg-slate-50 px-3 font-semibold text-slate-400">
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-9 items-center rounded-lg border border-slate-300 bg-white px-3 font-semibold text-slate-700 hover:bg-slate-50",
      )}
    >
      {children}
    </Link>
  );
}
