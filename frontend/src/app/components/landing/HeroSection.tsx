import Image from "next/image";
import { ChevronDown } from "lucide-react";
import PatternRevealList from "./PatternRevealList";

export default function HeroSection() {
  return (
      <section className="relative bg-white px-6 md:px-10">
        <div className="pointer-events-none absolute left-0 right-0 top-0 h-svh overflow-hidden" aria-hidden="true">
          <div className="absolute -right-12 top-[7%] h-64 w-64 rounded-full border border-brand-teal/20 bg-[radial-gradient(circle_at_35%_40%,rgba(94,177,191,0.07),transparent_68%)] md:-right-24 md:top-16 md:h-[30rem] md:w-[30rem]" />
          <div className="absolute -bottom-24 -left-24 h-60 w-60 rounded-full border border-brand-accent/10 md:-bottom-32 md:-left-36 md:h-96 md:w-96" />
          <div className="absolute left-[5%] top-[11%] h-10 w-10 rotate-12 border border-brand-secondary/35 md:left-[8%] md:top-[16%] md:h-16 md:w-16" />
          <div className="absolute left-[9%] top-[12%] h-px w-24 -rotate-6 bg-gradient-to-r from-brand-secondary/40 to-transparent md:left-[11%] md:top-[16%] md:w-44" />
          <div className="absolute bottom-[6%] left-[7%] h-20 w-28 opacity-25 md:bottom-[9%] md:left-[6%] md:h-28 md:w-40 md:opacity-35 [background-image:radial-gradient(rgba(4,42,43,0.2)_1px,transparent_1px)] [background-size:14px_14px]" />
          <div className="absolute left-[3%] top-[42%] hidden items-center gap-3 md:flex">
            <span className="font-sans text-[0.58rem] font-semibold tracking-[0.18em] text-brand-teal/45">01</span>
            <span className="h-20 w-px bg-gradient-to-b from-brand-teal/30 to-transparent" />
          </div>
          <div className="absolute left-[48%] top-[8%] h-9 w-9 rounded-full border border-brand-primary/15 md:left-[52%] md:top-[10%] md:h-12 md:w-12">
            <span className="absolute -right-3 top-1/2 h-px w-5 bg-brand-primary/20" />
            <span className="absolute left-1/2 -top-2 h-4 w-px bg-brand-primary/15" />
          </div>
          <div className="absolute right-0 top-[56%] h-24 w-5 border-y border-l border-brand-teal/15 md:top-[52%] md:h-36 md:w-8" />
          <div className="absolute bottom-[24%] left-[13%] flex -rotate-12 flex-col gap-2 md:bottom-[18%] md:left-[21%]">
            <span className="h-px w-10 bg-gradient-to-r from-transparent via-brand-accent/20 to-transparent md:w-16" />
            <span className="h-px w-6 translate-x-3 bg-gradient-to-r from-brand-accent/20 to-transparent md:w-10" />
          </div>
          <div className="absolute bottom-[5%] right-[6%] h-14 w-14 rounded-full border border-brand-secondary/20 md:bottom-[7%] md:right-[4%] md:h-20 md:w-20">
            <span className="absolute left-1/2 top-1/2 h-px w-8 -translate-x-1/2 bg-brand-secondary/25" />
            <span className="absolute left-1/2 top-1/2 h-8 w-px -translate-y-1/2 bg-brand-secondary/25" />
          </div>
          <div className="absolute bottom-[15%] right-[12%] hidden items-center gap-2 md:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-primary/35" />
            <span className="h-px w-20 bg-gradient-to-r from-brand-primary/25 to-transparent" />
          </div>
        </div>
        <div className="relative mx-auto max-w-6xl text-brand-dark">
          <div className="relative flex min-h-svh flex-col justify-center pb-20 pt-10 md:pb-24 md:pt-14">
            <h1 className="max-w-5xl text-[clamp(2.8rem,14vw,3.35rem)] font-bold leading-[0.92] tracking-[-0.055em] md:text-[clamp(3.35rem,8vw,7.8rem)]">
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
              <span className="block md:inline">your{" "}
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
              <p className="font-sans text-[0.65rem] font-bold uppercase tracking-[0.2em] text-brand-teal">
                We, at Neurocient, help you
              </p>
              <p className="mt-2 font-sans text-lg font-semibold leading-8 text-brand-dark md:text-2xl md:leading-9">
                Understand what&apos;s been{" "}
                <span className="box-decoration-clone bg-brand-secondary/55 px-1.5 py-0.5 text-brand-accent">
                  standing in your way
                </span>
              </p>
              <p className="mt-1 font-serif text-2xl font-bold italic leading-8 text-brand-dark md:text-3xl md:leading-10">
                <span className="text-brand-primary">&amp;</span> work with it in real life !!
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

          <div id="hero-story" className="grid scroll-mt-6 max-w-6xl gap-5 border-t border-brand-dark/12 py-20 md:grid-cols-6 md:py-28">
            <p className="font-serif text-[clamp(2rem,4vw,3.8rem)] font-bold leading-[1.08] tracking-[-0.035em] text-brand-dark md:col-span-6 md:max-w-6xl">
              Some life experiences make you realize,{" "}
              <strong className="inline-block whitespace-nowrap bg-brand-secondary/55 px-2 py-0.5 text-[0.82em] italic text-brand-accent sm:text-[1em]">clearly and uncomfortably,</strong> that the life you&apos;re
              living <span className="text-brand-primary">&amp;</span> <span>the life you want</span> are not the same.
            </p>
            <p className="relative border-l-2 border-t-2 border-brand-teal/55 py-6 pl-6 pr-2 font-serif text-xl leading-8 text-brand-dark before:absolute before:-top-5 before:right-2 before:font-serif before:text-6xl before:font-bold before:leading-none before:text-brand-teal/15 before:content-['01'] md:col-span-2 md:border-l-0 md:px-2 md:pt-12 md:text-2xl md:leading-9">
              Maybe it was watching someone close struggle with health and
              realizing you don&apos;t want to keep postponing the life you want to
              live.
            </p>
            <p className="relative border-l-2 border-t-2 border-brand-secondary/70 py-6 pl-6 pr-2 font-serif text-xl leading-8 text-brand-dark before:absolute before:-top-5 before:right-2 before:font-serif before:text-6xl before:font-bold before:leading-none before:text-brand-secondary/35 before:content-['02'] md:col-span-2 md:mt-10 md:border-l-0 md:px-2 md:pt-12 md:text-2xl md:leading-9">
              Maybe it was realizing that your close relationships had drifted
              into the bare minimum, where staying in touch had replaced feeling
              connected.
            </p>
            <p className="relative border-l-2 border-t-2 border-brand-primary/40 py-6 pl-6 pr-2 font-serif text-xl leading-8 text-brand-dark before:absolute before:-top-5 before:right-2 before:font-serif before:text-6xl before:font-bold before:leading-none before:text-brand-primary/12 before:content-['03'] md:col-span-2 md:mt-20 md:border-l-0 md:px-2 md:pt-12 md:text-2xl md:leading-9">
              Maybe it was realizing you&apos;d started getting triggered by the
              smallest things, like you were under pressure all day, every day.
            </p>
            <p className="my-8 border-y border-brand-dark/12 py-8 font-serif text-2xl leading-9 text-brand-dark md:col-span-6 md:ml-auto md:max-w-4xl md:py-10 md:text-4xl md:leading-tight">
              Moments like these have a way of <strong>revealing</strong> patterns
              you can no longer ignore.
            </p>
            <div className="mt-8 min-h-52 border-l-4 border-t border-brand-secondary px-6 py-8 font-serif text-xl leading-9 text-brand-dark md:col-span-4 md:col-start-1 md:min-h-64 md:px-8 md:py-10 md:text-3xl md:leading-[1.45]">
              <p className="text-brand-accent">So you tried.</p>
              <p className="mt-3">The routines.</p>
              <p>The fresh starts.</p>
              <p className="mt-5">You knew exactly what to do.</p>
              <p className="mt-3 font-bold">And still, the same patterns kept showing up.</p>
            </div>
            <PatternRevealList />
            <p className="mt-8 bg-brand-dark px-6 py-8 font-serif text-2xl font-bold leading-tight text-white md:col-span-6 md:max-w-5xl md:px-10 md:py-10 md:text-4xl">
              These patterns are not who you are. And then the question you ask
              yourself…
            </p>
          </div>
        </div>
      </section>
  );
}
