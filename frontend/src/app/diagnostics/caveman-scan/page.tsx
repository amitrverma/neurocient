import CavemanScan from "./CavemanScan";
import { createPublicMetadata } from "@/lib/searchMetadata";

export const metadata = createPublicMetadata({
  title: "Free Inner Caveman Scan: Understand Your Behavioral Patterns",
  description:
    "Take a short, situation-based scan to connect your answers with automatic responses involving safety, belonging, status, close bonds, and care for others.",
  path: "/diagnostics/caveman-scan",
});

export default function CavemanScanPage() {
  return <CavemanScan />;
}
