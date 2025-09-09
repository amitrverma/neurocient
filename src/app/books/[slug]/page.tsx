import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import type { Metadata } from "next";

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

export async function generateStaticParams() {
  return fs
    .readdirSync(booksDir)
    .filter((f) => f.endsWith(".mdx"))
    .map((file) => ({ slug: file.replace(/\.mdx$/, "") }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const filePath = path.join(booksDir, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return {};

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data } = matter(raw);
  const fm = data as BookFrontmatter;

  return {
    title: fm.title,
    description: fm.excerpt || `A resource from Neurocient Labs.`,
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

export default async function BookPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const filePath = path.join(booksDir, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return notFound();

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const fm = data as BookFrontmatter;

  const { content: mdx } = await compileMDX({
    source: content,
    options: { parseFrontmatter: false },
    components: {}, // add MDX components if you want
  });

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-brand-dark">{fm.title}</h1>
      <p className="text-brand-dark/70 mt-1">
        {fm.author} {fm.year ? `• ${fm.year}` : ""}
      </p>

      {fm.image && (
        <img
          src={fm.image}
          alt={fm.title}
          className="w-full h-64 object-cover rounded-lg mt-6"
        />
      )}

      <article className="prose prose-article max-w-none mt-6">{mdx}</article>

      {fm.affiliateLink && (
        <a
          href={fm.affiliateLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-8 px-4 py-2 rounded-lg bg-brand-secondary text-brand-dark font-semibold hover:shadow-md transition"
        >
          Buy on Amazon
        </a>
      )}
    </div>
  );
}
