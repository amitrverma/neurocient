import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import type { Metadata } from "next";
import ArticleLayout from "../../components/ArticleLayout";
import { pathways, type PathwayId, type Pathway, type ArticleRef } from "@/content/pathways";

const insightsDir = path.join(process.cwd(), "src/content/insights");

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const filePath = path.join(insightsDir, `${slug}.mdx`);
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data } = matter(raw);

  return {
    title: `${data.title} | The Modern Caveman`,
    description: data.excerpt || "An article from The Modern Caveman.",
  };
}

export async function generateStaticParams() {
  return fs.readdirSync(insightsDir).map((file) => ({
    slug: file.replace(/\.mdx$/, ""),
  }));
}

// helper to estimate reading time
function getReadingTime(text: string) {
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
}

export default async function InsightPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const filePath = path.join(insightsDir, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return notFound();

  const raw = fs.readFileSync(filePath, "utf-8");
  const { content, data } = matter(raw);

  const { content: mdxContent } = await compileMDX({
    source: content,
    options: { parseFrontmatter: false },
  });

  const readingTime = getReadingTime(content);

  // --- 📚 Random "Read Next" (outside pathways) ---
  const allFiles = fs.readdirSync(insightsDir).filter((f) => f.endsWith(".mdx"));
  const otherFiles = allFiles.filter((f) => f.replace(/\.mdx$/, "") !== slug);

  let randomNext: { slug: string; title: string; excerpt?: string } | null = null;
  if (otherFiles.length > 0) {
    const randomFile = otherFiles[Math.floor(Math.random() * otherFiles.length)];
    const rawNext = fs.readFileSync(path.join(insightsDir, randomFile), "utf-8");
    const { data: nextData } = matter(rawNext);

    randomNext = {
      slug: randomFile.replace(/\.mdx$/, ""),
      title: nextData.title,
      excerpt: nextData.excerpt,
    };
  }

  // --- 🧭 Pathway navigation ---
  let pathwayData: { id: PathwayId; title: string } | null = null;
  let prevInPath: ArticleRef | null = null;
  let nextInPath: ArticleRef | null = null;

  if (data.pathway) {
    const pid = data.pathway as PathwayId;
    const cluster: Pathway | undefined = pathways[pid];

    if (cluster) {
      const sorted: ArticleRef[] = [...cluster.articles].sort(
        (a: ArticleRef, b: ArticleRef) => (a.order || 0) - (b.order || 0)
      );

      const idx = sorted.findIndex((a) => a.slug === slug);

      if (idx > 0) prevInPath = sorted[idx - 1];
      if (idx < sorted.length - 1) nextInPath = sorted[idx + 1];

      pathwayData = { id: pid, title: cluster.title };
    }
  }

  return (
    <ArticleLayout
      title={data.title}
      date={data.date}
      excerpt={data.excerpt}
      tags={data.tags}
      readingTime={readingTime}
      slug={slug}
      nextArticle={randomNext}
      resources={data.resources}
      pathway={pathwayData}   // ✅ pathway info
      prevInPath={prevInPath} // ✅ prev in pathway
      nextInPath={nextInPath} // ✅ next in pathway
    >
      <div className="prose prose-article max-w-none">{mdxContent}</div>
    </ArticleLayout>
  );
}
