import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Data Deletion | Neurocient Labs",
  description: "Instructions for requesting deletion of a Neurocient account and personal information.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
