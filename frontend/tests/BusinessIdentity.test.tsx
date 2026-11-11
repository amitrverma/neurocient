import React from "react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import OrgSchema from "../src/app/components/OrgSchema";
import { siteMetadata } from "../src/app/siteMetadata";

afterEach(cleanup);

describe("public business identity", () => {
  it("links the Neurocient Labs brand to its legal business in structured data", () => {
    const { container } = render(<OrgSchema />);
    const script = container.querySelector('script[type="application/ld+json"]');
    const schema = JSON.parse(script?.textContent || "{}");

    expect(schema).toMatchObject({
      name: "Neurocient Labs",
      legalName: "Xaltris Technologies",
      email: "support@neurocient.com",
    });
    expect(schema.description).toMatch(/unit and brand of Xaltris Technologies/i);
  });

  it("uses the registered unit name in site and installed-app metadata", () => {
    expect(siteMetadata.title).toMatchObject({
      default: "Why Change Is Hard—and What Makes It Stick",
      template: "%s | Neurocient Labs",
    });
    expect(siteMetadata.openGraph).toMatchObject({ siteName: "Neurocient Labs" });

    const manifest = JSON.parse(
      readFileSync(join(process.cwd(), "public", "manifest.json"), "utf8"),
    );
    expect(manifest.name).toBe("Neurocient Labs");
  });
});
