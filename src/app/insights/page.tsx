import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";

interface ArticleMeta {
  slug: string;
  title: string;
  excerpt: string;
  date?: string;
  tags?: string[];
}

const insightsDir = path.join(process.cwd(), "src/content/insights");

export default function InsightsPage() {
  const articles: ArticleMeta[] = fs
    .readdirSync(insightsDir)
    .map((file) => {
      const raw = fs.readFileSync(path.join(insightsDir, file), "utf-8");
      const { data } = matter(raw);

      return {
        slug: file.replace(/\.mdx$/, ""),
        title: data.title as string,
        excerpt: data.excerpt as string,
        date: data.date as string,
        tags: data.tags as string[],
      };
    })
    .sort(
      (a, b) =>
        new Date(b.date || "").getTime() - new Date(a.date || "").getTime()
    );

  const latestArticles = articles.slice(0, 6);

  return (
    <main className="px-6 py-20 bg-white font-serif">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <section className="text-center space-y-6">
          <h1 className="text-3xl md:text-5xl font-bold text-[#042a2b]">
            Insights & Articles
          </h1>
          <p className="text-lg text-brand-dark/70 max-w-2xl mx-auto leading-relaxed">
            Short reads that explain how your inner caveman wiring shows up in
            everyday life — and what to do about it.
          </p>
        </section>

        {/* Latest Articles Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {latestArticles.map((article) => (
            <Link
              key={article.slug}
              href={`/insights/${article.slug}`}
              className="p-6 rounded-2xl shadow-sm hover:shadow-md transition flex flex-col space-y-4"
            >
              <h2 className="text-xl font-semibold text-brand-dark">
                {article.title}
              </h2>
              <p className="text-sm text-brand-dark/70 leading-relaxed">
                {article.excerpt}
              </p>
              <span className="text-[#ed254e] font-medium text-sm mt-auto">
                Read more
              </span>
            </Link>
          ))}
        </section>

        {/* View All button */}
        <div className="text-center mt-10">
          <Link
            href="/insights/all"
            className="inline-block px-6 py-3 text-lg font-semibold rounded-full border text-brand-dark hover:bg-brand-primary hover:text-white transition"
          >
            View All Articles
          </Link>
        </div>
      </div>
    </main>
  );
}
