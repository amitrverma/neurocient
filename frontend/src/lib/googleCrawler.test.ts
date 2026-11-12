import { describe, expect, it, vi } from "vitest";

import { ipMatchesPrefixes, isVerifiedGooglebotRequest } from "./googleCrawler";

const GOOGLEBOT =
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";

describe("verified Googlebot access", () => {
  it("matches IPv4, mapped IPv4, and IPv6 CIDR ranges", () => {
    const prefixes = ["66.249.64.0/19", "2001:4860:4801:10::/64"];
    expect(ipMatchesPrefixes("66.249.66.1", prefixes)).toBe(true);
    expect(ipMatchesPrefixes("::ffff:66.249.66.1", prefixes)).toBe(true);
    expect(ipMatchesPrefixes("2001:4860:4801:10::1", prefixes)).toBe(true);
    expect(ipMatchesPrefixes("203.0.113.5", prefixes)).toBe(false);
  });

  it("accepts Googlebot only from a published range on Vercel production", async () => {
    const loadPrefixes = vi.fn().mockResolvedValue(["66.249.64.0/19"]);
    const requestHeaders = new Headers({
      "user-agent": GOOGLEBOT,
      "x-vercel-forwarded-for": "66.249.66.1",
    });

    await expect(
      isVerifiedGooglebotRequest(requestHeaders, {
        vercelEnvironment: "production",
        loadPrefixes,
      }),
    ).resolves.toBe(true);
    expect(loadPrefixes).toHaveBeenCalledOnce();
  });

  it.each([
    ["a spoofed source IP", GOOGLEBOT, "203.0.113.5", "production"],
    ["a spoofed user agent", "ordinary browser", "66.249.66.1", "production"],
    ["a non-Vercel runtime", GOOGLEBOT, "66.249.66.1", undefined],
    ["a preview deployment", GOOGLEBOT, "66.249.66.1", "preview"],
  ])("fails closed for %s", async (_label, userAgent, ip, vercelEnvironment) => {
    await expect(
      isVerifiedGooglebotRequest(
        new Headers({
          "user-agent": userAgent,
          "x-vercel-forwarded-for": ip,
        }),
        {
          vercelEnvironment,
          loadPrefixes: async () => ["66.249.64.0/19"],
        },
      ),
    ).resolves.toBe(false);
  });

  it("fails closed when Google's range service is unavailable", async () => {
    await expect(
      isVerifiedGooglebotRequest(
        new Headers({
          "user-agent": GOOGLEBOT,
          "x-vercel-forwarded-for": "66.249.66.1",
        }),
        {
          vercelEnvironment: "production",
          loadPrefixes: async () => {
            throw new Error("offline");
          },
        },
      ),
    ).resolves.toBe(false);
  });
});
