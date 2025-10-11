import type { MetadataRoute } from "next";
import fs from "fs";
import path from "path";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://neurocient.com";

  const now = new Date();
  const routes: MetadataRoute.Sitemap = [
    { path: "", changeFrequency: "daily", priority: 0.9 },
    { path: "/about", changeFrequency: "monthly", priority: 0.4 },
    { path: "/resources", changeFrequency: "monthly", priority: 0.5 },
    { path: "/programs", changeFrequency: "monthly", priority: 0.5 },
    { path: "/diagnostics", changeFrequency: "weekly", priority: 0.6 },
    { path: "/tools", changeFrequency: "monthly", priority: 0.5 },
    { path: "/spot", changeFrequency: "weekly", priority: 0.5 },
    { path: "/microchallenge", changeFrequency: "weekly", priority: 0.5 },
    { path: "/insights", changeFrequency: "daily", priority: 0.8 },
    { path: "/insights/all", changeFrequency: "daily", priority: 0.7 },
    { path: "/tags/inner-caveman", changeFrequency: "weekly", priority: 0.6 },
    { path: "/inner-caveman", changeFrequency: "weekly", priority: 0.6 },
  ].map((e) => ({ url: `${base}${e.path}`, lastModified: now, changeFrequency: e.changeFrequency as MetadataRoute.Sitemap[0]["changeFrequency"], priority: e.priority }));

  const insightsDir = path.join(process.cwd(), "src/content/insights");
  const entries: MetadataRoute.Sitemap = [];
  try {
    const files = fs
      .readdirSync(insightsDir)
      .filter((f) => f.endsWith(".mdx"));

    for (const file of files) {
      const slug = file.replace(/\.mdx$/, "");
      const fullPath = path.join(insightsDir, file);
      let lastModified: Date | undefined;
      try {
        const stats = fs.statSync(fullPath);
        lastModified = stats.mtime;
      } catch {}
      entries.push({
        url: `${base}/insights/${slug}`,
        lastModified,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch {
    // ignore if content folder missing
  }

  return [...routes, ...entries];
}
