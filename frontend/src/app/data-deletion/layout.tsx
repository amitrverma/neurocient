import type { ReactNode } from "react";
import { createPublicMetadata } from "@/lib/searchMetadata";

export const metadata = createPublicMetadata({
  title: "Data Deletion",
  description: "Instructions for requesting deletion of a Neurocient account and personal information.",
  path: "/data-deletion",
});

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
