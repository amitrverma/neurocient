import type { ReactNode } from "react";
import { createPublicMetadata } from "@/lib/searchMetadata";

export const metadata = createPublicMetadata({
  title: "Behavior-Change Membership",
  description:
    "Continue beyond insight with Neurocient tools, guided Practice, reinforcement, and support for recurring patterns in everyday life.",
  path: "/membership",
});

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

