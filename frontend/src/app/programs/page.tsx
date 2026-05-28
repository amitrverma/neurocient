import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Check, Mountain } from "lucide-react";

const programs = [
  {
    tag: "Program 01",
    title: "The Modern Caveman",
    desc: "A guided journey through the full Inner Caveman framework. Understand your wiring, identify your dominant patterns, and build habits that work with your biology.",
    includes: [
      "Weekly themes",
      "Daily micro-practices",
      "Personal pattern assessment",
      "Science-backed and jargon-free",
    ],
    href: "/modern-caveman",
    icon: Mountain,
  },
  {
    tag: "Program 02",
    title: "Caveman in the Cubicle",
    desc: "The Inner Caveman lens applied to professional life: procrastination, perfectionism, status, office politics, leadership, and team behavior.",
    includes: [
      "Work-specific patterns",
      "Team dynamics through evolution",
      "Focus protocols",
      "Status and hierarchy decoded",
    ],
    href: "/caveman-cubicle",
    icon: BriefcaseBusiness,
  },
];

export default function ProgramPage() {
  return (
    <main className="bg-white px-6 py-14 font-serif text-brand-dark md:py-20">
      <section className="mx-auto w-full max-w-6xl">
        <div className="mb-7 flex items-center gap-3 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal">
          <span>Programs</span>
          <span className="h-px flex-1 bg-brand-dark/15" />
        </div>
        <h1 className="text-3xl font-bold leading-tight text-brand-dark md:text-5xl">
          Structured transformation.
          <br />
          <span className="italic text-brand-accent">Built on the science.</span>
        </h1>
        <p className="mt-5 max-w-2xl font-sans text-base leading-8 text-brand-dark/72">
          Not content dumps. Guided experiences designed around how old systems
          actually change: slowly, with repetition, practice, and the right
          friction.
        </p>
        <div className="mt-9 grid gap-5 lg:grid-cols-2">
          {programs.map((program) => {
            const Icon = program.icon;

            return (
              <article
                key={program.title}
                className="overflow-hidden rounded-lg border border-brand-dark/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="bg-brand-dark p-6 text-white">
                  <Icon className="mb-4 h-9 w-9 text-brand-secondary" />
                  <span className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
                    {program.tag}
                  </span>
                  <h2 className="mt-2 text-3xl font-bold">{program.title}</h2>
                </div>
                <div className="p-6">
                  <p className="font-sans text-sm leading-7 text-brand-dark/72">
                    {program.desc}
                  </p>
                  <ul className="mt-5 space-y-2 font-sans text-sm text-brand-dark/70">
                    {program.includes.map((item) => (
                      <li key={item} className="flex gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={program.href}
                    className="mt-6 inline-flex items-center gap-2 rounded-full border border-brand-dark px-4 py-2 font-sans text-sm font-semibold text-brand-dark transition hover:border-brand-primary hover:text-brand-primary"
                  >
                    Learn more
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
