import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";
import { slugifyTag, unslugifyTag } from "../../utils/slug";

const insightsDir = path.join(process.cwd(), "src/content/insights");

interface ArticleMeta {
  slug: string;
  title: string;
  excerpt?: string;
  date?: string;
  tags?: string[];
}

export async function generateStaticParams() {
  const files = fs.readdirSync(insightsDir);
  let tags: string[] = [];

  files.forEach((file) => {
    const raw = fs.readFileSync(path.join(insightsDir, file), "utf-8");
    const { data } = matter(raw);
    if (data.tags) {
      tags = [...tags, ...data.tags];
    }
  });

  return [...new Set(tags)].map((tag) => ({
    tag: slugifyTag(tag), // clean slug for URL
  }));
}

export default async function TagPage({
  params,
}: {
  params: { tag: string };
}) {
  const decodedTag = unslugifyTag(params.tag); // "the-modern-caveman" → "The Modern Caveman"

  const files = fs.readdirSync(insightsDir);

  const articles: ArticleMeta[] = files
    .map((file) => {
      const raw = fs.readFileSync(path.join(insightsDir, file), "utf-8");
      const { data } = matter(raw);
      return {
        slug: file.replace(/\.mdx$/, ""),
        title: data.title,
        excerpt: data.excerpt,
        date: data.date,
        tags: data.tags || [],
      };
    })
    .filter((article) =>
      article.tags?.some(
        (t: string) => t.toLowerCase() === decodedTag.toLowerCase()
      )
    )
    .sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  // Use the original tag casing from the first article (if available)
const displayTag =
  articles[0]?.tags?.find(
    (t: string) => t.toLowerCase() === decodedTag.toLowerCase()
  ) || decodedTag;

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-brand-dark mb-10">
        {displayTag}
      </h1>

      {articles.length === 0 ? (
        <p className="text-brand-dark">No articles found for this tag.</p>
      ) : (
        <div className="space-y-10">
          {articles.map((article) => (
            <div
              key={article.slug}
              className="border-b border-brand-dark pb-6 group transition-colors"
            >
              <Link
                href={`/insights/${article.slug}`}
                className="text-2xl font-bold text-brand-dark group-hover:text-brand-primary transition"
              >
                {article.title}
              </Link>

              {article.date && (
                <p className="text-sm text-brand-dark mt-1">{article.date}</p>
              )}

              {article.excerpt && (
                <p className="mt-3 text-brand-dark">{article.excerpt}</p>
              )}

              <Link
                href={`/insights/${article.slug}`}
                className="mt-4 inline-flex items-center text-brand-primary font-medium hover:underline"
              >
                Read more
                <span className="ml-1 group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
