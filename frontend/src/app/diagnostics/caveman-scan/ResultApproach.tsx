import Link from "next/link";
import { ArrowRight, BookOpen, NotebookPen, Repeat2 } from "lucide-react";
import { SectionLabel } from "../../components/landing/LandingShared";

const ikeaExample = [
  {
    letter: "I",
    name: "Identity",
    question: "What does this behaviour say about how you see yourself?",
    example: "I tell myself I work best under pressure, so delaying the report still fits my self-story.",
  },
  {
    letter: "K",
    name: "Knowledge",
    question: "What makes the current response make sense?",
    example: "Email offers quick, certain completion. The report begins with uncertainty and sustained effort.",
  },
  {
    letter: "E",
    name: "Environment",
    question: "What in the setting makes each response easier?",
    example: "The inbox is open and signalling urgency. The report has no prepared first step.",
  },
  {
    letter: "A",
    name: "Action",
    question: "What is the smallest useful change to try?",
    example: "Close the inbox, open the report, and write one rough heading before checking messages.",
  },
];

export const resultButton = "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full px-5 py-2.5 font-sans text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60";

export default function ResultApproach({ onContinue, signedIn, ready }: {
  onContinue: () => void;
  signedIn: boolean;
  ready: boolean;
}) {
  return (
    <>
      <section id="neurocient-approach" className="scroll-mt-24 bg-brand-dark px-5 py-14 text-white sm:px-7 sm:py-18 lg:py-20">
        <div className="mx-auto max-w-5xl">
          <SectionLabel tone="dark">The Neurocient approach</SectionLabel>
          <h2 className="max-w-3xl text-[2.25rem] font-bold leading-[1.08] tracking-[-0.025em] sm:text-5xl">
            Change starts before<br className="hidden sm:block" /> “just do it.”
          </h2>
          <p className="mt-7 max-w-2xl font-sans text-base leading-8 text-white/80">
            Understanding the Inner Caveman changes how we explain behaviour.
            Neurocient uses that understanding to help you examine what to change:
            how you see yourself, what you know, your surroundings, and what you do.
          </p>
          <div className="mb-4 mt-9 flex flex-wrap items-center justify-between gap-3 border-b border-white/20 pb-4">
            <p className="text-2xl font-bold">IKEA</p>
            <p className="font-sans text-xs leading-6 text-white/70">An example: checking email instead of starting a report</p>
          </div>
          <ol>
            {ikeaExample.map((step) => (
              <li key={step.letter} className="grid grid-cols-[2.5rem_1fr] gap-x-3 border-b border-white/15 py-5 md:grid-cols-[3rem_13rem_1fr] md:gap-x-6">
                <span aria-hidden="true" className="text-4xl text-brand-secondary md:text-5xl">{step.letter}</span>
                <div>
                  <h3 className="text-xl font-bold">{step.name}</h3>
                  <p className="mt-1 font-sans text-sm leading-6 text-white/70">{step.question}</p>
                </div>
                <p className="col-start-2 mt-3 font-sans text-sm leading-7 text-white/85 md:col-start-3 md:mt-0 md:text-base">{step.example}</p>
              </li>
            ))}
          </ol>
          <div className="mt-8 border-l-2 border-brand-secondary pl-5">
            <h3 className="text-2xl font-bold">Then return to it.</h3>
            <p className="mt-3 max-w-2xl font-sans text-base leading-8 text-white/80">
              Before the next report, recall why the inbox was easier to use.
              Set up the first task again. Try it, then review what happened.
              This is reinforcement: revisiting the understanding and practising the change.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[var(--surface-paper)] px-5 py-14 sm:px-7 sm:py-18 lg:py-20">
        <div className="mx-auto max-w-5xl">
          <SectionLabel>Knowing and doing</SectionLabel>
          <h2 className="max-w-3xl text-[1.85rem] font-bold leading-[1.16] tracking-[-0.02em] sm:text-[2.2rem] lg:text-[2.55rem]">An explanation is a beginning.</h2>
          <div className="mt-7 max-w-3xl space-y-5 font-sans text-base leading-8 text-brand-dark/80">
            <p>You can understand a behaviour and still repeat it. The familiar situation, the easier alternative, and the established response may all remain.</p>
            <p>You can also forget an explanation that made sense when you read it. That is why Neurocient combines understanding with changes to your surroundings, small experiments, and revisiting what you learn.</p>
          </div>
          <details className="mt-8 max-w-3xl border-y border-brand-dark/15 py-5 font-sans">
            <summary className="cursor-pointer py-1 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-teal">The science: habits, neuroplasticity, and forgetting</summary>
            <div className="mt-5 space-y-5 text-sm leading-7 text-brand-dark/80">
              <p><strong>Habits.</strong> Repeated behaviour can become linked to familiar contexts. A new intention does not necessarily replace that learned response. <a className="underline underline-offset-4" href="https://www.annualreviews.org/content/journals/10.1146/annurev-psych-122414-033417" target="_blank" rel="noreferrer">Wood &amp; Rünger, 2016</a>.</p>
              <p><strong>Neuroplasticity.</strong> The brain can change with experience and learning. This capacity makes learning possible; it does not mean a single insight automatically changes an established behaviour. <a className="underline underline-offset-4" href="https://www.nature.com/articles/s41583-020-00379-8" target="_blank" rel="noreferrer">Xin &amp; Chan, 2020</a>.</p>
              <p><strong>Forgetting.</strong> Memory research describes how retention can decline over time. The classic forgetting curve is not a timetable for how quickly you will forget this result. We use it as a reason to revisit learning, without predicting a percentage. <a className="underline underline-offset-4" href="https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0120644" target="_blank" rel="noreferrer">Murre &amp; Dros, 2015</a>.</p>
              <p className="text-xs leading-6">These studies inform the approach. They are not studies of Neurocient or guarantees of an outcome.</p>
            </div>
          </details>
        </div>
      </section>

      <section className="bg-white px-5 py-14 sm:px-7 sm:py-18 lg:py-20">
        <div className="mx-auto max-w-5xl">
          <SectionLabel>From understanding to practice</SectionLabel>
          <h2 className="max-w-3xl text-[1.85rem] font-bold leading-[1.16] tracking-[-0.02em] sm:text-[2.2rem] lg:text-[2.55rem]">Start with something you actually do.</h2>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            <article className="border-t-2 border-brand-teal pt-5">
              <NotebookPen className="h-6 w-6 text-brand-accent" aria-hidden="true" />
              <h3 className="mt-4 text-2xl font-bold">Spot the Caveman</h3>
              <p className="mt-3 font-sans text-sm leading-7 text-brand-dark/80">Record a situation and what you did. Use your own examples to recognise automatic behaviour outside the Scan.</p>
            </article>
            <article className="border-t-2 border-brand-secondary pt-5">
              <Repeat2 className="h-6 w-6 text-brand-accent" aria-hidden="true" />
              <h3 className="mt-4 text-2xl font-bold">Microchallenges</h3>
              <p className="mt-3 font-sans text-sm leading-7 text-brand-dark/80">Choose a small behavioural experiment. Try it in everyday life and record your progress.</p>
            </article>
            <article className="border-t-2 border-brand-primary/45 pt-5">
              <span className="inline-block rounded-full border border-brand-dark/25 px-3 py-1 font-sans text-xs font-semibold">In development</span>
              <h3 className="mt-4 text-2xl font-bold">Practice</h3>
              <p className="mt-3 font-sans text-sm leading-7 text-brand-dark/80">A guided experience bringing IKEA together around a specific behaviour. The first version explores procrastination.</p>
            </article>
          </div>
          <div className="mt-12 bg-brand-secondary/18 px-5 py-8 sm:px-7">
            <h3 className="text-2xl font-bold">Begin by spotting it in everyday life.</h3>
            <p className="mt-3 max-w-2xl font-sans text-sm leading-7 text-brand-dark/80">Your account lets you keep a record of what you notice and use the tools to work on it.</p>
            <button type="button" disabled={!ready} onClick={onContinue} className={`${resultButton} mt-6 bg-brand-dark text-white shadow-[0_10px_30px_rgba(4,42,43,0.14)] hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(4,42,43,0.18)]`}>
              {!ready ? "Checking your account…" : signedIn ? "Open Spot the Caveman" : "Log in to get started"}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-7 flex items-start gap-3">
            <BookOpen className="mt-1 h-5 w-5 shrink-0 text-brand-accent" aria-hidden="true" />
            <div className="font-sans text-sm leading-7">
              <Link href="/insights" className="font-semibold underline underline-offset-4">Prefer to read? Explore the insights.</Link>
              <p className="mt-1 text-brand-dark/70">Start reading without an account. Log in when you reach the guest reading limit.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
