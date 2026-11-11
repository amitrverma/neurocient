import type { ReactNode } from "react";
import { createPublicMetadata } from "@/lib/searchMetadata";

export const metadata = createPublicMetadata({
  title: "Support",
  description: "Get help with a Neurocient account, billing, programs, privacy, or the WhatsApp companion.",
  path: "/support",
});

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
