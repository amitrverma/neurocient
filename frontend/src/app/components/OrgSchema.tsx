import {
  BRAND_NAME,
  LEGAL_BUSINESS_NAME,
  LEGAL_IDENTITY_STATEMENT,
  SUPPORT_EMAIL,
} from "@/lib/businessIdentity";

export default function OrgSchema() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://neurocient.com/#/org/neurocient-labs",
    name: BRAND_NAME,
    legalName: LEGAL_BUSINESS_NAME,
    description: LEGAL_IDENTITY_STATEMENT,
    email: SUPPORT_EMAIL,
    url: "https://neurocient.com",
    logo: "https://neurocient.com/logo/neurocient.png",
    sameAs: [
      "https://x.com/neurocient",
      "https://www.linkedin.com/company/neurocient",
      "https://www.youtube.com/@neurocient",
      "https://www.instagram.com/neurocient/",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
