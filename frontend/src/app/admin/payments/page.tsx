"use client";

import { useEffect, useState } from "react";

type Payment = { id: string; status: string; amount_minor: number; currency: string; provider_order_id: string; provider_payment_id?: string; email: string; cohort_title: string; created_at: string };
export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  useEffect(() => { fetch("/api/admin/payments", { cache: "no-store" }).then((r) => r.json()).then((data) => setPayments(data.payments || [])); }, []);
  return <section className="mx-auto max-w-6xl px-5 py-12"><p className="page-eyebrow text-brand-teal">Reconciliation</p><h1 className="page-section-title mt-2">Cohort payments</h1><p className="mt-3 max-w-2xl font-sans text-sm leading-7 text-brand-dark/65">The verified provider record is authoritative. A browser return alone never marks an enrollment paid.</p><div className="mt-8 overflow-hidden rounded-xl border border-brand-dark/10 bg-white">{payments.length === 0 ? <p className="p-6 font-sans text-sm text-brand-dark/60">No payment records yet.</p> : payments.map((payment) => <div key={payment.id} className="grid gap-2 border-b border-brand-dark/10 p-5 last:border-0 md:grid-cols-[1fr_1fr_auto_auto]"><div><p className="font-sans text-sm font-semibold">{payment.email}</p><p className="font-sans text-xs text-brand-dark/55">{payment.cohort_title}</p></div><div><p className="font-sans text-xs text-brand-dark/55">{payment.provider_payment_id || payment.provider_order_id}</p></div><span className="font-sans text-sm font-semibold capitalize">{payment.status}</span><span className="font-sans text-sm">{new Intl.NumberFormat("en-IN", { style: "currency", currency: payment.currency }).format(payment.amount_minor / 100)}</span></div>)}</div></section>;
}
