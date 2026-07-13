import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Compass, Heart, ShieldCheck, Sparkles, Users } from "lucide-react";
import { SectionDecorations, SectionLabel } from "./LandingShared";

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
          <SectionLabel>Neurocient Labs introduces&hellip;</SectionLabel>
          <h2 className="text-[clamp(3.25rem,8vw,6.75rem)] font-bold leading-[0.88] tracking-[-0.055em] text-brand-dark">
            Meet Your <span className="italic text-brand-accent">Inner Caveman</span>
          </h2>
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
        <p className="max-w-4xl font-serif text-3xl font-bold leading-10 tracking-[-0.02em] text-brand-dark md:text-4xl md:leading-[1.15]">
          None of these drives are good or bad. They helped humans survive for
          thousands of years.
        </p>
        <p className="mt-8 max-w-3xl border-l-2 border-brand-primary/40 pl-5 md:text-lg md:leading-9">
          The challenge is that they are still responding to a modern world
          they were never designed for.
        </p>
        <div className="py-10 md:py-14">
          <p className="font-serif text-2xl leading-9 text-brand-dark md:max-w-5xl md:text-3xl md:leading-10">
            You cannot delete your Inner Caveman. But you can learn to
          </p>
          <div className="mt-7 grid gap-px overflow-hidden rounded-xl border border-brand-dark/15 bg-brand-dark/15 font-sans font-semibold text-brand-dark sm:grid-cols-3">
            <span className="bg-white/80 p-5">recognise when it is active,</span>
            <span className="bg-white/80 p-5">understand what it is trying to protect,</span>
            <span className="bg-white/80 p-5">and work with it.</span>
          </div>
        </div>
        <p className="relative max-w-5xl overflow-hidden rounded-2xl bg-brand-dark px-7 py-9 font-serif text-3xl font-bold leading-10 tracking-[-0.02em] text-white shadow-[0_24px_70px_-35px_rgba(4,42,43,0.75)] before:absolute before:-right-12 before:-top-20 before:h-52 before:w-52 before:rounded-full before:border before:border-white/10 md:px-12 md:py-12 md:text-4xl md:leading-[1.15]">
          You want MORE from your life. This is where it starts. By finally
          understanding what&apos;s underneath.
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
