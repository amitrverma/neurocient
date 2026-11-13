"use client";

import { FormEvent, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { AdminPageIntro, AdminState, formatDate, Pagination, SearchForm, StatusBadge } from "../_components/AdminPrimitives";
import { useAdminResource } from "../_lib/useAdminResource";
import NudgeEditor from "./NudgeEditor";
import type { Nudge, NudgeDraft, NudgeResponse } from "./types";

export default function NudgeLibraryPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [state, setState] = useState("all");
  const [editing, setEditing] = useState<Nudge | null | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [mutationError, setMutationError] = useState("");
  const [success, setSuccess] = useState("");
  const url = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), page_size: "25", state });
    if (query) params.set("query", query);
    return `/api/admin/nudges?${params}`;
  }, [page, query, state]);
  const { data, loading, error, retry } = useAdminResource<NudgeResponse>(url);

  const searchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setQuery(search.trim());
  };

  const save = async (draft: NudgeDraft) => {
    setSaving(true);
    setMutationError("");
    setSuccess("");
    const existing = editing || null;
    try {
      const response = await fetch(existing ? `/api/admin/nudges/${existing.id}` : "/api/admin/nudges", {
        method: existing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMutationError(typeof body.detail === "string" ? body.detail : "The nudge could not be saved. Check the content and try again.");
        return;
      }
      setEditing(undefined);
      setSuccess(existing ? "Nudge updated." : "Nudge created.");
      retry();
    } catch {
      setMutationError("The admin service could not be reached. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-5 py-10 md:py-12">
      <AdminPageIntro
        eyebrow="Daily reinforcement"
        title="Nudge library"
        description="Manage the pool used for the shared daily website and WhatsApp nudge. One active nudge is selected and held stable for each product day."
        action={<button type="button" onClick={() => { setEditing(null); setMutationError(""); setSuccess(""); }} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-dark px-5 font-sans text-sm font-semibold text-white"><Plus className="h-4 w-4" /> New nudge</button>}
      />

      {editing !== undefined ? (
        <div className="mt-8"><NudgeEditor nudge={editing} saving={saving} error={mutationError} onSave={save} onCancel={() => setEditing(undefined)} /></div>
      ) : (
        <>
          {success ? <p className="mt-6 rounded-lg bg-emerald-50 p-3 font-sans text-sm text-emerald-900" role="status">{success}</p> : null}
          {data?.today_selection ? <section className="mt-6 rounded-xl border border-brand-accent/40 bg-white p-5"><p className="page-eyebrow text-brand-teal">Published today</p><h2 className="mt-2 text-xl font-bold">{data.today_selection.title}</h2><p className="mt-2 line-clamp-2 whitespace-pre-line font-sans text-sm leading-6 text-brand-dark/65">{data.today_selection.whatsapp_preview}</p></section> : null}
          <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <SearchForm value={search} onChange={setSearch} onSubmit={searchSubmit} placeholder="Search titles or closing lines" />
            <label className="font-sans text-sm font-semibold">Status<select aria-label="Nudge status" value={state} onChange={(event) => { setState(event.target.value); setPage(1); }} className="mt-2 min-h-11 w-full rounded-lg border border-brand-dark/15 bg-white px-4 sm:w-40"><option value="all">All</option><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
          </div>
          <AdminState loading={loading} error={error} empty={!loading && data?.items.length === 0 ? "No nudges match this view." : undefined} onRetry={retry}>
            {data ? <>
              <div className="mt-7 flex items-center justify-between gap-4"><p className="font-sans text-sm text-brand-dark/55">{data.total.toLocaleString("en-IN")} nudges</p>{data.today_selection ? <p className="font-sans text-xs font-semibold text-brand-teal">Today&apos;s nudge is published</p> : <p className="font-sans text-xs text-brand-dark/45">Today&apos;s nudge has not been selected yet</p>}</div>
              <div className="mt-3 grid gap-3">
                {data.items.map((nudge) => <article key={nudge.id} className={`rounded-xl border bg-white p-5 shadow-sm ${nudge.selected_today ? "border-brand-accent" : "border-brand-dark/10"}`}>
                  <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-xl font-bold">{nudge.title}</h2>{nudge.selected_today ? <StatusBadge value="today" /> : null}<StatusBadge value={nudge.is_active ? "active" : "inactive"} /></div><p className="mt-2 font-sans text-sm leading-6 text-brand-dark/65 line-clamp-2">{nudge.paragraphs.join(" ") || nudge.quote}</p></div><button type="button" onClick={() => { setEditing(nudge); setMutationError(""); setSuccess(""); }} className="min-h-11 rounded-full border border-brand-dark/15 px-4 font-sans text-sm font-semibold">Edit</button></div>
                  <p className="mt-4 font-sans text-xs text-brand-dark/45">Added {formatDate(nudge.created_at)} · {nudge.last_selected_on ? `last selected ${formatDate(`${nudge.last_selected_on}T00:00:00`)}` : "not selected yet"}</p>
                </article>)}
              </div>
              <Pagination page={data.page} pageSize={data.page_size} total={data.total} onPage={setPage} />
            </> : null}
          </AdminState>
        </>
      )}
    </section>
  );
}
