import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";
import type React from "react";
import { ArrowRight, BookOpen } from "lucide-react";

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

export default function BooksPage() {
  const books = fs
    .readdirSync(booksDir)
    .filter((file) => file.endsWith(".mdx"))
    .map((filename) => {
      const raw = fs.readFileSync(path.join(booksDir, filename), "utf-8");
      const { data } = matter(raw);
      return {
        slug: filename.replace(/\.mdx$/, ""),
        ...(data as BookFrontmatter),
      };
    });

  return (
    <main className="bg-white font-serif text-brand-dark">
      <section className="px-6 py-14 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
          <div>
            <SectionLabel>Library</SectionLabel>
            <h1 className="mt-6 text-[clamp(2.55rem,5vw,5.2rem)] font-bold leading-[0.98] tracking-[-0.03em]">
              Books behind
              <br />
              <span className="italic text-brand-accent">the framework.</span>
            </h1>
          </div>
          <p className="max-w-2xl border-l-4 border-brand-secondary pl-5 font-sans text-base leading-8 text-brand-dark/72 md:text-lg">
            Foundational books, papers, and essays that inform the Modern
            Caveman and Caveman in the Cubicle lenses.
          </p>
        </div>
      </section>

      <section className="px-6 pb-16 md:pb-20">
        <div className="mx-auto max-w-6xl border-y border-brand-dark/12">
          {books.map((book) => (
            <Link
              key={book.slug}
              href={`/books/${book.slug}`}
              className="group grid gap-5 border-b border-brand-dark/12 py-7 transition last:border-b-0 md:grid-cols-[0.3fr_1fr_auto] md:items-center"
            >
              <div className="flex items-center gap-3 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-brand-teal">
                <BookOpen className="h-4 w-4" />
                {book.type || "book"}
              </div>
              <div>
                <h2 className="text-3xl font-bold leading-tight tracking-[-0.02em] transition group-hover:text-brand-primary">
                  {book.title}
                </h2>
                <p className="mt-2 font-sans text-sm leading-7 text-brand-dark/72">
                  {book.author}
                  {book.year ? `, ${book.year}` : ""}
                </p>
                {book.tags?.length ? (
                  <p className="mt-3 font-sans text-xs font-semibold uppercase tracking-[0.12em] text-brand-dark/45">
                    {book.tags.join(" / ")}
                  </p>
                ) : null}
              </div>
              <span className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-brand-accent">
                Open
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-3 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal">
    <span>{children}</span>
    <span className="h-px flex-1 bg-brand-dark/15" />
  </div>
);
