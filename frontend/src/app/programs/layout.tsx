import type { ReactNode } from "react";
import { createPublicMetadata } from "@/lib/searchMetadata";

export const metadata = createPublicMetadata({
  title: "Personal and Workplace Behavior-Change Programs",
  description:
    "Explore Neurocient's guided programs for individuals, teams, and organizations working on recurring behavior patterns.",
  path: "/programs",
});

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

