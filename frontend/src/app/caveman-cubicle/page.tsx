import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Brain,
  BriefcaseBusiness,
  Compass,
  Mail,
  Phone,
  ShieldCheck,
  Users,
} from "lucide-react";

const workplaceSignals = [
  {
    title: "People agree in the room, then drift afterward.",
    label: "Belonging protection",
    text: "The meeting sounded aligned, but the nervous system still read dissent as risky.",
  },
  {
    title: "Ownership is requested, but permission is still expected.",
    label: "Hierarchy sensitivity",
    text: "Teams may wait for signals of safety before acting with real agency.",
  },
  {
    title: "Feedback gets softened until nothing changes.",
    label: "Status management",
    text: "When rank feels fragile, truth becomes expensive and clarity gets diluted.",
  },
  {
    title: "Smart people make cautious decisions under pressure.",
    label: "Threat narrowing",
    text: "Stress pushes attention toward protection, certainty, and familiar defaults.",
  },
];

const programAreas = [
  {
    title: "Decision-making pitfalls",
    label: "Bias under pressure",
    text: "Why optimism, sunk costs, loss aversion, and urgency distort execution even in capable teams.",
    icon: Brain,
  },
  {
    title: "Leadership under the lens",
    label: "Signals leaders send",
    text: "How tone, timing, status, and ambiguity can trigger silence or initiative without anyone naming it.",
    icon: Users,
  },
  {
    title: "Behavior design",
    label: "Systems over slogans",
    text: "Practical nudges that make ownership, trust, and constructive dissent easier to repeat.",
    icon: Compass,
  },
];

const takeaways = [
  "A sharper read on why teams hesitate, conform, defer, or disengage.",
  "Bias-aware reflexes for decisions, feedback, meetings, and execution.",
  "Practical behavior-design moves that reduce threat and increase initiative.",
  "A shared language for discussing human dynamics without blame.",
];

