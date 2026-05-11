import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { slugifyTag } from "../../utils/slug";

interface ArticleMeta {
  slug: string;
  title: string;
  excerpt: string;
  date?: string;
  tags?: string[];
}

const insightsDir = path.join(process.cwd(), "src/content/insights");

const cleanText = (value = "") =>
  value
    .replaceAll("Ã¢â‚¬â€", "-")
    .replaceAll("Ã¢â‚¬â€œ", "-")
    .replaceAll("Ã¢â‚¬â„¢", "'")
    .replaceAll("Ã¢â‚¬Å“", '"')
    .replaceAll("Ã¢â‚¬Â", '"')
    .replaceAll("Ã¢â‚¬Ëœ", "'")
    .replaceAll("Ã‚", "");

const formatDate = (date?: string) => {
  if (!date) return null;

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
};

export default function AllInsightsPage() {
  const articles: ArticleMeta[] = fs
    .readdirSync(insightsDir)
    .filter((file) => file.endsWith(".mdx"))
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

  const tagCounts: Record<string, number> = {};
  articles.forEach((article) => {
    article.tags?.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  const tags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);

  return (
    <main className="bg-white font-serif text-brand-dark">
      <section className="mx-auto w-full max-w-6xl px-6 pt-14 pb-10 md:pt-16 md:pb-12">
        <SectionLabel>All insights</SectionLabel>

        <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
          <div>
            <h1 className="text-[clamp(2.8rem,5.4vw,5.6rem)] font-bold leading-[0.94] tracking-[-0.03em] text-brand-dark">
              The full
              <br />
              <span className="italic text-brand-accent">field guide.</span>
            </h1>
          </div>
          <div>
            <p className="max-w-2xl border-l-4 border-brand-secondary pl-5 font-sans text-base leading-8 text-brand-dark md:text-lg">
              Browse every Neurocient essay on the ancient wiring behind modern
              behavior: worry, comparison, avoidance, belonging, status, and the
              patterns that keep repeating.
            </p>
            <p className="mt-5 font-sans text-sm font-semibold uppercase tracking-[0.16em] text-brand-teal">
              {articles.length} articles across {tags.length} patterns
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-10 px-6 pb-16 lg:grid-cols-[14rem_1fr] lg:items-start">
        <aside className="lg:sticky lg:top-24">
          <div className="border-t border-brand-dark/15 pt-5">
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">
              Browse by pattern
            </p>
            <div className="mt-5 flex flex-wrap gap-2 lg:block lg:space-y-2">
              {tags.map(([tag, count]) => (
                <Link
                  key={tag}
                  href={`/tags/${slugifyTag(tag)}`}
                  className="group flex items-center justify-between gap-3 rounded-full border border-brand-dark/15 px-3 py-2 font-sans text-xs font-semibold text-brand-dark transition hover:border-brand-teal hover:text-brand-teal lg:rounded-none lg:border-x-0 lg:border-b-0 lg:px-0"
                >
                  <span>{cleanText(tag)}</span>
                  <span className="text-brand-dark/45 group-hover:text-brand-teal">
                    {count}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </aside>

        <div className="border-y border-brand-dark/12">
          {articles.map((article, index) => (
            <ArticleRow
              key={article.slug}
              article={article}
              index={articles.length - index}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

const ArticleRow = ({
  article,
  index,
}: {
  article: ArticleMeta;
  index: number;
}) => (
  <Link
    href={`/insights/${article.slug}`}
    className="group grid gap-5 border-b border-brand-dark/12 py-7 transition last:border-b-0 md:grid-cols-[4.5rem_0.8fr_1fr_auto] md:items-start"
  >
    <span className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-brand-primary/75">
      {String(index).padStart(2, "0")}
    </span>

    <div>
      <p className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-brand-teal">
        {formatDate(article.date) ?? "Article"}
      </p>
      <h2 className="mt-2 text-2xl font-bold leading-tight text-brand-dark transition group-hover:text-brand-primary">
        {article.title}
      </h2>
      {article.tags?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {article.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-brand-dark/12 px-3 py-1 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-brand-dark/62"
            >
              {cleanText(tag)}
            </span>
          ))}
        </div>
      ) : null}
    </div>

    <p className="font-sans text-sm leading-7 text-brand-dark/72">
      {article.excerpt}
    </p>

    <ArrowRight className="mt-1 h-5 w-5 text-brand-accent transition group-hover:translate-x-0.5" />
  </Link>
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-7 flex items-center gap-3 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal">
    <span>{children}</span>
    <span className="h-px flex-1 bg-brand-dark/15" />
  </div>
);
