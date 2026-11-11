import type { ReactNode } from "react";
import "./insights.css";
import { createPublicMetadata } from "@/lib/searchMetadata";

export const metadata = createPublicMetadata({
  title: "Why You Do What You Do: Behavior and Psychology Insights",
  description:
    "Explore clear explanations for doomscrolling, worry, comparison, procrastination, stress eating, feedback anxiety, and other recurring behaviors.",
  path: "/insights",
});

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

