import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

const insightsDir = path.join(process.cwd(), "src/content/insights");

export const metadata: Metadata = {
  title: "Inner Caveman: What It Is and How To Work With It | Neurocient Labs",
  description:
    "Inner Caveman is your ancient survival brain running modern life. Learn what it is, how to spot it, and how to work with it using Neurocient Labs tools.",
  keywords: [
    "inner caveman",
    "what is inner caveman",
    "neurocient inner caveman",
    "modern caveman",
    "survival brain",
    "work with your inner caveman",
  ],
  alternates: {
    canonical: "https://neurocient.com/inner-caveman",
  },
  openGraph: {
    type: "website",
    url: "https://neurocient.com/inner-caveman",
    siteName: "Neurocient Labs",
    title: "Inner Caveman at Neurocient Labs",
    description:
      "Understand your Inner Caveman and use practical tools to work with it.",
    images: [
      {
        url: "https://neurocient.com/logo/neurocient.png",
        width: 1200,
        height: 630,
        alt: "Neurocient Labs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Inner Caveman at Neurocient Labs",
    description:
      "Understand your Inner Caveman and use practical tools to work with it.",
    images: ["https://neurocient.com/logo/neurocient.png"],
  },
};

function getArticlesByTag(tagsToMatch: string[]) {
  const files = fs
    .readdirSync(insightsDir)
    .filter((f) => f.endsWith(".mdx"));

  const articles = files
    .map((file) => {
      const raw = fs.readFileSync(path.join(insightsDir, file), "utf-8");
      const { data } = matter(raw);
      const slug = file.replace(/\.mdx$/, "");
      return {
        slug,
        title: data.title as string,
        excerpt: (data.excerpt as string) || (data.description as string) || "",
        date: (data.date as string) || undefined,
        tags: (data.tags as string[]) || [],
      };
    })
    .filter((a) =>
      a.tags?.some((t) =>
        tagsToMatch.some((k) => t.toLowerCase() === k.toLowerCase())
      )
    )
    .sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  return articles;
}

export default function InnerCavemanPage() {
  const related = getArticlesByTag(["Inner Caveman", "The Modern Caveman"]);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is the Inner Caveman?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "It's your ancient survival circuitry (fear, comfort, approval) still running modern life. At Neurocient Labs we help you see it and work with it—rather than fight it.",
        },
      },
      {
        "@type": "Question",
        name: "How do I spot my Inner Caveman?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Look for patterns like doomscrolling for approval, conflict avoidance, comfort eating under stress, or procrastination when stakes feel social. Try our Spot Your Caveman tool to notice triggers.",
        },
      },
      {
        "@type": "Question",
        name: "How do I work with it?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Name the instinct, reduce perceived threat, and run tiny reps that update the pattern. Our microchallenges and diagnostics translate neuroscience into daily practice.",
        },
      },
    ],
  };

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-brand-dark mb-4">
        Inner Caveman
      </h1>
      <p className="text-lg text-brand-dark/80 max-w-3xl">
        Your Inner Caveman is the ancient survival brain—wired for threats,
        comfort, and social approval—still running modern life. The goal isn’t
        to suppress it, but to work with it. Start by spotting patterns,
        lowering perceived threat, and practicing tiny reps that update your
        responses.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/spot"
          className="px-4 py-2 rounded-lg border text-brand-dark hover:bg-brand-primary hover:text-white transition"
        >
          Spot Your Caveman
        </Link>
        <Link
          href="/microchallenge"
          className="px-4 py-2 rounded-lg border text-brand-dark hover:bg-brand-teal hover:text-white transition"
        >
          Try a Microchallenge
        </Link>
        <Link
          href="/tags/inner-caveman"
          className="px-4 py-2 rounded-lg border text-brand-dark hover:bg-brand-primary hover:text-white transition"
        >
          Articles: Inner Caveman
        </Link>
      </div>

      <section className="mt-12 space-y-6">
        <h2 className="text-2xl font-bold text-brand-dark">
          Learn the Pattern
        </h2>
        <div className="grid grid-cols-1 gap-6">
          <div className="border rounded-xl p-6">
            <h3 className="text-xl font-semibold text-brand-dark">
              Ancient programs, modern misfires
            </h3>
            <p className="text-brand-dark/80 mt-2">
              In tribes, avoiding conflict and seeking approval kept you safe.
              Today, those same instincts can drive doomscrolling, procrastination,
              and decision paralysis. Seeing the pattern is step one.
            </p>
          </div>
          <div className="border rounded-xl p-6">
            <h3 className="text-xl font-semibold text-brand-dark">
              Don’t fight wiring—work with it
            </h3>
            <p className="text-brand-dark/80 mt-2">
              When the Inner Caveman feels threatened, it hijacks attention.
              Reduce perceived threat, break tasks into tiny reps, and pair
              action with a safe cue. That’s how you change patterns.
            </p>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-brand-dark mb-4">
            Articles on Inner Caveman
          </h2>
          <div className="space-y-6">
            {related.map((a) => (
              <div key={a.slug} className="border-b pb-4">
                <Link
                  href={`/insights/${a.slug}`}
                  className="text-xl font-semibold text-brand-dark hover:text-brand-primary"
                >
                  {a.title}
                </Link>
                {a.excerpt && (
                  <p className="text-brand-dark/80 mt-1">{a.excerpt}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <Script
        id="inner-caveman-faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </main>
  );
}

