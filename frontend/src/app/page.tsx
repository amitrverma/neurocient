// app/page.tsx

import Landing from "./components/LandingPage";
import { createPublicMetadata } from "@/lib/searchMetadata";

export const metadata = createPublicMetadata({
  title: "Why Change Is Hard—and What Makes It Stick",
  description:
    "Understand why knowing what to do is often not enough. Neurocient explains the automatic responses behind procrastination, worry, comparison, scrolling, and other recurring patterns.",
  path: "/",
  keywords: [
    "why change is hard",
    "why habits do not stick",
    "knowing doing gap",
    "behavior change psychology",
    "automatic behavior",
  ],
});

export default function Home() {
  return (
      <Landing />
  );
}
