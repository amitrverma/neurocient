"use client";

import { useState } from "react";
import WeeklyReflections from "../components/tools/WeeklyReflections";
import NudgeOfTheDay from "../components/tools/NudgeOfTheDay";
import { useAuth } from "@/app/context/AuthContext";

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState<"insights" | "settings">("insights");
  const { user } = useAuth(); // from AuthContext

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[#042a2b] mb-6">👤 Profile</h1>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab("insights")}
          className={`px-4 py-2 font-semibold text-sm border-b-2 transition ${
            activeTab === "insights"
              ? "border-[#5eb1bf] text-[#042a2b]"
              : "border-transparent text-brand-dark hover:text-[#042a2b]"
          }`}
        >
          Reflections & Nudge
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`px-4 py-2 font-semibold text-sm border-b-2 transition ${
            activeTab === "settings"
              ? "border-[#5eb1bf] text-[#042a2b]"
              : "border-transparent text-brand-dark hover:text-[#042a2b]"
          }`}
        >
          Settings & Account
        </button>
      </div>

      {/* Tab content */}
      <div className="mt-4 space-y-6">
        {activeTab === "insights" && (
          <>
            <NudgeOfTheDay />
            <WeeklyReflections />
          </>
        )}

        {activeTab === "settings" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-[#042a2b] mb-2">User Details</h2>
              <p className="text-sm text-brand-dark">Name: {user?.name || "N/A"}</p>
              <p className="text-sm text-brand-dark">Email: {user?.email || "N/A"}</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[#042a2b] mb-2">Settings</h2>
              <button className="px-4 py-2 bg-[#042a2b] text-white rounded-md text-sm hover:bg-[#5eb1bf] transition">
                Change Password
              </button>
              <button className="ml-2 px-4 py-2 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 transition">
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
