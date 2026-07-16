import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Compass, Heart, ShieldCheck, Sparkles, Users } from "lucide-react";
import { SectionDecorations, SectionHeading, SectionLabel } from "./LandingShared";

const drives = [
  { name: "Affiliation & Belonging", question: "Am I included?", modern: "Notifications, social media, loneliness, team silence.", href: "/insights/connections", icon: Users },
  { name: "Kin Care", question: "Are my people okay?", modern: "Caregiving, provision, responsibility, emotional load.", href: "/insights/alloparenting", icon: Heart },
  { name: "Status & Hierarchy", question: "Where do I stand?", modern: "Performance reviews, comparison, reputation, visibility.", href: "/insights/why-we-compare", icon: Compass },
  { name: "Mate & Bond Security", question: "Is this bond safe?", modern: "Attachment, ambiguity, jealousy, replaying arguments.", href: "/insights/replay-arguments", icon: Sparkles },
  { name: "Safety & Survival", question: "Am I safe enough?", modern: "Deadlines, uncertainty, anxiety, avoidance, overreactions.", href: "/insights/anticipatory-anxiety", icon: ShieldCheck },
];

export default function InnerCavemanSection() {
  return (
    <section className="relative overflow-hidden bg-[#f3eee6] px-5 py-20 sm:px-6 md:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-brand-dark/15" />
      <div className="pointer-events-none absolute -right-40 top-24 h-96 w-96 rounded-full bg-brand-secondary/15 blur-3xl" />
      <SectionDecorations flip />

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="mx-auto max-w-5xl">
          <SectionLabel>Neurocient Labs introduces...</SectionLabel>
          <SectionHeading>
            Meet Your <span className="italic text-brand-accent">Inner Caveman</span>
          </SectionHeading>
          <p className="mt-10 max-w-5xl border-y border-brand-dark/15 py-7 font-serif text-[1.75rem] font-bold leading-[1.35] tracking-[-0.02em] text-brand-dark md:py-9 md:text-[2.65rem] md:leading-[1.2]">
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
            <p className="mt-9 border-t border-brand-dark/15 pt-8 font-serif text-2xl font-bold leading-9 tracking-[-0.015em] text-brand-dark md:mt-11 md:pt-10 md:text-3xl md:leading-10">
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
        <div className="grid overflow-hidden rounded-2xl border border-brand-dark/15 bg-white/70 shadow-[0_24px_70px_-45px_rgba(4,42,43,0.45)] md:grid-cols-2 lg:grid-cols-5">
          {drives.map((drive, index) => {
            const Icon = drive.icon;
            return (
              <Link
                key={drive.name}
                href={drive.href}
                className="group relative flex min-h-64 flex-col border-b border-brand-dark/10 p-6 transition-colors hover:bg-white last:border-b-0 md:border-r md:[&:nth-child(2)]:border-r-0 lg:border-b-0 lg:[&:nth-child(2)]:border-r lg:last:border-r-0"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="grid h-11 w-11 place-items-center rounded-full border border-brand-accent/25 bg-[#f3eee6] text-brand-accent transition-transform group-hover:-translate-y-0.5">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-sans text-xs font-semibold tracking-[0.16em] text-brand-dark/30">0{index + 1}</span>
                </div>
                <div className="mt-8">
                  <h3 className="font-sans text-xs font-semibold uppercase leading-5 tracking-[0.12em] text-brand-dark/60">{drive.name}</h3>
                  <p className="mt-3 font-serif text-2xl font-bold italic leading-8 text-brand-dark transition-colors group-hover:text-brand-accent">{drive.question}</p>
                </div>
                <p className="mt-auto pt-7 pr-6 font-sans text-sm leading-6 text-brand-dark/65">{drive.modern}</p>
                <ArrowRight className="absolute bottom-6 right-6 h-4 w-4 text-brand-teal opacity-40 transition-all group-hover:translate-x-1 group-hover:opacity-100" aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      </div>

      <div className="relative z-10 mx-auto mt-16 max-w-6xl border-t border-brand-dark/15 pt-14 font-sans text-base leading-8 text-brand-dark/75 md:pt-20">
        <p className="max-w-4xl font-serif text-2xl font-bold leading-9 tracking-[-0.02em] text-brand-dark md:text-3xl md:leading-10">
          Every person has all five drives. What differs is which one becomes active most often, and how it shapes the way you think, feel, and respond.
        </p>
        <p className="mt-8 max-w-3xl border-l-2 border-brand-primary/40 pl-5 md:text-lg md:leading-9">
          Grounded in decades of research across evolutionary psychology and behavioural science.
        </p>
        <div className="py-10 md:py-14">
          <div className="mt-7 grid gap-px overflow-hidden rounded-xl border border-brand-dark/15 bg-brand-dark/15 font-sans font-semibold text-brand-dark lg:grid-cols-3">
            <span className="flex flex-col bg-white/80 p-5">
              <strong className="font-serif text-4xl leading-none text-brand-primary">5</strong>
              <span className="mt-4"> — Core survival drives still shaping how you behave today. (Evolutionary Psychology / Kenrick et al.)</span>
            </span>
            <span className="flex flex-col bg-white/80 p-5">
              <strong className="font-serif text-4xl leading-none text-brand-primary">2x</strong>
              <span className="mt-4"> — Losses feel twice as powerful as equivalent gains. (Kahneman &amp; Tversky, Prospect Theory, 1979)</span>
            </span>
            <span className="flex flex-col bg-white/80 p-5">
              <strong className="font-serif text-4xl leading-none text-brand-primary">95%</strong>
              <span className="mt-4"> — Of decisions driven by unconscious processes. (Dr. Gerald Zaltman, Harvard University)</span>
            </span>
          </div>
          <p className="mt-7 inline-block bg-brand-secondary/55 px-2 py-0.5 font-semibold text-brand-accent">(check the source)</p>
        </div>
        <p className="max-w-4xl font-serif text-2xl leading-9 text-brand-dark md:text-3xl md:leading-10">
          You can&apos;t delete your Inner Caveman.
        </p>
        <p className="mt-7 max-w-4xl">But you can learn to</p>
        <div className="mt-6 grid gap-px overflow-hidden rounded-xl border border-brand-dark/15 bg-brand-dark/15 font-sans font-semibold text-brand-dark sm:grid-cols-3">
          <span className="bg-white/80 p-5">recognise when it&apos;s active,</span>
          <span className="bg-white/80 p-5">understand what it&apos;s trying to protect,</span>
          <span className="bg-white/80 p-5">and respond with more awareness instead of reacting automatically.</span>
        </div>
        <div className="mt-12 max-w-4xl space-y-6 border-t border-brand-dark/15 pt-9">
          <p className="font-serif text-2xl font-bold leading-9 text-brand-dark md:text-3xl md:leading-10">You wanted MORE from your ONE life. That doesn&apos;t begin by trying harder.</p>
          <p>It begins by understanding what&apos;s been shaping you all along.</p>
        </div>
        <p className="relative mt-10 max-w-5xl overflow-hidden rounded-2xl bg-brand-dark px-7 py-9 font-serif text-3xl font-bold leading-10 tracking-[-0.02em] text-white shadow-[0_24px_70px_-35px_rgba(4,42,43,0.75)] before:absolute before:-right-12 before:-top-20 before:h-52 before:w-52 before:rounded-full before:border before:border-white/10 md:px-12 md:py-12 md:text-4xl md:leading-[1.15]">
          So we created a simple scan to help you get started.
        </p>
      </div>
    </section>
  );
}

const CavemanImage = ({ priority = false }: { priority?: boolean }) => (
  <figure className="mx-auto w-full max-w-5xl">
    <div className="mx-auto w-fit max-w-full overflow-hidden rounded-xl border border-brand-dark/15 bg-[#f8f3ec] p-2 shadow-[0_24px_65px_-42px_rgba(4,42,43,0.55)] sm:p-3">
      <Image src="/assets/inner-caveman-five-drives.png" alt="The Inner Caveman framework showing the puppet and five core drives" width={1152} height={1536} priority={priority} className="mx-auto h-auto max-h-[88svh] w-auto max-w-full rounded-lg object-contain" />
    </div>
  </figure>
);
