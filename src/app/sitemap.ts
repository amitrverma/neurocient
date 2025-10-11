import type { MetadataRoute } from "next";
import fs from "fs";
import path from "path";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://neurocient.com";

  const routes: MetadataRoute.Sitemap = [
    "",
    "/about",
    "/resources",
    "/programs",
    "/diagnostics",
    "/tools",
    "/spot",
    "/microchallenge",
    "/insights",
    "/insights/all",
    "/tags/inner-caveman",
    "/inner-caveman",
  ].map((p) => ({ url: `${base}${p}` }));

  const insightsDir = path.join(process.cwd(), "src/content/insights");
  const entries: MetadataRoute.Sitemap = [];
  try {
    const files = fs
      .readdirSync(insightsDir)
      .filter((f) => f.endsWith(".mdx"));

    for (const file of files) {
      const slug = file.replace(/\.mdx$/, "");
      entries.push({ url: `${base}/insights/${slug}` });
    }
  } catch {
    // ignore if content folder missing
  }

  return [...routes, ...entries];
}

