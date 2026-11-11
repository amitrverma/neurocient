import type { ReactNode } from "react";
import "./modern-caveman.css";
import { createPublicMetadata } from "@/lib/searchMetadata";

export const metadata = createPublicMetadata({
  title: "A Guided Program for Lasting Behavior Change",
  description:
    "Modern Caveman is Neurocient's facilitated program for understanding why patterns repeat and changing the conditions that keep them going.",
  path: "/modern-caveman",
});

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

