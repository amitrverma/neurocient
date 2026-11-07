import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Support | Neurocient Labs",
  description: "Get help with a Neurocient account, billing, programs, privacy, or the WhatsApp companion.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
