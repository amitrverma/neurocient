import { BookOpenCheck, ChevronDown } from "lucide-react";
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
      <aside className="practice-summary-panel">
        <PanelHeading />
        <p className="mt-4 font-sans text-sm leading-6 text-brand-dark/64">
          Loading your current practice...
        </p>
      </aside>
    );
  }

  if (!practice) return null;

  return (
    <aside className="practice-summary-panel">
      <PanelHeading />
      <div className="mt-5 grid gap-4">
        <PracticeItem label="Moment" value={practice.moment} />
        <PracticeItem label="Next move" value={practice.action} />
        <PracticeItem label="When it returns" value={practice.reminder} />
        <details className="group border-t border-brand-dark/10 pt-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-sans text-sm font-semibold text-brand-dark marker:content-none">
            See your full practice
            <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <div className="mt-4 grid gap-4">
            {practice.oldStory ? (
              <PracticeItem label="Old story" value={practice.oldStory} />
            ) : null}
            <PracticeItem label="Practice instead" value={practice.identity} />
            <PracticeItem label="Why it made sense" value={practice.knowledge} />
            <PracticeItem label="What to change outside your head" value={practice.environment} />
          </div>
        </details>
      </div>
    </aside>
  );
};

const PanelHeading = () => (
  <div className="flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-accent">
    <BookOpenCheck className="h-4 w-4" aria-hidden="true" />
    Current practice
  </div>
);

const PracticeItem = ({ label, value }: { label: string; value: string }) => (
  <section className="border-t border-brand-dark/10 pt-3">
    <p className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-brand-dark/45">
      {label}
    </p>
    <p className="mt-1 whitespace-pre-line font-sans text-sm leading-6 text-brand-dark">
      {value || "Not saved yet"}
    </p>
  </section>
);
