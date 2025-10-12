import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Metadata } from "next";
import Script from "next/script";
import Image from "next/image";

const insightsDir = path.join(process.cwd(), "src/content/insights");

export const metadata: Metadata = {
  title: "The Complete Guide to Your Inner Caveman",
  description:
    "Your Inner Caveman is ancient wiring shaping modern life. Understand its science and train your brain with Neurocient Labs’ behavioral frameworks.",
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
      "Your Inner Caveman is ancient wiring shaping modern life. Understand its science and train your brain with Neurocient Labs’ behavioral frameworks.",
    images: [
      {
        url: "https://neurocient.com/assets/inner-caveman-logo.png",
        width: 1200,
        height: 630,
        alt: "Neurocient Labs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Complete Guide to Your Inner Caveman",
    description:
      "Your Inner Caveman is ancient wiring shaping modern life. Understand its science and train your brain with Neurocient Labs’ behavioral frameworks.",
    images: ["https://neurocient.com/assets/inner-caveman-logo.png"],
  },
};

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
          text:
            "It's your ancient survival circuitry—fear, comfort, and social instincts—still running modern life. The Inner Caveman is not a flaw, but a foundation of human behavior.",
        },
      },
      {
        "@type": "Question",
        name: "Why does the Inner Caveman matter today?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Our brains evolved for small tribes and visible dangers, not for abstract modern stressors. Understanding the Inner Caveman helps us work with our instincts rather than against them.",
        },
      },
      {
        "@type": "Question",
        name: "How can I understand my Inner Caveman better?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "By observing emotional reactions, body sensations, and social patterns that arise under stress. Awareness of these ancient circuits is the first step toward integration.",
        },
      },
    ],
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "The Complete Guide to Your Inner Caveman",
    description:
      "Your Inner Caveman is ancient wiring shaping modern life. Understand its science and train your brain with Neurocient Labs’ behavioral frameworks.",
    author: {
      "@type": "Organization",
      name: "Neurocient Labs",
      url: "https://neurocient.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Neurocient Labs",
      logo: {
        "@type": "ImageObject",
        url: "https://neurocient.com/assets/inner-caveman-logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": "https://neurocient.com/inner-caveman",
    },
  };

  return (
    <main className="max-w-3xl mx-auto p-6 text-lg leading-relaxed font-serif text-brand-dark">

      <h1 className="text-4xl font-sans font-bold text-brand-accent mb-6">
        The Complete Guide to Your Inner Caveman
      </h1>
      <p className="italic text-xl text-brand-dark/80 mb-10">
        Understanding your ancient brain in a modern world.
      </p>

      <div className="my-8">
        <Image
          src="/assets/inner-caveman-logo.png"
          alt="Illustration of the Inner Caveman — representing the ancient survival brain navigating modern life"
          width={1200}
          height={630}
          className="rounded-xl shadow-md"
        />
      </div>

      <p className="mb-6">
        We inhabit an age of breathtaking complexity—machines that translate
        languages, algorithms that predict desire, devices that speak back when
        spoken to. Yet beneath the glass and glow, the most powerful system
        running your life is older than civilization itself. The{" "}
        <strong>Inner Caveman</strong>—your ancient survival brain—still hums
        beneath every email, argument, and ambition. It is the invisible hand on
        the steering wheel of modern behavior.
      </p>

      <p className="mb-6">
        For roughly two hundred thousand years, this neural machinery kept our
        ancestors alive. It learned to scan for threat, to seek comfort, to win
        belonging. But the environment that shaped it has vanished. We now live
        among abstractions—status, reputation, wealth, achievement—while
        carrying a biology built for immediacy. The result is a constant
        friction between Stone Age instincts and digital-age demands.
      </p>

      <h2 className="text-2xl font-sans font-semibold text-brand-secondary mt-12 mb-4">
        The Ancient Brain Still Running the Show
      </h2>

      <p className="mb-6">
        The <strong>Inner Caveman</strong> isn’t a symbol of ignorance or
        violence; it is a biological reality. Deep within the skull lies an
        exquisite survival network—the amygdala, limbic system, and prefrontal
        cortex—each performing ancient duties in a modern theater. The amygdala
        detects danger before you can name it. The limbic system records
        emotional memory and rewards you for patterns that once ensured food or
        friendship. The prefrontal cortex, the youngest region, tries to plan
        the future while the older circuits guard the past.
      </p>

      <p className="mb-6">
        These layers of brain architecture evolved for tribes of a hundred
        people, not for the eight billion strangers that now share the planet.
        They understood seasons, predators, and social hierarchies you could
        see and touch. Today they confront invisible currencies: deadlines,
        notifications, credit scores, metrics of worth. To your Inner Caveman, a
        delayed reply can feel like exile, a critical comment like a predator’s
        shadow.
      </p>

      <h2 className="text-2xl font-sans font-semibold text-brand-secondary mt-12 mb-4">
        The Evolutionary Mismatch
      </h2>

      <p className="mb-6">
        Scientists call this the <em>evolutionary mismatch</em>—ancient
        adaptations meeting modern abstractions. The caveman’s body was tuned to
        short bursts of stress followed by long recovery. Our world offers the
        opposite: perpetual alertness without closure. What once triggered a
        sprint now triggers insomnia. A rustle in the grass has become a
        vibration in your pocket, and the same hormones flood your bloodstream.
      </p>

      <p className="mb-6">
        Because your Inner Caveman can’t tell the difference between physical
        and psychological threat, it overreacts to both. It drives
        procrastination, perfectionism, and the endless scroll for validation.
        These are not flaws in character but features of survival logic playing
        out in the wrong century.
      </p>

      <h2 className="text-2xl font-sans font-semibold text-brand-secondary mt-12 mb-4">
        The Body’s Native Language
      </h2>

      <p className="mb-6">
        The Inner Caveman does not understand words. Its grammar is sensation. A
        racing pulse signals danger; a slow breath whispers safety. Warmth from
        another human means inclusion; silence feels like risk. This is why
        rational pep talks rarely change behavior. The nervous system demands
        proof, not argument. Until the body feels safe, the mind keeps producing
        stories to explain its unease.
      </p>

      <p className="mb-6">
        Every sigh, craving, and hesitation is data from this ancient operating
        system. To work with it, one must first learn to listen in its dialect
        of heartbeat, tension, and release. Awareness begins when you realize
        that emotion is not the enemy of reason but the soil from which reason
        grows.
      </p>

      <h2 className="text-2xl font-sans font-semibold text-brand-secondary mt-12 mb-4">
        The Inner Caveman at Work
      </h2>

      <p className="mb-6">
        In everyday life, the caveman moves quietly but decisively. The
        hesitation before sending a message, the surge of defensiveness in
        conflict, the restless pull toward your phone—all are echoes of
        ancestral logic. When you overeat after stress, your body remembers
        famine. When you avoid confrontation, it remembers that social harmony
        once guaranteed safety. Even the drive for achievement can be traced to
        a primitive calculus: visibility meant survival.
      </p>

      <p className="mb-6">
        Understanding this lineage dissolves shame. You are not weak; you are
        exquisitely tuned for a world that no longer exists. Recognizing that
        truth turns frustration into compassion—a necessary step if we hope to
        evolve consciously rather than react automatically.
      </p>

      <h2 className="text-2xl font-sans font-semibold text-brand-secondary mt-12 mb-4">
        Knowing Is Not Enough
      </h2>

      <p className="mb-6">
        Modern culture worships intellect, yet the <strong>Inner Caveman</strong>{" "}
        proves that insight alone rarely changes behavior. Under stress, blood
        flow shifts away from the prefrontal cortex—the rational seat of
        decision-making—toward older survival circuits. The mind that solves
        equations is literally disabled by fear. This is why willpower collapses
        at midnight in front of a fridge, why clarity in calm moments vanishes
        under pressure. The ancient brain seizes control the instant it senses
        threat, real or imagined.
      </p>

      <p className="mb-6">
        To bridge this gap between knowing and doing, we must teach the nervous
        system safety. Every calm exhale, every small act completed despite
        discomfort, is evidence for the caveman that the world has changed. Over
        time, repetition rewires expectation. That is how knowledge becomes
        embodiment.
      </p>

      <h2 className="text-2xl font-sans font-semibold text-brand-secondary mt-12 mb-4">
        The Social Animal
      </h2>

      <p className="mb-6">
        No instinct shapes us more than the need to belong. For the Inner
        Caveman, acceptance was life; isolation meant death. Our nervous systems
        still treat exclusion as a mortal wound. Neuroscience shows that social
        pain activates the same regions as physical pain. A harsh comment on a
        screen can ignite the same neural fire as a burn on the skin.
      </p>

      <p className="mb-6">
        We chase followers not for vanity but for ancient reassurance. We fear
        public speaking because ancestral memory equates judgment with expulsion
        from the tribe. To be human is to live with a social brain in a world
        too large for it to map.
      </p>

      <h2 className="text-2xl font-sans font-semibold text-brand-secondary mt-12 mb-4">
        Integrating the Ancient and the Modern
      </h2>

      <p className="mb-6">
        The goal is not to silence the Inner Caveman but to integrate it—to
        translate its fears into the language of the present. When you feel
        resistance, instead of declaring war on yourself, ask: what is my
        nervous system trying to protect? That simple question replaces judgment
        with curiosity. Curiosity, in turn, lowers threat perception, allowing
        the rational brain to return online.
      </p>

      <p className="mb-6">
        Integration is not a single revelation but a lifelong dialogue between
        instinct and intention. It begins when you stop treating emotion as
        interference and start treating it as information. In doing so, you
        evolve the caveman rather than exiling him.
      </p>

      <h2 className="text-2xl font-sans font-semibold text-brand-secondary mt-12 mb-4">
        Beyond Survival
      </h2>

      <p className="mb-6">
        For most of human history, survival was enough. Today, existence demands
        something subtler: meaning, connection, creativity. The same neural
        machinery that once feared predators now dreams, designs, and debates.
        The Inner Caveman has become the artist, the scientist, the lover—all
        using the same pulse that once guarded a campfire.
      </p>

      <p className="mb-6">
        To thrive in the modern world is to repurpose those ancient reflexes.
        Fear becomes focus; craving becomes curiosity; belonging expands from
        tribe to humanity. Evolution continues not through genes but through
        awareness.
      </p>

      <h2 className="text-2xl font-sans font-semibold text-brand-secondary mt-12 mb-4">
        The Quiet Revolution
      </h2>

      <p className="mb-6">
        Every small act of awareness is a step in human evolution. When you
        breathe instead of react, notice instead of judge, pause instead of
        post—you teach your Inner Caveman a new world. The change is microscopic
        yet monumental: the nervous system updates its map of safety. Over time,
        these moments accumulate into a new baseline of calm intelligence. This
        is the quiet revolution available to each of us—the movement from reflex
        to reflection, from survival to presence.
      </p>

      <h2 className="text-2xl font-sans font-semibold text-brand-secondary mt-12 mb-4">
        Returning Home
      </h2>

      <p className="mb-6">
        The Inner Caveman is not an enemy to overcome but a companion to
        understand. It has carried humanity through hunger, danger, and
        isolation. It beats your heart, alerts you to threat, and binds you to
        others. But it also fears too quickly, hungers too easily, and imagines
        threat in the space where only uncertainty lives.
      </p>

      <p className="mb-6">
        To know this creature within is to reconcile past and present—to live
        with ancient roots and modern branches. The work of evolution now
        happens in consciousness, one breath, one pause, one insight at a time.
      </p>

      <p className="mb-8">
        So when you feel the old pulse rise—the fear, the craving, the need for
        approval—pause. Smile, perhaps. That is your oldest self, still trying
        to keep you safe. Thank it. Then remind it: we made it out of the cave.
      </p>

      <section className="mt-20 pt-10 border-t border-gray-300">



        <p className="mb-6">
          <strong>Neurocient Labs</strong> is a behavioral science studio
          exploring the gap between how our brains evolved and how we live
          today. We translate research from neuroscience, psychology, and
          evolutionary biology into frameworks that make everyday behavior more
          understandable—and more humane.
        </p>


        <p className="mb-6">
          At Neurocient, we don’t believe in willpower revolutions or quick
          fixes. We believe in awareness, environment design, and
          micro-evolutions that let the ancient brain and modern life coexist in
          harmony. Every insight, every framework, is an experiment in aligning
          instinct with intention.
        </p>

        <p className="italic text-brand-dark/80">
          Neurocient Labs — bridging the gap between who we are wired to be and
          the world we live in today.
        </p>
      </section>

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
