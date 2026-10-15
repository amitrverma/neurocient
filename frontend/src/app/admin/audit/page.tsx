"use client";

import { useEffect, useState } from "react";

type Event = { id: string; action: string; subject_type: string; subject_id?: string; created_at: string; details: Record<string, unknown> };
export default function AuditPage() {
  const [events, setEvents] = useState<Event[]>([]);
  useEffect(() => { fetch("/api/admin/audit", { cache: "no-store" }).then((r) => r.json()).then((data) => setEvents(data.events || [])); }, []);
  return <section className="mx-auto max-w-6xl px-5 py-12"><p className="page-eyebrow text-brand-teal">Accountability</p><h1 className="page-section-title mt-2">Audit trail</h1><div className="mt-8 overflow-hidden rounded-xl border border-brand-dark/10 bg-white">{events.length === 0 ? <p className="p-6 font-sans text-sm text-brand-dark/60">No recorded events yet.</p> : events.map((event) => <div key={event.id} className="grid gap-2 border-b border-brand-dark/10 p-5 last:border-0 md:grid-cols-[12rem_1fr_auto]"><span className="font-sans text-sm font-semibold">{event.action}</span><span className="font-sans text-sm text-brand-dark/65">{event.subject_type} {event.subject_id}</span><time className="font-sans text-xs text-brand-dark/50">{new Date(event.created_at).toLocaleString("en-IN")}</time></div>)}</div></section>;
}
