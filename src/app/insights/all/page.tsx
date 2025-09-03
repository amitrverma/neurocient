import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";
import { slugifyTag } from "../../utils/slug";

interface ArticleMeta {
  slug: string;
  title: string;
  excerpt: string;
  date?: string;
  tags?: string[];
}

const insightsDir = path.join(process.cwd(), "src/content/insights");

export default function AllInsightsPage() {
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

  // Collect all tags with counts
  const tagCounts: Record<string, number> = {};
  articles.forEach((article) => {
    article.tags?.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  return (
    <main className="px-6 py-20 bg-white font-serif relative">
  <div className="max-w-5xl mx-auto flex gap-12">
    {/* Floating Tags Sidebar - Desktop only */}
    <aside className="hidden lg:block w-56 sticky top-24 self-start">
      <div className="border rounded-2xl p-6">
        <h2 className="text-lg font-bold mb-4 text-[#042a2b]">Tags</h2>
        <ul className="space-y-2">
          {Object.entries(tagCounts).map(([tag, count]) => (
            <li key={tag}>
              <Link
                href={`/tags/${slugifyTag(tag)}`}
                className="flex justify-between text-sm text-[#042a2b] hover:text-[#ed254e] transition"
              >
                <span>{tag}</span>
                <span className="text-brand-dark">{count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>

    {/* Articles */}
    <div className="flex-1 space-y-12">
      {articles.map((article) => (
        <div key={article.slug} className="pb-8 border-b">
          <Link
            href={`/insights/${article.slug}`}
            className="text-2xl font-semibold text-[#042a2b] hover:text-[#ed254e] transition"
          >
            {article.title}
          </Link>
          {article.date && (
            <p className="text-sm text-brand-dark mt-1">{article.date}</p>
          )}
          <p className="mt-2 text-brand-dark/70 leading-relaxed">{article.excerpt}</p>

          <div className="mt-3 flex flex-wrap gap-2">
            {article.tags?.map((tag) => (
              <Link
                key={tag}
                href={`/tags/${slugifyTag(tag)}`}
                className="px-2 py-1 text-xs rounded bg-brand-secondary/20 text-brand-dark hover:bg-brand-secondary/30 transition"
              >
                {tag}
              </Link>
            ))}
          </div>

          <Link
            href={`/insights/${article.slug}`}
            className="block mt-3 text-[#ed254e] font-medium text-sm"
          >
            Read more
          </Link>
        </div>
      ))}
    </div>
  </div>
</main>

  );
}
