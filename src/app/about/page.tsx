import Link from "next/link";
import { ArrowRight, Instagram, Linkedin, Youtube } from "lucide-react";
import type { ReactNode } from "react";

const doorways = [
  {
    title: "The Modern Caveman",
    label: "Personal transformation",
    text: "A guided way to understand your wiring, identify dominant patterns, and build habits that work with your biology.",
    href: "/modern-caveman",
  },
  {
    title: "Caveman in the Cubicle",
    label: "Workplace behavior",
    text: "The Inner Caveman lens applied to procrastination, perfectionism, status, politics, leadership, and team dynamics.",
    href: "/caveman-cubicle",
  },
  {
    title: "Mind the Gap!",
    label: "Weekly insights",
    text: "Short, practical essays on the ancient wiring behind everyday modern struggles.",
    href: "/insights",
  },
];

export default function AboutPage() {
  return (
    <main className="bg-white font-serif text-brand-dark">
      <section className="border-b border-brand-dark/10 px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto w-full max-w-6xl">
          <div className="max-w-5xl">
            <div className="mb-7 flex items-center gap-3 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal">
              <span className="h-px w-12 bg-brand-dark" />
              <span>About Neurocient Labs</span>
            </div>

            <h1 className="text-[clamp(3rem,6.5vw,6.25rem)] font-bold leading-[1.01] text-brand-dark">
              The hardest problems
              <br />
              are rarely technical.
              <br />
              <span className="italic text-brand-accent">They are human.</span>
            </h1>

            <p className="mt-8 max-w-3xl border-l-4 border-brand-secondary pl-5 font-sans text-lg leading-8 text-brand-dark md:text-xl md:leading-9">
              Neurocient Labs explores the ancient wiring behind modern
              behavior, then turns that understanding into practical ways to
              live, work, and change.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-14 md:py-20">
        <SectionLabel>Origin story</SectionLabel>

        <div className="grid gap-10 md:grid-cols-[0.74fr_1fr] md:items-start">
          <div>
            <h2 className="text-[clamp(2.6rem,4.5vw,4.8rem)] font-bold leading-[0.96] tracking-[-0.03em] text-brand-dark">
              From complex systems
              <br />
              to human systems.
            </h2>
          </div>

          <div className="space-y-5 font-sans text-base leading-8 text-brand-dark">
            <p>
              For over two decades, I built a career in technology, leading
              engineering teams and architecting complex platforms. While I
              found it rewarding, I learned a critical lesson: the hardest
              problems are not technical. They are human.
            </p>
            <p>
              I saw this everywhere: in myself, in colleagues at work, and in
              the daily struggles of personal life. From unfinished health goals
              to fractured focus, the same pattern kept surfacing.
            </p>
            <p>
              The culprit, I discovered, is not a lack of willpower or
              discipline. Our brains were not built for calendars,
              notifications, or infinite choice. They were tuned for survival in
              small tribes and dangerous landscapes.
            </p>
            <p className="border-l-4 border-brand-secondary pl-5 text-xl leading-9 text-brand-dark">
              In other words, we are running modern lives on an{" "}
              <strong className="font-semibold text-brand-accent">
                ancient operating system
              </strong>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="bg-brand-dark px-6 py-16 text-white md:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionLabel tone="dark">What changed</SectionLabel>
          <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-start">
            <h2 className="max-w-2xl text-3xl font-bold leading-tight tracking-[-0.02em] md:text-5xl">
              Not another way to fight yourself.
            </h2>

            <div className="space-y-5 font-sans text-base leading-8 text-white/72">
              <p>
                That realization launched my journey from technology into
                neuroscience, cognitive psychology, and evolutionary biology. I
                immersed myself in research, consulted with leading scientists,
                and became my own first test subject.
              </p>
              <p>
                I experimented not just with mental models, but also with the
                everyday rhythms of holistic fitness: sleep, movement,
                nutrition, and recovery.
              </p>
              <p className="border-l-4 border-brand-secondary pl-5 text-xl leading-9 text-white/92">
                Over time, I uncovered not just quick fixes, but the deeper
                principles that govern human behavior.
              </p>
              <p>
                Neurocient Labs is the product of that quest. It is not a
                consultancy or a traditional coaching practice. It is a
                behavioral design lab: experimenting, prototyping, and refining
                ways to make human nature an ally rather than an obstacle.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-14 md:py-20">
        <SectionLabel>The mission</SectionLabel>

        <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <div>
            <h2 className="text-[clamp(2.5rem,4.5vw,4.7rem)] font-bold leading-[0.96] tracking-[-0.03em] text-brand-dark">
              Different doorways.
              <br />
              Same work.
            </h2>
            <p className="mt-6 max-w-xl font-sans text-base leading-8 text-brand-dark">
              This site is built as a place to explore resources, insights, and
              tools so you can stop fighting your caveman brain and start
              working with it.
            </p>
          </div>

          <div className="border-y border-brand-dark/12">
            {doorways.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group grid cursor-pointer gap-4 border-b border-brand-dark/12 py-6 transition last:border-b-0 md:grid-cols-[0.72fr_1fr_auto] md:items-center"
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
                <ArrowRight className="h-5 w-5 text-brand-accent transition group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-brand-dark/10 px-6 py-14 md:py-16">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.7fr_1fr] md:items-start">
          <div>
            <SectionLabel>The human side</SectionLabel>
            <h2 className="text-3xl font-bold leading-tight tracking-[-0.02em] text-brand-dark md:text-4xl">
              The work is personal before it is professional.
            </h2>
          </div>

          <div className="space-y-5 font-sans text-base leading-8 text-brand-dark">
            <p>
              Beyond the lab, I am a parent, a holistic fitness enthusiast, and
              an insatiable reader. Parenting has been my most profound lesson
              in raw human nature. Fitness keeps me grounded in the signals of
              the body: strength, energy, recovery.
            </p>
            <p>
              Reading fuels an endless curiosity about the world. Every facet
              of life informs this work, all centered on a single question:
            </p>
            <p className="border-l-4 border-brand-secondary pl-5 text-2xl font-bold leading-9 text-brand-dark">
              What does it truly mean to be human in the 21st century?
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-14 md:grid-cols-[0.78fr_1.22fr] md:items-start md:py-16">
        <div>
          <SectionLabel>Connect</SectionLabel>
          <h2 className="text-3xl font-bold leading-tight text-brand-dark md:text-4xl">
            Follow the work.
          </h2>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <ExternalLink href="https://www.linkedin.com/in/amitrverma/">
            <Linkedin className="h-4 w-4" />
            LinkedIn
          </ExternalLink>
          <ExternalLink href="https://www.youtube.com/@neurocient">
            <Youtube className="h-4 w-4" />
            YouTube
          </ExternalLink>
          <ExternalLink href="https://www.instagram.com/neurocient/">
            <Instagram className="h-4 w-4" />
            Instagram
          </ExternalLink>
          <ExternalLink href="https://neurocient.com">
            neurocient.com
          </ExternalLink>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-16">
        <div className="border-t border-brand-dark/12 pt-8 font-sans text-xs leading-6 text-brand-dark/62">
          <p className="font-semibold uppercase tracking-[0.14em] text-brand-dark">
            The boring but important stuff
          </p>
          <div className="mt-4 grid gap-5 md:grid-cols-[0.8fr_1.2fr]">
            <p>Copyright: (c) 2025 Neurocient Labs. All rights reserved.</p>
            <div className="space-y-3">
              <p>
                Legal Disclaimer: The content shared on this site represents
                only my personal views and the work of Neurocient Labs. It is
                intended for learning, reflection, and entertainment, not as
                medical, psychological, or financial advice.
              </p>
              <p>
                <Link
                  href="/privacy"
                  className="cursor-pointer font-semibold text-brand-accent hover:underline"
                >
                  Privacy Policy
                </Link>{" "}
                - We respect your privacy. We do not, and will not, sell your
                information.{" "}
                <Link
                  href="/terms"
                  className="cursor-pointer font-semibold text-brand-accent hover:underline"
                >
                  Terms of Service
                </Link>{" "}
                - By continuing to access this website, newsletter, or related
                tools, you accept our Terms of Service.
              </p>
            </div>
          </div>
        </div>
      </section>
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

const ExternalLink = ({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-brand-dark/25 px-5 py-3 font-sans text-sm font-semibold text-brand-dark transition hover:border-brand-primary hover:text-brand-primary"
  >
    {children}
  </a>
);
