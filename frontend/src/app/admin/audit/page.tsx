"use client";

import { useState } from "react";
import { AdminPageIntro, AdminState, Pagination } from "../_components/AdminPrimitives";
import { useAdminResource } from "../_lib/useAdminResource";

type Event = { id: string; action: string; subject_type: string; subject_id?: string; created_at: string; details: Record<string, unknown> };
type Response = { events: Event[]; total: number; page: number; page_size: number };
export default function AuditPage() {
  const [page, setPage] = useState(1);
  const { data, loading, error, retry } = useAdminResource<Response>(`/api/admin/audit?page=${page}&page_size=50`);
  const events = data?.events || [];
  return <section className="mx-auto max-w-6xl px-5 py-10 md:py-12"><AdminPageIntro eyebrow="Accountability" title="Audit trail" description="Material administrative and payment events recorded by the backend." /><AdminState loading={loading} error={error} empty={!loading && data && events.length === 0 ? "No recorded events yet." : undefined} onRetry={retry}>{data ? <><p className="mt-7 font-sans text-sm text-brand-dark/55">{data.total.toLocaleString("en-IN")} recorded events</p><div className="mt-3 overflow-hidden rounded-xl border border-brand-dark/10 bg-white">{events.map((event) => <div key={event.id} className="grid gap-2 border-b border-brand-dark/10 p-5 last:border-0 md:grid-cols-[12rem_1fr_auto] md:items-center"><span className="font-sans text-sm font-semibold">{event.action}</span><span className="break-all font-sans text-sm text-brand-dark/65">{event.subject_type} {event.subject_id}</span><time className="font-sans text-xs text-brand-dark/50">{new Date(event.created_at).toLocaleString("en-IN")}</time></div>)}</div><Pagination page={data.page} pageSize={data.page_size} total={data.total} onPage={setPage} /></> : null}</AdminState></section>;
}
