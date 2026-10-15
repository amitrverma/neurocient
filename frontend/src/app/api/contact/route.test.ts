import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { resendConstructor, sendEmail } = vi.hoisted(() => {
  const sendEmail = vi.fn();

  return {
    sendEmail,
    resendConstructor: vi.fn(function MockResend() {
      return { emails: { send: sendEmail } };
    }),
  };
});

vi.mock("resend", () => ({ Resend: resendConstructor }));

import { POST } from "./route";

describe("contact route configuration", () => {
  const originalApiKey = process.env.RESEND_API_KEY;
  const originalFromEmail = process.env.RESEND_FROM_EMAIL;

  beforeEach(() => {
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_FROM_EMAIL;
    resendConstructor.mockClear();
    sendEmail.mockClear();
  });

  afterEach(() => {
    if (originalApiKey === undefined) {
      delete process.env.RESEND_API_KEY;
    } else {
      process.env.RESEND_API_KEY = originalApiKey;
    }

    if (originalFromEmail === undefined) {
      delete process.env.RESEND_FROM_EMAIL;
    } else {
      process.env.RESEND_FROM_EMAIL = originalFromEmail;
    }
  });

  it.each([
    {
      missingValue: "API key",
      apiKey: undefined,
      fromEmail: "hello@example.com",
    },
    {
      missingValue: "from address",
      apiKey: "re_test_key",
      fromEmail: undefined,
    },
  ])(
    "returns an unavailable response without attempting delivery when the $missingValue is missing",
    async ({ apiKey, fromEmail }) => {
      if (apiKey) process.env.RESEND_API_KEY = apiKey;
      if (fromEmail) process.env.RESEND_FROM_EMAIL = fromEmail;

      const response = await POST(
        new Request("http://localhost/api/contact", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            name: "Amit",
            email: "amit@example.com",
            message: "Hello",
          }),
        }),
      );

      expect(response.status).toBe(503);
      await expect(response.json()).resolves.toEqual({
        error: "Contact service is unavailable",
      });
      expect(resendConstructor).not.toHaveBeenCalled();
      expect(sendEmail).not.toHaveBeenCalled();
    },
  );

  it("creates the client and sends email when runtime configuration is present", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.RESEND_FROM_EMAIL = "hello@example.com";
    sendEmail.mockResolvedValue({ data: { id: "email-id" }, error: null });

    const response = await POST(
      new Request("http://localhost/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: "Amit",
          email: "amit@example.com",
          message: "Hello",
        }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });
    expect(resendConstructor).toHaveBeenCalledWith("re_test_key");
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "Neurocient <hello@example.com>",
        replyTo: "amit@example.com",
      }),
    );
  });
});
