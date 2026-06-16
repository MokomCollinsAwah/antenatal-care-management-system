import Link from "next/link";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { PageHeader } from "@/components/ui/PageHeader";
import { getHealthCentresForSelect } from "@/features/admin/health-centres/queries";
import { FollowUpFilters } from "@/features/followups/components/FollowUpFilters";
import { FollowUpTable } from "@/features/followups/components/FollowUpTable";
import { getFollowUps } from "@/features/followups/queries";
import { getPageNumber, paginate } from "@/lib/pagination";
import type { ClinicalRecordFilters } from "@/types";

type ClinicalSearchParams = ClinicalRecordFilters & { page?: string | string[] };

export default async function FollowUpsPage({ searchParams }: { searchParams: Promise<ClinicalSearchParams> }) {
  const filters = await searchParams;
  const [followUps, healthCentres] = await Promise.all([getFollowUps(filters), getHealthCentresForSelect()]);
  const page = paginate(followUps, getPageNumber(filters.page));
  return (
    <div className="space-y-6">
      <PageHeader title="Follow-ups" description="Track patient follow-up contact and outcomes." action={<Link href="/follow-ups/new" className="inline-flex h-11 items-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800"><Plus className="size-4" /> Add Follow-up</Link>} />
      <Card><CardContent className="pt-6"><FollowUpFilters filters={filters} healthCentres={healthCentres} /></CardContent></Card>
      <Card><CardContent className="p-0"><FollowUpTable followUps={page.items} /><Pagination {...page} searchParams={filters} /></CardContent></Card>
    </div>
  );
}
