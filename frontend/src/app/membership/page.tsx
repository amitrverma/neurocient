import { Check, CreditCard, MessageCircle } from "lucide-react";

const whatsappUrl =
  "https://wa.me/918551915656?text=Hi%20Amit%2C%20I%20am%20interested%20in%20Neurocient%20membership.";

const checkoutUrl = process.env.MEMBERSHIP_CHECKOUT_URL?.trim() || whatsappUrl;
const hasGatewayCheckout = Boolean(process.env.MEMBERSHIP_CHECKOUT_URL?.trim());

const plans = [
  {
    name: "Explorer",
    price: "$0",
    desc: "Start seeing the pattern before deciding whether you need more.",
    features: [
      "Inner Caveman guide",
      "Caveman diagnostics",
      "20 Insights articles",
      "Weekly newsletter",
      "5 microchallenges",
      "15 saved Spots",
      "1 saved Practice loop",
    ],
  },
  {
    name: "Member",
    price: "$9",
    desc: "Continue without free-account limits across the self-guided platform.",
    features: [
      "Everything in Explorer",
      "Unlimited articles",
      "Unlimited Spots and microchallenges",
      "Unlimited Practice loops",
      "Discounts for programs",
    ],
    featured: true,
  },
];

export default function MembershipPage() {
  return (
    <main className="surface-page membership-page px-6 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="page-eyebrow mb-7 flex items-center gap-3 text-brand-secondary">
          <span>Membership</span>
          <span className="h-px flex-1 bg-white/20" />
        </div>
        <h1 className="page-title max-w-3xl text-white">
          Go deeper. Work with your wiring.
        </h1>
        <p className="mt-5 max-w-2xl font-sans text-base leading-8 text-white/70">
          Begin free. When the free-account limits are reached, Membership
          keeps Insights, Practice, Spots, and Microchallenges available for
          $9 per month.
        </p>
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`rounded-lg border p-6 ${
                plan.featured
                  ? "border-brand-primary bg-brand-dark"
                  : "border-white/15 bg-white/5"
              }`}
            >
              <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
                {plan.name}
              </p>
              <p className="mt-4 text-5xl font-bold">
                {plan.price}
                <span className="font-sans text-base font-normal text-white/45">
                  /mo
                </span>
              </p>
              <p className="mt-3 font-sans text-sm leading-6 text-white/64">
                {plan.desc}
              </p>
              <ul className="mt-6 space-y-3 font-sans text-sm text-white/75">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-secondary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              {plan.featured ? (
                <a
                  href={checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full border border-brand-primary bg-white px-4 py-3 font-sans text-sm font-semibold text-brand-dark transition hover:text-brand-primary"
                >
                  {hasGatewayCheckout ? (
                    <CreditCard className="h-4 w-4" />
                  ) : (
                    <MessageCircle className="h-4 w-4" />
                  )}
                  {hasGatewayCheckout ? "Join for $9/month" : "Join via WhatsApp"}
                </a>
              ) : null}
            </article>
          ))}
        </div>
        {!hasGatewayCheckout && (
          <p className="mx-auto mt-6 max-w-2xl text-center font-sans text-xs leading-6 text-white/55">
            Membership is currently activated with personal assistance. Online
            checkout will appear here when the payment gateway is connected.
          </p>
        )}
      </div>
    </main>
  );
}
