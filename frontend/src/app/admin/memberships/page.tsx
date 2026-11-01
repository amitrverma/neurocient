"use client";

import { FormEvent, useMemo, useState } from "react";
import { AdminPageIntro, AdminState, formatDate, Pagination, SearchForm, StatusBadge } from "../_components/AdminPrimitives";
import { useAdminResource } from "../_lib/useAdminResource";

type Membership = {
  user_id: string; email: string; name?: string; status: string; provider?: string;
  provider_status?: string; provider_subscription_id?: string; checkout_state?: string;
  current_period_end?: string; updated_at: string;
};
type MembershipResponse = { items: Membership[]; total: number; page: number; page_size: number };
type BillingEvent = {
  id: string; event_type: string; provider_subscription_id?: string;
  status: string; reason_code?: string; created_at: string;
};
type EventResponse = { items: BillingEvent[]; total: number; page: number; page_size: number };

export default function MembershipsPage() {
  const [draftQuery, setDraftQuery] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [eventPage, setEventPage] = useState(1);
  const url = useMemo(
    () => `/api/admin/memberships?page=${page}&page_size=25${query ? `&query=${encodeURIComponent(query)}` : ""}${status ? `&status=${encodeURIComponent(status)}` : ""}`,
    [page, query, status],
  );
  const memberships = useAdminResource<MembershipResponse>(url);
  const events = useAdminResource<EventResponse>(`/api/admin/membership-events?page=${eventPage}&page_size=25`);
  const search = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setQuery(draftQuery.trim());
    setPage(1);
  };

  return (
    <section className="mx-auto max-w-6xl px-5 py-10 md:py-12">
      <AdminPageIntro eyebrow="Entitlements" title="Memberships" description="Provider-neutral access records and checkout reconciliation state. Users without an entitlement record remain visible in Registered users." />
      <SearchForm value={draftQuery} onChange={setDraftQuery} onSubmit={search} placeholder="Search member name or email" />
      <label className="mt-4 block max-w-xs font-sans text-xs font-bold uppercase tracking-wider text-brand-teal">
        Status
        <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="mt-2 min-h-11 w-full rounded-lg border border-brand-dark/15 bg-white px-3 text-sm font-medium normal-case tracking-normal text-brand-dark">
          <option value="">All statuses</option><option value="active">Active</option><option value="trialing">Trialing</option>
          <option value="inactive">Inactive</option><option value="canceled">Canceled</option><option value="past_due">Past due</option>
          <option value="paused">Paused</option><option value="expired">Expired</option><option value="refunded">Refunded</option><option value="disputed">Disputed</option>
        </select>
      </label>
      <AdminState loading={memberships.loading} error={memberships.error} empty={memberships.data && memberships.data.items.length === 0 ? "No membership records match these filters." : undefined} onRetry={memberships.retry}>
        {memberships.data ? <>
          <p className="mt-7 font-sans text-sm text-brand-dark/55">{memberships.data.total.toLocaleString("en-IN")} entitlement records</p>
          <div className="mt-3 overflow-hidden rounded-xl border border-brand-dark/10 bg-white">{memberships.data.items.map((item) =>
            <div key={item.user_id} className="grid gap-3 border-b border-brand-dark/10 p-5 last:border-0 md:grid-cols-[1fr_auto_auto_auto] md:items-center">
              <div><p className="font-sans text-sm font-semibold">{item.name || item.email}</p><p className="mt-1 break-all font-sans text-xs text-brand-dark/55">{item.email}</p>{item.provider_subscription_id ? <p className="mt-1 break-all font-mono text-[11px] text-brand-dark/45">{item.provider_subscription_id}</p> : null}</div>
              <StatusBadge value={item.status} />
              <div className="font-sans text-xs text-brand-dark/55"><p>{item.provider || "Manual / unspecified"}</p><p>Provider: {item.provider_status || "—"}</p><p>Checkout: {item.checkout_state || "—"}</p></div>
              <p className="font-sans text-xs text-brand-dark/55">Period ends {formatDate(item.current_period_end)}</p>
            </div>)}</div>
          <Pagination page={memberships.data.page} pageSize={memberships.data.page_size} total={memberships.data.total} onPage={setPage} />
        </> : null}
      </AdminState>

      <div className="mt-12 border-t border-brand-dark/10 pt-8">
        <h2 className="font-serif text-2xl font-semibold text-brand-dark">Recent billing events</h2>
        <p className="mt-2 font-sans text-sm text-brand-dark/55">Privacy-minimised webhook outcomes for reconciliation.</p>
        <AdminState loading={events.loading} error={events.error} empty={events.data && events.data.items.length === 0 ? "No membership billing events yet." : undefined} onRetry={events.retry}>
          {events.data ? <><div className="mt-4 overflow-hidden rounded-xl border border-brand-dark/10 bg-white">{events.data.items.map((event) =>
            <div key={event.id} className="grid gap-2 border-b border-brand-dark/10 p-4 last:border-0 md:grid-cols-[1fr_auto_auto]">
              <div><p className="font-sans text-sm font-semibold">{event.event_type}</p><p className="mt-1 break-all font-mono text-[11px] text-brand-dark/45">{event.provider_subscription_id || "No subscription ID"}</p></div>
              <div><StatusBadge value={event.status} />{event.reason_code ? <p className="mt-1 font-sans text-xs text-brand-dark/55">{event.reason_code}</p> : null}</div>
              <p className="font-sans text-xs text-brand-dark/55">{formatDate(event.created_at)}</p>
            </div>)}</div><Pagination page={events.data.page} pageSize={events.data.page_size} total={events.data.total} onPage={setEventPage} /></> : null}
        </AdminState>
      </div>
    </section>
  );
}
