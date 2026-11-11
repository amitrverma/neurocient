import { describe, expect, it } from "vitest";
import { createPublicMetadata, noIndexMetadata } from "./searchMetadata";
import { siteMetadata } from "@/app/siteMetadata";

describe("search metadata", () => {
  it("creates a self-referential canonical for a public page", () => {
    const metadata = createPublicMetadata({
      title: "Behavior change",
      description: "A useful description.",
      path: "/behavior-change",
    });

    expect(metadata.alternates?.canonical).toBe(
      "https://neurocient.com/behavior-change",
    );
    expect(metadata.openGraph).toMatchObject({
      url: "https://neurocient.com/behavior-change",
    });
    expect(metadata.robots).toMatchObject({ index: true, follow: true });
  });

  it("keeps the root metadata from leaking a homepage canonical to child routes", () => {
    expect(siteMetadata.alternates).toBeUndefined();
  });

  it("blocks personalized routes from indexing", () => {
    expect(noIndexMetadata.alternates?.canonical).toBeNull();
    expect(noIndexMetadata.robots).toMatchObject({
      index: false,
      follow: false,
      noarchive: true,
    });
  });
});
