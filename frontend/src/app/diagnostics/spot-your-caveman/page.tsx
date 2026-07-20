import { redirect } from "next/navigation";

export default function LegacySpotDiagnosticPage() {
  redirect("/diagnostics/caveman-scan");
}
