"use client";

import { FormEvent, useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import type { Nudge, NudgeDraft } from "./types";

const inputClass =
  "mt-2 w-full rounded-lg border border-brand-dark/15 bg-white px-4 py-3 font-sans text-sm outline-none focus:border-brand-teal disabled:bg-brand-dark/[0.04] disabled:text-brand-dark/55";

const emptyDraft: NudgeDraft = {
  title: "",
  paragraphs: [""],
  quote: null,
  link: null,
  is_active: true,
};

function truncate(value: string, maximum: number) {
  const normalized = value.trim();
  if (normalized.length <= maximum) return normalized;
  return `${normalized.slice(0, maximum - 1).trimEnd()}…`;
}

export function buildWhatsappPreview(draft: NudgeDraft) {
  const title = truncate(draft.title || "Inner Caveman reminder", 300);
  const body = [...draft.paragraphs, draft.quote || ""]
    .map((value) => value.trim())
    .filter(Boolean)
    .join("\n\n");
  return truncate(`${title}\n\n${truncate(body, 1024)}`, 1024);
}

export default function NudgeEditor({
  nudge,
  saving,
  error,
  onSave,
  onCancel,
}: {
  nudge: Nudge | null;
  saving: boolean;
  error: string;
  onSave: (draft: NudgeDraft) => Promise<void>;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<NudgeDraft>(emptyDraft);
  const contentLocked = Boolean(nudge?.selected_today);

  useEffect(() => {
    setDraft(
      nudge
        ? {
            title: nudge.title,
            paragraphs: nudge.paragraphs,
            quote: nudge.quote,
            link: nudge.link,
            is_active: nudge.is_active,
          }
        : emptyDraft,
    );
  }, [nudge]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSave({
      ...draft,
      title: draft.title.trim(),
      paragraphs: draft.paragraphs.map((item) => item.trim()).filter(Boolean),
      quote: draft.quote?.trim() || null,
      link: draft.link?.trim() || null,
    });
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-brand-dark/10 bg-white p-5 shadow-sm md:p-7">
      <div>
        <p className="page-eyebrow text-brand-teal">{nudge ? "Edit nudge" : "New nudge"}</p>
        <h2 className="mt-2 text-2xl font-bold">{nudge?.title || "Add to the daily library"}</h2>
        {contentLocked ? (
          <p className="mt-3 rounded-lg bg-amber-50 p-3 font-sans text-sm leading-6 text-amber-900">
            This is today&apos;s published nudge. Its content is locked until tomorrow, but you can change whether it remains eligible for future days.
          </p>
        ) : null}
      </div>

      <div className="mt-6 grid gap-5">
        <label className="font-sans text-sm font-semibold">
          Title
          <input
            aria-label="Nudge title"
            value={draft.title}
            onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            className={inputClass}
            maxLength={300}
            disabled={contentLocked}
            required
          />
        </label>
        <label className="font-sans text-sm font-semibold">
          Paragraphs
          <textarea
            aria-label="Nudge paragraphs"
            value={draft.paragraphs.join("\n\n")}
            onChange={(event) => setDraft({ ...draft, paragraphs: event.target.value.split(/\n\s*\n/) })}
            className={inputClass}
            rows={7}
            disabled={contentLocked}
            placeholder="Separate paragraphs with a blank line."
          />
        </label>
        <label className="font-sans text-sm font-semibold">
          Closing line or quote <span className="font-normal text-brand-dark/45">(optional)</span>
          <textarea
            aria-label="Nudge quote"
            value={draft.quote || ""}
            onChange={(event) => setDraft({ ...draft, quote: event.target.value })}
            className={inputClass}
            rows={3}
            maxLength={1000}
            disabled={contentLocked}
          />
        </label>
        <label className="font-sans text-sm font-semibold">
          Related Neurocient link <span className="font-normal text-brand-dark/45">(optional)</span>
          <input
            aria-label="Nudge link"
            type="url"
            value={draft.link || ""}
            onChange={(event) => setDraft({ ...draft, link: event.target.value })}
            className={inputClass}
            disabled={contentLocked}
            placeholder="https://neurocient.com/insights/..."
          />
        </label>
        <label className="flex min-h-11 items-center gap-3 font-sans text-sm font-semibold">
          <input
            type="checkbox"
            checked={draft.is_active}
            onChange={(event) => setDraft({ ...draft, is_active: event.target.checked })}
            className="h-5 w-5 accent-brand-dark"
          />
          Eligible for daily selection
        </label>
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-2">
        <Preview title="Website preview">
          <p className="text-lg font-bold">{draft.title || "Nudge title"}</p>
          {draft.paragraphs.filter(Boolean).map((paragraph, index) => (
            <p key={index} className="mt-3 font-sans text-sm leading-6 text-brand-dark/70">{paragraph}</p>
          ))}
          {draft.quote ? <blockquote className="mt-4 border-l-2 border-brand-accent pl-3 font-sans text-sm italic">{draft.quote}</blockquote> : null}
        </Preview>
        <Preview title="WhatsApp preview">
          <p className="whitespace-pre-wrap rounded-lg bg-[#e7ffdb] p-3 font-sans text-sm leading-6">{buildWhatsappPreview(draft)}</p>
          <p className="mt-2 font-sans text-xs text-brand-dark/45">{buildWhatsappPreview(draft).length}/1024 characters</p>
        </Preview>
      </div>

      {error ? <p className="mt-5 font-sans text-sm text-red-700" role="alert">{error}</p> : null}
      <div className="mt-6 flex flex-wrap gap-3">
        <button disabled={saving} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-brand-dark px-5 font-sans text-sm font-semibold text-white disabled:opacity-50">
          {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
          {saving ? "Saving" : nudge ? "Save changes" : "Create nudge"}
        </button>
        <button type="button" onClick={onCancel} className="min-h-11 rounded-full border border-brand-dark/15 px-5 font-sans text-sm font-semibold">Cancel</button>
      </div>
    </form>
  );
}

function Preview({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-xl border border-brand-dark/10 bg-[#f8f7f3] p-4"><h3 className="font-sans text-xs font-bold uppercase tracking-wider text-brand-teal">{title}</h3><div className="mt-3">{children}</div></section>;
}
