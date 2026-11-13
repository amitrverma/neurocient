"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bell,
  LoaderCircle,
  LogOut,
  Settings,
  UserRound,
} from "lucide-react";
import AuthModal from "../components/AuthModal";
import { useAuth } from "@/app/context/AuthContext";
import usePushNotifications from "../hooks/usePushNotifications";
import { useNotification } from "../components/NotificationProvider";
import { profileViewFromHash, type ProfileView } from "./profileViews";
import PersonalHome from "./PersonalHome";
import useWorkOverview from "./useWorkOverview";
import WhatsAppPairingDialog from "./WhatsAppPairingDialog";
import {
  ChannelButton,
  DeliveryChannel,
} from "./DeliveryPreferenceControls";
import { InfoTile, Panel, SectionKicker } from "./ProfilePrimitives";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

const responseMessage = async (response: Response) => {
  try {
    const payload = await response.json();
    return typeof payload.detail === "string"
      ? payload.detail
      : "The request could not be completed.";
  } catch {
    return "The request could not be completed.";
  }
};

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState<ProfileView>("evidence");
  const [showAuth, setShowAuth] = useState(false);
  const { user, logout, ready } = useAuth();
  const [cohortEnrollment, setCohortEnrollment] = useState<{
    status: string;
    cohort: { title: string; starts_at: string; timezone: string };
    next_session?: { title: string; starts_at: string; ends_at: string } | null;
  } | null>(null);
  const { overview: workOverview, retry: retryWorkOverview } = useWorkOverview(
    ready && Boolean(user),
  );

  const { subscribe, unsubscribe } = usePushNotifications(VAPID_PUBLIC_KEY);
  const { notify } = useNotification();

  useEffect(() => {
    const syncView = () => setActiveTab(profileViewFromHash(window.location.hash));
    syncView();
    window.addEventListener("hashchange", syncView);
    return () => window.removeEventListener("hashchange", syncView);
  }, []);

  const [whatsAppEnabled, setWhatsAppEnabled] = useState(false);
  const [whatsAppConnected, setWhatsAppConnected] = useState(false);
  const [whatsAppDisplayNumber, setWhatsAppDisplayNumber] = useState("");
  const [whatsAppPairingPending, setWhatsAppPairingPending] = useState(false);
  const [whatsAppBusy, setWhatsAppBusy] = useState(false);
  const [whatsAppPairingUrl, setWhatsAppPairingUrl] = useState("");
  const [pushEnabled, setPushEnabled] = useState(false);
  const [prefsLoading, setPrefsLoading] = useState(true);
  const [prefsError, setPrefsError] = useState(false);
  const [prefsReloadKey, setPrefsReloadKey] = useState(0);
  const [pushBusy, setPushBusy] = useState(false);

  useEffect(() => {
    if (!ready) return;

    if (!user) {
      setPrefsLoading(false);
      return;
    }

    const loadPreferences = async () => {
      setPrefsLoading(true);
      setPrefsError(false);
      try {
        const res = await fetch("/api/user/preferences", {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`Failed to load preferences: ${res.status}`);
        const data = await res.json();
        if (data) {
          setPushEnabled(Boolean(data.push_enabled));
          setWhatsAppEnabled(Boolean(data.whatsapp_enabled));
          setWhatsAppConnected(Boolean(data.whatsapp_connected));
          setWhatsAppDisplayNumber(data.whatsapp_display_number || "");
          setWhatsAppPairingPending(Boolean(data.whatsapp_pairing_pending));
        }
      } catch (err) {
        console.error("Failed to load preferences:", err);
        setPrefsError(true);
      } finally {
        setPrefsLoading(false);
      }
    };

    loadPreferences();
  }, [ready, user, prefsReloadKey]);

  useEffect(() => {
    if (!ready || !user) return;
    const refreshWhenReturning = () => {
      if (document.visibilityState === "visible") {
        setPrefsReloadKey((value) => value + 1);
      }
    };
    window.addEventListener("focus", refreshWhenReturning);
    document.addEventListener("visibilitychange", refreshWhenReturning);
    return () => {
      window.removeEventListener("focus", refreshWhenReturning);
      document.removeEventListener("visibilitychange", refreshWhenReturning);
    };
  }, [ready, user]);

  useEffect(() => {
    if (!whatsAppConnected || !whatsAppPairingUrl) return;
    setWhatsAppPairingPending(false);
    setWhatsAppPairingUrl("");
    notify("WhatsApp is connected.", "success");
  }, [notify, whatsAppConnected, whatsAppPairingUrl]);

  useEffect(() => {
    if (!whatsAppPairingUrl || whatsAppConnected) return;

    let active = true;
    let checking = false;
    const checkConnection = async () => {
      if (checking) return;
      checking = true;
      try {
        const response = await fetch("/api/user/preferences", {
          credentials: "include",
          cache: "no-store",
        });
        if (!response.ok) return;
        const data = await response.json();
        if (!active || !data.whatsapp_connected) return;
        setWhatsAppConnected(true);
        setWhatsAppEnabled(Boolean(data.whatsapp_enabled));
        setWhatsAppDisplayNumber(data.whatsapp_display_number || "");
        setWhatsAppPairingPending(false);
      } catch {
        // Keep the handoff available; the next connection check may succeed.
      } finally {
        checking = false;
      }
    };

    void checkConnection();
    const interval = window.setInterval(checkConnection, 2500);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [whatsAppConnected, whatsAppPairingUrl]);

  useEffect(() => {
    if (!ready || !user) return;
    fetch("/api/cohorts/my", { credentials: "include", cache: "no-store" })
      .then((response) => (response.ok ? response.json() : { enrollments: [] }))
      .then((data) => setCohortEnrollment(data.enrollments?.[0] || null))
      .catch(() => setCohortEnrollment(null));
  }, [ready, user]);

  const savePrefs = async (updates: object) => {
    const response = await fetch("/api/user/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error(await responseMessage(response));
  };

  const setPushChannel = async (enabled: boolean) => {
    setPushBusy(true);
    try {
      if (enabled) {
        if (Notification.permission === "default") {
          const permission = await Notification.requestPermission();
          if (permission !== "granted") throw new Error("Browser notifications were not allowed.");
        } else if (Notification.permission === "denied") {
          throw new Error("Browser notifications are blocked in your site settings.");
        }
        await subscribe();
        try {
          await savePrefs({ push_enabled: true });
        } catch (error) {
          await unsubscribe();
          throw error;
        }
      } else {
        await savePrefs({ push_enabled: false });
        setPushEnabled(false);
        try {
          await unsubscribe();
        } catch {
          notify("Browser notifications are off. This browser's old subscription could not be removed yet.", "error");
          return;
        }
      }
      setPushEnabled(enabled);
      notify(enabled ? "Browser notifications are on." : "Browser notifications are off.", "success");
    } catch (error) {
      notify(error instanceof Error ? error.message : "The channel could not be updated.", "error");
    } finally {
      setPushBusy(false);
    }
  };

  const connectWhatsApp = async () => {
    setWhatsAppBusy(true);
    try {
      const response = await fetch("/api/user/preferences/whatsapp-pairing", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error(await responseMessage(response));
      const data = await response.json();
      setWhatsAppPairingPending(true);
      setWhatsAppPairingUrl(data.whatsapp_url);
    } catch (error) {
      notify(error instanceof Error ? error.message : "WhatsApp could not be opened.", "error");
    } finally {
      setWhatsAppBusy(false);
    }
  };

  const disconnectWhatsApp = async () => {
    setWhatsAppBusy(true);
    try {
      const response = await fetch("/api/user/preferences/whatsapp-connection", {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error(await responseMessage(response));
      setWhatsAppConnected(false);
      setWhatsAppEnabled(false);
      setWhatsAppDisplayNumber("");
      setWhatsAppPairingPending(false);
      setWhatsAppPairingUrl("");
      notify("WhatsApp is disconnected.", "success");
    } catch (error) {
      notify(error instanceof Error ? error.message : "WhatsApp could not be disconnected.", "error");
    } finally {
      setWhatsAppBusy(false);
    }
  };

  const firstName = String(user?.name || "").trim().split(/\s+/)[0] || "there";
  const pageTitle = activeTab === "evidence"
    ? user ? `Welcome back, ${firstName}.` : "Your work, kept together."
    : activeTab === "preferences"
        ? "Stay connected"
        : "Your account";

  const content = (
    <main className="surface-page">
      <section className="border-b border-brand-dark/10 bg-white px-6 py-8 md:py-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-5">
          <div>
            <p className="page-eyebrow text-brand-teal">
              {activeTab === "evidence" ? "Your Neurocient" : "Account space"}
            </p>
            <h1 className="page-section-title mt-2">{pageTitle}</h1>
          </div>
          {!user && ready ? (
            <button
              onClick={() => setShowAuth(true)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-brand-dark px-5 py-2.5 font-sans text-sm font-semibold text-white transition hover:bg-brand-primary"
            >
              Log in
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </section>

      <section className="px-6 pb-16 pt-6 md:pb-20 md:pt-8">
        <div className="mx-auto max-w-6xl">
          {!ready ? (
            <Panel>
              <LoaderCircle className="h-7 w-7 animate-spin text-brand-accent" />
              <h2 className="mt-5 text-3xl font-bold leading-tight">
                Loading profile
              </h2>
            </Panel>
          ) : !user ? (
            <Panel>
              <UserRound className="h-7 w-7 text-brand-accent" />
              <p className="mt-5 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
                Private account
              </p>
              <h2 className="mt-2 text-3xl font-bold leading-tight">
                Log in to open your profile
              </h2>
              <p className="mt-3 max-w-2xl font-sans text-sm leading-7 text-brand-dark/72">
                Your profile keeps personal evidence, reflections, and
                notification settings connected to your account.
              </p>
            </Panel>
          ) : (
            <div className="mx-auto max-w-5xl">
                {activeTab === "evidence" && (
                  <PersonalHome
                    overview={workOverview}
                    cohortEnrollment={cohortEnrollment}
                    onRetry={retryWorkOverview}
                  />
                )}

                {activeTab === "settings" && (
                  <Panel>
                    <SectionKicker icon={<Settings className="h-5 w-5" />}>
                      Account
                    </SectionKicker>
                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      <InfoTile label="Name" value={String(user.name || "N/A")} />
                      <InfoTile
                        label="Email"
                        value={String(user.email || "N/A")}
                      />
                    </div>
                    <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-brand-dark/12 pt-6">
                      <button
                        onClick={() => logout()}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-brand-dark px-5 py-2.5 font-sans text-sm font-semibold text-white transition hover:bg-brand-primary"
                      >
                        Logout
                        <LogOut className="h-4 w-4" />
                      </button>
                    </div>
                  </Panel>
                )}

                {activeTab === "preferences" && (
                  <Panel>
                    <SectionKicker icon={<Bell className="h-5 w-5" />}>
                      Alerts & reminders
                    </SectionKicker>

                    {prefsLoading ? (
                      <div className="mt-6 flex items-center gap-3 font-sans text-sm text-brand-dark/72">
                        <LoaderCircle className="h-5 w-5 animate-spin text-brand-accent" />
                        Loading preferences
                      </div>
                    ) : prefsError ? (
                      <div className="mt-6 border-y border-brand-dark/12 py-6">
                        <p className="font-sans text-sm leading-7 text-brand-dark/72">
                          Your saved preferences could not be loaded. Nothing
                          has been replaced with defaults.
                        </p>
                        <button
                          onClick={() => setPrefsReloadKey((value) => value + 1)}
                          className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full border border-brand-dark px-5 py-2.5 font-sans text-sm font-semibold text-brand-dark"
                        >
                          Try again
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="mt-6 max-w-3xl font-sans text-sm leading-7 text-brand-dark/72">
                          Neurocient chooses relevant nudges and check-ins from what you are currently working on. Choose how they can reach you outside the app.
                        </p>
                        <div className="mt-6 divide-y divide-brand-dark/10 border-y border-brand-dark/10">
                          <DeliveryChannel
                            title="Browser notifications"
                            text="Receive timely nudges and check-ins on this device."
                            status={pushEnabled ? "On" : "Off"}
                            action={
                              <ChannelButton onClick={() => setPushChannel(!pushEnabled)} disabled={pushBusy} quiet={pushEnabled}>
                                {pushBusy ? "Updating" : pushEnabled ? "Turn off" : "Enable"}
                              </ChannelButton>
                            }
                          />
                          <DeliveryChannel
                            title="WhatsApp companion"
                            text={
                              whatsAppConnected ? (
                                <>
                                  {whatsAppEnabled
                                    ? "Receive nudges and reminders, and record microchallenge check-ins directly in WhatsApp."
                                    : "Connected, but messages are paused. Reply START in WhatsApp to turn them on again."}
                                  {whatsAppDisplayNumber ? <span className="mt-1 block">Connected as {whatsAppDisplayNumber}</span> : null}
                                </>
                              ) : whatsAppPairingPending ? (
                                "Waiting for you to send the prepared WhatsApp message. The link expires after 10 minutes."
                              ) : (
                                "Receive relevant nudges and check-ins, and record microchallenge progress directly in WhatsApp."
                              )
                            }
                            status={whatsAppConnected ? (whatsAppEnabled ? "Connected" : "Paused") : whatsAppPairingPending ? "Waiting" : "Not connected"}
                            action={
                              whatsAppConnected ? (
                                <ChannelButton onClick={disconnectWhatsApp} disabled={whatsAppBusy} quiet>
                                  {whatsAppBusy ? "Disconnecting" : "Disconnect"}
                                </ChannelButton>
                              ) : (
                                <ChannelButton onClick={connectWhatsApp} disabled={whatsAppBusy}>
                                  {whatsAppBusy ? "Preparing WhatsApp" : whatsAppPairingPending ? "Continue pairing" : "Connect WhatsApp"}
                                </ChannelButton>
                              )
                            }
                          />
                        </div>
                      </>
                    )}
                  </Panel>
                )}
            </div>
          )}
        </div>
      </section>

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
      <WhatsAppPairingDialog
        open={Boolean(whatsAppPairingUrl)}
        whatsappUrl={whatsAppPairingUrl}
        onClose={() => setWhatsAppPairingUrl("")}
      />
    </main>
  );

  return content;
};

export default ProfilePage;
