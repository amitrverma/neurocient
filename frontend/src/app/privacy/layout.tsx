import type { ReactNode } from "react";
import { createPublicMetadata } from "@/lib/searchMetadata";

export const metadata = createPublicMetadata({
  title: "Privacy Policy",
  description: "How Neurocient Labs collects, uses, protects, and deletes personal information.",
  path: "/privacy",
});

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

