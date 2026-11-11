import { permanentRedirect } from "next/navigation";

export default function LegacySpotDiagnosticPage() {
  permanentRedirect("/diagnostics/caveman-scan");
}
