import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  MessagesSquare,
  NotebookPen,
  Route,
  ScanLine,
  type LucideIcon,
} from "lucide-react";
import { SectionDecorations, SectionHeading, SectionLabel } from "./LandingShared";

type PlatformPath = {
  number: string;
  label: string;
  title: string;
  text: string;
  detail: string;
  href: string;
  cta: string;
  icon: LucideIcon;
};

const paths: PlatformPath[] = [
  {
    number: "01",
    label: "Understand",
    title: "Insights",
    text: "Begin with a behaviour you cannot quite explain and follow what is happening underneath it.",
    detail: "For scrolling, comparison, worry, avoidance and other familiar situations.",
    href: "/insights",
    cta: "Explore Insights",
    icon: BookOpenText,
  },
  {
    number: "02",
    label: "Notice and experiment",
    title: "Tools",
    text: "Capture what happened in a real situation, then try one modest change in the conditions around it.",
    detail: "Spot the Inner Caveman and Microchallenges turn a vague difficulty into usable evidence.",
    href: "/tools",
    cta: "Explore Tools",
    icon: NotebookPen,
  },
  {
    number: "03",
    label: "Work through it",
    title: "Practice",
    text: "Use a guided sequence to work through one recurring behaviour without jumping straight to another action plan.",
    detail: "Practice brings Identity, Knowledge, Environment, Action and Reinforcement together.",
    href: "/practice",
    cta: "Open Practice",
    icon: Route,
  },
  {
    number: "04",
    label: "Add human support",
    title: "Programs",
    text: "Use live structure and facilitation when self-guided understanding is not enough for the change you want to make.",
    detail: "Personal guidance and workplace programs offer different forms of support.",
    href: "/programs",
    cta: "Explore Programs",
    icon: MessagesSquare,
  },
];

const framework = [
  { letter: "I", title: "Identity", text: "Loosen the story the behaviour has created about you." },
  { letter: "K", title: "Knowledge", text: "Understand the immediate logic beneath what happens." },
  { letter: "E", title: "Environment", text: "Change the conditions making the old response easier." },
  { letter: "A", title: "Action", text: "Choose the smallest useful move that fits the cause." },
  { letter: "+", title: "Reinforcement", text: "Bring the insight back when the situation returns." },
];

export default function NeurocientSystemSection() {
  return (
    <section id="how-neurocient-helps" className="relative scroll-mt-20 overflow-hidden bg-brand-dark px-6 py-16 text-white md:py-24">
      <SectionDecorations tone="dark" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <SectionLabel tone="dark">The complete path</SectionLabel>
        <SectionHeading tone="dark">
          How Neurocient <span className="italic text-brand-secondary">helps.</span>
        </SectionHeading>

        <div className="mt-10">
          <p className="max-w-4xl font-serif text-3xl font-bold leading-tight text-white md:text-4xl md:leading-[1.18]">
            Understanding is not the finish line. Neurocient helps you move from something you understand to something you live.
          </p>
        </div>

        <div className="mt-12 grid overflow-hidden border border-white/15 lg:grid-cols-2">
          {paths.map((path) => {
            const Icon = path.icon;
            return (
              <article key={path.href} className="flex min-h-[23rem] flex-col border-b border-white/15 p-6 last:border-b-0 sm:p-8 lg:border-r lg:[&:nth-child(2n)]:border-r-0 lg:[&:nth-last-child(-n+2)]:border-b-0">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-sans text-xs font-bold tracking-[0.18em] text-white/35">{path.number}</span>
                  <Icon className="h-5 w-5 text-brand-secondary" aria-hidden="true" />
                </div>
                <p className="mt-8 font-sans text-xs font-bold uppercase tracking-[0.16em] text-brand-primary">{path.label}</p>
                <h3 className="mt-2 font-serif text-4xl font-bold text-white">{path.title}</h3>
                <p className="mt-5 max-w-xl font-sans text-lg leading-8 text-white/78">{path.text}</p>
                <p className="mt-4 max-w-xl border-l-2 border-brand-teal pl-4 font-sans text-sm leading-7 text-white/55">{path.detail}</p>
                <Link href={path.href} className="group mt-auto inline-flex min-h-12 items-center gap-2 pt-7 font-sans text-sm font-bold text-brand-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-secondary">
                  {path.cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </article>
            );
          })}
        </div>

        <div className="mt-14 md:mt-20">
          <div className="max-w-4xl">
            <p className="page-eyebrow text-brand-secondary">Inside guided Practice</p>
            <h3 className="mt-4 font-serif text-3xl font-bold leading-tight text-white md:text-4xl">
              IKEA + Reinforcement works on more than the final action.
            </h3>
          </div>
          <ol className="mt-8 grid border-y border-white/15 sm:grid-cols-2 lg:grid-cols-5">
            {framework.map((step) => (
              <li key={step.title} className="border-b border-white/10 py-6 sm:px-5 lg:border-b-0 lg:border-r lg:last:border-r-0 first:sm:pl-0 last:sm:pr-0">
                <span className="font-serif text-4xl font-bold text-brand-secondary" aria-hidden="true">{step.letter}</span>
                <h4 className="mt-4 font-sans text-sm font-bold text-white">{step.title}</h4>
                <p className="mt-2 font-sans text-sm leading-6 text-white/58">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-12 grid gap-6 border-l-4 border-brand-secondary pl-5 md:mt-16 md:grid-cols-[1fr_auto] md:items-center md:pl-7">
          <div>
            <p className="font-serif text-2xl font-bold leading-9 text-white md:text-3xl md:leading-10">
              Not sure where to start?
            </p>
            <p className="mt-2 font-sans text-base leading-7 text-white/65">
              Begin with ordinary situations from your own life. Free · about five minutes.
            </p>
          </div>
          <Link
            href="/diagnostics/caveman-scan"
            className="group inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-brand-secondary px-7 font-sans text-sm font-bold text-brand-dark transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-teal"
          >
            <ScanLine className="h-4 w-4" aria-hidden="true" />
            Take the 5-minute Inner Caveman Scan
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
