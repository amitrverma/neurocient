import Link from "next/link";
import { ArrowRight, CalendarDays, ShieldCheck } from "lucide-react";

export default function AdminPage() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-12">
      <p className="page-eyebrow text-brand-teal">Operations</p>
      <h1 className="page-section-title mt-2">Admin dashboard</h1>
      <p className="mt-3 max-w-2xl font-sans text-sm leading-7 text-brand-dark/65">Create and publish facilitated cohorts, then monitor the operational record behind enrollment.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Link href="/admin/cohorts" className="group rounded-xl border border-brand-dark/10 bg-white p-6 shadow-sm">
          <CalendarDays className="h-6 w-6 text-brand-accent" /><h2 className="mt-5 text-2xl font-bold">Modern Caveman cohorts</h2><p className="mt-2 font-sans text-sm leading-6 text-brand-dark/65">Dates, capacity, price, publication and enrollment state.</p><ArrowRight className="mt-6 h-5 w-5 transition group-hover:translate-x-1" />
        </Link>
        <Link href="/admin/audit" className="group rounded-xl border border-brand-dark/10 bg-white p-6 shadow-sm">
          <ShieldCheck className="h-6 w-6 text-brand-accent" /><h2 className="mt-5 text-2xl font-bold">Audit trail</h2><p className="mt-2 font-sans text-sm leading-6 text-brand-dark/65">Review material cohort and payment events.</p><ArrowRight className="mt-6 h-5 w-5 transition group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
