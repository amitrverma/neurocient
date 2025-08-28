// app/components/InsightsPage.tsx
import Link from "next/link";

const dummyInsights = [
  {
    slug: "negativity-bias",
    title: "Why Your Brain Fixates on the Negative",
    excerpt: "Our caveman wiring evolved to notice threats first — here’s how it plays out today.",
  },
  {
    slug: "status-seeking",
    title: "The Hidden Instinct Behind Status Games",
    excerpt: "Status meant survival in tribes — see how it shapes careers and social media now.",
  },
  {
    slug: "confirmation-bias",
    title: "Why We Only Hear What We Want",
    excerpt: "Once a belief formed, our ancestors stuck with it. Sound familiar?",
  },
];

const Insights = () => {
  return (
    <main className="px-6 py-20 bg-white font-serif">
      <div className="max-w-6xl mx-auto space-y-12">

        {/* Hero */}
        <section className="text-center space-y-6">
          <h1 className="text-3xl md:text-5xl font-bold text-[#042a2b]">
            Insights & Articles
          </h1>
          <p className="text-lg text-brand-dark/70 max-w-2xl mx-auto leading-relaxed">
            Short reads that explain how your inner caveman wiring shows up in everyday life —
            and what to do about it.
          </p>
        </section>

        {/* Articles Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {dummyInsights.map((article) => (
            <Link
              key={article.slug}
              href={`/insights/${article.slug}`}
              className="p-6 border rounded-2xl shadow-sm hover:shadow-md transition flex flex-col space-y-4"
            >
              <h2 className="text-xl font-semibold text-[#042a2b]">{article.title}</h2>
              <p className="text-sm text-brand-dark/70 leading-relaxed">{article.excerpt}</p>
              <span className="text-[#ed254e] font-medium text-sm mt-auto">Read more →</span>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
};

export default Insights;
