import type { ReactNode } from "react";
import "./caveman-cubicle.css";
import { createPublicMetadata } from "@/lib/searchMetadata";

export const metadata = createPublicMetadata({
  title: "Workplace Behavior Change and Team Programs",
  description:
    "Understand the automatic responses behind feedback anxiety, team silence, hierarchy, missed deadlines, and other recurring workplace patterns.",
  path: "/caveman-cubicle",
});

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

