"use client";

import { FormEvent, useMemo, useState } from "react";
import { AdminPageIntro, AdminState, formatDate, Pagination, SearchForm, StatusBadge } from "../_components/AdminPrimitives";
import { useAdminResource } from "../_lib/useAdminResource";

type Membership = { user_id: string; email: string; name?: string; status: string; provider?: string; current_period_end?: string; updated_at: string };
type Response = { items: Membership[]; total: number; page: number; page_size: number };

export default function MembershipsPage() {
  const [draftQuery, setDraftQuery] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const url = useMemo(() => `/api/admin/memberships?page=${page}&page_size=25${query ? `&query=${encodeURIComponent(query)}` : ""}${status ? `&status=${encodeURIComponent(status)}` : ""}`, [page, query, status]);
  const { data, loading, error, retry } = useAdminResource<Response>(url);
  const search = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setQuery(draftQuery.trim()); setPage(1); };
  return <section className="mx-auto max-w-6xl px-5 py-10 md:py-12">
    <AdminPageIntro eyebrow="Entitlements" title="Memberships" description="Provider-neutral access records. Users without an entitlement record remain visible in Registered users." />
    <SearchForm value={draftQuery} onChange={setDraftQuery} onSubmit={search} placeholder="Search member name or email" />
    <label className="mt-4 block max-w-xs font-sans text-xs font-bold uppercase tracking-wider text-brand-teal">Status<select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="mt-2 min-h-11 w-full rounded-lg border border-brand-dark/15 bg-white px-3 text-sm font-medium normal-case tracking-normal text-brand-dark"><option value="">All statuses</option><option value="active">Active</option><option value="trialing">Trialing</option><option value="inactive">Inactive</option><option value="cancelled">Cancelled</option><option value="expired">Expired</option></select></label>
    <AdminState loading={loading} error={error} empty={data && data.items.length === 0 ? "No membership records match these filters." : undefined} onRetry={retry}>
      {data ? <><p className="mt-7 font-sans text-sm text-brand-dark/55">{data.total.toLocaleString("en-IN")} entitlement records</p><div className="mt-3 overflow-hidden rounded-xl border border-brand-dark/10 bg-white">{data.items.map((item) => <div key={item.user_id} className="grid gap-3 border-b border-brand-dark/10 p-5 last:border-0 md:grid-cols-[1fr_auto_auto_auto] md:items-center"><div><p className="font-sans text-sm font-semibold">{item.name || item.email}</p><p className="mt-1 break-all font-sans text-xs text-brand-dark/55">{item.email}</p></div><StatusBadge value={item.status} /><p className="font-sans text-xs text-brand-dark/55">{item.provider || "Manual / unspecified"}</p><p className="font-sans text-xs text-brand-dark/55">Period ends {formatDate(item.current_period_end)}</p></div>)}</div><Pagination page={data.page} pageSize={data.page_size} total={data.total} onPage={setPage} /></> : null}
    </AdminState>
  </section>;
}
