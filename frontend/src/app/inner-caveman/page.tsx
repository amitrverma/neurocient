import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Compass,
  Heart,
  Headphones,
  Repeat2,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import Newsletter from "../components/Newsletter";

const innerCavemanAudioUrl =
  "https://neurocientblob.blob.core.windows.net/audio/inner-caveman.mp3?sp=r&st=2026-01-07T13:14:30Z&se=2029-01-07T21:29:30Z&spr=https&sv=2024-11-04&sr=b&sig=VBMEjoqZ06UnnDktbcRTOwyH%2BTdcq6QyHlpMWejuwc4%3D";
const orgId = "https://neurocient.com/#/org/neurocient-labs";

export const metadata: Metadata = {
  title: "The Complete Guide to Your Inner Caveman",
  description:
    "Your Inner Caveman is ancient wiring shaping modern life. Understand its science and train your brain with Neurocient Labs' behavioral frameworks.",
  keywords: [
    "inner caveman",
    "what is inner caveman",
    "neurocient inner caveman",
    "modern caveman",
    "survival brain",
    "work with your inner caveman",
    "inner caveman psychology",
    "inner caveman meaning",
  ],
  alternates: {
    canonical: "https://neurocient.com/inner-caveman",
  },
  openGraph: {
    type: "website",
    url: "https://neurocient.com/inner-caveman",
    siteName: "Neurocient Labs",
    title: "The Complete Guide to Your Inner Caveman",
    description:
      "Your Inner Caveman is ancient wiring shaping modern life. Understand its science and train your brain with Neurocient Labs' behavioral frameworks.",
    images: [
      {
        url: "https://neurocient.com/assets/inner-caveman-five-drives.png",
        width: 1200,
        height: 630,
        alt: "The Inner Caveman framework",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Complete Guide to Your Inner Caveman",
    description:
      "Your Inner Caveman is ancient wiring shaping modern life. Understand its science and train your brain with Neurocient Labs' behavioral frameworks.",
    images: ["https://neurocient.com/assets/inner-caveman-five-drives.png"],
  },
};

const drives = [
  {
    name: "Safety & Survival",
    question: "Is there danger?",
    oldLogic:
      "Notice threat early, conserve energy, avoid unnecessary exposure.",
    modernSignal:
      "Procrastination, overthinking, anxiety, defensiveness, and waiting to feel ready.",
    href: "/insights/evolutionary-lag",
    icon: ShieldCheck,
  },
  {
    name: "Affiliation & Belonging",
    question: "Am I still included?",
    oldLogic:
      "Stay close to the group because exclusion once carried real risk.",
    modernSignal:
      "People-pleasing, notification checking, conflict avoidance, and loneliness.",
    href: "/insights/connections",
    icon: Users,
  },
  {
    name: "Status & Hierarchy",
    question: "Where do I stand?",
    oldLogic:
      "Track rank because status shaped safety, resources, and influence.",
    modernSignal:
      "Comparison, performance anxiety, reputation management, and silence after being dismissed.",
    href: "/insights/why-we-compare",
    icon: Compass,
  },
  {
    name: "Kin Care",
    question: "Are my people okay?",
    oldLogic:
      "Protect the people whose survival was tied to yours.",
    modernSignal:
      "Caregiving load, guilt, responsibility spirals, and difficulty switching off.",
    href: "/insights/alloparenting",
    icon: Heart,
  },
  {
    name: "Mate & Bond Security",
    question: "Is this bond safe?",
    oldLogic:
      "Monitor attachment because close bonds shaped protection, continuity, and belonging.",
    modernSignal:
      "Jealousy, replayed arguments, reassurance seeking, and reading tiny shifts in tone.",
    href: "/insights/replay-arguments",
    icon: Sparkles,
  },
];

const mismatches = [
  {
    old: "A rustle in the grass",
    now: "A Slack ping, email preview, or unread message",
    pattern: "The body prepares before the mind has context.",
  },
  {
    old: "Visible rank inside a small group",
    now: "Global comparison feeds and performance metrics",
    pattern: "Status tracking becomes endless because the tribe never stops refreshing.",
  },
  {
    old: "Scarce calories and uncertain food",
    now: "Always-available snacks, delivery apps, and stress eating",
    pattern: "Craving feels urgent because opportunity once had an expiry date.",
  },
  {
    old: "Short bursts of danger with recovery",
    now: "Low-grade pressure without closure",
    pattern: "The stress system stays open because nothing clearly ends.",
  },
];

const bodySignals = [
  {
    signal: "A racing pulse",
    meaning: "The body is preparing for threat before the mind has finished interpreting the situation.",
  },
  {
    signal: "A craving",
    meaning: "The old system has detected quick relief, quick energy, or quick reassurance.",
  },
  {
    signal: "A hesitation",
    meaning: "Some part of the next step feels exposed, costly, unclear, or socially unsafe.",
  },
  {
    signal: "A defensive story",
    meaning: "The mind may be explaining an alarm that began underneath language.",
  },
];

const responseSteps = [
  {
    title: "Name the signal",
    text: "Before fixing the behavior, identify what the caveman is trying to protect: safety, status, belonging, energy, or attachment.",
  },
  {
    title: "Lower the threat",
    text: "The nervous system responds to evidence, not lectures. Make the next action smaller, clearer, and less socially costly.",
  },
  {
    title: "Design the environment",
    text: "Do not rely on willpower alone. Change defaults, cues, friction, timing, and social context so the useful action becomes easier.",
  },
  {
    title: "Repeat the update",
    text: "Every small completed action teaches the ancient system that this modern situation is survivable.",
  },
];

const pathways = [
  {
    label: "Free diagnostic",
    title: "Take the Inner Caveman Scan",
    text: "See which patterns show up in your everyday choices: avoidance, comparison, distraction, conflict, and habits.",
    href: "/diagnostics/caveman-scan",
    cta: "Start the scan",
  },
  {
    label: "Tools",
    title: "Practice with daily tools",
    text: "Use spots, microchallenges, nudges, and reflections to turn this lens into small repeatable actions.",
    href: "/tools",
    cta: "Open tools",
  },
  {
    label: "Essays",
    title: "Read the pattern library",
    text: "Short, grounded essays that explain how ancient wiring appears in modern work, relationships, health, and attention.",
    href: "/insights",
    cta: "Browse insights",
  },
];

export default function InnerCavemanPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is the Inner Caveman?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The Inner Caveman is Neurocient Labs' shorthand for ancient survival patterns that still shape modern behavior: safety, belonging, status, care, attachment, energy conservation, and threat detection.",
        },
      },
      {
        "@type": "Question",
        name: "Is the Inner Caveman a literal old brain?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. It is a practical metaphor for evolved response patterns, not a claim that the brain is split into simple primitive and modern layers.",
        },
      },
      {
        "@type": "Question",
        name: "How do I work with my Inner Caveman?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Start by naming the signal, lowering perceived threat, changing the environment, and repeating small actions that teach the nervous system a new expectation.",
        },
      },
    ],
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "The Complete Guide to Your Inner Caveman",
    description:
      "Your Inner Caveman is ancient wiring shaping modern life. Understand its science and train your brain with Neurocient Labs' behavioral frameworks.",
    author: {
      "@type": "Organization",
      "@id": orgId,
      name: "Neurocient Labs",
      url: "https://neurocient.com",
    },
    publisher: {
      "@type": "Organization",
      "@id": orgId,
      name: "Neurocient Labs",
      logo: {
        "@type": "ImageObject",
        url: "https://neurocient.com/assets/inner-caveman-logo.png",
      },
    },
    audio: {
      "@type": "AudioObject",
      contentUrl: innerCavemanAudioUrl,
      encodingFormat: "audio/mpeg",
      duration: "PT12M",
      name: "The Complete Guide to Your Inner Caveman audio conversation",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": "https://neurocient.com/inner-caveman",
    },
  };

  return (
    <main className="bg-white font-serif text-brand-dark">
      <section className="border-b border-brand-dark/10 px-6 py-14 md:py-20">
        <div className="mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <SectionLabel>Complete guide</SectionLabel>
            <h1 className="text-[clamp(3rem,6.6vw,6.35rem)] font-bold leading-[0.96] tracking-[-0.035em] text-brand-dark">
              Meet your
              <br />
              <span className="italic text-brand-accent">Inner Caveman.</span>
            </h1>
            <p className="mt-7 max-w-2xl border-l-4 border-brand-secondary pl-5 font-sans text-lg leading-8 text-brand-dark md:text-xl md:leading-9">
              The brain system that reacts before you reason: fast,
              protective, and shaped for survival in a very different world.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#audio"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-dark/25 px-6 py-3 font-sans text-sm font-semibold text-brand-dark transition hover:border-brand-primary hover:text-brand-primary"
              >
                Listen instead
                <Headphones className="h-4 w-4" />
              </a>
            </div>
          </div>

          <figure className="mx-auto w-full max-w-lg">
            <div className="overflow-hidden rounded-lg border border-brand-teal/25 bg-white p-2 shadow-sm">
              <Image
                src="/assets/inner-caveman-five-drives.png"
                alt="The Inner Caveman framework showing the five core drives"
                width={1152}
                height={1536}
                priority
                className="h-auto w-full rounded-md"
              />
            </div>
          </figure>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-14 md:grid-cols-[0.78fr_1.22fr] md:items-start md:py-20">
        <div>
          <SectionLabel>Definition</SectionLabel>
          <h2 className="text-[clamp(2.4rem,4.6vw,4.85rem)] font-bold leading-[0.96] tracking-[-0.03em] text-brand-dark">
            It is not a villain.
            <br />
            It is a protector with old data.
          </h2>
        </div>

        <div className="space-y-5 font-sans text-base leading-8 text-brand-dark">
          <p>
            The Inner Caveman is a shorthand for the evolved patterns still
            active inside modern behavior. It is not a literal anatomical
            &quot;old brain,&quot; and it is not an insult. It is a way to name
            the fast, protective system that scans for danger, belonging,
            rank, scarcity, and social safety.
          </p>
          <p>
            This system helped humans survive small groups, uncertainty,
            hunger, exposure, and conflict. Today, it responds to deadlines,
            unread messages, public criticism, comparison feeds, ambiguity, and
            emotional distance.
          </p>
          <p className="border-l-4 border-brand-secondary pl-5 text-xl font-semibold leading-9 text-brand-dark">
            The problem is not that you have ancient wiring. The problem is that
            modern life keeps pressing its ancient buttons.
          </p>
        </div>
      </section>

      <section className="border-y border-brand-dark/10 px-6 py-14 md:py-16">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.78fr_1.22fr] md:items-start">
          <div>
            <SectionLabel>The body's language</SectionLabel>
            <h2 className="text-3xl font-bold leading-tight tracking-[-0.02em] text-brand-dark md:text-5xl">
              The caveman does not speak in arguments.
              <br />
              It speaks in signals.
            </h2>
          </div>

          <div>
            <p className="max-w-3xl font-sans text-base leading-8 text-brand-dark">
              This is why rational pep talks often fail. The nervous system is
              not waiting for a better paragraph. It is looking for proof of
              safety. Until the body feels safe enough, the mind keeps producing
              stories to explain the alarm.
            </p>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {bodySignals.map((item) => (
                <article
                  key={item.signal}
                  className="rounded-lg border border-brand-dark/12 bg-white p-5 shadow-sm"
                >
                  <h3 className="font-sans text-sm font-semibold text-brand-accent">
                    {item.signal}
                  </h3>
                  <p className="mt-2 font-sans text-sm leading-7 text-brand-dark/72">
                    {item.meaning}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="audio" className="bg-brand-dark px-6 py-14 text-white md:py-16">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.78fr_1.22fr] md:items-start">
          <div>
            <SectionLabel tone="dark">Conversation version</SectionLabel>
            <h2 className="text-3xl font-bold leading-tight tracking-[-0.02em] md:text-5xl">
              Prefer to hear the idea unfold?
            </h2>
          </div>

          <div className="rounded-lg border border-white/18 bg-white p-6 text-brand-dark shadow-sm md:p-7">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-brand-teal/45 text-brand-accent">
                <Headphones className="h-5 w-5" />
              </span>
              <div className="w-full">
                <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
                  12-minute audio
                </p>
                <h3 className="mt-2 text-2xl font-bold leading-tight text-brand-dark">
                  The Complete Guide to Your Inner Caveman
                </h3>
                <p className="mt-3 font-sans text-sm leading-7 text-brand-dark/72">
                  A slower conversation for the core idea: why ancient
                  protective patterns still shape modern choices.
                </p>
                <audio
                  controls
                  preload="metadata"
                  playsInline
                  className="mt-5 w-full"
                  controlsList="nodownload"
                >
                  <source src={innerCavemanAudioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-brand-dark/10 px-6 py-14 md:py-16">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.78fr_1.22fr] md:items-start">
          <div>
            <SectionLabel>Knowing is not enough</SectionLabel>
            <h2 className="text-3xl font-bold leading-tight tracking-[-0.02em] text-brand-dark md:text-5xl">
              Insight explains the pattern.
              <br />
              Safety changes it.
            </h2>
          </div>

          <div className="space-y-5 font-sans text-base leading-8 text-brand-dark">
            <p>
              Modern culture loves the idea that if you understand something,
              you should be able to change it. But under pressure, the body
              often moves before the insight can help. Fear narrows attention.
              Stress pulls energy toward older protective responses. The part of
              you that can plan, reflect, and choose may simply arrive late.
            </p>
            <p>
              This is why the work cannot be only intellectual. Every calm
              exhale, every smaller first step, every completed action under
              mild discomfort becomes evidence. The caveman learns through
              repeated proof that the modern situation is survivable.
            </p>
            <p className="border-l-4 border-brand-secondary pl-5 text-xl font-semibold leading-9 text-brand-dark">
              Knowledge becomes useful when the nervous system has enough safety
              to act on it.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-14 md:py-20">
        <SectionLabel>The five drives</SectionLabel>
        <div className="grid gap-8 md:grid-cols-[0.7fr_1fr] md:items-start">
          <h2 className="text-[clamp(2.5rem,4.8vw,5rem)] font-bold leading-[0.96] tracking-[-0.03em] text-brand-dark">
            What is it
            <br />
            trying to protect?
          </h2>
          <p className="font-sans text-base leading-8 text-brand-dark">
            Most reactions make more sense when you ask which ancient drive is
            active. The same moment can involve several drives, but one usually
            speaks loudest.
          </p>
        </div>

        <div className="mt-10 border-y border-brand-dark/12">
          {drives.map((drive) => {
            const Icon = drive.icon;
            return (
              <Link
                key={drive.name}
                href={drive.href}
                className="group grid gap-5 border-b border-brand-dark/12 py-6 transition last:border-b-0 md:grid-cols-[0.65fr_1fr_auto] md:items-center"
              >
                <div className="flex gap-4">
                  <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-teal/35 text-brand-accent">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">
                      {drive.question}
                    </p>
                    <h3 className="mt-2 text-2xl font-bold leading-tight text-brand-dark">
                      {drive.name}
                    </h3>
                  </div>
                </div>
                <div className="grid gap-3 font-sans text-sm leading-7 text-brand-dark/72 md:grid-cols-2">
                  <p>
                    <strong className="text-brand-dark">Old logic:</strong>{" "}
                    {drive.oldLogic}
                  </p>
                  <p>
                    <strong className="text-brand-dark">Modern signal:</strong>{" "}
                    {drive.modernSignal}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-brand-accent transition group-hover:translate-x-0.5" />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="bg-brand-dark px-6 py-16 text-white md:py-20">
        <div className="mx-auto max-w-6xl">
          <SectionLabel tone="dark">The mismatch</SectionLabel>
          <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
            <h2 className="text-3xl font-bold leading-tight tracking-[-0.02em] md:text-5xl">
              Same wiring.
              <br />
              Different world.
            </h2>
            <div className="grid gap-4">
              {mismatches.map((item) => (
                <article
                  key={item.old}
                  className="rounded-lg border border-white/16 bg-white p-5 text-brand-dark md:p-6"
                >
                  <div className="grid gap-4 md:grid-cols-[0.7fr_0.7fr_1fr]">
                    <div>
                      <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">
                        Then
                      </p>
                      <p className="mt-2 font-sans text-sm font-semibold leading-6">
                        {item.old}
                      </p>
                    </div>
                    <div>
                      <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
                        Now
                      </p>
                      <p className="mt-2 font-sans text-sm font-semibold leading-6">
                        {item.now}
                      </p>
                    </div>
                    <p className="font-sans text-sm leading-7 text-brand-dark/72">
                      {item.pattern}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-14 md:py-20">
        <SectionLabel>How to work with it</SectionLabel>
        <div className="grid gap-8 md:grid-cols-[0.78fr_1.22fr] md:items-start">
          <div>
            <h2 className="text-[clamp(2.5rem,4.6vw,4.85rem)] font-bold leading-[0.96] tracking-[-0.03em] text-brand-dark">
              Do not fight the caveman.
              <br />
              Update the map.
            </h2>
            <p className="mt-6 max-w-xl font-sans text-base leading-8 text-brand-dark">
              Insight matters, but under pressure the body asks a simpler
              question: is this safe enough to try?
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {responseSteps.map((step, index) => (
              <article
                key={step.title}
                className="rounded-lg border border-brand-dark/12 bg-white p-5 shadow-sm"
              >
                <span className="font-serif text-3xl font-bold text-brand-primary">
                  {index + 1}
                </span>
                <h3 className="mt-3 font-sans text-sm font-semibold text-brand-dark">
                  {step.title}
                </h3>
                <p className="mt-2 font-sans text-sm leading-7 text-brand-dark/72">
                  {step.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-14 md:py-16">
        <div className="grid gap-8 md:grid-cols-[0.78fr_1.22fr] md:items-start">
          <div>
            <SectionLabel>Where to go next</SectionLabel>
            <h2 className="text-3xl font-bold leading-tight text-brand-dark md:text-4xl">
              Make the idea useful.
            </h2>
          </div>
          <div className="grid gap-4">
            {pathways.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group grid gap-4 rounded-lg border border-brand-dark/12 bg-white p-5 shadow-sm transition hover:border-brand-teal/60 hover:shadow-md md:grid-cols-[0.62fr_1fr_auto] md:items-center"
              >
                <div>
                  <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">
                    {item.label}
                  </p>
                  <h3 className="mt-2 text-2xl font-bold leading-tight text-brand-dark">
                    {item.title}
                  </h3>
                </div>
                <p className="font-sans text-sm leading-7 text-brand-dark/72">
                  {item.text}
                </p>
                <span className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-brand-accent">
                  <span className="hidden xl:inline">{item.cta}</span>
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-brand-dark/10 px-6 py-14 md:py-16">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[0.78fr_1.22fr] md:items-start">
          <div>
            <SectionLabel>Core reminder</SectionLabel>
            <h2 className="text-3xl font-bold leading-tight text-brand-dark md:text-4xl">
              The goal is not exile.
              <br />
              It is translation.
            </h2>
          </div>
          <div className="space-y-5 border-l-4 border-brand-secondary pl-5">
            <div className="flex gap-4">
              <Repeat2 className="mt-1 h-6 w-6 shrink-0 text-brand-accent" />
              <p className="font-sans text-lg leading-9 text-brand-dark">
                The work is learning to notice a little earlier, reduce threat a
                little faster, and choose the next useful action before the old
                pattern becomes the whole story.
              </p>
            </div>
            <p className="font-sans text-base leading-8 text-brand-dark/78">
              So when the old pulse rises — the fear, the craving, the need for
              approval — pause. That is your oldest self still trying to keep
              you safe. Thank it. Then remind it: the world has changed, and you
              can choose from here.
            </p>
          </div>
        </div>
      </section>

      <Newsletter
        variant="feature"
        subtext="Join thousands of readers getting weekly insights on the ancient wiring behind modern struggles and practical ways to work with it. No fluff. No gimmicks. Just science made human."
        logoSrc="/logo/newsletter.png"
      />

      <Script
        id="inner-caveman-faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Script
        id="inner-caveman-article-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
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
