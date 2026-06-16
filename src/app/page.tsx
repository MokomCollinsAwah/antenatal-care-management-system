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
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-5 sm:px-8">
        <header className="flex h-20 items-center">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-teal-700 p-2.5 text-white">
              <HeartPulse className="size-5" />
            </span>
            <span className="font-bold text-slate-900">
              Antenatal Care Management
            </span>
          </div>
          <Link
            href="/login"
            className="ml-auto text-sm font-semibold text-teal-800 hover:text-teal-950"
          >
            Staff login
          </Link>
        </header>

        <section className="grid flex-1 items-center gap-14 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
          <div>
            <span className="inline-flex rounded-full bg-teal-100 px-3 py-1 text-sm font-semibold text-teal-800">
              Coordinated maternal care
            </span>
            <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-6xl">
              Better visibility across every antenatal care journey.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              A professional workspace for health workers to coordinate
              appointments, visits, supplements, scans, reminders, and
              follow-ups.
            </p>
            <Link
              href="/login"
              className="mt-8 inline-flex h-12 items-center gap-2 rounded-lg bg-teal-700 px-6 font-semibold text-white hover:bg-teal-800"
            >
              Continue to login
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="rounded-3xl border border-teal-100 bg-white p-6 shadow-xl shadow-teal-900/8 sm:p-8">
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
            <div className="mt-6 rounded-2xl bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-900">
                Foundation release
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Authentication and clinical workflows will be connected in
                later implementation steps.
              </p>
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
    <div className="rounded-2xl border border-slate-200 p-5">
      <span className="inline-flex rounded-xl bg-teal-50 p-3 text-teal-700">
        <Icon className="size-5" />
      </span>
      <h2 className="mt-4 font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}
