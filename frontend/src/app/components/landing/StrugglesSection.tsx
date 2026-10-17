import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SectionDecorations, SectionHeading, SectionLabel } from "./LandingShared";

const struggles = [
  {
    title: "Waiting to feel ready",
    text: "The project, conversation, or change matters—but beginning still feels easier to postpone.",
    accent: "border-brand-primary",
  },
  {
    title: "Escaping into the scroll",
    text: "You pick up your phone for a moment and stay long after you meant to stop.",
    accent: "border-brand-teal",
  },
  {
    title: "Measuring yourself against others",
    text: "Someone else’s progress changes how your own life feels, even when nothing in it has changed.",
    accent: "border-brand-secondary",
  },
  {
    title: "Pressure that never switches off",
    text: "Even during rest, unfinished tasks keep running through your mind.",
    accent: "border-brand-primary",
  },
  {
    title: "Worries that never leave",
    text: "You replay conversations and prepare for problems that have not happened.",
    accent: "border-brand-teal",
  },
  {
    title: "The guilt that does not go away",
    text: "Another plan slips, and the disappointment begins to sound like a judgment about you.",
    accent: "border-brand-secondary",
  },
];

export default function StrugglesSection() {
  return (
    <section id="struggle" className="relative scroll-mt-24 overflow-hidden bg-white">
      <SectionDecorations flip />
      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-14 md:py-20">
        <SectionLabel>The modern challenge</SectionLabel>
        <SectionHeading>
          “Why do I do that<span className="text-brand-primary">?</span>”
        </SectionHeading>

        <div className="mt-9 max-w-5xl font-sans text-xl leading-[1.5] text-brand-dark md:mt-11 md:text-2xl md:leading-[1.45]">
          <p>
            You know what needs to be done. You may even want to do it.{" "}
            <span>And yet, you don&apos;t.</span>{" "}
            <span className="block">
              <em className="font-serif font-bold italic text-brand-accent">Not always. Not completely.</em>{" "}
              But often enough to wonder what&apos;s really going on.
            </span>
          </p>

          <div className="mt-9 space-y-7 md:mt-10 md:space-y-8">
            <p>
              Over time, it becomes{" "}
              <em className="font-serif font-bold italic text-brand-accent">frustrating.</em>{" "}
              You stop asking why you can&apos;t seem to make things stick, and start wondering if{" "}
              <em className="font-serif font-bold italic text-brand-accent">something is wrong with you.</em>
            </p>

            <p>
              You tell yourself{" "}
              <em className="font-serif font-bold italic text-brand-accent">next week will be different.</em>{" "}
              After this project. After the holidays. Once work settles down. Once life feels less busy. But somehow, that version of{" "}
              <span className="box-decoration-clone bg-brand-secondary/55 px-1.5 py-0.5">
                your life{" "}<em className="font-serif font-bold italic text-brand-accent">never arrives.</em>
              </span>
            </p>

            <p>
              Instead, the{" "}
              <em className="font-serif font-bold italic text-brand-accent">same struggles</em>{" "}
              keep showing up in different parts of your life. Some are obvious. Others become so familiar that they start to feel like{" "}
              <em className="font-serif font-bold italic text-brand-accent">part of who you are.</em>
            </p>

            <p className="pt-3 font-serif text-2xl font-bold leading-8 text-brand-dark md:pt-4 md:text-3xl md:leading-10">
              Here are a few patterns you might recognize
            </p>
          </div>
        </div>

        <div className="mt-8 grid border-y border-brand-dark/15 md:mt-10 md:grid-cols-2 lg:grid-cols-3">
          {struggles.map((item, index) => (
            <article
              key={item.title}
              className="relative border-b border-brand-dark/10 px-1 py-7 md:min-h-56 md:px-7 md:py-8 md:[&:nth-child(odd)]:border-r lg:border-r lg:[&:nth-child(3n)]:border-r-0"
            >
              <div className={`border-l-2 pl-5 ${item.accent}`}>
                <span className="font-sans text-[0.65rem] font-bold uppercase tracking-[0.2em] text-brand-dark/40">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 max-w-[22ch] font-serif text-2xl font-bold leading-8 text-brand-dark">
                  {item.title}
                </h3>
                <p className="mt-4 max-w-xl font-sans text-base leading-7 text-brand-dark/70">
                  {item.text}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 grid gap-10 md:mt-12 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start lg:gap-16">
          <div className="max-w-4xl space-y-5 font-sans text-xl leading-[1.5] text-brand-dark md:text-2xl md:leading-[1.45] lg:col-start-1 lg:row-start-1">
            <p>These patterns may look different from person to person.</p>
            <p>
              But if you&apos;ve recognized yourself in even one of them, you&apos;ve
              probably already searched for answers and followed more advice than
              you can remember.
            </p>
          </div>

          <aside className="relative overflow-hidden bg-brand-secondary/20 px-6 py-7 lg:col-start-2 lg:row-start-1">
            <span className="page-eyebrow text-brand-accent">Explore through Insights</span>
            <span className="absolute right-0 top-0 h-2 w-16 bg-brand-secondary" aria-hidden="true" />
            <p className="mt-4 font-serif text-2xl font-bold leading-8 text-brand-dark">
              Recognition is a useful beginning.
            </p>
            <p className="mt-3 font-sans text-sm leading-7 text-brand-dark/70">
              If one situation already stands out, Insights can help you understand what may be happening underneath it.
            </p>
            <Link
              href="/insights"
              className="group mt-5 inline-flex min-h-11 items-center gap-2 font-sans text-sm font-bold text-brand-accent underline decoration-brand-secondary decoration-2 underline-offset-4 transition hover:text-brand-teal focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-teal"
            >
              Find your question
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
