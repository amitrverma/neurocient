"use client";

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 text-lg leading-relaxed font-serif text-brand-dark">
      <h1 className="text-4xl font-sans font-bold text-brand-accent mb-4">
        About Neurocient Labs
      </h1>
      <p className="italic text-xl text-brand-dark/80 mb-8">
        Mastering the science of human behavior, without fighting human nature.
      </p>

      <p className="mb-6">
        For over two decades, I built a career in technology—leading engineering
        teams and architecting complex platforms. While I found it rewarding, I
        learned a critical lesson: the hardest problems aren’t technical—they’re
        human.
      </p>

      <p className="mb-6">
        I saw this everywhere: in myself, in my colleagues at work, and in the
        daily struggles of personal life. From unfinished health goals to
        fractured focus, the same pattern kept surfacing. The culprit, I
        discovered, isn’t a lack of willpower or discipline. Our brains weren’t
        built for calendars, notifications, or infinite choice. They were tuned
        for survival in small tribes and dangerous landscapes. In other words,
        we’re running modern lives on an{" "}
        <span className="font-semibold text-brand-accent">
          ancient operating system
        </span>
        .
      </p>

      <p className="mb-6">
        This realization launched my journey from technology into the worlds of
        neuroscience, cognitive psychology, and evolutionary biology. I immersed
        myself in research, consulted with leading scientists, and became my own
        first test subject—experimenting with not just mental models, but also
        the everyday rhythms of holistic fitness: sleep, movement, nutrition,
        and recovery. Over time, I uncovered not just quick fixes, but the
        deeper principles that truly govern human behavior.
      </p>

      <p className="mb-6">
        Neurocient Labs is the product of that quest. We are not a consultancy
        or a traditional coaching practice. We are a behavioral design lab—
        experimenting, prototyping, and refining ways to make human nature an
        ally rather than an obstacle.
      </p>

      <p className="mb-8">
        That’s what this site is built for: a place to explore resources,
        insights, and tools so you can stop fighting your caveman brain and
        start working with it. Out of this work have grown initiatives like{" "}
        <em>The Modern Caveman</em> (personal transformation),{" "}
        <em>Caveman in the Cubicle</em> (workplace and leadership), and{" "}
        <em>Mind the Gap!</em> (weekly insights). Each is a different doorway
        into the same mission: translating science into strategies you can
        actually live.
      </p>

      <h2 className="text-2xl font-sans font-semibold text-brand-secondary mb-4">
        The Human Side
      </h2>
      <p className="mb-6">
        Beyond the lab, I'm a parent, a holistic fitness enthusiast, and an
        insatiable reader. Parenting has been my most profound lesson in raw
        human nature. Fitness keeps me grounded in the signals of my
        body—strength, energy, recovery—and reminds me that sustainable progress
        comes from alignment, not force. Reading fuels an endless curiosity
        about the world. Every facet of life informs this work, all centered on
        a single question:{" "}
        <span className="font-semibold text-brand-accent">
          What does it truly mean to be human in the 21st century?
        </span>
      </p>

      <p className="mb-8">
        You can also find me on{" "}
        <a
          href="https://linkedin.com/in/amit-verma"
          target="_blank"
          className="text-brand-accent underline hover:text-brand-secondary"
        >
          LinkedIn
        </a>
        ,{" "}
        <a
          href="https://x.com"
          target="_blank"
          className="text-brand-accent underline hover:text-brand-secondary"
        >
          X
        </a>
        , and{" "}
        <a
          href="https://neurocient.com"
          target="_blank"
          className="text-brand-accent underline hover:text-brand-secondary"
        >
          neurocient.com
        </a>
        .
      </p>

      <hr className="my-10 border-t-2 border-brand-dark/30" />

      <h2 className="text-2xl font-sans font-semibold text-brand-secondary mb-4">
        The Boring (but Important) Stuff
      </h2>
      <p>
        <strong>Copyright:</strong> © 2025 Neurocient Labs. All rights reserved.
      </p>
      <p>
        <strong>Legal Disclaimer:</strong> The content shared on this site
        represents only my personal views and the work of Neurocient Labs. It is
        intended for learning, reflection, and entertainment, not as medical,
        psychological, or financial advice. Please use your own judgment before
        making decisions based on what you read here.
      </p>
      <p>
        <a href="/privacy" className="text-brand-accent underline">
          Privacy Policy
        </a>{" "}
        — We respect your privacy. We do not, and will not, sell your
        information.
      </p>
      <p>
        <a href="/terms" className="text-brand-accent underline">
          Terms of Service
        </a>{" "}
        — By continuing to access this website, newsletter, or related tools,
        you accept our Terms of Service.
      </p>
    </div>
  );
}
