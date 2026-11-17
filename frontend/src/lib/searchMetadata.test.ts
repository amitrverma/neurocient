import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  createPublicMetadata,
  noIndexMetadata,
  SOCIAL_IMAGE_HEIGHT,
  SOCIAL_IMAGE_PATH,
  SOCIAL_IMAGE_URL,
  SOCIAL_IMAGE_WIDTH,
} from "./searchMetadata";
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
      images: [
        {
          url: SOCIAL_IMAGE_URL,
          width: 1200,
          height: 630,
        },
      ],
    });
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      images: [SOCIAL_IMAGE_URL],
    });
    expect(metadata.robots).toMatchObject({ index: true, follow: true });
  });

  it("serves a genuine 1200 by 630 PNG for social previews", () => {
    const image = readFileSync(join(process.cwd(), "public", ...SOCIAL_IMAGE_PATH.split("/").filter(Boolean)));

    expect(image.subarray(1, 4).toString("ascii")).toBe("PNG");
    expect(image.readUInt32BE(16)).toBe(SOCIAL_IMAGE_WIDTH);
    expect(image.readUInt32BE(20)).toBe(SOCIAL_IMAGE_HEIGHT);
  });

  it("keeps the root metadata from leaking a homepage canonical to child routes", () => {
    expect(siteMetadata.alternates).toBeUndefined();
    expect(siteMetadata.openGraph).toMatchObject({
      images: [{ url: SOCIAL_IMAGE_URL, width: 1200, height: 630 }],
    });
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
