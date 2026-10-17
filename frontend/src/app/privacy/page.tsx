import Link from "next/link";

const sections = [
  {
    title: "What we collect",
    paragraphs: [
      "Account information such as your name, email address, password credential or Google sign-in identifier, and any phone number you choose to provide.",
      "The private work you choose to save: Scan answers and portraits, Spots, Practice worksheets and logs, microchallenge activity and notes, reflections, preferences, and saved articles.",
      "Program and transaction information such as cohort or waitlist status, the amount and currency, and payment, order, subscription, and entitlement identifiers. Neurocient does not receive or store your full card or bank-account credentials from Razorpay.",
      "Messages and delivery information when you contact us, join the newsletter, enable browser notifications, or opt into WhatsApp reminders.",
      "Technical and usage information such as pages viewed, links and buttons used, device and browser information, IP-derived information, cookies, and local-storage identifiers.",
    ],
  },
  {
    title: "Why we use it",
    paragraphs: [
      "We use this information to create and secure your account; keep your work available across sessions; operate free limits, membership access, cohorts, waitlists, and payments; deliver reminders you enable; respond to support requests; and protect the service from misuse.",
      "We also use limited usage data to understand whether the product works, diagnose errors, and improve the experience. We do not sell your personal data or use your private entries to sell advertising.",
    ],
  },
  {
    title: "AI-generated reflections",
    paragraphs: [
      "If you request a generated weekly reflection, relevant Practice entries, microchallenge notes, and Spots may be sent to our AI service provider to create that reflection. The generated text is then saved to your account. Do not include information about another person that you do not have permission to share.",
    ],
  },
  {
    title: "Services that help us operate",
    paragraphs: [
      "We use service providers only where needed to run Neurocient. These currently include hosting and database infrastructure, Google Firebase for optional Google sign-in, PostHog for product analytics, Razorpay for payment processing, Resend for contact email, OpenAI for requested generated reflections, Azure storage for article audio, browser push infrastructure, and Twilio/WhatsApp for reminders you enable.",
      "Those providers process information under their own terms and may process it outside India. Payment details entered in Razorpay checkout are handled by Razorpay; its buyer privacy notice explains that processing.",
    ],
  },
  {
    title: "Cookies and information on your device",
    paragraphs: [
      "We use secure account cookies to keep you signed in. PostHog uses cookies and local storage for analytics. Neurocient also uses local storage to remember usage limits, an unfinished Scan or Practice handoff, and newsletter state. Clearing browser data can remove information held only on that device, but it does not delete information already saved to your account.",
    ],
  },
  {
    title: "How long we keep it",
    paragraphs: [
      "We keep account and saved-work data while your account is active and for as long as reasonably needed to provide the service. We may retain transaction, security, audit, and legal records after account closure where required by law or needed to resolve disputes. When information is no longer needed, we delete or de-identify it where reasonably possible.",
    ],
  },
  {
    title: "Your choices and requests",
    paragraphs: [
      "You can change reminder preferences from Profile and unsubscribe from newsletters using the link in each email. You may ask to access, correct, or erase personal data, withdraw consent where processing depends on consent, or raise a grievance by emailing privacy@neurocient.com. We may need to verify your identity before completing a request.",
      "If you withdraw consent, we will explain any service feature that can no longer operate. You may also complain to the Data Protection Board of India when that remedy is available to you.",
    ],
  },
  {
    title: "Security and age",
    paragraphs: [
      "We use reasonable technical and organisational safeguards, but no online service can guarantee absolute security. Contact us promptly if you believe your account has been compromised.",
      "Accounts and paid offerings are intended for people aged 18 or older. Please do not create an account or submit personal data if you are under 18.",
    ],
  },
  {
    title: "Changes and contact",
    paragraphs: [
      "We may update this notice as the product or law changes. We will change the effective date and provide additional notice when a change materially affects how we use personal data.",
      "Neurocient Labs is responsible for the information described here. For privacy questions, requests, or grievances, email privacy@neurocient.com.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="surface-page px-6 py-14 md:py-20">
      <article className="mx-auto max-w-4xl">
        <p className="page-eyebrow text-brand-teal">Legal · plain-language notice</p>
        <h1 className="page-title mt-4">Privacy Policy</h1>
        <p className="mt-4 font-sans text-sm text-brand-dark/60">Effective date: October 15, 2026</p>
        <p className="mt-7 max-w-3xl border-l-4 border-brand-secondary pl-5 font-sans text-base leading-8 text-brand-dark/76">
          Neurocient includes public reading, private behavior-change tools,
          paid membership, and facilitated programs. This notice explains what
          is collected in each part and what happens to it.
        </p>

        <div className="mt-10 border-y border-brand-dark/12">
          {sections.map((section, index) => (
            <section key={section.title} className="grid gap-4 border-b border-brand-dark/12 py-7 last:border-b-0 md:grid-cols-[4rem_1fr] md:gap-7">
              <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">{String(index + 1).padStart(2, "0")}</p>
              <div>
                <h2 className="text-2xl font-bold leading-tight text-brand-dark">{section.title}</h2>
                <div className="mt-3 space-y-3 font-sans text-base leading-8 text-brand-dark/76">
                  {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
              </div>
            </section>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <a href="mailto:privacy@neurocient.com" className="inline-flex rounded-full bg-brand-dark px-5 py-2.5 font-sans text-sm font-semibold text-white">Contact privacy</a>
          <Link href="/terms" className="inline-flex rounded-full border border-brand-dark/25 px-5 py-2.5 font-sans text-sm font-semibold text-brand-dark">Read terms</Link>
        </div>
      </article>
    </main>
  );
}
