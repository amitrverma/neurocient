import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";
import type React from "react";
import { ArrowRight, BookOpen } from "lucide-react";
import { slugifyTag, unslugifyTag } from "../../utils/slug";

const insightsDir = path.join(process.cwd(), "src/content/insights");

interface ArticleMeta {
  slug: string;
  title: string;
  excerpt?: string;
  date?: string;
  tags: string[];
}

const cleanText = (value = "") =>
  value
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/—/g, "-")
    .replace(/…/g, "...")
    .replace(/Â/g, "")
    .trim();

const formatDate = (date?: string) => {
  if (!date) return null;

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
};

const readArticles = (): ArticleMeta[] =>
  fs
    .readdirSync(insightsDir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(insightsDir, file), "utf-8");
      const { data } = matter(raw);

      return {
        slug: file.replace(/\.mdx$/, ""),
        title: cleanText(data.title),
        excerpt: cleanText(data.excerpt),
        date: data.date,
        tags: data.tags || [],
      };
    });

export async function generateStaticParams() {
  const tags = readArticles().flatMap((article) => article.tags);

  return [...new Set(tags)].map((tag) => ({
    tag: slugifyTag(tag),
  }));
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const decodedTag = unslugifyTag(tag);

  const articles = readArticles()
    .filter((article) =>
      article.tags.some((articleTag) => slugifyTag(articleTag) === tag),
    )
    .sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  const displayTag =
    articles[0]?.tags.find((articleTag) => slugifyTag(articleTag) === tag) ||
    decodedTag;

  const articleLabel = articles.length === 1 ? "article" : "articles";

  return (
    <main className="surface-page">
      <section className="surface-hero utility-hero">
        <div>
          <p className="surface-eyebrow">Tagged insights</p>
          <h1 className="surface-title">
            {displayTag}
            <span>archive.</span>
          </h1>
        </div>

        <aside className="utility-hero-card">
          <p>{articles.length} {articleLabel}</p>
          <strong>Follow one idea across essays.</strong>
          <span>A focused reading list from Neurocient Labs, filtered to one idea stream so the pattern is easier to follow.</span>
          <Link
            href="/insights"
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-brand-dark/25 px-5 py-2.5 font-sans text-sm font-semibold text-brand-dark transition hover:border-brand-primary hover:text-brand-primary"
          >
            All insights
            <ArrowRight className="h-4 w-4" />
          </Link>
        </aside>
      </section>

      <section className="px-6 pb-16 md:pb-20">
        <div className="mx-auto max-w-6xl">
          {articles.length === 0 ? (
            <div className="rounded-lg border border-brand-dark/12 p-8 md:p-10">
              <BookOpen className="h-6 w-6 text-brand-accent" />
              <h2 className="mt-5 text-3xl font-bold leading-tight">
                No articles found for this tag.
              </h2>
              <p className="mt-3 max-w-2xl font-sans text-sm leading-7 text-brand-dark/72">
                The tag may have moved, or the article set may still be in
                progress. Browse the full insights archive instead.
              </p>
              <Link
                href="/insights"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-dark px-5 py-2.5 font-sans text-sm font-semibold text-white transition hover:bg-brand-primary"
              >
                Browse insights
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="border-y border-brand-dark/14">
              {articles.map((article) => (
                <ArticleRow key={article.slug} article={article} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

const ArticleRow = ({ article }: { article: ArticleMeta }) => (
  <article className="group grid gap-5 border-b border-brand-dark/12 py-7 last:border-b-0 md:grid-cols-[0.26fr_1fr] md:py-8">
    <div className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-brand-teal">
      {formatDate(article.date) || "Undated"}
    </div>
    <div>
      <Link href={`/insights/${article.slug}`}>
        <h2 className="max-w-3xl text-3xl font-bold leading-tight tracking-[-0.02em] transition group-hover:text-brand-primary md:text-4xl">
          {article.title}
        </h2>
      </Link>
      {article.excerpt && (
        <p className="mt-4 max-w-3xl font-sans text-sm leading-7 text-brand-dark/72 md:text-base md:leading-8">
          {article.excerpt}
        </p>
      )}
      <Link
        href={`/insights/${article.slug}`}
        className="mt-5 inline-flex items-center gap-2 font-sans text-sm font-semibold text-brand-accent"
      >
        Read article
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </Link>
    </div>
  </article>
);
