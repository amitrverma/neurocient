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
  useAuth: () => ({ user: mocks.user, logout: vi.fn(), ready: true }),
}));
vi.mock("../hooks/usePushNotifications", () => ({
  default: () => ({ subscribe: mocks.subscribe, unsubscribe: mocks.unsubscribe }),
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
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

const preferences = {
  push_enabled: false,
  whatsapp_connected: false,
  whatsapp_enabled: false,
  whatsapp_display_number: null,
  whatsapp_pairing_pending: false,
};

describe("profile delivery channels", () => {
  beforeEach(() => {
    window.location.hash = "#preferences";
    mocks.notify.mockReset();
    mocks.subscribe.mockReset();
    mocks.unsubscribe.mockReset();
    vi.stubGlobal("Notification", { permission: "granted", requestPermission: vi.fn() });
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url === "/api/user/preferences" && !init?.method) return jsonResponse(preferences);
      if (url === "/api/cohorts/my") return jsonResponse({ enrollments: [] });
      if (url === "/api/user/preferences" && init?.method === "PATCH") return jsonResponse({});
      if (url === "/api/user/preferences/whatsapp-connection" && init?.method === "DELETE") return jsonResponse(preferences);
      throw new Error(`Unexpected fetch: ${url}`);
    }));
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    window.location.hash = "";
  });

  it("shows channels rather than product-feature toggles or an OTP flow", async () => {
    render(<ProfilePage />);

    expect(await screen.findByText("Browser notifications")).toBeInTheDocument();
    expect(screen.getByText("WhatsApp companion")).toBeInTheDocument();
    expect(screen.queryByText("Daily nudges")).not.toBeInTheDocument();
    expect(screen.queryByText("Spot reminders")).not.toBeInTheDocument();
    expect(screen.queryByText("Microchallenge reminders")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("WhatsApp number")).not.toBeInTheDocument();
    expect(screen.queryByText("Save preferences")).not.toBeInTheDocument();
  });

  it("enables browser notifications immediately", async () => {
    render(<ProfilePage />);
    fireEvent.click(await screen.findByRole("button", { name: "Enable" }));

    await waitFor(() => expect(mocks.subscribe).toHaveBeenCalledOnce());
    expect(fetch).toHaveBeenCalledWith(
      "/api/user/preferences",
      expect.objectContaining({ method: "PATCH", body: JSON.stringify({ push_enabled: true }) }),
    );
    expect(await screen.findByText("On")).toBeInTheDocument();
  });

  it("shows a connected WhatsApp companion and disconnects immediately", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url === "/api/user/preferences" && !init?.method) return jsonResponse({
        ...preferences,
        whatsapp_connected: true,
        whatsapp_enabled: true,
        whatsapp_display_number: "+••••••3210",
      });
      if (url === "/api/cohorts/my") return jsonResponse({ enrollments: [] });
      if (url === "/api/user/preferences/whatsapp-connection") return jsonResponse(preferences);
      throw new Error(`Unexpected fetch: ${url}`);
    });

    render(<ProfilePage />);
    expect(await screen.findByText("Connected")).toBeInTheDocument();
    expect(screen.getByText(/Connected as/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Disconnect" }));
    await waitFor(() => expect(fetch).toHaveBeenCalledWith(
      "/api/user/preferences/whatsapp-connection",
      expect.objectContaining({ method: "DELETE" }),
    ));
  });
});
