import Image from "next/image";
import Link from "next/link";
import { Compass, Heart, ShieldCheck, Sparkles, Users } from "lucide-react";
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
      <section className="bg-white px-6 py-20 md:py-28">
        <div className="mx-auto grid w-full max-w-6xl gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <SectionLabel>Neurocient Labs introduces…</SectionLabel>
            <h2 className="text-[clamp(3.25rem,5.5vw,6rem)] font-bold leading-[0.96] tracking-[-0.04em] text-brand-dark">
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

        <div className="mx-auto mt-16 grid max-w-6xl content-start gap-px overflow-hidden rounded-lg border border-brand-dark/12 bg-brand-dark/12 sm:grid-cols-2 lg:grid-cols-3">
          {drives.map((drive) => {
            const Icon = drive.icon;

            return (
              <Link
                key={drive.name}
                href={drive.href}
                className="group bg-white px-6 py-6 transition duration-300 hover:-translate-y-0.5 hover:bg-brand-dark hover:text-white"
              >
                <div className="flex items-start gap-3">
                  <Icon className="mt-1 h-5 w-5 shrink-0 text-brand-accent transition group-hover:text-brand-secondary" />
                  <div>
                    <h3 className="font-sans text-sm font-semibold text-brand-dark transition group-hover:text-white">
                      {drive.name}
                    </h3>
                    <p className="mt-2 text-xl italic leading-7 text-brand-dark transition group-hover:text-brand-secondary">
                      {drive.question}
                    </p>
                    <p className="mt-3 font-sans text-sm leading-6 text-brand-dark/70 transition group-hover:text-white/65">
                      {drive.modern}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mx-auto mt-14 grid max-w-6xl gap-6 border-t border-brand-dark/15 pt-10 font-sans text-base leading-8 text-brand-dark/75 md:grid-cols-2">
          <p className="font-serif text-2xl leading-9 text-brand-dark">
            None of these drives are good or bad. They helped humans survive for
            thousands of years.
          </p>
          <p>
            The challenge is that they are still responding to a modern world
            they were never designed for.
          </p>
          <p>
            You cannot delete your Inner Caveman. But you can learn to recognise
            when it is active, understand what it is trying to protect, and work
            with it
          </p>
          <p className="font-semibold text-brand-dark">
            You want MORE from your ONE life. This is where it starts. By finally
            understanding what&apos;s underneath.
          </p>
          <p className="border-l-4 border-brand-secondary pl-5 font-serif text-3xl font-bold leading-tight text-brand-dark md:col-span-2 md:text-5xl">The first step is seeing it in yourself.</p>
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
