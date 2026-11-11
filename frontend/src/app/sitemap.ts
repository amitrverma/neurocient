import type { MetadataRoute } from "next";
import {
  contentDate,
  getIndexableTagSlugs,
  getInsightIndex,
} from "@/lib/insightIndex";

const siteUrl = "https://neurocient.com";

const publicRoutes = [
  "",
  "/about",
  "/inner-caveman",
  "/insights",
  "/insights/all",
  "/diagnostics",
  "/diagnostics/caveman-scan",
  "/tools",
  "/practice",
  "/programs",
  "/membership",
  "/modern-caveman",
  "/caveman-cubicle",
  "/contact",
  "/support",
  "/privacy",
  "/terms",
  "/data-deletion",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const insights = getInsightIndex();
  const routes: MetadataRoute.Sitemap = publicRoutes.map((route) => ({
    url: route ? `${siteUrl}${route}` : siteUrl,
  }));
  const insightRoutes: MetadataRoute.Sitemap = insights.map((insight) => ({
    url: `${siteUrl}/insights/${insight.slug}`,
    lastModified: contentDate(insight),
  }));
  const tagRoutes: MetadataRoute.Sitemap = getIndexableTagSlugs(insights).map(
    (tag) => ({ url: `${siteUrl}/tags/${tag}` }),
  );

  return [...routes, ...insightRoutes, ...tagRoutes];
}
