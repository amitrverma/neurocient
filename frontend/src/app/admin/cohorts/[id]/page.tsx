"use client";

import { use, useState, type ReactNode } from "react";
import { AdminPageIntro, AdminState } from "../../_components/AdminPrimitives";
import { useAdminResource } from "../../_lib/useAdminResource";

type Cohort = { id: string; title: string; slug: string; description?: string; facilitator?: string; timezone: string; status: string; starts_at: string; ends_at: string; enrollment_opens_at?: string; enrollment_closes_at?: string; capacity: number; seats_remaining: number; price_minor: number; currency: string; checkout_configured: boolean; sessions: { id: string; title: string; starts_at: string; ends_at: string; public_note?: string; meeting_url?: string }[]; enrollments: { id: string; email: string; name?: string; status: string }[]; waitlist: { id: string; email: string; name?: string; status: string; offer_expires_at?: string; offer_email_sent_at?: string; offer_email_status: string; offer_email_last_error_code?: string }[] };
type ListItem = { primary: string; secondary: string; note?: string; href?: string; actions?: ReactNode };
const nextStates: Record<string, string[]> = { draft: ["published", "cancelled"], published: ["open", "closed", "cancelled"], open: ["full", "closed", "in_progress", "cancelled"], full: ["open", "closed", "in_progress", "cancelled"], closed: ["open", "in_progress", "cancelled"], in_progress: ["completed", "cancelled"] };

