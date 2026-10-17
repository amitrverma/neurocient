import Image from "next/image";
import Link from "next/link";
import { ArrowDown, Compass, Heart, ShieldCheck, Sparkles, Users } from "lucide-react";
import { AnimatedApproach } from "./AnimatedApproach";
import { SectionDecorations, SectionHeading, SectionLabel } from "./LandingShared";

const drives = [
  {
    name: "Affiliation & Belonging",
    question: "Am I included?",
    examples: "Notifications, social media, loneliness, team silence.",
    icon: Users,
  },
  {
    name: "Kin Care",
    question: "Are my people okay?",
    examples: "Caregiving, provision, responsibility, emotional load.",
    icon: Heart,
  },
  {
    name: "Status & Hierarchy",
    question: "Where do I stand?",
    examples: "Performance reviews, comparison, reputation, visibility.",
    icon: Compass,
  },
  {
    name: "Mate & Bond Security",
    question: "Is this bond safe?",
    examples: "Attachment, ambiguity, jealousy, replaying arguments.",
    icon: Sparkles,
  },
  {
    name: "Safety & Survival",
    question: "Am I safe enough?",
    examples: "Deadlines, uncertainty, anxiety, avoidance, overreactions.",
    icon: ShieldCheck,
  },
];

export default function InnerCavemanSection() {
  return (
    <section id="inner-caveman" className="relative scroll-mt-20 overflow-hidden bg-white px-6 pb-8 pt-16 md:pb-12 md:pt-24">
      <SectionDecorations flip />
      <div className="relative z-10 mx-auto max-w-6xl">
        <AnimatedApproach />
        <div className="mt-8 max-w-4xl space-y-4 pt-4 font-sans text-lg leading-8 text-brand-dark md:text-xl md:leading-9">
          <p>To make lasting change, the first step is awareness.</p>
          <p>Not just of your behaviours, but of what is driving them.</p>
          <p className="pt-2 font-serif text-2xl font-bold leading-9 text-brand-dark md:text-4xl md:leading-tight">
            Begin with the system shaping the response.
          </p>
        </div>

        <div className="mt-16 md:mt-24">
          <SectionLabel>The survival system within</SectionLabel>
          <SectionHeading>
            Meet Your <span className="italic text-brand-accent">Inner Caveman</span>
          </SectionHeading>
        </div>

        <div className="mt-10 grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div>
            <p className="font-serif text-3xl font-bold leading-tight text-brand-dark md:text-4xl md:leading-[1.18]">
              The brain system that <span className="italic text-brand-accent">reacts before you reason:</span>{" "}
              <span className="relative inline bg-[linear-gradient(transparent_68%,rgba(244,201,93,0.48)_68%)]">fast, automatic,</span>{" "}
              and shaped for survival in a very different world.
            </p>
            <div className="mt-7 max-w-3xl space-y-5 font-sans text-lg leading-8 text-brand-dark/75 md:text-xl md:leading-9">
              <p>
                It is not a villain. It is not something you need to get rid of. It is Neurocient&apos;s name for evolved automatic processing: fast, reactive, energy-saving, and shaped by recurring human problems across many generations.
              </p>
              <p>
                The patterns you recognised earlier—waiting to feel ready, escaping into the scroll, comparing yourself with others, constant pressure, worries that never leave, and guilt—can be different ways automatic processing responds when one of five recurring human concerns becomes salient.
              </p>
              <p className="font-serif text-2xl font-bold leading-9 tracking-[-0.015em] text-brand-dark md:text-3xl md:leading-10">
                Those concerns usually fall into <span className="box-decoration-clone bg-brand-secondary/55 px-1.5 py-0.5 text-brand-accent">five core drives.</span>
              </p>
            </div>
          </div>

          <figure className="mx-auto w-full max-w-sm lg:max-w-md">
            <Image
              src="/assets/inner-caveman-five-drives.png"
              alt="The Inner Caveman framework and its five recurring human concerns"
              width={1152}
              height={1536}
              className="h-auto max-h-[34rem] w-full object-contain"
            />
          </figure>
        </div>

        <div className="mt-14 border-y border-brand-dark/15 md:mt-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-5">
            {drives.map((drive, index) => {
              const Icon = drive.icon;
              return (
                <article key={drive.name} className="flex min-h-56 flex-col border-b border-brand-dark/10 py-7 md:border-r md:px-6 lg:border-b-0 first:md:pl-0 last:md:border-r-0 last:md:pr-0">
                  <div className="flex items-center justify-between gap-4">
                    <span className="grid h-10 w-10 place-items-center rounded-full border border-brand-accent/25 text-brand-accent">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="font-sans text-xs font-semibold tracking-[0.16em] text-brand-dark/30">0{index + 1}</span>
                  </div>
                  <h3 className="mt-6 font-sans text-xs font-semibold uppercase leading-5 tracking-[0.12em] text-brand-dark/60">
                    {drive.name}
                  </h3>
                  <p className="mt-2 font-serif text-xl font-bold italic leading-7 text-brand-dark">{drive.question}</p>
                  <p className="mt-auto pt-5 font-sans text-sm leading-6 text-brand-dark/65">{drive.examples}</p>
                </article>
              );
            })}
          </div>
        </div>

        <div className="mt-10 font-sans text-base leading-8 text-brand-dark/75 md:mt-12 md:text-lg md:leading-9">
          <p className="max-w-4xl font-serif text-2xl font-bold leading-9 tracking-[-0.02em] text-brand-dark md:text-3xl md:leading-10">
            Every person has all five drives. Different situations activate different drives, shaping how you think, feel, and <em className="font-bold italic text-brand-primary">respond</em>.
          </p>

          <div className="mt-10 grid gap-7 border-y border-brand-dark/15 py-9 lg:grid-cols-[0.72fr_1.28fr] lg:gap-12 lg:py-11">
            <div>
              <p className="font-serif text-2xl leading-9 text-brand-dark md:text-3xl md:leading-10">
                You can&apos;t delete your Inner Caveman.
              </p>
              <p className="mt-3 font-serif text-2xl font-bold italic text-brand-accent md:text-3xl">But you can learn to</p>
            </div>
            <ol className="relative space-y-5 pl-12 before:absolute before:bottom-6 before:left-[0.9rem] before:top-6 before:w-px before:bg-brand-dark/15 md:space-y-6 md:pl-16">
              <li className="relative">
                <span className="absolute -left-12 top-1 grid h-8 w-8 place-items-center rounded-full bg-brand-primary font-sans text-xs font-bold text-white md:-left-16">01</span>
                <p className="font-serif text-xl leading-8 text-brand-dark md:text-2xl md:leading-9"><strong className="text-brand-primary">recognise</strong> when automatic processing is shaping the response,</p>
              </li>
              <li className="relative">
                <span className="absolute -left-12 top-1 grid h-8 w-8 place-items-center rounded-full bg-brand-secondary font-sans text-xs font-bold text-brand-dark md:-left-16">02</span>
                <p className="font-serif text-xl leading-8 text-brand-dark md:text-2xl md:leading-9"><strong className="text-brand-accent">understand</strong> which signals are receiving more weight,</p>
              </li>
              <li className="relative">
                <span className="absolute -left-12 top-1 grid h-8 w-8 place-items-center rounded-full bg-brand-teal font-sans text-xs font-bold text-brand-dark md:-left-16">03</span>
                <p className="font-serif text-xl leading-8 text-brand-dark md:text-2xl md:leading-9">and <strong className="text-brand-teal">respond</strong> with more awareness instead of reacting automatically.</p>
              </li>
            </ol>
          </div>

          <Link
            href="/inner-caveman"
            className="mt-6 inline-flex min-h-11 items-center font-sans text-sm font-bold text-brand-accent underline decoration-brand-secondary decoration-2 underline-offset-4 transition hover:text-brand-teal focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-teal"
          >
            Read the full Inner Caveman explanation
          </Link>

          <div className="mt-11 border-t border-brand-dark/15 pt-9 md:mt-14 md:pt-11">
            <p className="page-eyebrow text-brand-accent">From recognition to change</p>
            <div className="mt-4 flex items-end justify-between gap-7">
              <div className="max-w-5xl">
                <p className="font-serif text-2xl font-bold leading-9 text-brand-dark md:text-3xl md:leading-10">
                  Seeing the pattern changes the question.
                </p>
                <p className="mt-3 font-serif text-3xl font-bold italic leading-tight text-brand-accent md:text-5xl md:leading-[1.12]">
                  How do you turn that understanding into lasting change?
                </p>
              </div>
              <span className="hidden h-14 w-14 shrink-0 place-items-center rounded-full bg-brand-dark text-brand-secondary sm:grid" aria-hidden="true">
                <ArrowDown className="h-5 w-5" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
