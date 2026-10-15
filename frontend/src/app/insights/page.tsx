import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, LibraryBig } from "lucide-react";
import { slugifyTag } from "../utils/slug";

interface ArticleMeta {
  slug: string;
  title: string;
  excerpt: string;
  date?: string;
  tags?: string[];
}

interface QuestionPath {
  slug: string;
  question: string;
  situation: string;
  context: "Everyday life" | "At work";
}

const insightsDir = path.join(process.cwd(), "src/content/insights");

const questionPaths: QuestionPath[] = [
  {
    slug: "doomscrolling",
    question: "Why do I keep scrolling long after I meant to stop?",
    situation: "You open your phone for one thing. An hour disappears.",
    context: "Everyday life",
  },
  {
    slug: "replay-arguments",
    question: "Why do I keep replaying an argument?",
    situation: "The conversation is over. Your mind keeps restarting it.",
    context: "Everyday life",
  },
  {
    slug: "anticipatory-anxiety",
    question: "Why am I worrying before anything has happened?",
    situation: "One uncertain possibility begins to feel like the likely outcome.",
    context: "Everyday life",
  },
  {
    slug: "why-we-compare",
    question: "Why do I keep comparing myself with other people?",
    situation: "Someone else’s progress quietly changes how yours feels.",
    context: "Everyday life",
  },
  {
    slug: "stress-comfort-food",
    question: "Why does stress send me towards sugar and snacks?",
    situation: "The harder the day gets, the more immediate relief matters.",
    context: "Everyday life",
  },
  {
    slug: "silent-team",
    question: "Why does the room go quiet when honesty matters?",
    situation: "The meeting invites candor, but rank and consequence are still present.",
    context: "At work",
  },
];

const cleanText = (value: string) =>
  value
    .replaceAll("â€”", "—")
    .replaceAll("â€“", "–")
    .replaceAll("â€™", "’")
    .replaceAll("â€œ", "“")
    .replaceAll("â€", "”")
    .replaceAll("â€˜", "‘")
    .replaceAll("Â", "");

const formatDate = (date?: string) => {
  if (!date) return null;

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
};

const getArticles = (): ArticleMeta[] =>
  fs
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

export default function InsightsPage() {
  const articles = getArticles();
  const articlesBySlug = new Map(articles.map((article) => [article.slug, article]));
  const guidedQuestions = questionPaths
    .map((path) => ({ ...path, article: articlesBySlug.get(path.slug) }))
    .filter(
      (path): path is QuestionPath & { article: ArticleMeta } =>
        Boolean(path.article),
    );
  const guidedSlugs = new Set(guidedQuestions.map((path) => path.slug));
  const moreArticles = articles
    .filter((article) => !guidedSlugs.has(article.slug))
    .slice(0, 6);
  const tagCounts = new Map<string, number>();

  articles.forEach((article) => {
    article.tags?.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    });
  });

  const topTags = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <main className="insights-page">
      <section className="insights-hero">
        <div className="insights-hero-copy">
          <p className="insights-eyebrow">Understand what keeps happening</p>
          <h1>
            Start with the behavior
            <span>you cannot quite explain.</span>
          </h1>
          <p className="insights-hero-lede">
            Insights connects ordinary situations to the automatic responses
            beneath them—so you can understand the immediate pull, the later
            cost, and what familiar advice may be missing.
          </p>
          <a className="insights-anchor" href="#questions">
            Find your question <ArrowRight aria-hidden="true" />
          </a>
        </div>

        <aside className="insights-method" aria-label="How to use Insights">
          <p>Start with the moment</p>
          <ol>
            <li>
              <span>01</span>
              <strong>What happened?</strong>
              <small>Name the concrete situation.</small>
            </li>
            <li>
              <span>02</span>
              <strong>What felt useful immediately?</strong>
              <small>Find the payoff that arrived first.</small>
            </li>
            <li>
              <span>03</span>
              <strong>What did it cost later?</strong>
              <small>See the mismatch without turning it into an identity.</small>
            </li>
          </ol>
        </aside>
      </section>

      <section id="questions" className="insights-section insights-questions">
        <header className="insights-section-heading">
          <p className="insights-eyebrow">What brought you here?</p>
          <h2>Choose the question that feels familiar.</h2>
          <p>
            You do not need the right category. Begin with a moment you have
            actually lived.
          </p>
        </header>

        <div className="insights-question-grid">
          {guidedQuestions.map((path, index) => (
            <Link
              key={path.slug}
              href={`/insights/${path.slug}`}
              className="insights-question-card"
            >
              <div>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <small>{path.context}</small>
              </div>
              <h3>{path.question}</h3>
              <p>{path.situation}</p>
              <strong>
                Understand this pattern <ArrowUpRight aria-hidden="true" />
              </strong>
            </Link>
          ))}
        </div>
      </section>

      <section className="insights-section insights-more">
        <header className="insights-section-heading">
          <p className="insights-eyebrow insights-eyebrow-light">More explanations</p>
          <h2>Keep following what you recognise.</h2>
        </header>

        <div className="insights-article-list">
          {moreArticles.map((article, index) => (
            <Link key={article.slug} href={`/insights/${article.slug}`}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <small>{formatDate(article.date) ?? "Insight"}</small>
                <h3>{article.title}</h3>
              </div>
              <ArrowRight aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <section className="insights-section insights-library">
        <div className="insights-library-copy">
          <LibraryBig aria-hidden="true" />
          <p className="insights-eyebrow">The complete library</p>
          <h2>Browse every explanation.</h2>
          <p>
            Use the archive when you already know what you are looking for—or
            explore a topic across several situations.
          </p>
          <Link href="/insights/all" className="insights-library-button">
            View all {articles.length} insights
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>

        <div className="insights-topics">
          <p>Browse by topic</p>
          <div>
            {topTags.map(([tag, count]) => (
              <Link key={tag} href={`/tags/${slugifyTag(tag)}`}>
                <span>{cleanText(tag)}</span>
                <small>{count}</small>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
