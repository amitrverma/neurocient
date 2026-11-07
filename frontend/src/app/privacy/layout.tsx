import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Privacy Policy | Neurocient Labs",
  description: "How Neurocient Labs collects, uses, protects, and deletes personal information.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

