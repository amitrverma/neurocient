export default function WebSiteSchema() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://neurocient.com/#/website",
    url: "https://neurocient.com/",
    name: "Neurocient Labs",
    alternateName: "Neurocient",
    description:
      "A behavior-change platform explaining the automatic responses behind recurring modern struggles and helping people work with them in real life.",
    publisher: {
      "@id": "https://neurocient.com/#/org/neurocient-labs",
    },
    inLanguage: "en",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
