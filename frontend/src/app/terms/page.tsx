import Link from "next/link";

const terms = [
  {
    title: "For learning, not advice",
    text: "The content here is for education and reflection. It is not medical, psychological, legal, or financial advice.",
  },
  {
    title: "Use at your own risk",
    text: "You are responsible for how you apply anything from this site.",
  },
  {
    title: "Intellectual property",
    text: "All content, design, code, and tools belong to Neurocient Labs unless otherwise credited. Do not copy, resell, or distribute without permission.",
  },
  {
    title: "Changes",
    text: "We may update these terms from time to time. Continuing to use the site means you accept the latest version.",
  },
  {
    title: "Governing law",
    text: "These terms are governed by the laws of India.",
  },
];

export default function TermsPage() {
  return (
    <main className="bg-white px-6 py-14 font-serif text-brand-dark md:py-20">
      <article className="mx-auto max-w-3xl">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal">
          Legal
        </p>
        <h1 className="mt-4 text-4xl font-bold leading-tight tracking-[-0.02em] md:text-5xl">
          Terms of Service
        </h1>
        <p className="mt-4 font-sans text-sm text-brand-dark/60">
          Effective date: August 27, 2025
        </p>

        <div className="mt-10 border-y border-brand-dark/12">
          {terms.map((item, index) => (
            <section
              key={item.title}
              className="grid gap-4 border-b border-brand-dark/12 py-6 last:border-b-0 md:grid-cols-[0.18fr_1fr]"
            >
              <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">
                {String(index + 1).padStart(2, "0")}
              </p>
              <div>
                <h2 className="text-2xl font-bold leading-tight">{item.title}</h2>
                <p className="mt-2 font-sans text-base leading-8 text-brand-dark/76">
                  {item.text}
                </p>
              </div>
            </section>
          ))}
        </div>

        <p className="mt-8 font-sans text-base leading-8 text-brand-dark/76">
          If you do not agree with these terms, please do not use the site. For
          questions, email{" "}
          <a href="mailto:support@neurocient.com" className="font-semibold text-brand-accent">
            support@neurocient.com
          </a>
          .
        </p>

        <Link
          href="/privacy"
          className="mt-8 inline-flex rounded-full border border-brand-dark/25 px-5 py-2.5 font-sans text-sm font-semibold text-brand-dark transition hover:border-brand-primary hover:text-brand-primary"
        >
          Read privacy policy
        </Link>
      </article>
    </main>
  );
}
