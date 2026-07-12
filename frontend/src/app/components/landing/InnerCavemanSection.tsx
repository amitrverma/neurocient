import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Compass, Heart, ShieldCheck, Sparkles, Users } from "lucide-react";
import { SectionLabel } from "./LandingShared";

const drives = [
  {
    name: "Affiliation & Belonging",
    question: "Am I included?",
    modern: "Notifications, social media, loneliness, team silence.",
    href: "/insights/connections",
    icon: Users,
  },
  {
    name: "Kin Care",
    question: "Are my people okay?",
    modern: "Caregiving, provision, responsibility, emotional load.",
    href: "/insights/alloparenting",
    icon: Heart,
  },
  {
    name: "Status & Hierarchy",
    question: "Where do I stand?",
    modern: "Performance reviews, comparison, reputation, visibility.",
    href: "/insights/why-we-compare",
    icon: Compass,
  },
  {
    name: "Mate Acquisition & Retention",
    question: "Is this bond secure?",
    modern: "Attachment, ambiguity, jealousy, replaying arguments.",
    href: "/insights/replay-arguments",
    icon: Sparkles,
  },
  {
    name: "Safety & Survival",
    question: "Am I safe enough?",
    modern: "Deadlines, uncertainty, anxiety, avoidance, overreactions.",
    href: "/insights/anticipatory-anxiety",
    icon: ShieldCheck,
  },
];
export default function InnerCavemanSection() {
  return (
      <section className="relative overflow-hidden bg-white px-6 py-20 md:py-28">
        <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <SectionLabel>Neurocient Labs introduces…</SectionLabel>
            <h2 className="text-[clamp(3rem,5.2vw,5.5rem)] font-bold leading-[0.95] tracking-[-0.04em] text-brand-dark">
              Meet Your <span className="italic text-brand-accent">Inner Caveman</span>
            </h2>
            <p className="mt-8 font-sans text-lg leading-9 text-brand-dark/75">
              The brain system that reacts before you reason: fast, protective,
              and shaped for survival in a very different world.
            </p>
            <p className="mt-5 font-sans text-base leading-8 text-brand-dark/75">
              It&rsquo;s not a villain. It is not something you need to get rid of.
              It is simply trying to keep you safe the only way it knows how.
            </p>
            <p className="mt-5 font-sans text-base leading-8 text-brand-dark/75">
              The patterns you recognised earlier&mdash;waiting to feel ready,
              escaping into the scroll, comparing yourself with others,
              constant pressure, worries that never leave, guilt, and rest that
              doesn&apos;t restore&mdash;are often different ways your Inner Caveman
              responds when it believes one of its core survival needs is under
              threat.
            </p>
            <p className="mt-5 border-l-4 border-brand-secondary pl-5 font-sans text-lg font-semibold leading-8 text-brand-dark">
              Those survival needs usually fall into five core drives.
            </p>
          </div>

          <CavemanImage />
        </div>

        <div className="relative z-10 mx-auto mt-16 max-w-6xl border-y border-brand-dark/15">
          {drives.map((drive) => {
            const Icon = drive.icon;

            return (
              <Link
                key={drive.name}
                href={drive.href}
                className="group relative grid gap-4 border-b border-brand-dark/12 bg-white py-7 last:border-b-0 md:grid-cols-[1fr_1fr_auto] md:items-center md:gap-8"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 shrink-0 text-brand-accent" />
                    <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.12em] text-brand-dark/65">
                      {drive.name}
                    </h3>
                  </div>
                  <p className="mt-2 font-serif text-2xl font-bold italic leading-8 text-brand-dark transition group-hover:text-brand-accent md:text-3xl">
                    {drive.question}
                  </p>
                </div>
                <p className="border-l-2 border-brand-secondary/50 pl-4 font-sans text-sm leading-6 text-brand-dark/70 md:text-base md:leading-7">
                  {drive.modern}
                </p>
                <ArrowRight className="h-5 w-5 text-brand-teal transition-transform group-hover:translate-x-1 group-hover:text-brand-primary" aria-hidden="true" />
              </Link>
            );
          })}
        </div>

        <div className="relative z-10 mx-auto mt-14 grid max-w-6xl gap-8 pt-10 font-sans text-base leading-8 text-brand-dark/75 md:grid-cols-2 md:gap-12">
          <p className="border-l-4 border-brand-secondary pl-5 font-serif text-2xl font-bold leading-9 text-brand-dark md:text-3xl md:leading-10">
            None of these drives are good or bad. They helped humans survive for
            thousands of years.
          </p>
          <p className="border-t-2 border-brand-primary/35 pt-5 md:text-lg md:leading-9">
            The challenge is that they are still responding to a modern world
            they were never designed for.
          </p>
          <div className="py-8 md:col-span-2 md:py-10">
            <p className="font-serif text-2xl leading-9 text-brand-dark md:max-w-5xl md:text-3xl md:leading-10">
              You cannot delete your Inner Caveman. But you can learn to
            </p>
            <div className="mt-6 grid gap-3 font-sans font-semibold text-brand-dark sm:grid-cols-3">
              <span className="border-l-2 border-brand-teal pl-4">recognise when it is active,</span>
              <span className="border-l-2 border-brand-secondary pl-4">understand what it is trying to protect,</span>
              <span className="border-l-2 border-brand-primary pl-4">and work with it.</span>
            </div>
          </div>
          <p className="bg-brand-dark px-6 py-7 font-serif text-2xl font-bold leading-9 text-white md:col-span-2 md:max-w-5xl md:px-9 md:py-9 md:text-3xl md:leading-10">
            You want MORE from your life. This is where it starts. By finally
            understanding what&apos;s underneath.
          </p>
        </div>
      </section>
  );
}

const CavemanImage = ({ priority = false }: { priority?: boolean }) => (
  <figure className="mx-auto w-full max-w-lg">
    <div className="overflow-hidden rounded-lg border border-brand-teal/25 bg-white p-2 shadow-sm">
      <Image src="/assets/inner-caveman-five-drives.png" alt="The Inner Caveman framework showing the puppet and five core drives" width={1152} height={1536} priority={priority} className="h-auto w-full rounded-md" />
    </div>
  </figure>
);
