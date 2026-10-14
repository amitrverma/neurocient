import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../nav-surfaces.css";

export const metadata: Metadata = {
  title: "Tools | Inner Caveman",
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

