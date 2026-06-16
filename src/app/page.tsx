import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  HeartPulse,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-white">
      <div className="absolute inset-x-0 top-0 h-96 bg-linear-to-b from-teal-50 to-white" />
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 sm:px-6 lg:px-8">
        <header className="flex h-16 items-center sm:h-20">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-teal-700 p-2 text-white sm:p-2.5">
              <HeartPulse className="size-4 sm:size-5" />
            </span>
            <span className="text-sm font-bold text-slate-900 sm:text-base">
              Antenatal Care Management
            </span>
          </div>
        </header>

        <section className="grid flex-1 items-center gap-8 py-8 sm:gap-10 sm:py-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14 lg:py-20">
          <div>
            <span className="inline-flex rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-800 sm:text-sm">
              Coordinated maternal care
            </span>
            <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Better visibility across every antenatal care journey.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              A professional workspace for health workers to coordinate
              appointments, visits, supplements, scans, reminders, and
              follow-ups.
            </p>
            <Link
              href="/login"
              className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-teal-700 px-6 font-semibold text-white hover:bg-teal-800 sm:w-auto"
            >
              Staff login
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="rounded-3xl border border-teal-100 bg-white p-4 shadow-xl shadow-teal-900/8 sm:p-6 lg:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <Feature
                icon={CalendarCheck}
                title="Care coordination"
                description="Keep scheduled care and follow-up priorities visible."
              />
              <Feature
                icon={ShieldCheck}
                title="Structured records"
                description="Build on a clear, role-aware clinical foundation."
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Feature({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4 sm:p-5">
      <span className="inline-flex rounded-xl bg-teal-50 p-3 text-teal-700">
        <Icon className="size-5" />
      </span>
      <h2 className="mt-4 text-base font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}