export default function CohortDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [message, setMessage] = useState("");
  const [working, setWorking] = useState(false);
  const { data: cohort, loading, error, retry } = useAdminResource<Cohort>(`/api/admin/cohorts/${id}`);
  const changeState = async (status: string) => {
    setWorking(true); setMessage("");
    try {
      const response = await fetch(`/api/admin/cohorts/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      setMessage(response.ok ? `Cohort moved to ${status.replaceAll("_", " ")}.` : "That state change was not accepted.");
      if (response.ok) retry();
    } catch {
      setMessage("The cohort service could not be reached. No change has been confirmed.");
    } finally { setWorking(false); }
  };
  const offerNextPlace = async () => {
    setWorking(true); setMessage("");
    try {
      const response = await fetch(`/api/admin/cohorts/${id}/waitlist/offer-next`, { method: "POST" });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        const offered = Number(data.offered || 0);
        const emailed = Number(data.emailed || 0);
        const pending = Number(data.email_pending || 0);
        setMessage(
          offered > 0
            ? `${offered} place${offered === 1 ? "" : "s"} reserved; ${emailed} email${emailed === 1 ? "" : "s"} accepted${pending ? `, ${pending} awaiting retry` : ""}.`
            : pending > 0
              ? `${pending} reserved offer email${pending === 1 ? " is" : "s are"} awaiting retry.`
              : "No free place or waiting person was available.",
        );
        retry();
      } else {
        setMessage("A place was reserved, but its email still needs delivery. The automatic dispatcher will retry it.");
      }
    } catch {
      setMessage("The waitlist service could not be reached. No new offer has been confirmed.");
    } finally { setWorking(false); }
  };
  const resolveOfferEmail = async (entryId: string, action: "confirmed_sent" | "retry_confirmed_absent" | "revoke") => {
    setWorking(true); setMessage("");
    try {
      const response = await fetch(`/api/admin/cohorts/${id}/waitlist/${entryId}/resolve-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      setMessage(response.ok ? "The ambiguous email outcome was resolved and recorded." : "That email resolution was not accepted.");
      if (response.ok) retry();
    } catch {
      setMessage("The waitlist service could not be reached. No resolution has been recorded.");
    } finally { setWorking(false); }
  };
  return <section className="mx-auto max-w-6xl px-5 py-10 md:py-12"><AdminState loading={loading} error={error} onRetry={retry}>{cohort ? <>
    <AdminPageIntro eyebrow={cohort.status} title={cohort.title} description={cohort.description || `/${cohort.slug}`} />
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Tile label="Starts" value={new Date(cohort.starts_at).toLocaleString("en-IN")} /><Tile label="Ends" value={new Date(cohort.ends_at).toLocaleString("en-IN")} /><Tile label="Seats" value={`${cohort.capacity - cohort.seats_remaining}/${cohort.capacity}`} /><Tile label="Fee" value={new Intl.NumberFormat("en-IN", { style: "currency", currency: cohort.currency, maximumFractionDigits: 0 }).format(cohort.price_minor / 100)} /><Tile label="Facilitator" value={cohort.facilitator || "Not assigned"} /><Tile label="Timezone" value={cohort.timezone} /><Tile label="Enrollment" value={`${cohort.enrollment_opens_at ? new Date(cohort.enrollment_opens_at).toLocaleDateString("en-IN") : "Not set"} – ${cohort.enrollment_closes_at ? new Date(cohort.enrollment_closes_at).toLocaleDateString("en-IN") : "Not set"}`} /><Tile label="Checkout" value={cohort.checkout_configured ? "Configured" : "Not configured"} /></div>
    <div className="mt-6 rounded-xl border border-brand-dark/10 bg-white p-6"><h2 className="text-2xl font-bold">Lifecycle</h2><p className="mt-2 font-sans text-sm text-brand-dark/65">Only valid transitions are offered. Changes are recorded in the audit trail.</p><div className="mt-5 flex flex-wrap gap-2">{(nextStates[cohort.status] || []).map((status) => <button key={status} disabled={working} onClick={() => changeState(status)} className="min-h-11 rounded-full border border-brand-dark/20 px-4 py-2 font-sans text-sm font-semibold capitalize disabled:opacity-50">{status.replaceAll("_", " ")}</button>)}</div>{message ? <p className="mt-4 font-sans text-sm" role="status">{message}</p> : null}</div>
    <div className="mt-6 rounded-xl border border-brand-dark/10 bg-white p-6"><div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-2xl font-bold">Waitlist offers</h2><p className="mt-2 font-sans text-sm text-brand-dark/65">A background check offers a free place automatically. Use this only when you need an immediate check.</p></div><button disabled={working} onClick={offerNextPlace} className="min-h-11 rounded-full border border-brand-dark/20 px-4 py-2 font-sans text-sm font-semibold disabled:opacity-50">Offer next free place</button></div></div>
    <div className="mt-6 grid gap-6 lg:grid-cols-2"><List title="Participants" empty="No enrollments yet." items={cohort.enrollments.map((item) => ({ primary: item.name || item.email, secondary: `${item.email} · ${item.status}` }))} /><List title="Waitlist" empty="No one is waiting." items={cohort.waitlist.map((item, index) => ({ primary: `${index + 1}. ${item.name || item.email}`, secondary: `${item.email} · ${item.status} · email ${item.offer_email_status}${item.offer_expires_at ? ` · offer expires ${new Date(item.offer_expires_at).toLocaleString("en-IN")}` : ""}${item.offer_email_last_error_code ? ` · ${item.offer_email_last_error_code}` : ""}`, actions: item.offer_email_status === "reconciliation_required" ? <div className="mt-3 flex flex-wrap gap-2"><button disabled={working} onClick={() => resolveOfferEmail(item.id, "confirmed_sent")} className="rounded-full border px-3 py-2 text-xs font-semibold disabled:opacity-50">Confirm sent</button><button disabled={working} onClick={() => resolveOfferEmail(item.id, "retry_confirmed_absent")} className="rounded-full border px-3 py-2 text-xs font-semibold disabled:opacity-50">Confirm absent and retry</button><button disabled={working} onClick={() => resolveOfferEmail(item.id, "revoke")} className="rounded-full border px-3 py-2 text-xs font-semibold disabled:opacity-50">Revoke offer</button></div> : undefined }))} /></div>
    <div className="mt-6"><List title="Sessions" empty="No sessions added." items={cohort.sessions.map((item) => ({ primary: item.title, secondary: `${new Date(item.starts_at).toLocaleString("en-IN")} – ${new Date(item.ends_at).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}`, note: item.public_note, href: item.meeting_url }))} /></div>
  </> : null}</AdminState></section>;
}

function Tile({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-brand-dark/10 bg-white p-5"><p className="font-sans text-xs font-bold uppercase tracking-wider text-brand-teal">{label}</p><p className="mt-2 font-sans text-sm font-semibold">{value}</p></div>; }
function List({ title, empty, items }: { title: string; empty: string; items: ListItem[] }) { return <div className="rounded-xl border border-brand-dark/10 bg-white p-6"><h2 className="text-2xl font-bold">{title}</h2><div className="mt-4 divide-y divide-brand-dark/10">{items.length ? items.map((item, index) => <div key={`${item.primary}-${index}`} className="py-3"><div className="flex flex-wrap items-center justify-between gap-3"><p className="font-sans text-sm font-semibold">{item.primary}</p>{item.href ? <a href={item.href} target="_blank" rel="noreferrer" className="font-sans text-xs font-semibold text-brand-primary">Open meeting</a> : null}</div><p className="mt-1 font-sans text-xs text-brand-dark/55">{item.secondary}</p>{item.note ? <p className="mt-2 font-sans text-xs leading-5 text-brand-dark/65">{item.note}</p> : null}{item.actions}</div>) : <p className="py-3 font-sans text-sm text-brand-dark/55">{empty}</p>}</div></div>; }
