import type { ReactNode } from "react";
import { createPublicMetadata } from "@/lib/searchMetadata";

export const metadata = createPublicMetadata({
  title: "Behavior-Change Tools for Real Situations",
  description:
    "Use Neurocient tools to notice automatic responses, capture real-life evidence, and test small changes in the conditions around a behavior.",
  path: "/tools",
});

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

