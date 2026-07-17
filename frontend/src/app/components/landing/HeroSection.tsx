import Image from "next/image";
import { ChevronDown } from "lucide-react";

export default function HeroSection() {
  return (
      <section className="relative bg-white px-6 md:px-10">
        <div className="pointer-events-none absolute left-0 right-0 top-0 h-svh overflow-hidden" aria-hidden="true">
          <div className="absolute right-0 top-[18%] hidden w-[26vw] max-w-sm items-center md:flex">
            <span className="h-px flex-1 bg-brand-dark/12" />
            <span className="h-3 w-3 rounded-full bg-brand-primary" />
            <span className="h-px w-14 bg-brand-dark/12" />
          </div>
          <div className="absolute bottom-[11%] left-0 hidden w-[18vw] max-w-56 items-center md:flex">
            <span className="h-px flex-1 bg-brand-dark/12" />
            <span className="h-2 w-2 rounded-full bg-brand-secondary" />
          </div>
        </div>
        <div className="relative mx-auto max-w-6xl text-brand-dark">
          <div className="relative flex min-h-svh flex-col justify-center pb-20 pt-10 md:pb-24 md:pt-14">
            <h1 className="max-w-5xl text-balance text-[clamp(2.8rem,14vw,3.35rem)] font-bold leading-[0.92] tracking-[-0.055em] md:text-[clamp(3.35rem,8vw,7.8rem)]">
              <span className="block md:inline">You want</span>{" "}
              <span className="block whitespace-nowrap md:inline md:whitespace-normal">
              <span className="relative inline-block h-[0.92em] w-[2.55em] translate-y-[0.12em] align-baseline md:mx-[0.03em] md:w-[2.75em]">
                <span className="sr-only">more</span>
                <Image
                  src="/assets/more-blocks.png"
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 768px) 180px, 320px"
                  className="object-cover object-[50%_55%] contrast-[1.04] saturate-[0.72] mix-blend-multiply"
                />
              </span>{" "}from
              </span>{" "}
              <span className="block md:inline">your ONE{" "}
              <span className="relative inline-block italic text-brand-teal">
                life.
                <svg
                  aria-hidden="true"
                  viewBox="0 0 120 18"
                  preserveAspectRatio="none"
                  className="absolute -bottom-[0.08em] left-0 h-[0.18em] w-full overflow-visible"
                >
                  <path
                    d="M3 13 C34 8, 86 8, 117 13"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    opacity="0.7"
                  />
                </svg>
              </span>
              </span>
            </h1>

            <div className="mt-10 max-w-4xl border-l-4 border-brand-secondary py-1 pl-5">
              <p className="font-sans text-lg font-semibold leading-8 text-brand-dark md:text-2xl md:leading-9">
                We help you understand what&apos;s been{" "}
                <span className="box-decoration-clone bg-brand-secondary/55 px-1.5 py-0.5 text-brand-accent">
                  standing in your way
                </span>.
              </p>
              <p className="mt-1 font-serif text-2xl font-bold italic leading-8 text-brand-dark md:text-3xl md:leading-10">
                <span className="text-brand-primary">&amp;</span> work with it in real life.
              </p>
            </div>

            <a
              href="#hero-story"
              className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1 whitespace-nowrap rounded-full px-4 py-2 font-sans text-[0.62rem] font-bold uppercase tracking-[0.18em] text-brand-dark/55 transition hover:text-brand-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-teal md:bottom-7"
            >
              See what&apos;s underneath
              <ChevronDown className="h-5 w-5 text-brand-teal motion-safe:animate-bounce" />
            </a>
          </div>

          <div id="hero-story" className="grid scroll-mt-6 max-w-6xl gap-5 border-t border-brand-dark/12 pb-0 pt-20 md:grid-cols-6 md:pt-28">
            <p className="font-serif text-balance text-[clamp(2rem,4vw,3.8rem)] font-bold leading-[1.08] tracking-[-0.035em] text-brand-dark md:col-span-6 md:max-w-6xl">
              Some life experiences make you realize,{" "}
              <strong className="inline-block whitespace-nowrap bg-brand-secondary/55 px-2 py-0.5 text-[0.82em] italic text-brand-accent sm:text-[1em]">clearly and uncomfortably,</strong> that the life you&apos;re living and the life you want are not the same.
            </p>
            <p className="relative border-l-2 border-t-2 border-brand-teal/55 py-6 pl-6 pr-2 font-serif text-xl leading-8 text-brand-dark before:absolute before:-top-5 before:right-2 before:font-serif before:text-6xl before:font-bold before:leading-none before:text-brand-teal/15 before:content-['01'] md:col-span-2 md:border-l-0 md:px-2 md:pt-12 md:text-2xl md:leading-9">
              Maybe it was watching someone close <strong>struggle with their health</strong> and realizing you don&apos;t want to keep taking your own for granted.
            </p>
            <p className="relative border-l-2 border-t-2 border-brand-secondary/70 py-6 pl-6 pr-2 font-serif text-xl leading-8 text-brand-dark before:absolute before:-top-5 before:right-2 before:font-serif before:text-6xl before:font-bold before:leading-none before:text-brand-secondary/35 before:content-['02'] md:col-span-2 md:mt-10 md:border-l-0 md:px-2 md:pt-12 md:text-2xl md:leading-9">
              Maybe it was realizing that your <strong>close relationships had drifted</strong> into the bare minimum, and you don&apos;t want to settle for surface-level relationships just to avoid conflict or judgment.
            </p>
            <p className="relative border-l-2 border-t-2 border-brand-primary/40 py-6 pl-6 pr-2 font-serif text-xl leading-8 text-brand-dark before:absolute before:-top-5 before:right-2 before:font-serif before:text-6xl before:font-bold before:leading-none before:text-brand-primary/12 before:content-['03'] md:col-span-2 md:mt-20 md:border-l-0 md:px-2 md:pt-12 md:text-2xl md:leading-9">
              Maybe it was realizing you&apos;d started getting <strong>triggered by the smallest things</strong>, like you were under pressure all day, every day, and you don&apos;t want your body and mind to keep paying the price.
            </p>
            <div className="mt-2 text-brand-dark md:col-span-6 md:mt-2">
              <div className="flex items-center gap-4 font-sans text-[0.65rem] font-bold tracking-[0.18em] text-brand-primary" aria-hidden="true">
                <span>04</span>
                <span className="h-px flex-1 bg-brand-primary/75" />
              </div>
              <div className="pb-4 pt-10 md:pb-5 md:pt-12">
                <p className="font-serif text-3xl font-bold leading-tight md:text-4xl">Or maybe it was something else entirely.</p>
                <p className="mt-7 max-w-5xl font-sans text-base leading-8 md:text-lg md:leading-9">
                  Whatever the moment was, it left you with a feeling you couldn&apos;t ignore anymore. You wanted to live with more intention and fewer regrets.
                </p>
                <p className="mt-9 font-serif text-xl font-bold italic md:mt-10 md:text-2xl">So you tried.</p>
                <p className="mt-4 max-w-5xl font-sans text-base leading-8 text-brand-dark/45 line-through decoration-brand-dark/30 md:text-lg md:leading-9">
                  Morning routines. Meditation. Journaling. Self-help books. Listening to podcasts. Productivity hacks. Self-help apps.
                </p>
                <p className="mt-10 max-w-5xl border-l-4 border-brand-secondary py-0.5 pl-5 font-sans text-lg font-bold leading-7 md:mt-12 md:text-xl md:leading-8">
                  You knew what to do. Yet a few weeks later, you found yourself back where you started.
                </p>
              </div>
            </div>
            <p className="mt-0 py-6 font-serif text-3xl italic leading-tight text-brand-dark md:col-span-6 md:py-7 md:text-4xl">
              And you keep asking yourself&hellip;
            </p>
          </div>
        </div>
      </section>
  );
}
