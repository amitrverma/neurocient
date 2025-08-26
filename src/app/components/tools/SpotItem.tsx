"use client";
import React from "react";

const SpotItem = ({ date, description }: { date: string; description: string }) => (
  <li className="bg-gray-100 p-3 rounded shadow-sm border border-gray-200">
    <div className="text-xs text-gray-500 font-medium mb-1">
      {new Date(date).toLocaleDateString("en-IN", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })}
    </div>
    <p className="text-gray-800 text-sm">{description}</p>
  </li>
);

export default SpotItem;
