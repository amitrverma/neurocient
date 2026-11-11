import type { ReactNode } from "react";
import { createPublicMetadata } from "@/lib/searchMetadata";

export const metadata = createPublicMetadata({
  title: "Behavior-Pattern Diagnostics",
  description:
    "Use short Neurocient diagnostics to connect concrete situations in your life with the automatic responses shaping what happens next.",
  path: "/diagnostics",
});

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

