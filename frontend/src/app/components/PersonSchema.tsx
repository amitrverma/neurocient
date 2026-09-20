export default function PersonSchema() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": "https://neurocient.com/#/person/amit-r-verma",
    name: "Amit R Verma",
    url: "https://neurocient.com",
    worksFor: {
      "@type": "Organization",
      "@id": "https://neurocient.com/#/org/neurocient-labs",
      name: "Neurocient Labs",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
