import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";

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
  const files = fs.readdirSync(booksDir).filter((f) => f.endsWith(".mdx"));

  const books = files.map((filename) => {
    const raw = fs.readFileSync(path.join(booksDir, filename), "utf-8");
    const { data } = matter(raw);
    return {
      slug: filename.replace(/\.mdx$/, ""),
      ...(data as BookFrontmatter),
    };
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">Books Library</h1>
      <p className="text-brand-dark/70 mb-8">
        Foundational books, papers, and essays that inform The Modern Caveman.
      </p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {books.map((b) => (
          <Link
            key={b.slug}
            href={`/books/${b.slug}`}
            className="block rounded-xl border border-brand-dark/10 bg-white hover:shadow-md transition"
          >
            {b.image && (
              <img
                src={b.image}
                alt={b.title}
                className="w-full h-48 object-cover rounded-t-xl"
              />
            )}
            <div className="p-4">
              <h2 className="text-lg font-semibold text-brand-dark">{b.title}</h2>
              {b.author && (
                <p className="text-sm text-brand-dark/70 mt-1">{b.author}</p>
              )}
              {b.tags?.length ? (
                <p className="text-xs text-brand-dark/60 mt-3 line-clamp-2">
                  {b.tags.join(", ")}
                </p>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
