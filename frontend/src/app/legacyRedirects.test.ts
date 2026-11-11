import { beforeEach, describe, expect, it, vi } from "vitest";
import LegacyResourcesPage from "./resources/page";
import LegacySpotPage from "./spot/page";

const navigation = vi.hoisted(() => ({
  permanentRedirect: vi.fn(),
}));

vi.mock("next/navigation", () => navigation);

describe("legacy search entry points", () => {
  beforeEach(() => {
    navigation.permanentRedirect.mockClear();
  });

  it("permanently redirects the retired resources URL to the insight library", () => {
    LegacyResourcesPage();

    expect(navigation.permanentRedirect).toHaveBeenCalledWith("/insights/all");
  });

  it("permanently redirects the retired spot URL to the canonical Spots tool", () => {
    LegacySpotPage();

    expect(navigation.permanentRedirect).toHaveBeenCalledWith("/tools/spots");
  });
});
