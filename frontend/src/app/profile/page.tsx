"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bell,
  BookOpen,
  Check,
  LoaderCircle,
  LogOut,
  Settings,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";
import WeeklyReflections from "../components/tools/WeeklyReflections";
import NudgeOfTheDay from "../components/tools/NudgeOfTheDay";
import AuthModal from "../components/AuthModal";
import { useAuth } from "@/app/context/AuthContext";
import usePushNotifications from "../hooks/usePushNotifications";
import { useNotification } from "../components/NotificationProvider";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

type ProfileTab = "insights" | "settings" | "preferences";

const tabs: {
  id: ProfileTab;
  label: string;
  icon: typeof BookOpen;
}[] = [
  { id: "insights", label: "Reflections", icon: BookOpen },
  { id: "settings", label: "Account", icon: Settings },
  { id: "preferences", label: "Preferences", icon: SlidersHorizontal },
];

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState<ProfileTab>("insights");
  const [showAuth, setShowAuth] = useState(false);
  const { user, logout, ready } = useAuth();

  const { subscribe, unsubscribe } = usePushNotifications(VAPID_PUBLIC_KEY);
  const { notify } = useNotification();

  const [nudgeEnabled, setNudgeEnabled] = useState(true);
  const [challengeEnabled, setChallengeEnabled] = useState(true);
  const [whatsAppEnabled, setWhatsAppEnabled] = useState(false);
  const [whatsAppNumber, setWhatsAppNumber] = useState("");
  const [pushEnabled, setPushEnabled] = useState(false);
  const [prefsLoading, setPrefsLoading] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [initialPrefs, setInitialPrefs] = useState<{
    nudgeEnabled: boolean;
    challengeEnabled: boolean;
    pushEnabled: boolean;
    whatsAppEnabled: boolean;
    whatsAppNumber: string;
  } | null>(null);

  useEffect(() => {
    if (!ready) return;

    if (!user) {
      setPrefsLoading(false);
      return;
    }

    const loadPreferences = async () => {
      setPrefsLoading(true);
      try {
        const res = await fetch("/api/user/preferences", {
          credentials: "include",
        });
        const data = await res.json();
        if (data) {
          const prefs = {
            nudgeEnabled: data.nudge_enabled,
            challengeEnabled: data.microchallenge_enabled,
            whatsAppEnabled: !!data.whatsapp_number,
            whatsAppNumber: data.whatsapp_number || "",
            pushEnabled: data.notif_channel === "push",
          };
          setNudgeEnabled(prefs.nudgeEnabled);
          setChallengeEnabled(prefs.challengeEnabled);
          setWhatsAppEnabled(prefs.whatsAppEnabled);
          setWhatsAppNumber(prefs.whatsAppNumber);
          setPushEnabled(prefs.pushEnabled);
          setInitialPrefs(prefs);
        }
      } catch (err) {
        console.error("Failed to load preferences:", err);
      } finally {
        setPrefsLoading(false);
      }
    };

    loadPreferences();
  }, [ready, user]);

  const savePrefs = async (updates: object) => {
    await fetch("/api/user/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(updates),
    });
  };

  const hasChanges = initialPrefs
    ? nudgeEnabled !== initialPrefs.nudgeEnabled ||
      challengeEnabled !== initialPrefs.challengeEnabled ||
      pushEnabled !== initialPrefs.pushEnabled ||
      whatsAppEnabled !== initialPrefs.whatsAppEnabled ||
      (whatsAppEnabled && whatsAppNumber !== initialPrefs.whatsAppNumber)
    : false;

  const handleSave = async () => {
    if (!initialPrefs) return;

    const updates = {
      nudge_enabled: nudgeEnabled,
      microchallenge_enabled: challengeEnabled,
      notif_channel: pushEnabled ? "push" : null,
      whatsapp_number: whatsAppEnabled ? whatsAppNumber : null,
    };

    setSavingPrefs(true);
    try {
      if (pushEnabled && !initialPrefs.pushEnabled) {
        if (Notification.permission === "default") {
          const result = await Notification.requestPermission();
          if (result !== "granted") {
            notify("Please enable push in browser settings.", "error");
            return;
          }
        } else if (Notification.permission === "denied") {
          notify(
            "Push is blocked in your browser. Please allow it from site settings.",
            "error",
          );
          return;
        }
        await subscribe();
      }

      if (!pushEnabled && initialPrefs.pushEnabled) {
        await unsubscribe();
      }

      await savePrefs(updates);
      setInitialPrefs({
        nudgeEnabled,
        challengeEnabled,
        pushEnabled,
        whatsAppEnabled,
        whatsAppNumber,
      });
      notify("Preferences saved.", "success");
    } catch (err) {
      console.error("Failed to save preferences:", err);
      notify("Failed to save preferences.", "error");
    } finally {
      setSavingPrefs(false);
    }
  };

  return (
    <main className="bg-white font-serif text-brand-dark">
      <section className="px-6 pb-10 pt-14 md:pb-12 md:pt-20">
        <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
          <div>
            <SectionLabel>Account space</SectionLabel>
            <h1 className="mt-6 text-[clamp(2.45rem,5vw,5rem)] font-bold leading-[0.98] tracking-[-0.03em]">
              Your
              <br />
              <span className="italic text-brand-accent">profile.</span>
            </h1>
          </div>

          <div className="rounded-lg border border-brand-dark/12 bg-white p-6 shadow-[0_20px_60px_rgba(4,42,43,0.06)] md:p-8">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-brand-teal/35 text-brand-accent">
                <UserRound className="h-5 w-5" />
              </span>
              <div>
                <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
                  {user ? "Signed in" : "Signed out"}
                </p>
                <p className="mt-3 font-sans text-base leading-8 text-brand-dark/72">
                  Manage your reading, reflections, nudges, and delivery
                  preferences from one place.
                </p>
                {!user && ready && (
                  <button
                    onClick={() => setShowAuth(true)}
                    className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full bg-brand-dark px-5 py-2.5 font-sans text-sm font-semibold text-white transition hover:bg-brand-primary"
                  >
                    Log in
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-16 md:pb-20">
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
                Your profile keeps personal preferences, saved reflections, and
                notification settings connected to your account.
              </p>
            </Panel>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[0.3fr_1fr] lg:items-start">
              <aside className="rounded-lg border border-brand-dark/12 bg-white p-3 shadow-sm">
                <div className="border-b border-brand-dark/10 p-4">
                  <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">
                    Signed in as
                  </p>
                  <p className="mt-2 break-words font-sans text-sm font-semibold text-brand-dark">
                    {String(user.name || user.email || "Member")}
                  </p>
                </div>
                <div className="space-y-1 p-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex w-full cursor-pointer items-center gap-3 rounded-md px-4 py-3 text-left font-sans text-sm font-semibold transition ${
                          isActive
                            ? "bg-brand-dark text-white"
                            : "text-brand-dark hover:bg-brand-dark/5"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </aside>

              <div>
                {activeTab === "insights" && (
                  <div className="grid gap-5">
                    <NudgeOfTheDay />
                    <WeeklyReflections />
                  </div>
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
                      <button className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-brand-dark/25 px-5 py-2.5 font-sans text-sm font-semibold text-brand-dark transition hover:border-brand-primary hover:text-brand-primary">
                        Change password
                        <ArrowRight className="h-4 w-4" />
                      </button>
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
                      Delivery preferences
                    </SectionKicker>

                    {prefsLoading ? (
                      <div className="mt-6 flex items-center gap-3 font-sans text-sm text-brand-dark/72">
                        <LoaderCircle className="h-5 w-5 animate-spin text-brand-accent" />
                        Loading preferences
                      </div>
                    ) : (
                      <>
                        <div className="mt-6 divide-y divide-brand-dark/10 border-y border-brand-dark/10">
                          <PreferenceToggle
                            title="Daily nudges"
                            text="Small prompts that keep the work visible between longer reads."
                            checked={nudgeEnabled}
                            onChange={setNudgeEnabled}
                          />
                          <PreferenceToggle
                            title="Microchallenge reminders"
                            text="Reminders for practical behavior experiments."
                            checked={challengeEnabled}
                            onChange={setChallengeEnabled}
                          />
                          <PreferenceToggle
                            title="Push notifications"
                            text="Browser notifications for nudges and reminders."
                            checked={pushEnabled}
                            onChange={setPushEnabled}
                          />
                          <div className="py-5">
                            <PreferenceToggle
                              title="WhatsApp notifications"
                              text="Use WhatsApp as an additional delivery channel."
                              checked={whatsAppEnabled}
                              onChange={setWhatsAppEnabled}
                              compact
                            />
                            {whatsAppEnabled && (
                              <input
                                type="tel"
                                placeholder="+91 98765 43210"
                                value={whatsAppNumber}
                                onChange={(e) =>
                                  setWhatsAppNumber(e.target.value)
                                }
                                className="mt-4 w-full rounded-lg border border-brand-dark/15 px-4 py-3 font-sans text-sm text-brand-dark outline-none transition placeholder:text-brand-dark/40 focus:border-brand-teal"
                              />
                            )}
                          </div>
                        </div>

                        <div className="mt-7 flex items-center gap-3">
                          <button
                            onClick={handleSave}
                            disabled={!hasChanges || savingPrefs}
                            className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-brand-dark px-5 py-2.5 font-sans text-sm font-semibold text-white transition hover:bg-brand-primary disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {savingPrefs ? "Saving" : "Save preferences"}
                            {savingPrefs ? (
                              <LoaderCircle className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </>
                    )}
                  </Panel>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </main>
  );
};

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-3 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal">
    <span>{children}</span>
    <span className="h-px flex-1 bg-brand-dark/15" />
  </div>
);

const Panel = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-lg border border-brand-dark/12 bg-white p-6 shadow-sm md:p-8">
    {children}
  </div>
);

const SectionKicker = ({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="flex items-center gap-3">
    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-teal/35 text-brand-accent">
      {icon}
    </span>
    <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
      {children}
    </p>
  </div>
);

const InfoTile = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-brand-dark/12 p-4">
    <p className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-brand-teal">
      {label}
    </p>
    <p className="mt-2 break-words font-sans text-sm font-semibold text-brand-dark">
      {value}
    </p>
  </div>
);

const PreferenceToggle = ({
  title,
  text,
  checked,
  onChange,
  compact = false,
}: {
  title: string;
  text: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  compact?: boolean;
}) => (
  <label
    className={`flex cursor-pointer items-center justify-between gap-5 ${
      compact ? "" : "py-5"
    }`}
  >
    <span>
      <span className="block font-sans text-sm font-semibold text-brand-dark">
        {title}
      </span>
      <span className="mt-1 block max-w-xl font-sans text-sm leading-6 text-brand-dark/64">
        {text}
      </span>
    </span>
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="h-5 w-5 shrink-0 accent-brand-accent"
    />
  </label>
);

export default ProfilePage;
