import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./modern-caveman.css";

export const metadata: Metadata = {
  title: "Modern Caveman | Inner Caveman",
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

