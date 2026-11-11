import type { ReactNode } from "react";
import { createPublicMetadata } from "@/lib/searchMetadata";

export const metadata = createPublicMetadata({
  title: "Terms of Service",
  description: "Terms for Neurocient's public content, accounts, membership, tools, and facilitated programs.",
  path: "/terms",
});

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

