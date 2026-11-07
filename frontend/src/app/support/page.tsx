import { AlertTriangle, CreditCard, LockKeyhole, Mail, MessageCircle } from "lucide-react";
import Link from "next/link";
import { LEGAL_IDENTITY_STATEMENT } from "@/lib/businessIdentity";

const supportAreas = [
  {
    icon: LockKeyhole,
    title: "Account and access",
    text: "Sign-in problems, account security, saved work, membership access, and requests to correct or delete account information.",
  },
  {
    icon: CreditCard,
    title: "Billing and programs",
    text: "Payment confirmation, cancellation, refunds, membership, waitlists, and Modern Caveman cohort access.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp companion",
    text: "Connecting or disconnecting WhatsApp, reminder preferences, STOP or START, and help with a Spot or microchallenge check-in.",
  },
];

export default function SupportPage() {
  return (
    <main className="surface-page">
      <section className="surface-hero utility-hero">
        <div>
          <p className="surface-eyebrow">Support</p>
          <h1 className="surface-title">
            Help with
            <span>Neurocient.</span>
          </h1>
        </div>
        <aside className="utility-hero-card">
          <p>Human support</p>
          <strong>Tell us what happened and what you need next.</strong>
          <span>We aim to acknowledge support requests within two business days.</span>
        </aside>
      </section>

      <section className="px-6 pb-16 md:pb-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-5 lg:grid-cols-3">
            {supportAreas.map(({ icon: Icon, title, text }) => (
              <article key={title} className="rounded-lg border border-brand-dark/12 bg-white p-6">
                <Icon className="h-5 w-5 text-brand-accent" aria-hidden="true" />
                <h2 className="mt-5 text-2xl font-bold leading-tight text-brand-dark">{title}</h2>
                <p className="mt-3 font-sans text-sm leading-7 text-brand-dark/72">{text}</p>
              </article>
            ))}
          </div>

          <div className="mt-10 grid gap-8 border-y border-brand-dark/12 py-9 lg:grid-cols-[0.62fr_0.38fr]">
            <div>
              <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">Contact</p>
              <h2 className="mt-3 text-3xl font-bold leading-tight text-brand-dark">One address for support.</h2>
              <p className="mt-4 max-w-2xl font-sans text-base leading-8 text-brand-dark/72">
                Email from the address connected to your Neurocient account when possible. Include what you were trying to do, what happened, and any safe detail that helps us find the issue. Do not send passwords, payment-card details, government identifiers, or medical records.
              </p>
              <a
                href="mailto:support@neurocient.com"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-dark px-5 py-2.5 font-sans text-sm font-semibold text-white"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                Email support
              </a>
            </div>

            <aside className="border-l-4 border-brand-secondary pl-5">
              <AlertTriangle className="h-5 w-5 text-brand-accent" aria-hidden="true" />
              <h2 className="mt-3 text-2xl font-bold leading-tight text-brand-dark">Not emergency support</h2>
              <p className="mt-3 font-sans text-sm leading-7 text-brand-dark/72">
                Neurocient is not an emergency or crisis service and does not provide medical or psychological treatment. If you or someone else may be in immediate danger, contact local emergency services or an appropriate crisis service now.
              </p>
            </aside>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/privacy" className="inline-flex rounded-full border border-brand-dark/25 px-5 py-2.5 font-sans text-sm font-semibold text-brand-dark">Privacy policy</Link>
            <Link href="/data-deletion" className="inline-flex rounded-full border border-brand-dark/25 px-5 py-2.5 font-sans text-sm font-semibold text-brand-dark">Request data deletion</Link>
            <Link href="/terms" className="inline-flex rounded-full border border-brand-dark/25 px-5 py-2.5 font-sans text-sm font-semibold text-brand-dark">Terms of service</Link>
          </div>

          <p className="mt-10 font-sans text-xs leading-6 text-brand-dark/54">
            {LEGAL_IDENTITY_STATEMENT}
          </p>
        </div>
      </section>
    </main>
  );
}
