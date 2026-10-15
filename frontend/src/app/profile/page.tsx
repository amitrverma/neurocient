"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  BookOpen,
  Check,
  Eye,
  FlaskConical,
  LoaderCircle,
  LogOut,
  NotebookPen,
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

type ProfileTab = "evidence" | "reflections" | "settings" | "preferences";

const tabs: {
  id: ProfileTab;
  label: string;
  icon: typeof BookOpen;
}[] = [
  { id: "evidence", label: "My evidence", icon: Eye },
  { id: "reflections", label: "Reflections", icon: BookOpen },
  { id: "settings", label: "Account", icon: Settings },
  { id: "preferences", label: "Preferences", icon: SlidersHorizontal },
];

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState<ProfileTab>("evidence");
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
  const [prefsError, setPrefsError] = useState(false);
  const [prefsReloadKey, setPrefsReloadKey] = useState(0);
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
      setPrefsError(false);
      try {
        const res = await fetch("/api/user/preferences", {
          credentials: "include",
        });
        if (!res.ok) throw new Error(`Failed to load preferences: ${res.status}`);
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
        setPrefsError(true);
      } finally {
        setPrefsLoading(false);
      }
    };

    loadPreferences();
  }, [ready, user, prefsReloadKey]);

  const savePrefs = async (updates: object) => {
    const response = await fetch("/api/user/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error(`Failed to save preferences: ${response.status}`);
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
    <main className="surface-page">
      <section className="border-b border-brand-dark/10 bg-white px-6 py-8 md:py-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-5">
          <div>
            <p className="page-eyebrow text-brand-teal">Account space</p>
            <h1 className="page-section-title mt-2">Your profile</h1>
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
            <div className="grid gap-8 lg:grid-cols-[0.3fr_1fr] lg:items-start">
              <aside className="rounded-lg border border-brand-dark/12 bg-white p-2 shadow-sm lg:p-3">
                <div className="hidden border-b border-brand-dark/10 p-4 lg:block">
                  <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">
                    Signed in as
                  </p>
                  <p className="mt-2 break-words font-sans text-sm font-semibold text-brand-dark">
                    {String(user.name || user.email || "Member")}
                  </p>
                </div>
                <div className="flex gap-1 overflow-x-auto p-1 lg:block lg:space-y-1 lg:p-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-md px-3 py-3 text-left font-sans text-sm font-semibold transition lg:w-full lg:gap-3 lg:px-4 ${
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
                {activeTab === "evidence" && (
                  <Panel>
                    <SectionKicker icon={<Eye className="h-5 w-5" />}>
                      My evidence
                    </SectionKicker>
                    <p className="mt-5 max-w-2xl font-sans text-sm leading-7 text-brand-dark/70">
                      These are different views of the same work: what the Scan
                      suggested, what happened in real life, and what you tried
                      next.
                    </p>
                    <div className="mt-7 grid gap-3">
                      <EvidenceLink
                        href="/my-caveman"
                        icon={<Eye className="h-5 w-5" />}
                        label="Scan portrait"
                        text="Return to the result built from your answers."
                      />
                      <EvidenceLink
                        href="/tools/spots"
                        icon={<NotebookPen className="h-5 w-5" />}
                        label="Spots"
                        text="Review the concrete situations you recorded."
                      />
                      <EvidenceLink
                        href="/tools/microchallenges"
                        icon={<FlaskConical className="h-5 w-5" />}
                        label="Microchallenges"
                        text="Continue or review your small experiments."
                      />
                    </div>
                  </Panel>
                )}

                {activeTab === "reflections" && (
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

const EvidenceLink = ({
  href,
  icon,
  label,
  text,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  text: string;
}) => (
  <Link
    href={href}
    className="group grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 border-y border-brand-dark/12 bg-white px-1 py-4 font-sans first:border-b-0 last:border-t-0"
  >
    <span className="flex h-10 w-10 items-center justify-center border border-brand-teal/35 text-brand-accent">
      {icon}
    </span>
    <span>
      <strong className="block text-sm text-brand-dark">{label}</strong>
      <span className="mt-1 block text-sm leading-6 text-brand-dark/62">{text}</span>
    </span>
    <ArrowRight className="h-4 w-4 text-brand-accent transition group-hover:translate-x-0.5" />
  </Link>
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
