"use client";

import { FormEvent, useMemo, useState } from "react";
import { AdminPageIntro, AdminState, formatDate, Pagination, SearchForm, StatusBadge } from "../_components/AdminPrimitives";
import { useAdminResource } from "../_lib/useAdminResource";

type AdminUser = {
  id: string; email: string; name?: string; created_at: string; auth_method: string; roles: string[];
  membership: { status: string; is_active: boolean; current_period_end?: string };
  activity: Record<string, number>;
  delivery: { push_devices: number; whatsapp_enabled: boolean; whatsapp_verified: boolean };
};
type UserResponse = { items: AdminUser[]; total: number; page: number; page_size: number };

export default function UsersPage() {
  const [draftQuery, setDraftQuery] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const url = useMemo(() => `/api/admin/users?page=${page}&page_size=25${query ? `&query=${encodeURIComponent(query)}` : ""}`, [page, query]);
  const { data, loading, error, retry } = useAdminResource<UserResponse>(url);
  const search = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setQuery(draftQuery.trim()); setPage(1); };

  return <section className="mx-auto max-w-6xl px-5 py-10 md:py-12">
    <AdminPageIntro eyebrow="Accounts" title="Registered accounts" description="Account identity, access state, delivery readiness, and activity counts. Private user-written content is deliberately not shown." />
    <SearchForm value={draftQuery} onChange={setDraftQuery} onSubmit={search} placeholder="Search by name or email" />
    <AdminState loading={loading} error={error} empty={data && data.items.length === 0 ? "No users match this search." : undefined} onRetry={retry}>
      {data ? <>
        <p className="mt-7 font-sans text-sm text-brand-dark/55">{data.total.toLocaleString("en-IN")} accounts</p>
        <div className="mt-3 overflow-hidden rounded-xl border border-brand-dark/10 bg-white">
          {data.items.map((user) => <UserRow key={user.id} user={user} />)}
        </div>
        <Pagination page={data.page} pageSize={data.page_size} total={data.total} onPage={setPage} />
      </> : null}
    </AdminState>
  </section>;
}

const UserRow = ({ user }: { user: AdminUser }) => {
  const activityTotal = Object.values(user.activity).reduce((sum, count) => sum + count, 0);
  return <article className="grid gap-4 border-b border-brand-dark/10 p-5 last:border-0 lg:grid-cols-[1.3fr_0.8fr_0.8fr_1fr] lg:items-center">
    <div><h2 className="font-sans text-sm font-semibold">{user.name || "Name not provided"}</h2><p className="mt-1 break-all font-sans text-xs text-brand-dark/58">{user.email}</p><p className="mt-2 font-sans text-xs text-brand-dark/45">Joined {formatDate(user.created_at)} · {user.auth_method}</p></div>
    <div><p className="font-sans text-[0.68rem] font-bold uppercase tracking-wider text-brand-teal">Access</p><div className="mt-2 flex flex-wrap gap-2"><StatusBadge value={user.membership.is_active ? user.membership.status : "inactive"} />{user.roles.map((role) => <StatusBadge key={role} value={role} />)}</div></div>
    <div><p className="font-sans text-[0.68rem] font-bold uppercase tracking-wider text-brand-teal">Delivery</p><p className="mt-2 font-sans text-xs leading-5 text-brand-dark/62">{user.delivery.push_devices} push {user.delivery.push_devices === 1 ? "device" : "devices"}<br />WhatsApp {user.delivery.whatsapp_verified ? "verified" : user.delivery.whatsapp_enabled ? "configured" : "off"}</p></div>
    <div><p className="font-sans text-[0.68rem] font-bold uppercase tracking-wider text-brand-teal">Activity</p><p className="mt-2 font-sans text-xs leading-5 text-brand-dark/62">{activityTotal} recorded items</p><p className="font-sans text-[0.68rem] leading-5 text-brand-dark/45">Scan {user.activity.completed_scans} · Spots {user.activity.spots} · Practice {user.activity.practices} · Challenges {user.activity.microchallenges} · Saves {user.activity.saved_insights}</p></div>
  </article>;
};
