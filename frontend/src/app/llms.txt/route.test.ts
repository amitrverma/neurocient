import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("llms.txt", () => {
  it("describes Neurocient and links only to public discovery surfaces", async () => {
    const response = GET();
    const body = await response.text();

    expect(response.headers.get("content-type")).toContain("text/markdown");
    expect(body).toMatch(/^# Neurocient Labs/m);
    expect(body).toContain("https://neurocient.com/inner-caveman");
    expect(body).toContain("https://neurocient.com/insights/doomscrolling");
    expect(body).not.toContain("/admin");
    expect(body).not.toContain("/profile");
    expect(body).not.toContain("/diagnostics/caveman-scan/result");
  });
});
