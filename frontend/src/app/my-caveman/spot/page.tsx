import { permanentRedirect } from "next/navigation";

export default function LegacyMyCavemanSpotPage() {
  permanentRedirect("/tools/spots");
}
