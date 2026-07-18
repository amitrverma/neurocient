import Image from "next/image";
import { ArrowRight, Compass, Heart, ShieldCheck, Sparkles, Users } from "lucide-react";
import { SectionDecorations, SectionHeading, SectionLabel } from "./LandingShared";

const drives = [
  { name: "Affiliation & Belonging", question: "Am I included?", modern: "Notifications, social media, loneliness, team silence.", icon: Users },
  { name: "Kin Care", question: "Are my people okay?", modern: "Caregiving, provision, responsibility, emotional load.", icon: Heart },
  { name: "Status & Hierarchy", question: "Where do I stand?", modern: "Performance reviews, comparison, reputation, visibility.", icon: Compass },
  { name: "Mate & Bond Security", question: "Is this bond safe?", modern: "Attachment, ambiguity, jealousy, replaying arguments.", icon: Sparkles },
  { name: "Safety & Survival", question: "Am I safe enough?", modern: "Deadlines, uncertainty, anxiety, avoidance, overreactions.", icon: ShieldCheck },
];

export default function InnerCavemanSection() {
  return (
    <section className="relative overflow-hidden bg-white px-6 pb-12 pt-12 md:pb-16 md:pt-16">
      <SectionDecorations flip />

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="max-w-5xl">
          <SectionLabel>The survival system within</SectionLabel>
          <SectionHeading>
            Meet Your <span className="italic text-brand-accent">Inner Caveman</span>
          </SectionHeading>
          <p className="mt-10 max-w-5xl py-7 font-serif text-[1.75rem] font-bold leading-[1.35] tracking-[-0.02em] text-brand-dark md:py-9 md:text-[2.65rem] md:leading-[1.2]">
            The brain system that <span className="italic text-brand-accent">reacts before you reason:</span>{" "}
            <span className="relative inline bg-[linear-gradient(transparent_68%,rgba(244,201,93,0.48)_68%)]">fast, protective,</span>
            {" "}and shaped for survival in a very different world.
          </p>
          <div className="mt-9 max-w-5xl text-brand-dark/75 md:mt-11">
            <p className="max-w-4xl border-l-4 border-brand-secondary py-1 pl-6 font-serif text-xl font-bold leading-8 text-brand-dark md:text-2xl md:leading-9">
              It&rsquo;s not a villain. It is not something you need to get rid of.
              It is simply trying to keep you safe the only way it knows how.
            </p>
            <p className="mt-8 max-w-5xl font-sans text-base leading-8 md:mt-10 md:text-lg md:leading-9">
              The patterns you recognised earlier&mdash;waiting to feel ready,
              escaping into the scroll, comparing yourself with others,
              constant pressure, worries that never leave, guilt, and rest that
              doesn&apos;t restore&mdash;are often different ways your Inner Caveman
              responds when it believes one of its core survival needs is under
              threat.
            </p>
            <p className="mt-9 pt-8 font-serif text-2xl font-bold leading-9 tracking-[-0.015em] text-brand-dark md:mt-11 md:pt-10 md:text-3xl md:leading-10">
              Those survival needs usually fall into{" "}
              <span className="box-decoration-clone bg-brand-secondary/55 px-1.5 py-0.5 text-brand-accent">five core drives.</span>
            </p>
          </div>
        </div>
        <div className="mt-10 md:mt-14">
          <CavemanImage />
        </div>
      </div>

      <div className="relative z-10 mx-auto mt-16 max-w-6xl md:mt-20">
        <div className="grid overflow-hidden border-y border-brand-dark/15 bg-white md:grid-cols-2 lg:grid-cols-5">
          {drives.map((drive, index) => {
            const Icon = drive.icon;
            return (
              <article
                key={drive.name}
                className="relative flex min-h-64 flex-col border-b border-brand-dark/10 p-6 last:border-b-0 md:border-r md:[&:nth-child(2)]:border-r-0 lg:border-b-0 lg:[&:nth-child(2)]:border-r lg:last:border-r-0"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="grid h-11 w-11 place-items-center rounded-full border border-brand-accent/25 bg-white text-brand-accent">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-sans text-xs font-semibold tracking-[0.16em] text-brand-dark/30">0{index + 1}</span>
                </div>
                <div className="mt-8">
                  <h3 className="font-sans text-xs font-semibold uppercase leading-5 tracking-[0.12em] text-brand-dark/60">{drive.name}</h3>
                  <p className="mt-3 font-serif text-2xl font-bold italic leading-8 text-brand-dark">{drive.question}</p>
                </div>
                <p className="mt-auto pt-7 pr-6 font-sans text-sm leading-6 text-brand-dark/65">{drive.modern}</p>
              </article>
            );
          })}
        </div>
      </div>

      <div className="relative z-10 mx-auto mt-8 max-w-6xl font-sans text-base leading-8 text-brand-dark/75 md:mt-10">
        <p className="max-w-4xl font-serif text-2xl font-bold leading-9 tracking-[-0.02em] text-brand-dark md:text-3xl md:leading-10">
          Every person has all five drives. What differs is which one becomes active most often, and how it shapes the way you think, feel, and <em className="font-bold italic text-brand-primary">respond</em>.
        </p>
        <p className="mt-6 max-w-5xl md:whitespace-nowrap md:text-lg md:leading-9">
          Grounded in decades of research across evolutionary psychology and behavioural science.
        </p>
        <div className="pb-6 pt-4 md:pb-8 md:pt-5">
          <div className="mt-4 grid gap-px overflow-hidden border-y border-brand-dark/15 bg-brand-dark/15 font-sans font-semibold text-brand-dark lg:grid-cols-3">
            <div className="flex flex-col bg-white/80 p-5">
              <span>Neurocient&apos;s five-drive model, informed by the fundamental-motives framework. (<a href="https://doi.org/10.1177/1745691610369469" target="_blank" rel="noreferrer" className="font-bold text-brand-teal underline underline-offset-4 transition-colors hover:text-brand-accent">Kenrick et al., 2010 ↗</a>)</span>
              <strong className="mt-auto self-end pt-6 font-serif text-6xl leading-none text-brand-secondary">5</strong>
            </div>
            <div className="flex flex-col bg-white/80 p-5">
              <span>Losses can weigh about twice as much as equivalent gains. (<a href="https://doi.org/10.1007/BF00122574" target="_blank" rel="noreferrer" className="font-bold text-brand-teal underline underline-offset-4 transition-colors hover:text-brand-accent">Tversky &amp; Kahneman, 1992 ↗</a>)</span>
              <strong className="mt-auto self-end pt-6 font-serif text-6xl leading-none text-brand-secondary">2x</strong>
            </div>
            <div className="flex flex-col bg-white/80 p-5">
              <span>Zaltman&apos;s estimate of cognition occurring outside conscious awareness, discussed in consumer decision-making. (<a href="https://www.library.hbs.edu/working-knowledge/the-subconscious-mind-of-the-consumer-and-how-to-reach-it" target="_blank" rel="noreferrer" className="font-bold text-brand-teal underline underline-offset-4 transition-colors hover:text-brand-accent">Harvard Business School, 2003 ↗</a>)</span>
              <strong className="mt-auto self-end pt-6 font-serif text-6xl leading-none text-brand-secondary">95%</strong>
            </div>
          </div>
        </div>
        <p className="max-w-4xl font-serif text-2xl leading-9 text-brand-dark md:text-3xl md:leading-10">
          You can&apos;t delete your Inner Caveman.
        </p>
        <p className="mt-4 max-w-4xl font-serif text-2xl font-bold italic text-brand-accent md:text-3xl">But you can learn to</p>
        <ol className="relative mt-7 max-w-5xl space-y-5 pl-12 before:absolute before:bottom-6 before:left-[0.9rem] before:top-6 before:w-px before:bg-brand-dark/15 md:mt-9 md:space-y-6 md:pl-16">
          <li className="relative">
            <span className="absolute -left-12 top-1 grid h-8 w-8 place-items-center rounded-full bg-brand-primary font-sans text-xs font-bold text-white md:-left-16">01</span>
            <p className="font-serif text-2xl leading-9 text-brand-dark md:text-3xl md:leading-10"><strong className="text-brand-primary">recognise</strong> when it&apos;s active,</p>
          </li>
          <li className="relative">
            <span className="absolute -left-12 top-1 grid h-8 w-8 place-items-center rounded-full bg-brand-secondary font-sans text-xs font-bold text-brand-dark md:-left-16">02</span>
            <p className="font-serif text-2xl leading-9 text-brand-dark md:text-3xl md:leading-10"><strong className="text-brand-accent">understand</strong> what it&apos;s trying to protect,</p>
          </li>
          <li className="relative">
            <span className="absolute -left-12 top-1 grid h-8 w-8 place-items-center rounded-full bg-brand-teal font-sans text-xs font-bold text-brand-dark md:-left-16">03</span>
            <p className="font-serif text-2xl leading-9 text-brand-dark md:text-3xl md:leading-10">and <strong className="text-brand-teal">respond</strong> with more awareness instead of reacting automatically.</p>
          </li>
        </ol>
        <blockquote className="mt-14 max-w-5xl border-y border-brand-dark/15 py-10 md:mt-16 md:py-14">
          <p className="max-w-4xl text-balance font-serif text-[clamp(2.15rem,5vw,4.25rem)] font-bold leading-[1.08] tracking-[-0.035em] text-brand-dark">
            You wanted MORE from your ONE life.
          </p>
          <p className="mt-6 max-w-4xl font-serif text-2xl leading-9 text-brand-dark md:mt-7 md:text-3xl md:leading-10">
            That doesn&apos;t begin by trying harder.
          </p>
          <p className="mt-5 max-w-3xl font-serif text-2xl italic leading-9 text-brand-accent md:mt-6 md:text-3xl md:leading-10">
            It begins by understanding what&apos;s been shaping you all along.
          </p>
        </blockquote>
        <div className="mt-6 flex max-w-5xl items-center justify-between gap-6 py-5 md:mt-7 md:py-6">
          <p className="font-serif text-3xl font-bold leading-10 tracking-[-0.02em] text-brand-dark md:text-4xl md:leading-[1.15]">
            So we created a{" "}
            <span className="box-decoration-clone bg-brand-secondary/55 px-1.5 py-0.5 text-brand-accent">simple scan</span>{" "}
            to help you get started.
          </p>
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-brand-teal/40 text-brand-teal md:h-16 md:w-16" aria-hidden="true">
            <ArrowRight className="h-6 w-6" />
          </span>
        </div>
      </div>
    </section>
  );
}

const CavemanImage = ({ priority = false }: { priority?: boolean }) => (
  <figure className="mx-auto w-full max-w-5xl">
    <div className="mx-auto w-fit max-w-full overflow-hidden bg-white py-4">
      <Image src="/assets/inner-caveman-five-drives.png" alt="The Inner Caveman framework showing the puppet and five core drives" width={1152} height={1536} priority={priority} className="mx-auto h-auto max-h-[88svh] w-auto max-w-full object-contain" />
    </div>
  </figure>
);
