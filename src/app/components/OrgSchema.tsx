export default function OrgSchema() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://neurocient.com/#/org/neurocient-labs",
    name: "Neurocient Labs",
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
