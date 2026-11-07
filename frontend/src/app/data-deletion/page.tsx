import { Mail } from "lucide-react";
import Link from "next/link";
import { LEGAL_IDENTITY_STATEMENT } from "@/lib/businessIdentity";

const deletionSteps = [
  "Email support@neurocient.com from the email address connected to your account when possible.",
  "Use the subject “Data deletion request” and identify the account email or connected WhatsApp number you want us to locate.",
  "We may ask for limited additional information to verify that the request concerns your account.",
  "We will confirm when the deletion is complete or explain any information that must be retained and why.",
];

export default function DataDeletionPage() {
  const deletionEmail = "mailto:support@neurocient.com?subject=Data%20deletion%20request";

  return (
    <main className="surface-page px-6 py-14 md:py-20">
      <article className="mx-auto max-w-4xl">
        <p className="page-eyebrow text-brand-teal">Privacy · request instructions</p>
        <h1 className="page-title mt-4">Delete your Neurocient data</h1>
        <p className="mt-4 font-sans text-sm text-brand-dark/60">Effective date: November 7, 2026</p>
        <p className="mt-7 max-w-3xl border-l-4 border-brand-secondary pl-5 font-sans text-base leading-8 text-brand-dark/76">
          You can ask Neurocient to delete your account and personal information. You do not need to contact Meta separately to ask us to delete information held by Neurocient.
        </p>

        <section className="mt-10 border-y border-brand-dark/12 py-8">
          <h2 className="text-3xl font-bold leading-tight text-brand-dark">How to make a request</h2>
          <ol className="mt-5 grid gap-4 font-sans text-base leading-8 text-brand-dark/76">
            {deletionSteps.map((step, index) => (
              <li key={step} className="grid grid-cols-[2rem_1fr] gap-3">
                <span className="font-semibold text-brand-teal">{index + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <a
            href={deletionEmail}
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-brand-dark px-5 py-2.5 font-sans text-sm font-semibold text-white"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            Send deletion request
          </a>
        </section>

        <section className="grid gap-8 border-b border-brand-dark/12 py-8 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold leading-tight text-brand-dark">What the request covers</h2>
            <p className="mt-3 font-sans text-base leading-8 text-brand-dark/76">
              Subject to verification and any required retention, deletion covers your account profile, saved Scan and Practice work, Spots, microchallenge activity, preferences, connected WhatsApp number and consent record, and WhatsApp content retained by Neurocient.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold leading-tight text-brand-dark">What may be retained</h2>
            <p className="mt-3 font-sans text-base leading-8 text-brand-dark/76">
              We may retain limited payment, tax, fraud-prevention, security, or legal records where applicable law or a legitimate dispute requires it. Retained information is restricted to that purpose and is not kept as an active Neurocient profile.
            </p>
          </div>
        </section>

        <section className="py-8">
          <h2 className="text-2xl font-bold leading-tight text-brand-dark">Timing and other choices</h2>
          <p className="mt-3 font-sans text-base leading-8 text-brand-dark/76">
            We aim to acknowledge the request promptly and complete a verified deletion request within 30 days. If you only want to stop optional WhatsApp messages, reply STOP or disconnect WhatsApp in Profile instead of deleting your account.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/privacy" className="inline-flex rounded-full border border-brand-dark/25 px-5 py-2.5 font-sans text-sm font-semibold text-brand-dark">Read privacy policy</Link>
            <Link href="/support" className="inline-flex rounded-full border border-brand-dark/25 px-5 py-2.5 font-sans text-sm font-semibold text-brand-dark">Support</Link>
          </div>
        </section>

        <p className="font-sans text-xs leading-6 text-brand-dark/54">
          {LEGAL_IDENTITY_STATEMENT}
        </p>
      </article>
    </main>
  );
}
