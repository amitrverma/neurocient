import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

import { splitInsightContent } from "./insightPublicLead";

describe("Insight public leads", () => {
  it("separates the opening explanation from the first section", () => {
    expect(
      splitInsightContent(
        "An answer people can use.\n\n## Deeper explanation\nPrivate detail.",
        "Fallback",
      ),
    ).toEqual({
      publicLead: "An answer people can use.",
      meteredBody: "## Deeper explanation\nPrivate detail.",
    });
  });

  it("does not expose an unstructured body as the public lead", () => {
    expect(splitInsightContent("Gated body without sections", "Public summary"))
      .toEqual({
        publicLead: "Public summary",
        meteredBody: "Gated body without sections",
      });
  });

  it("removes a duplicate top-level heading from the public lead", () => {
    expect(
      splitInsightContent(
        "# Repeated title\n\nUseful opening.\n\n## More\nGated body.",
        "Fallback",
      ).publicLead,
    ).toBe("Useful opening.");
  });

  it("gives every current Insight a substantive lead and metered body", () => {
    const insightDirectory = path.resolve(process.cwd(), "src/content/insights");
    const files = fs.readdirSync(insightDirectory).filter((file) => file.endsWith(".mdx"));

    expect(files).toHaveLength(29);
    for (const file of files) {
      const { content, data } = matter(
        fs.readFileSync(path.join(insightDirectory, file), "utf8"),
      );
      const fallback = String(data.excerpt || data.description || "");
      const parts = splitInsightContent(content, fallback);
      const publicWords = parts.publicLead.split(/\s+/).filter(Boolean).length;

      expect(publicWords, `${file} public lead`).toBeGreaterThanOrEqual(75);
      expect(parts.meteredBody, `${file} metered body`).toMatch(/^##\s+/);
    }
  });
});
