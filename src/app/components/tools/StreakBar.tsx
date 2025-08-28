"use client";
import React from "react";

const StreakBar = ({ current, longest }: { current: number; longest: number }) => (
  <div className="bg-white rounded-lg p-4 shadow-sm border border-brand-dark">
    <div className="flex items-center justify-between">
      <div className="text-md font-semibold text-[#042a2b]">
        🔥 Current Streak:
        <span className="ml-2 text-[#ed254e] font-bold">
          {current} day{current !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="text-md text-brand-dark">
        🏆 Longest:
        <span className="ml-1 font-medium">
          {longest} day{longest !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  </div>
);

export default StreakBar;
