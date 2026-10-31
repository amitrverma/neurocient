import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  notify: vi.fn(),
  subscribe: vi.fn(),
  unsubscribe: vi.fn(),
  user: { id: "user-1", name: "Amit", email: "amit@example.test" },
}));

vi.mock("@/app/context/AuthContext", () => ({
  useAuth: () => ({
    user: mocks.user,
    logout: vi.fn(),
    ready: true,
  }),
}));
vi.mock("../hooks/usePushNotifications", () => ({
  default: () => ({
    subscribe: mocks.subscribe,
    unsubscribe: mocks.unsubscribe,
  }),
}));
vi.mock("../components/NotificationProvider", () => ({
  useNotification: () => ({ notify: mocks.notify }),
}));
vi.mock("../components/AuthModal", () => ({ default: () => null }));
vi.mock("./PersonalHome", () => ({ default: () => null }));
vi.mock("./useWorkOverview", () => ({
  default: () => ({ overview: null, retry: vi.fn() }),
}));

import ProfilePage from "./page";

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

describe("profile delivery preferences", () => {
  beforeEach(() => {
    window.location.hash = "#preferences";
    mocks.notify.mockReset();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url === "/api/user/preferences" && (!init || init.method === undefined)) {
          return jsonResponse({
            nudge_enabled: false,
            spot_reminder_enabled: true,
            microchallenge_enabled: false,
            push_enabled: false,
            whatsapp_enabled: false,
            whatsapp_verified: false,
            whatsapp_number: null,
            whatsapp_pending_number: null,
          });
        }
        if (url === "/api/cohorts/my") return jsonResponse({ enrollments: [] });
        if (url === "/api/user/preferences/whatsapp-verification") {
          return jsonResponse({ status: "code_sent" }, 202);
        }
        if (url === "/api/user/preferences/whatsapp-verification/confirm") {
          return jsonResponse({
            whatsapp_number: "+919876543210",
            whatsapp_verified: true,
            whatsapp_enabled: false,
          });
        }
        if (url === "/api/user/preferences" && init?.method === "PATCH") {
          return jsonResponse({ status: "ok" });
        }
        throw new Error(`Unexpected fetch: ${url}`);
      }),
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    window.location.hash = "";
  });

  it("renders persisted purpose and channel state without unsafe defaults", async () => {
    render(<ProfilePage />);

    expect(await screen.findByRole("checkbox", { name: /Daily nudges/ })).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: /Spot reminders/ })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: /Microchallenge reminders/ })).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: /Push notifications/ })).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: /WhatsApp notifications/ })).not.toBeChecked();
  });

  it("does not present WhatsApp as enabled until the code is confirmed", async () => {
    render(<ProfilePage />);
    const whatsapp = await screen.findByRole("checkbox", {
      name: /WhatsApp notifications/,
    });
    fireEvent.click(whatsapp);
    expect(whatsapp).not.toBeChecked();
    fireEvent.change(screen.getByLabelText("WhatsApp number"), {
      target: { value: "+919876543210" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Verify this number" }));

    const code = await screen.findByLabelText("Six-digit WhatsApp verification code");
    expect(screen.queryByText(/^Verified\./)).not.toBeInTheDocument();
    expect(whatsapp).not.toBeChecked();
    fireEvent.change(code, { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: "Confirm code" }));

    await waitFor(() => {
      expect(screen.getByText(/^Verified\./)).toBeInTheDocument();
    });
    expect(whatsapp).not.toBeChecked();
    expect(mocks.notify).toHaveBeenCalledWith(
      "WhatsApp number verified. Turn on the channel and save when you are ready.",
      "success",
    );
  });

  it("keeps consent off when WhatsApp verification delivery fails", async () => {
    vi.mocked(fetch).mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url === "/api/user/preferences" && (!init || init.method === undefined)) {
        return jsonResponse({
          nudge_enabled: false,
          spot_reminder_enabled: false,
          microchallenge_enabled: false,
          push_enabled: false,
          whatsapp_enabled: false,
          whatsapp_verified: false,
          whatsapp_number: null,
          whatsapp_pending_number: null,
        });
      }
      if (url === "/api/cohorts/my") return jsonResponse({ enrollments: [] });
      if (url === "/api/user/preferences/whatsapp-verification") {
        return jsonResponse({ detail: "Verification code could not be sent" }, 502);
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });

    render(<ProfilePage />);
    const whatsapp = await screen.findByRole("checkbox", {
      name: /WhatsApp notifications/,
    });
    fireEvent.click(whatsapp);
    expect(whatsapp).not.toBeChecked();
    fireEvent.change(screen.getByLabelText("WhatsApp number"), {
      target: { value: "+919876543210" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Verify this number" }));

    await waitFor(() => {
      expect(mocks.notify).toHaveBeenCalledWith(
        "Verification code could not be sent",
        "error",
      );
    });
    expect(whatsapp).not.toBeChecked();
    expect(screen.getByLabelText("WhatsApp number")).toBeInTheDocument();
  });

  it("clears enabled consent while replacing a verified WhatsApp number", async () => {
    vi.mocked(fetch).mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url === "/api/user/preferences" && (!init || init.method === undefined)) {
        return jsonResponse({
          nudge_enabled: false,
          spot_reminder_enabled: false,
          microchallenge_enabled: false,
          push_enabled: false,
          whatsapp_enabled: true,
          whatsapp_verified: true,
          whatsapp_number: "+919876543210",
          whatsapp_pending_number: null,
        });
      }
      if (url === "/api/cohorts/my") return jsonResponse({ enrollments: [] });
      if (url === "/api/user/preferences/whatsapp-verification") {
        return jsonResponse({ detail: "Verification code could not be sent" }, 502);
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });

    render(<ProfilePage />);
    const whatsapp = await screen.findByRole("checkbox", {
      name: /WhatsApp notifications/,
    });
    expect(whatsapp).toBeChecked();
    fireEvent.change(screen.getByLabelText("WhatsApp number"), {
      target: { value: "+919876543211" },
    });
    expect(whatsapp).not.toBeChecked();
    fireEvent.click(screen.getByRole("button", { name: "Verify this number" }));

    await waitFor(() => {
      expect(mocks.notify).toHaveBeenCalledWith(
        "Verification code could not be sent",
        "error",
      );
    });
    expect(whatsapp).not.toBeChecked();
    expect(screen.getByLabelText("WhatsApp number")).toHaveValue(
      "+919876543211",
    );
  });

  it("keeps a pending WhatsApp challenge separate from channel consent", async () => {
    vi.mocked(fetch).mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "/api/user/preferences") {
        return jsonResponse({
          nudge_enabled: false,
          spot_reminder_enabled: false,
          microchallenge_enabled: false,
          push_enabled: false,
          whatsapp_enabled: false,
          whatsapp_verified: false,
          whatsapp_number: null,
          whatsapp_pending_number: "+919876543210",
        });
      }
      if (url === "/api/cohorts/my") return jsonResponse({ enrollments: [] });
      throw new Error(`Unexpected fetch: ${url}`);
    });

    render(<ProfilePage />);

    const whatsapp = await screen.findByRole("checkbox", {
      name: /WhatsApp notifications/,
    });
    expect(whatsapp).not.toBeChecked();
    expect(
      screen.getByLabelText("Six-digit WhatsApp verification code"),
    ).toBeInTheDocument();
  });
});
