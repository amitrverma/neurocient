import { describe, expect, it } from "vitest";

import { apiErrorMessage } from "./apiError";

describe("apiErrorMessage", () => {
  it("turns an internal error object into safe copy with a support reference", () => {
    expect(
      apiErrorMessage(
        {
          detail: {
            code: "internal_error",
            correlation_id: "123e4567-e89b-42d3-a456-426614174000",
          },
        },
        "Authentication failed.",
      ),
    ).toBe("Something went wrong. Please try again. Reference: 123e4567.");
  });

  it("preserves safe string details and falls back for unknown objects", () => {
    expect(
      apiErrorMessage({ detail: "Invalid credentials" }, "Authentication failed."),
    ).toBe("Invalid credentials");
    expect(apiErrorMessage({ detail: { unexpected: true } }, "Authentication failed."))
      .toBe("Authentication failed.");
  });

  it("uses the response correlation header when the body omits it", () => {
    const response = new Response(null, {
      headers: {
        "x-correlation-id": "abcdef12-3456-4789-8abc-def012345678",
      },
    });

    expect(
      apiErrorMessage(
        { detail: { code: "csrf_failed" } },
        "Authentication failed.",
        response,
      ),
    ).toBe(
      "Your session could not be verified. Refresh and try again. Reference: abcdef12.",
    );
  });
});
