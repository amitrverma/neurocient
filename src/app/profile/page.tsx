"use client";

import { useState, useEffect } from "react";
import WeeklyReflections from "../components/tools/WeeklyReflections";
import NudgeOfTheDay from "../components/tools/NudgeOfTheDay";
import { useAuth } from "@/app/context/AuthContext";
import usePushNotifications from "../hooks/usePushNotifications";
import { useNotification } from "../components/NotificationProvider"; 

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState<"insights" | "settings" | "preferences">("insights");
  const { user, logout } = useAuth();

  const { subscribe, unsubscribe } = usePushNotifications(VAPID_PUBLIC_KEY);
  const { notify } = useNotification();
  // Preferences state
  const [nudgeEnabled, setNudgeEnabled] = useState(true);
  const [challengeEnabled, setChallengeEnabled] = useState(true);
  const [whatsAppEnabled, setWhatsAppEnabled] = useState(false);
  const [whatsAppNumber, setWhatsAppNumber] = useState("");
  const [pushEnabled, setPushEnabled] = useState(false);
  const [initialPrefs, setInitialPrefs] = useState<{
    nudgeEnabled: boolean;
    challengeEnabled: boolean;
    pushEnabled: boolean;
    whatsAppEnabled: boolean;
    whatsAppNumber: string;
  } | null>(null);
  // Load preferences from backend
  // Load from backend
useEffect(() => {
  fetch("/api/user/preferences")
    .then((res) => res.json())
    .then((data) => {
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
    })
    .catch((err) => console.error("❌ Failed to load preferences", err));
}, []);

  // Save preferences helper
  const savePrefs = async (updates: object) => {
    try {
      await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
    } catch (err) {
      console.error("❌ Failed to save preferences", err);
    }
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
          "error"
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
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Page Title */}
      <h1 className="text-2xl font-bold text-[#042a2b] mb-6">👤 Profile</h1>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        {["insights", "settings", "preferences"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className={`px-4 py-2 font-semibold text-sm border-b-2 transition ${
              activeTab === tab
                ? "border-[#5eb1bf] text-[#042a2b]"
                : "border-transparent text-brand-dark hover:text-[#042a2b]"
            }`}
          >
            {tab === "insights" && "Reflections & Nudge"}
            {tab === "settings" && "Settings & Account"}
            {tab === "preferences" && "Preferences"}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-4 space-y-6">
        {/* Insights Tab */}
        {activeTab === "insights" && (
          <>
            <NudgeOfTheDay />
            <WeeklyReflections />
          </>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            {/* User Details */}
            <section>
              <h2 className="text-lg font-semibold text-[#042a2b] mb-2">User Details</h2>
              <p className="text-sm text-brand-dark">Name: {String(user?.name || "N/A")}</p>
              <p className="text-sm text-brand-dark">Email: {String(user?.email || "N/A")}</p>
            </section>

            {/* Account Actions */}
            <section>
              <h2 className="text-lg font-semibold text-[#042a2b] mb-2">Account</h2>
              <button className="px-4 py-2 bg-[#042a2b] text-white rounded-md text-sm hover:bg-[#5eb1bf] transition">
                Change Password
              </button>
              <button
                onClick={() => logout()}
                className="ml-2 px-4 py-2 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 transition"
              >
                Logout
              </button>
            </section>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === "preferences" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-[#042a2b] mb-2">Preferences</h2>

            {/* Nudges */}
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-brand-dark">Daily Nudges</span>
              <input
                type="checkbox"
                checked={nudgeEnabled}
                onChange={(e) => setNudgeEnabled(e.target.checked)}
                className="h-4 w-4"
              />
            </div>

            {/* Microchallenge Reminders */}
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-brand-dark">Microchallenge Reminders</span>
              <input
                type="checkbox"
                checked={challengeEnabled}
                onChange={(e) => setChallengeEnabled(e.target.checked)}
                className="h-4 w-4"
              />
            </div>

<div className="flex items-center justify-between py-2">
  <span className="text-sm text-brand-dark">Push Notifications</span>
  <input
    type="checkbox"
    checked={pushEnabled}
    onChange={(e) => setPushEnabled(e.target.checked)}
    className="h-4 w-4"
  />
</div>

            {/* WhatsApp Notifications */}
            <div className="py-2">
              <label className="flex items-center justify-between">
                <span className="text-sm text-brand-dark">WhatsApp Notifications</span>
                <input
                  type="checkbox"
                  checked={whatsAppEnabled}
                  onChange={(e) => setWhatsAppEnabled(e.target.checked)}
                  className="h-4 w-4"
                />
              </label>
              {whatsAppEnabled && (
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={whatsAppNumber}
                  onChange={(e) => setWhatsAppNumber(e.target.value)}
                  className="mt-2 w-full border rounded-md px-2 py-1 text-sm"
                />
              )}
            </div>
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className="px-4 py-2 bg-[#042a2b] text-white rounded-md text-sm hover:bg-[#5eb1bf] transition disabled:opacity-50"
            >
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
