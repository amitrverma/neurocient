import { beforeEach, describe, expect, it, vi } from "vitest";

const compileMDX = vi.fn();
const requestArticleAccess = vi.fn();

vi.mock("fs", () => ({
  default: {
    existsSync: vi.fn(() => true),
    readFileSync: vi.fn(
      () => "---\ntitle: A private insight\n---\nThe paid article body",
    ),
    readdirSync: vi.fn(() => []),
  },
}));
vi.mock("next-mdx-remote/rsc", () => ({ compileMDX }));
vi.mock("next/navigation", () => ({ notFound: vi.fn() }));
vi.mock("next/script", () => ({ default: () => null }));
vi.mock("./articleAccess", () => ({ requestArticleAccess }));
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
    requestArticleAccess.mockReset();
  });

  it("does not compile the article body when access is denied", async () => {
    requestArticleAccess.mockResolvedValue({
      granted: false,
      reason: "membership",
      message: "Membership required",
    });

    const { default: InsightPage } = await import("./page");
    await InsightPage({ params: Promise.resolve({ slug: "private-insight" }) });

    expect(requestArticleAccess).toHaveBeenCalledWith("private-insight");
    expect(compileMDX).not.toHaveBeenCalled();
  });
});
