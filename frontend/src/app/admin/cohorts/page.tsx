"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, LoaderCircle, Plus } from "lucide-react";

type Cohort = { id: string; title: string; slug: string; starts_at: string; status: string; capacity: number; seats_remaining: number; currency: string; price_minor: number };

export default function CohortsPage() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch("/api/admin/cohorts", { cache: "no-store" }).then(async (response) => {
      if (!response.ok) throw new Error();
      return response.json();
    }).then((data) => setCohorts(data.cohorts || [])).catch(() => setError("Cohorts could not be loaded.")).finally(() => setLoading(false));
  }, []);
  return (
    <section className="mx-auto max-w-6xl px-5 py-12">
      <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="page-eyebrow text-brand-teal">Modern Caveman</p><h1 className="page-section-title mt-2">Cohorts</h1></div><Link href="/admin/cohorts/new" className="flex items-center gap-2 rounded-full bg-brand-dark px-5 py-3 font-sans text-sm font-semibold text-white"><Plus className="h-4 w-4" />New cohort</Link></div>
      {loading ? <LoaderCircle className="mt-10 h-6 w-6 animate-spin text-brand-accent" /> : error ? <p className="mt-10 font-sans text-sm text-red-700">{error}</p> : (
        <div className="mt-8 grid gap-3">{cohorts.length === 0 ? <p className="rounded-xl border border-dashed border-brand-dark/20 p-8 font-sans text-sm text-brand-dark/65">No cohorts yet. Create the first one as a draft.</p> : cohorts.map((cohort) => (
          <Link key={cohort.id} href={`/admin/cohorts/${cohort.id}`} className="grid gap-4 rounded-xl border border-brand-dark/10 bg-white p-5 shadow-sm md:grid-cols-[1fr_auto_auto_auto] md:items-center">
            <div><h2 className="text-xl font-bold">{cohort.title}</h2><p className="mt-1 font-sans text-sm text-brand-dark/60">Starts {new Date(cohort.starts_at).toLocaleDateString("en-IN")}</p></div>
            <span className="font-sans text-xs font-bold uppercase tracking-wider">{cohort.status}</span><span className="font-sans text-sm">{cohort.capacity - cohort.seats_remaining}/{cohort.capacity} seats</span><ArrowRight className="h-4 w-4" />
          </Link>
        ))}</div>
      )}
    </section>
  );
}
