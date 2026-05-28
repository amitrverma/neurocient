import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="bg-white px-6 py-14 font-serif text-brand-dark md:py-20">
      <article className="mx-auto max-w-3xl">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal">
          Legal
        </p>
        <h1 className="mt-4 text-4xl font-bold leading-tight tracking-[-0.02em] md:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-4 font-sans text-sm text-brand-dark/60">
          Effective date: August 27, 2025
        </p>

        <div className="mt-10 space-y-6 border-y border-brand-dark/12 py-8 font-sans text-base leading-8 text-brand-dark/76">
          <p>
            At Neurocient Labs, your privacy matters. We collect as little
            personal information as possible, typically your email address if
            you subscribe to the newsletter or create an account for tools.
          </p>
          <p>
            <strong className="text-brand-dark">We do not sell your data.</strong>{" "}
            We use data to improve your experience, send requested updates,
            analyze usage patterns, and debug issues.
          </p>
          <p>
            You control your subscription. Every email we send includes an
            unsubscribe link.
          </p>
          <p>
            We may use trusted third-party services such as analytics or email
            providers. Those services are governed by their own privacy terms.
          </p>
          <p>
            Our site may use cookies to remember preferences or improve
            usability.
          </p>
          <p>
            For questions or data requests, email{" "}
            <a
              href="mailto:privacy@neurocient.com"
              className="font-semibold text-brand-accent"
            >
              privacy@neurocient.com
            </a>
            .
          </p>
        </div>

        <Link
          href="/terms"
          className="mt-8 inline-flex rounded-full border border-brand-dark/25 px-5 py-2.5 font-sans text-sm font-semibold text-brand-dark transition hover:border-brand-primary hover:text-brand-primary"
        >
          Read terms
        </Link>
      </article>
    </main>
  );
}
