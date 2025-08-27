"use client";

export default function PrivacyPage() {
  return (
    <div className="prose mx-auto p-6">
      <h1>Privacy Policy</h1>
      <p><strong>Effective Date:</strong> August 27, 2025</p>
      <p>
        At Neurocient Labs, your privacy matters. We collect as little personal
        information as possible — typically just your email address if you
        subscribe to our newsletter or create an account in one of our tools.
      </p>
      <ul>
        <li><strong>We don’t sell your data.</strong> Ever.</li>
        <li>
          <strong>We only use data to improve your experience.</strong> That may
          include sending you updates, analyzing usage patterns, or debugging
          issues.
        </li>
        <li>
          <strong>You control your subscription.</strong> Every email we send
          has an unsubscribe link.
        </li>
        <li>
          <strong>Third-party services.</strong> We may use trusted services
          (like analytics or email providers), but they are bound by their own
          privacy policies.
        </li>
        <li>
          <strong>Cookies.</strong> Our site may use cookies to remember
          preferences or improve usability.
        </li>
      </ul>
      <p>
        If you have questions or requests about your data, email us at:{" "}
        <a href="mailto:privacy@neurocientlabs.com">
          privacy@neurocientlabs.com
        </a>
        .
      </p>
    </div>
  );
}
