import PracticeFlow from "./PracticeFlow";
import { createPublicMetadata } from "@/lib/searchMetadata";

export const metadata = createPublicMetadata({
  title: "Guided Practice for Recurring Behavior Patterns",
  description:
    "Work through Identity, Knowledge, Environment, Action, and Reinforcement without reducing behavior change to another list of tips.",
  path: "/practice",
});

export default function PracticePage() {
  return <PracticeFlow />;
}
