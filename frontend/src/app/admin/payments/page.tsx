"use client";

import { useState } from "react";
import { AdminPageIntro, AdminState, Pagination, StatusBadge } from "../_components/AdminPrimitives";
import { useAdminResource } from "../_lib/useAdminResource";

type Payment = { id: string; status: string; amount_minor: number; currency: string; provider_order_id: string; provider_payment_id?: string; email: string; cohort_title: string; created_at: string };
type PaymentResponse = { payments: Payment[]; total: number; page: number; page_size: number };
type PaymentEvent = { id: string; event_type: string; status: string; payment_id?: string; order_id?: string; processed_at?: string; created_at: string };
type EventResponse = { events: PaymentEvent[]; total: number; page: number; page_size: number };

export default function PaymentsPage() {
  const [view, setView] = useState<"records" | "events">("records");
  return <section className="mx-auto max-w-6xl px-5 py-10 md:py-12"><AdminPageIntro eyebrow="Reconciliation" title="Cohort payments" description="Provider payment records and webhook-processing events. A browser return alone never marks an enrollment paid." /><div className="mt-5 flex gap-2" role="group" aria-label="Payment data view">{(["records", "events"] as const).map((value) => <button key={value} type="button" aria-pressed={view === value} onClick={() => setView(value)} className={`min-h-11 rounded-full px-4 font-sans text-sm font-semibold capitalize ${view === value ? "bg-brand-dark text-white" : "border border-brand-dark/15 bg-white"}`}>{value === "records" ? "Payment records" : "Webhook events"}</button>)}</div>{view === "records" ? <PaymentRecords /> : <PaymentEvents />}</section>;
}

const PaymentRecords = () => {
  const [page, setPage] = useState(1);
  const { data, loading, error, retry } = useAdminResource<PaymentResponse>(`/api/admin/payments?page=${page}&page_size=50`);
  const payments = data?.payments || [];
  return <AdminState loading={loading} error={error} empty={!loading && data && payments.length === 0 ? "No payment records yet." : undefined} onRetry={retry}>{data ? <><p className="mt-7 font-sans text-sm text-brand-dark/55">{data.total.toLocaleString("en-IN")} payment records</p><div className="mt-3 overflow-hidden rounded-xl border border-brand-dark/10 bg-white">{payments.map((payment) => <div key={payment.id} className="grid gap-3 border-b border-brand-dark/10 p-5 last:border-0 md:grid-cols-[1fr_1fr_auto_auto] md:items-center"><div><p className="font-sans text-sm font-semibold">{payment.email}</p><p className="font-sans text-xs text-brand-dark/55">{payment.cohort_title}</p></div><p className="break-all font-sans text-xs text-brand-dark/55">{payment.provider_payment_id || payment.provider_order_id}</p><StatusBadge value={payment.status} /><span className="font-sans text-sm font-semibold">{new Intl.NumberFormat("en-IN", { style: "currency", currency: payment.currency }).format(payment.amount_minor / 100)}</span></div>)}</div><Pagination page={data.page} pageSize={data.page_size} total={data.total} onPage={setPage} /></> : null}</AdminState>;
};

const PaymentEvents = () => {
  const [page, setPage] = useState(1);
  const { data, loading, error, retry } = useAdminResource<EventResponse>(`/api/admin/payment-events?page=${page}&page_size=50`);
  const events = data?.events || [];
  return <AdminState loading={loading} error={error} empty={!loading && data && events.length === 0 ? "No webhook events yet." : undefined} onRetry={retry}>{data ? <><p className="mt-7 font-sans text-sm text-brand-dark/55">{data.total.toLocaleString("en-IN")} webhook events</p><div className="mt-3 overflow-hidden rounded-xl border border-brand-dark/10 bg-white">{events.map((event) => <div key={event.id} className="grid gap-3 border-b border-brand-dark/10 p-5 last:border-0 md:grid-cols-[1fr_1fr_auto_auto] md:items-center"><div><p className="font-sans text-sm font-semibold">{event.event_type}</p><p className="mt-1 break-all font-sans text-xs text-brand-dark/50">{event.id}</p></div><p className="break-all font-sans text-xs text-brand-dark/55">{event.payment_id || event.order_id || "No provider object ID"}</p><StatusBadge value={event.status} /><time className="font-sans text-xs text-brand-dark/50">{new Date(event.processed_at || event.created_at).toLocaleString("en-IN")}</time></div>)}</div><Pagination page={data.page} pageSize={data.page_size} total={data.total} onPage={setPage} /></> : null}</AdminState>;
};
