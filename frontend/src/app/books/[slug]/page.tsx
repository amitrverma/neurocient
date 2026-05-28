import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";

const booksDir = path.join(process.cwd(), "src/content/books");

type BookFrontmatter = {
  title: string;
  author: string;
  type?: "book" | "paper" | "article";
  year?: number;
  motive?: string[];
  program?: string[];
  image?: string;
  affiliateLink?: string;
  tags?: string[];
  excerpt?: string;
};

const cleanText = (value = "") =>
  value
    .replaceAll("â€”", "-")
    .replaceAll("â€“", "-")
    .replaceAll("â†’", "->")
    .replaceAll("â€™", "'")
    .replaceAll("â€œ", '"')
    .replaceAll("â€", '"')
    .replaceAll("Â", "")
    .trim();

export async function generateStaticParams() {
  return fs
    .readdirSync(booksDir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => ({ slug: file.replace(/\.mdx$/, "") }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const filePath = path.join(booksDir, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return {};

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data } = matter(raw);
  const fm = data as BookFrontmatter;

  return {
    title: fm.title,
    description: fm.excerpt || "A resource from Neurocient Labs.",
    openGraph: {
      type: "article",
      title: fm.title,
      description: fm.excerpt,
      images: [{ url: fm.image || "/logo/neurocient.png" }],
    },
    twitter: {
      card: "summary_large_image",
      title: fm.title,
      description: fm.excerpt,
      images: [fm.image || "/logo/neurocient.png"],
    },
  };
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const filePath = path.join(booksDir, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return notFound();

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const fm = data as BookFrontmatter;

  const { content: mdx } = await compileMDX({
    source: cleanText(content),
    options: { parseFrontmatter: false },
    components: {},
  });

  return (
    <main className="bg-white font-serif text-brand-dark">
      <section className="px-6 py-14 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
          <div>
            <Link
              href="/books"
              className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-brand-accent"
            >
              <ArrowLeft className="h-4 w-4" />
              Books library
            </Link>
            <h1 className="mt-6 text-[clamp(2.35rem,5vw,4.9rem)] font-bold leading-[1] tracking-[-0.03em]">
              {fm.title}
            </h1>
          </div>
          <div className="rounded-lg border border-brand-dark/12 p-6 shadow-[0_20px_60px_rgba(4,42,43,0.06)] md:p-8">
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
              {fm.type || "book"}
            </p>
            <p className="mt-3 font-sans text-base font-semibold text-brand-dark">
              {fm.author}
              {fm.year ? `, ${fm.year}` : ""}
            </p>
            {fm.program?.length ? (
              <p className="mt-4 font-sans text-sm leading-7 text-brand-dark/72">
                Relevant to {fm.program.join(" and ")}.
              </p>
            ) : null}
            {fm.affiliateLink && (
              <a
                href={fm.affiliateLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-dark px-5 py-2.5 font-sans text-sm font-semibold text-white transition hover:bg-brand-primary"
              >
                Find the book
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </section>

      <section className="px-6 pb-16 md:pb-20">
        <article className="prose prose-article mx-auto max-w-3xl">{mdx}</article>
        <div className="mx-auto mt-10 max-w-3xl border-t border-brand-dark/12 pt-6">
          <Link
            href="/books"
            className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-brand-accent"
          >
            Back to library
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
