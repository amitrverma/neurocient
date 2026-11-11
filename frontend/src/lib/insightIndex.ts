import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { slugifyTag } from "@/app/utils/slug";

export type InsightIndexEntry = {
  slug: string;
  title: string;
  description: string;
  date?: string;
  updated?: string;
  tags: string[];
};

const insightsDirectory = path.join(process.cwd(), "src/content/insights");

export function getInsightIndex(): InsightIndexEntry[] {
  return fs
    .readdirSync(insightsDirectory)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(insightsDirectory, file), "utf-8");
      const { data } = matter(raw);

      return {
        slug: file.replace(/\.mdx$/, ""),
        title: String(data.title || file.replace(/\.mdx$/, "")),
        description: String(data.description || data.excerpt || ""),
        date: typeof data.date === "string" ? data.date : undefined,
        updated: typeof data.updated === "string" ? data.updated : undefined,
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      };
    })
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

export function getIndexableTagSlugs(
  insights: InsightIndexEntry[],
  minimumArticleCount = 2,
): string[] {
  const counts = new Map<string, number>();

  insights.forEach((insight) => {
    new Set(insight.tags.map(slugifyTag).filter(Boolean)).forEach((tag) => {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    });
  });

  return [...counts.entries()]
    .filter(([, count]) => count >= minimumArticleCount)
    .map(([tag]) => tag)
    .sort();
}

export function contentDate(entry: InsightIndexEntry): Date | undefined {
  const value = entry.updated || entry.date;
  if (!value) return undefined;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}
