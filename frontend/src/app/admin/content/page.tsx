"use client";

import Link from "next/link";
import { AdminPageIntro, AdminState, formatDate, StatusBadge } from "../_components/AdminPrimitives";
import { useAdminResource } from "../_lib/useAdminResource";

type ContentData = {
  articles: Array<{ id: string; slug: string; title: string; read_count: number; save_count: number; updated_at: string }>;
  nudges: Array<{ id: string; title: string; is_active: boolean; created_at: string }>;
  microchallenges: Array<{ id: string; title: string; assignment_count: number; created_at: string }>;
};

export default function ContentPage() {
  const { data, loading, error, retry } = useAdminResource<ContentData>("/api/admin/content");
  return <section className="mx-auto max-w-6xl px-5 py-10 md:py-12">
    <AdminPageIntro eyebrow="Published experience" title="Content and nudges" description="Existing article performance counters and the current behavioral-nudge inventory. Authoring remains in the established content and database workflows." />
    <AdminState loading={loading} error={error} onRetry={retry}>
      {data ? <div className="mt-8 grid gap-8">
        <section><h2 className="text-2xl font-bold">Insights</h2><div className="mt-4 overflow-hidden rounded-xl border border-brand-dark/10 bg-white">{data.articles.length ? data.articles.map((article) => <div key={article.id} className="grid gap-3 border-b border-brand-dark/10 p-5 last:border-0 md:grid-cols-[1fr_auto_auto] md:items-center"><div><Link href={`/insights/${article.slug}`} className="font-sans text-sm font-semibold hover:text-brand-primary">{article.title}</Link><p className="mt-1 font-sans text-xs text-brand-dark/48">/{article.slug} · updated {formatDate(article.updated_at)}</p></div><p className="font-sans text-sm"><strong>{article.read_count.toLocaleString("en-IN")}</strong> <span className="text-brand-dark/50">reads</span></p><p className="font-sans text-sm"><strong>{article.save_count.toLocaleString("en-IN")}</strong> <span className="text-brand-dark/50">saves</span></p></div>) : <p className="p-6 font-sans text-sm text-brand-dark/55">No article records.</p>}</div></section>
        <section><h2 className="text-2xl font-bold">Nudges</h2><div className="mt-4 overflow-hidden rounded-xl border border-brand-dark/10 bg-white">{data.nudges.length ? data.nudges.map((nudge) => <div key={nudge.id} className="grid gap-3 border-b border-brand-dark/10 p-5 last:border-0 sm:grid-cols-[1fr_auto_auto] sm:items-center"><p className="font-sans text-sm font-semibold">{nudge.title}</p><StatusBadge value={nudge.is_active ? "active" : "inactive"} /><time className="font-sans text-xs text-brand-dark/50">Added {formatDate(nudge.created_at)}</time></div>) : <p className="p-6 font-sans text-sm text-brand-dark/55">No nudges recorded.</p>}</div></section>
        <section><h2 className="text-2xl font-bold">Microchallenge library</h2><div className="mt-4 overflow-hidden rounded-xl border border-brand-dark/10 bg-white">{data.microchallenges.length ? data.microchallenges.map((challenge) => <div key={challenge.id} className="grid gap-3 border-b border-brand-dark/10 p-5 last:border-0 sm:grid-cols-[1fr_auto_auto] sm:items-center"><p className="font-sans text-sm font-semibold">{challenge.title}</p><p className="font-sans text-sm"><strong>{challenge.assignment_count.toLocaleString("en-IN")}</strong> <span className="text-brand-dark/50">assignments</span></p><time className="font-sans text-xs text-brand-dark/50">Added {formatDate(challenge.created_at)}</time></div>) : <p className="p-6 font-sans text-sm text-brand-dark/55">No microchallenges recorded.</p>}</div></section>
      </div> : null}
    </AdminState>
  </section>;
}
