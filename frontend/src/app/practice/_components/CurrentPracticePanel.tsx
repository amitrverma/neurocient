import { BookOpenCheck } from "lucide-react";
import type { SavedPractice } from "../_lib/practicePersistence";

export const CurrentPracticePanel = ({
  practice,
  loading,
}: {
  practice: SavedPractice | null;
  loading: boolean;
}) => {
  if (loading) {
    return (
      <aside className="rounded-lg border border-brand-dark/12 bg-white/45 p-4">
        <PanelHeading />
        <p className="mt-4 font-sans text-sm leading-6 text-brand-dark/64">
          Loading your current practice...
        </p>
      </aside>
    );
  }

  if (!practice) return null;

  return (
    <aside className="rounded-lg border border-brand-teal/25 bg-brand-teal/[0.035] p-4">
      <PanelHeading />
      <div className="mt-5 grid gap-4">
        <PracticeItem label="Moment" value={practice.moment} />
        {practice.oldStory ? (
          <PracticeItem label="Old story" value={practice.oldStory} />
        ) : null}
        <PracticeItem label="Practice instead" value={practice.identity} />
        <PracticeItem label="Why it made sense" value={practice.knowledge} />
        <PracticeItem label="What to change outside your head" value={practice.environment} />
        <PracticeItem label="Next move" value={practice.action} />
        <PracticeItem label="When it returns" value={practice.reminder} />
      </div>
    </aside>
  );
};

const PanelHeading = () => (
  <div className="flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">
    <BookOpenCheck className="h-4 w-4" aria-hidden="true" />
    Current practice
  </div>
);

const PracticeItem = ({ label, value }: { label: string; value: string }) => (
  <section className="border-t border-brand-dark/10 pt-3">
    <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.15em] text-brand-dark/45">
      {label}
    </p>
    <p className="mt-1 whitespace-pre-line font-sans text-sm leading-6 text-brand-dark">
      {value || "Not saved yet"}
    </p>
  </section>
);
