import { CheckCircle2 } from "lucide-react";

export type CheckinOutcome = "done" | "partly" | "not_today";

const options: Array<{ value: CheckinOutcome; label: string }> = [
  { value: "done", label: "Done" },
  { value: "partly", label: "Partly" },
  { value: "not_today", label: "Didn't happen" },
];

const outcomeLabel = (outcome?: CheckinOutcome | null) =>
  options.find((option) => option.value === outcome)?.label ?? "Recorded";

export default function MicrochallengeCheckin({
  loggedToday,
  outcome,
  note,
  onNoteChange,
  onLog,
}: {
  loggedToday: boolean;
  outcome?: CheckinOutcome | null;
  note: string;
  onNoteChange: (value: string) => void;
  onLog: (outcome: CheckinOutcome) => void;
}) {
  return (
    <div className="mt-6 grid gap-3">
      {loggedToday ? (
        <p className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-brand-teal">
          <CheckCircle2 className="h-4 w-4" />
          Reported today: {outcomeLabel(outcome)}
        </p>
      ) : (
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="How did today's experiment go?"
        >
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => onLog(option.value)}
              className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-brand-dark/25 px-4 py-2 font-sans text-sm font-semibold text-brand-dark transition hover:border-brand-teal hover:text-brand-teal"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
      <textarea
        value={note}
        onChange={(event) => onNoteChange(event.target.value)}
        placeholder="Quick reflection, optional"
        rows={1}
        disabled={loggedToday}
        className="min-h-11 resize-none rounded-lg border border-brand-dark/15 px-4 py-3 font-sans text-sm text-brand-dark outline-none transition focus:border-brand-teal disabled:opacity-50"
      />
    </div>
  );
}