export default function CavemanInTheCubiclePage() {
  return (
    <main className="bg-white font-serif text-brand-dark">
      <section className="border-b border-brand-dark/10 px-6 py-14 md:py-20">
        <div className="mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
          <div>
            <SectionLabel>Workplace behavior</SectionLabel>
            <h1 className="text-[clamp(3rem,6.2vw,6.1rem)] font-bold leading-[0.96] tracking-[-0.035em] text-brand-dark">
              Caveman in
              <br />
              <span className="italic text-brand-accent">the Cubicle.</span>
            </h1>
            <p className="mt-7 max-w-2xl border-l-4 border-brand-secondary pl-5 font-sans text-lg leading-8 text-brand-dark md:text-xl md:leading-9">
              A leadership reset grounded in how people actually behave, not
              how we wish they behaved under pressure.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="mailto:hello@neurocient.com"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-dark/25 px-6 py-3 font-sans text-sm font-semibold text-brand-dark transition hover:border-brand-primary hover:text-brand-primary"
              >
                Discuss a workshop
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="rounded-lg border border-brand-dark/12 bg-white p-6 shadow-[0_20px_60px_rgba(4,42,43,0.06)] md:p-8">
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
              The hidden problem
            </p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-brand-dark md:text-4xl">
              You are not leading spreadsheets.
              <br />
              You are leading nervous systems.
            </h2>
            <div className="mt-6 space-y-4 font-sans text-sm leading-7 text-brand-dark/72">
              <p>
                Leaders say the right things: open door, more ownership, more
                initiative, more candor.
              </p>
              <p>
                But teams still hesitate because hierarchy, belonging, status,
                and safety are not abstract ideas to the brain. They are ancient
                survival signals.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-14 md:py-20">
        <SectionLabel>What leadership training misses</SectionLabel>
        <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <div>
            <h2 className="text-[clamp(2.5rem,4.8vw,5rem)] font-bold leading-[0.96] tracking-[-0.03em] text-brand-dark">
              The issue is rarely intent.
              <br />
              <span className="italic text-brand-accent">It is threat.</span>
            </h2>
            <p className="mt-6 max-w-xl font-sans text-base leading-8 text-brand-dark">
              Most workplace advice assumes people will act on what is logical.
              Caveman in the Cubicle starts from a different premise: under
              pressure, people first protect safety, status, and belonging.
            </p>
          </div>

          <div className="border-y border-brand-dark/12">
            {workplaceSignals.map((signal, index) => (
              <article
                key={signal.title}
                className="grid gap-4 border-b border-brand-dark/12 py-6 last:border-b-0 md:grid-cols-[0.58fr_1fr]"
              >
                <div className="flex gap-4">
                  <span className="mt-1 font-serif text-3xl font-bold text-brand-primary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">
                      {signal.label}
                    </p>
                    <h3 className="mt-2 text-xl font-bold leading-tight text-brand-dark">
                      {signal.title}
                    </h3>
                  </div>
                </div>
                <p className="font-sans text-sm leading-7 text-brand-dark/72">
                  {signal.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-dark px-6 py-14 text-white md:py-20">
        <div className="mx-auto max-w-6xl">
          <SectionLabel tone="dark">The shift</SectionLabel>
          <div className="grid gap-10 md:grid-cols-[0.78fr_1.22fr] md:items-start">
            <h2 className="text-3xl font-bold leading-tight tracking-[-0.02em] md:text-5xl">
              From leadership scripts
              <br />
              to behavioral x-ray vision.
            </h2>
            <div className="space-y-5 font-sans text-base leading-8 text-white/72">
              <p>
                Most programs tell leaders what to do. This lens explains why
                what they are already doing may not be landing.
              </p>
              <p>
                It helps leaders spot the invisible social signals they send,
                decode instinctive loops behind low ownership, and design
                environments where useful behavior is easier to repeat.
              </p>
              <p className="border-l-4 border-brand-secondary pl-5 text-xl leading-9 text-white">
                The work is not motivational fluff. It is behavior design for
                ancient brains inside modern organizations.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-14 md:py-20">
        <SectionLabel>Program focus</SectionLabel>
        <div className="grid gap-5 md:grid-cols-3">
          {programAreas.map((area) => {
            const Icon = area.icon;

            return (
              <article
                key={area.title}
                className="rounded-lg border border-brand-dark/12 bg-white p-6 shadow-sm"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-teal/35 text-brand-accent">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-5 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
                  {area.label}
                </p>
                <h3 className="mt-2 text-2xl font-bold leading-tight text-brand-dark">
                  {area.title}
                </h3>
                <p className="mt-3 font-sans text-sm leading-7 text-brand-dark/72">
                  {area.text}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section
        id="diagnostic"
        className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-14 md:grid-cols-[0.78fr_1.22fr] md:items-start md:py-16"
      >
        <div>
          <SectionLabel>CIC Diagnostic</SectionLabel>
          <h2 className="text-3xl font-bold leading-tight text-brand-dark md:text-5xl">
            Start with a clearer read of the room.
          </h2>
        </div>

        <Link
          href="/diagnostics/cic"
          className="group block rounded-lg border border-brand-dark bg-brand-dark p-6 text-white shadow-sm transition hover:opacity-95 md:p-8"
        >
          <span className="inline-flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-secondary">
            <BriefcaseBusiness className="h-4 w-4" />
            Workplace insight
          </span>
          <h3 className="mt-3 text-3xl font-bold leading-tight">
            Find the instincts shaping execution.
          </h3>
          <p className="mt-4 max-w-2xl font-sans text-sm leading-7 text-white/72">
            A diagnostic for seeing where status patterns, conflict avoidance,
            hierarchy sensitivity, and alignment breakdowns may be shaping team
            behavior.
          </p>
          <span className="mt-6 inline-flex items-center gap-2 font-sans text-sm font-semibold text-brand-secondary">
            Start CIC diagnostic
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </span>
        </Link>
      </section>

      <section className="border-y border-brand-dark/10 px-6 py-14 md:py-16">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.78fr_1.22fr] md:items-start">
          <div>
            <SectionLabel>Takeaways</SectionLabel>
            <h2 className="text-3xl font-bold leading-tight text-brand-dark md:text-4xl">
              What leaders walk away with.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {takeaways.map((takeaway) => (
              <div
                key={takeaway}
                className="flex gap-3 rounded-lg border border-brand-dark/12 bg-white p-5 shadow-sm"
              >
                <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-brand-accent" />
                <p className="font-sans text-sm leading-7 text-brand-dark/72">
                  {takeaway}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-14 md:grid-cols-[0.78fr_1.22fr] md:items-start md:py-16">
        <div>
          <SectionLabel>Bring it to your team</SectionLabel>
          <h2 className="text-3xl font-bold leading-tight text-brand-dark md:text-4xl">
            Start with a conversation.
          </h2>
          <p className="mt-4 max-w-xl font-sans text-sm leading-7 text-brand-dark/72">
            Use the diagnostic as a starting point, or bring the framework into
            a leadership workshop.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <a
            href="mailto:hello@neurocient.com"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-dark bg-brand-dark px-5 py-3 font-sans text-sm font-semibold text-white transition hover:opacity-90"
          >
            <Mail className="h-4 w-4" />
            hello@neurocient.com
          </a>
          <a
            href="tel:+918551915656"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-dark/25 px-5 py-3 font-sans text-sm font-semibold text-brand-dark transition hover:border-brand-primary hover:text-brand-primary"
          >
            <Phone className="h-4 w-4" />
            +91-85519 15656
          </a>
        </div>
      </section>
    </main>
  );
}

const SectionLabel = ({
  children,
  tone = "light",
}: {
  children: ReactNode;
  tone?: "light" | "dark";
}) => (
  <div
    className={`mb-7 flex items-center gap-3 font-sans text-xs font-semibold uppercase tracking-[0.18em] ${
      tone === "dark" ? "text-brand-secondary" : "text-brand-teal"
    }`}
  >
    <span>{children}</span>
    <span
      className={`h-px flex-1 ${
        tone === "dark" ? "bg-white/20" : "bg-brand-dark/15"
      }`}
    />
  </div>
);
