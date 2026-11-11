import type { ReactNode } from "react";
import { createPublicMetadata } from "@/lib/searchMetadata";

export const metadata = createPublicMetadata({
  title: "About the Neurocient Behavior-Change Approach",
  description:
    "Why Neurocient starts with the automatic responses beneath behavior instead of adding more advice, motivation, or shame.",
  path: "/about",
});

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

