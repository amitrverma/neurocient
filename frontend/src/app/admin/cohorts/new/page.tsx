"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";

const inputClass = "mt-2 w-full rounded-lg border border-brand-dark/15 bg-white px-4 py-3 font-sans text-sm";

export default function NewCohortPage() {
  const router = useRouter();
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [sessions, setSessions] = useState([{ title: "Session 1", starts_at: "", ends_at: "", public_note: "", meeting_url: "" }]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setWorking(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const body = {
      slug: form.get("slug"), title: form.get("title"), description: form.get("description") || null,
      facilitator: form.get("facilitator") || null, timezone: form.get("timezone"),
      starts_at: form.get("starts_at"), ends_at: form.get("ends_at"),
      enrollment_opens_at: form.get("enrollment_opens_at") || null,
      enrollment_closes_at: form.get("enrollment_closes_at") || null,
      capacity: Number(form.get("capacity")), price_minor: Math.round(Number(form.get("price")) * 100),
      currency: "INR", status: form.get("status"),
      sessions: sessions.filter((item) => item.starts_at && item.ends_at).map((item) => ({ ...item, public_note: item.public_note || null, meeting_url: item.meeting_url || null })),
    };
    const response = await fetch("/api/admin/cohorts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(typeof data.detail === "string" ? data.detail : "Check the cohort details and try again.");
      setWorking(false);
      return;
    }
    router.push(`/admin/cohorts/${data.id}`);
  };

  return (
    <section className="mx-auto max-w-3xl px-5 py-12">
      <p className="page-eyebrow text-brand-teal">Cohort setup</p><h1 className="page-section-title mt-2">Create a cohort</h1>
      <form onSubmit={submit} className="mt-8 grid gap-5 rounded-xl border border-brand-dark/10 bg-white p-6 shadow-sm md:p-8">
        <div className="grid gap-5 md:grid-cols-2"><Field label="Cohort title" name="title" required /><Field label="URL slug" name="slug" placeholder="modern-caveman-october" required /></div>
        <label className="font-sans text-sm font-semibold">Description<textarea name="description" rows={4} className={inputClass} /></label>
        <div className="grid gap-5 md:grid-cols-2"><Field label="Facilitator" name="facilitator" /><Field label="Timezone" name="timezone" defaultValue="Asia/Kolkata" required /></div>
        <div className="grid gap-5 md:grid-cols-2"><Field label="Program starts" name="starts_at" type="datetime-local" required /><Field label="Program ends" name="ends_at" type="datetime-local" required /></div>
        <div className="grid gap-5 md:grid-cols-2"><Field label="Enrollment opens" name="enrollment_opens_at" type="datetime-local" /><Field label="Enrollment closes" name="enrollment_closes_at" type="datetime-local" /></div>
        <div className="grid gap-5 md:grid-cols-3"><Field label="Capacity" name="capacity" type="number" defaultValue="20" required /><Field label="Fee (₹)" name="price" type="number" defaultValue="21000" required /><label className="font-sans text-sm font-semibold">Initial state<select name="status" className={inputClass} defaultValue="draft"><option value="draft">Draft</option><option value="published">Published</option><option value="open">Open</option></select></label></div>
        <div className="border-t border-brand-dark/10 pt-6"><div className="flex items-center justify-between"><div><h2 className="text-2xl font-bold">Sessions</h2><p className="mt-1 font-sans text-sm text-brand-dark/60">Public timing and notes, plus the private meeting URL.</p></div><button type="button" onClick={() => setSessions([...sessions, { title: `Session ${sessions.length + 1}`, starts_at: "", ends_at: "", public_note: "", meeting_url: "" }])} className="font-sans text-sm font-semibold text-brand-primary">Add session</button></div>
          <div className="mt-4 grid gap-4">{sessions.map((session, index) => <div key={index} className="grid gap-3 rounded-lg bg-brand-dark/[0.035] p-4 md:grid-cols-2"><input aria-label={`Session ${index + 1} title`} className={inputClass} value={session.title} onChange={(e) => setSessions(sessions.map((item, i) => i === index ? { ...item, title: e.target.value } : item))} /><input aria-label={`Session ${index + 1} note`} placeholder="Public note" className={inputClass} value={session.public_note} onChange={(e) => setSessions(sessions.map((item, i) => i === index ? { ...item, public_note: e.target.value } : item))} /><input aria-label={`Session ${index + 1} start`} type="datetime-local" className={inputClass} value={session.starts_at} onChange={(e) => setSessions(sessions.map((item, i) => i === index ? { ...item, starts_at: e.target.value } : item))} /><input aria-label={`Session ${index + 1} end`} type="datetime-local" className={inputClass} value={session.ends_at} onChange={(e) => setSessions(sessions.map((item, i) => i === index ? { ...item, ends_at: e.target.value } : item))} /><input aria-label={`Session ${index + 1} meeting URL`} type="url" placeholder="Private meeting URL" className={`${inputClass} md:col-span-2`} value={session.meeting_url} onChange={(e) => setSessions(sessions.map((item, i) => i === index ? { ...item, meeting_url: e.target.value } : item))} /></div>)}</div>
        </div>
        {error ? <p className="font-sans text-sm text-red-700" role="alert">{error}</p> : null}
        <button disabled={working} className="flex items-center justify-center gap-2 rounded-full bg-brand-dark px-5 py-3 font-sans text-sm font-semibold text-white disabled:opacity-50">{working ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}{working ? "Creating" : "Create cohort"}</button>
      </form>
    </section>
  );
}

function Field({ label, name, type = "text", ...props }: { label: string; name: string; type?: string; required?: boolean; defaultValue?: string; placeholder?: string }) {
  return <label className="font-sans text-sm font-semibold">{label}<input name={name} type={type} className={inputClass} {...props} /></label>;
}
