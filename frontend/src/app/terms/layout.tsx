import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Terms of Service | Neurocient Labs",
  description: "Terms for Neurocient's public content, accounts, membership, tools, and facilitated programs.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

