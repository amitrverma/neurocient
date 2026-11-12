import { beforeEach, describe, expect, it, vi } from "vitest";

const compileMDX = vi.fn();
const requestArticleAccess = vi.fn();
const isVerifiedGooglebotRequest = vi.fn();

const PUBLIC_LEAD = "A useful public explanation for people and discovery systems.";
const METERED_BODY = "## Deeper explanation\nA private metered detail.";

vi.mock("fs", () => ({
  default: {
    existsSync: vi.fn(() => true),
    readFileSync: vi.fn(
      () => `---\ntitle: A private insight\ndate: 2026-01-01\nexcerpt: Public summary\n---\n${PUBLIC_LEAD}\n\n${METERED_BODY}`,
    ),
    readdirSync: vi.fn(() => []),
  },
}));
vi.mock("next-mdx-remote/rsc", () => ({ compileMDX }));
vi.mock("next/navigation", () => ({ notFound: vi.fn() }));
vi.mock("next/headers", () => ({ headers: vi.fn(async () => new Headers()) }));
vi.mock("next/script", () => ({ default: () => null }));
vi.mock("./articleAccess", () => ({ requestArticleAccess }));
vi.mock("@/lib/googleCrawler", () => ({ isVerifiedGooglebotRequest }));
vi.mock("./InsightAccessGate", () => ({ default: () => null }));
vi.mock("../../components/ArticleLayout", () => ({ default: () => null }));
vi.mock("../../components/tools/MicrochallengeBox", () => ({ default: () => null }));
vi.mock("../../components/ui/CavemanSpot", () => ({ default: () => null }));
vi.mock("../../components/ConversationVersion", () => ({ default: () => null }));
vi.mock("../../components/InnerCavemanHighlighter", () => ({ default: () => null }));
vi.mock("@/content/pathways", () => ({ pathways: {} }));
vi.mock("@/lib/azureAudioSas", () => ({ generateAudioSasUrl: vi.fn() }));

describe("InsightPage access boundary", () => {
  beforeEach(() => {
    compileMDX.mockReset();
    compileMDX.mockImplementation(async ({ source }) => ({ content: source }));
    requestArticleAccess.mockReset();
    isVerifiedGooglebotRequest.mockReset();
    isVerifiedGooglebotRequest.mockResolvedValue(false);
  });

  it("compiles the public lead but not the metered body when access is denied", async () => {
    requestArticleAccess.mockResolvedValue({
      granted: false,
      reason: "membership",
      message: "Membership required",
    });

    const { default: InsightPage } = await import("./page");
    await InsightPage({ params: Promise.resolve({ slug: "private-insight" }) });

    expect(requestArticleAccess).toHaveBeenCalledWith("private-insight");
    expect(compileMDX).toHaveBeenCalledOnce();
    expect(compileMDX).toHaveBeenCalledWith(
      expect.objectContaining({ source: PUBLIC_LEAD }),
    );
    expect(compileMDX).not.toHaveBeenCalledWith(
      expect.objectContaining({ source: expect.stringContaining("private metered detail") }),
    );
  });

  it("serves the full article to a verified Googlebot without consuming a reader grant", async () => {
    isVerifiedGooglebotRequest.mockResolvedValue(true);

    const { default: InsightPage } = await import("./page");
    await InsightPage({ params: Promise.resolve({ slug: "private-insight" }) });

    expect(requestArticleAccess).not.toHaveBeenCalled();
    expect(compileMDX).toHaveBeenCalledTimes(2);
    expect(compileMDX).toHaveBeenCalledWith(
      expect.objectContaining({ source: METERED_BODY }),
    );
  });
});
