import Link from "next/link";

const terms = [
  {
    title: "Using Neurocient",
    text: "You may read public content without an account. An account is required to keep personal work, use signed-in allowances, buy membership, or enrol in a cohort. You must provide accurate information, keep your credentials secure, and tell us promptly if you suspect unauthorised access. Accounts and paid offerings are intended for people aged 18 or older.",
  },
  {
    title: "Education, not treatment",
    text: "Neurocient provides education, reflection, and behavior-change tools. It is not medical or psychological diagnosis, treatment, therapy, crisis support, or a substitute for qualified professional care. You remain responsible for decisions you make and should seek appropriate professional or emergency help when needed.",
  },
  {
    title: "Free access and membership",
    text: "Some features have free usage limits. The current membership offering is US$9 per month and removes the stated limits on self-guided content and tools while the membership is active. The checkout must show the final price, currency, billing schedule, and applicable taxes before you pay. Membership does not include a Modern Caveman cohort unless the offer explicitly says so.",
  },
  {
    title: "Billing, cancellation, and refunds",
    text: "Payments may be processed by Razorpay or another provider identified at checkout. Any recurring charge must be authorised through that checkout. You may cancel a recurring membership using the method provided with the purchase or by contacting support. Cancellation stops future renewal but does not automatically refund a completed billing period. Any refund required by law or expressly offered at checkout or on a program page will still apply.",
  },
  {
    title: "Modern Caveman cohorts",
    text: "Modern Caveman is a separate, paid, facilitated program. Published cohorts have specific dates, capacity, price, facilitator, and session details. You must sign in before payment. A seat is confirmed only after payment has been verified and your enrolment is shown as confirmed. If capacity is reached, joining the waitlist does not guarantee a seat. After attending the first session, you may request a full refund by emailing support@neurocient.com within 48 hours of that session. Other cohort-specific cancellation, transfer, or attendance terms shown before purchase form part of these terms.",
  },
  {
    title: "Your private entries",
    text: "You retain ownership of the original text and information you enter into private tools. You give Neurocient permission to host, process, and display that material only as needed to operate, secure, and improve the service as described in the Privacy Policy. You must not submit material that is unlawful or that violates another person’s rights or privacy.",
  },
  {
    title: "Our content and product",
    text: "Neurocient’s articles, program material, visual design, software, trademarks, and other original content belong to Neurocient Labs or its licensors. Personal, non-commercial use is permitted. You may not copy, scrape, reproduce, resell, publish, reverse engineer, or build a competing dataset or service from them without permission, except where applicable law allows it.",
  },
  {
    title: "Acceptable use",
    text: "Do not misuse the service, interfere with its operation, bypass access or payment controls, probe security, automate abusive traffic, impersonate another person, or use the service to harm others. We may restrict or terminate access where reasonably necessary to protect users, the service, or legal obligations.",
  },
  {
    title: "Availability and changes",
    text: "We may repair, update, add, or retire features and may experience interruptions. We will not intentionally remove paid access without a reasonable operational or legal reason. If we make a material change to these terms, we will update the effective date and provide additional notice where appropriate.",
  },
  {
    title: "Responsibility and liability",
    text: "To the extent permitted by law, the service is provided without guarantees that it will always be uninterrupted, error-free, or suitable for a particular outcome. Neurocient Labs is not responsible for indirect or consequential loss arising from use of the service. Nothing here excludes rights or liability that cannot lawfully be excluded, including applicable consumer rights.",
  },
  {
    title: "Law and contact",
    text: "These terms are governed by the laws of India. Before starting formal proceedings, please contact us so we can try to resolve the issue in good faith. Questions about these terms, billing, cancellation, or access can be sent to support@neurocient.com.",
  },
];

export default function TermsPage() {
  return (
    <main className="surface-page px-6 py-14 md:py-20">
      <article className="mx-auto max-w-4xl">
        <p className="page-eyebrow text-brand-teal">Legal · service agreement</p>
        <h1 className="page-title mt-4">Terms of Service</h1>
        <p className="mt-4 font-sans text-sm text-brand-dark/60">Effective date: October 15, 2026</p>
        <p className="mt-7 max-w-3xl border-l-4 border-brand-secondary pl-5 font-sans text-base leading-8 text-brand-dark/76">
          These terms cover Neurocient’s public content, private account tools,
          membership, and facilitated cohort programs. By using the service,
          you agree to the terms that apply to the part you use.
        </p>

        <div className="mt-10 border-y border-brand-dark/12">
          {terms.map((item, index) => (
            <section key={item.title} className="grid gap-4 border-b border-brand-dark/12 py-7 last:border-b-0 md:grid-cols-[4rem_1fr] md:gap-7">
              <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">{String(index + 1).padStart(2, "0")}</p>
              <div>
                <h2 className="text-2xl font-bold leading-tight text-brand-dark">{item.title}</h2>
                <p className="mt-3 font-sans text-base leading-8 text-brand-dark/76">{item.text}</p>
              </div>
            </section>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <a href="mailto:support@neurocient.com" className="inline-flex rounded-full bg-brand-dark px-5 py-2.5 font-sans text-sm font-semibold text-white">Contact support</a>
          <Link href="/privacy" className="inline-flex rounded-full border border-brand-dark/25 px-5 py-2.5 font-sans text-sm font-semibold text-brand-dark">Read privacy policy</Link>
        </div>
      </article>
    </main>
  );
}
