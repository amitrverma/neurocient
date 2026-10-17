"use client";

import { FormEvent, useMemo, useState } from "react";
import { AdminPageIntro, AdminState, formatDate, Pagination, SearchForm } from "../_components/AdminPrimitives";
import { useAdminResource } from "../_lib/useAdminResource";

type Subscriber = { id: string; email: string; created_at: string };
type Response = { items: Subscriber[]; total: number; page: number; page_size: number };

export default function NewsletterPage() {
  const [draftQuery, setDraftQuery] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const url = useMemo(() => `/api/admin/newsletter?page=${page}&page_size=50${query ? `&query=${encodeURIComponent(query)}` : ""}`, [page, query]);
  const { data, loading, error, retry } = useAdminResource<Response>(url);
  const search = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setQuery(draftQuery.trim()); setPage(1); };
  return <section className="mx-auto max-w-5xl px-5 py-10 md:py-12">
    <AdminPageIntro eyebrow="Communications" title="Newsletter subscribers" description="Every email persisted through the existing newsletter signup journey." />
    <SearchForm value={draftQuery} onChange={setDraftQuery} onSubmit={search} placeholder="Search subscriber email" />
    <AdminState loading={loading} error={error} empty={data && data.items.length === 0 ? "No subscribers match this search." : undefined} onRetry={retry}>
      {data ? <><p className="mt-7 font-sans text-sm text-brand-dark/55">{data.total.toLocaleString("en-IN")} subscribers</p><div className="mt-3 overflow-hidden rounded-xl border border-brand-dark/10 bg-white">{data.items.map((item) => <div key={item.id} className="grid gap-1 border-b border-brand-dark/10 p-5 last:border-0 sm:grid-cols-[1fr_auto] sm:items-center"><p className="break-all font-sans text-sm font-semibold">{item.email}</p><time className="font-sans text-xs text-brand-dark/50">Joined {formatDate(item.created_at)}</time></div>)}</div><Pagination page={data.page} pageSize={data.page_size} total={data.total} onPage={setPage} /></> : null}
    </AdminState>
  </section>;
}
