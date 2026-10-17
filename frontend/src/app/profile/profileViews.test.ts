import { describe, expect, it } from "vitest";
import { profileViewFromHash } from "./profileViews";

describe("profileViewFromHash", () => {
  it.each([
    ["", "evidence"],
    ["#reflections", "evidence"],
    ["#preferences", "preferences"],
    ["#account", "settings"],
    ["#unknown", "evidence"],
  ])("maps %s to %s", (hash, expected) => {
    expect(profileViewFromHash(hash)).toBe(expected);
  });
});
