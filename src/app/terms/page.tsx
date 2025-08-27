"use client";

export default function TermsPage() {
  return (
    <div className="prose mx-auto p-6">
      <h1>Terms of Service</h1>
      <p><strong>Effective Date:</strong> August 27, 2025</p>

      <ol className="list-decimal list-inside">
        <li>
          <strong>For learning, not advice.</strong> The content here is for
          education and reflection. It is not medical, psychological, legal, or
          financial advice.
        </li>
        <li>
          <strong>Use at your own risk.</strong> You’re responsible for how you
          apply anything from this site.
        </li>
        <li>
          <strong>Intellectual property.</strong> All content (text, design,
          code, tools) belongs to Neurocient Labs unless otherwise credited.
          Don’t copy, resell, or distribute without permission.
        </li>
        <li>
          <strong>Changes.</strong> We may update these terms from time to time.
          Continuing to use the site means you accept the latest version.
        </li>
        <li>
          <strong>Governing law.</strong> These terms are governed by the laws
          of India.
        </li>
      </ol>

      <p>
        If you don’t agree with these terms, please do not use the site.
      </p>
      <p>
        For questions:{" "}
        <a href="mailto:support@neurocientlabs.com">
          support@neurocientlabs.com
        </a>
      </p>
    </div>
  );
}
