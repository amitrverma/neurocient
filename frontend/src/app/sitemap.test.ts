import { describe, expect, it } from "vitest";
import sitemap from "./sitemap";

describe("search sitemap", () => {
  it("publishes unique canonical public URLs and excludes private surfaces", async () => {
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(new Set(urls).size).toBe(urls.length);
    expect(urls).toContain("https://neurocient.com");
    expect(urls).toContain("https://neurocient.com/insights/doomscrolling");
    expect(urls).toContain("https://neurocient.com/diagnostics/caveman-scan");
    expect(urls).toContain("https://neurocient.com/modern-caveman");
    expect(urls).not.toContain("https://neurocient.com/admin");
    expect(urls).not.toContain("https://neurocient.com/profile");
    expect(urls).not.toContain("https://neurocient.com/forgot-password");
    expect(urls).not.toContain("https://neurocient.com/diagnostics/caveman-scan/result");
  });

  it("uses content dates instead of deployment time and omits ignored hints", async () => {
    const entries = await sitemap();
    const doomscrolling = entries.find(
      (entry) => entry.url === "https://neurocient.com/insights/doomscrolling",
    );

    expect(doomscrolling?.lastModified).toEqual(new Date("2025-04-27"));
    expect(doomscrolling).not.toHaveProperty("changeFrequency");
    expect(doomscrolling).not.toHaveProperty("priority");
  });
});
