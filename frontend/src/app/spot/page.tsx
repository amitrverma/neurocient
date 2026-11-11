import { permanentRedirect } from "next/navigation";

export default function LegacySpotPage() {
  permanentRedirect("/tools/spots");
}
