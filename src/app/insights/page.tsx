import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { slugifyTag } from "../utils/slug";

interface ArticleMeta {
  slug: string;
  title: string;
  excerpt: string;
  date?: string;
  tags?: string[];
}

const insightsDir = path.join(process.cwd(), "src/content/insights");

const cleanText = (value: string) =>
  value
    .replaceAll("â€”", "-")
    .replaceAll("â€“", "-")
    .replaceAll("â€™", "'")
    .replaceAll("â€œ", '"')
    .replaceAll("â€", '"')
    .replaceAll("â€˜", "'")
    .replaceAll("Â", "");

const formatDate = (date?: string) => {
  if (!date) return null;

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
};

export default function InsightsPage() {
  const articles: ArticleMeta[] = fs
    .readdirSync(insightsDir)
    .map((file) => {
      const raw = fs.readFileSync(path.join(insightsDir, file), "utf-8");
      const { data } = matter(raw);

      return {
        slug: file.replace(/\.mdx$/, ""),
        title: cleanText(data.title as string),
        excerpt: cleanText(data.excerpt as string),
        date: data.date as string,
        tags: data.tags as string[],
      };
    })
    .sort(
      (a, b) =>
        new Date(b.date || "").getTime() - new Date(a.date || "").getTime(),
    );

  const [featuredArticle, ...secondaryArticles] = articles.slice(0, 7);
  const tagCounts: Record<string, number> = {};

  articles.forEach((article) => {
    article.tags?.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7);

  return (
    <main className="bg-white font-serif text-brand-dark">
      <section className="mx-auto w-full max-w-6xl px-6 pt-14 pb-10 md:pt-16 md:pb-12">
        <SectionLabel>Insights</SectionLabel>

        <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <div>
            <h1 className="text-[clamp(2.4rem,4.4vw,4.55rem)] font-bold leading-[0.98] tracking-[-0.03em] text-brand-dark">
              Insights for
              <br />
              <span className="italic text-brand-accent">
                old patterns.
              </span>
            </h1>
            <p className="mt-6 max-w-lg border-l-4 border-brand-secondary pl-5 font-sans text-base leading-8 text-brand-dark">
              Short articles on the ancient wiring behind modern behavior.
            </p>

            <div className="mt-7">
              <p className="mb-3 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
                Browse by pattern
              </p>
              <div className="flex flex-wrap gap-2">
                {topTags.map(([tag, count]) => (
                  <Link
                    key={tag}
                    href={`/tags/${slugifyTag(tag)}`}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-brand-dark/15 px-4 py-2 font-sans text-xs font-semibold text-brand-dark transition hover:border-brand-teal hover:text-brand-teal"
                  >
                    {cleanText(tag)}
                    <span className="text-brand-dark/45">{count}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {featuredArticle ? (
            <FeaturedArticle article={featuredArticle} />
          ) : null}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pt-4 pb-14 md:pt-6 md:pb-20">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold leading-tight tracking-[-0.02em] text-brand-dark md:text-5xl">
              Recent articles.
            </h2>
          </div>
          <Link
            href="/insights/all"
            className="hidden cursor-pointer items-center gap-2 rounded-full border border-brand-dark/25 px-5 py-3 font-sans text-sm font-semibold text-brand-dark transition hover:border-brand-primary hover:text-brand-primary sm:inline-flex"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="border-y border-brand-dark/12">
          {secondaryArticles.map((article) => (
            <ArticleRow key={article.slug} article={article} />
          ))}
        </div>

        <Link
          href="/insights/all"
          className="mt-8 inline-flex cursor-pointer items-center gap-2 rounded-full border border-brand-dark bg-brand-dark px-6 py-3 font-sans text-sm font-semibold text-white transition hover:opacity-90 sm:hidden"
        >
          View all articles
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </main>
  );
}

const FeaturedArticle = ({ article }: { article: ArticleMeta }) => (
  <Link
    href={`/insights/${article.slug}`}
    className="group block cursor-pointer rounded-lg border border-brand-dark bg-brand-dark p-6 text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-dark/95 hover:shadow-md md:p-8"
  >
    <span className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-secondary">
      Featured
    </span>
    <h2 className="mt-4 text-3xl font-bold leading-tight tracking-[-0.02em] md:text-4xl">
      {article.title}
    </h2>
    <p className="mt-4 font-sans text-sm leading-7 text-white/68">
      {article.excerpt}
    </p>
    <div className="mt-7 flex flex-wrap items-center gap-3 font-sans text-xs text-white/55">
      {formatDate(article.date) ? <span>{formatDate(article.date)}</span> : null}
      {article.tags?.slice(0, 2).map((tag) => (
        <span
          key={tag}
          className="rounded-full border border-white/15 px-3 py-1 text-white/68"
        >
          {cleanText(tag)}
        </span>
      ))}
    </div>
    <span className="mt-7 inline-flex items-center gap-2 font-sans text-sm font-semibold text-brand-secondary">
      Read article
      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
    </span>
  </Link>
);

const ArticleRow = ({ article }: { article: ArticleMeta }) => (
  <Link
    href={`/insights/${article.slug}`}
    className="group grid cursor-pointer gap-4 border-b border-brand-dark/12 py-6 transition last:border-b-0 md:grid-cols-[0.68fr_1fr_auto] md:items-center"
  >
    <div>
      <p className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-brand-teal">
        {formatDate(article.date) ?? "Article"}
      </p>
      <h3 className="mt-2 text-2xl font-bold leading-tight text-brand-dark">
        {article.title}
      </h3>
    </div>
    <p className="font-sans text-sm leading-7 text-brand-dark/72">
      {article.excerpt}
    </p>
    <ArrowRight className="h-5 w-5 text-brand-accent transition group-hover:translate-x-0.5" />
  </Link>
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-7 flex items-center gap-3 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal">
    <span>{children}</span>
    <span className="h-px flex-1 bg-brand-dark/15" />
  </div>
);
