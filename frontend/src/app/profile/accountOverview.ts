export type WorkOverview = {
  status: "loading" | "ready" | "unavailable";
  savedCount: number;
  spotCount: number;
  challengeCount: number;
  activeChallenge: boolean;
  hasPractice: boolean;
  hasScan: boolean;
  savedArticles: Array<{ slug: string; title?: string; excerpt?: string }>;
  latestSpot: { date: string; description: string } | null;
  activeChallengeTitle: string | null;
  activeChallengeLoggedToday: boolean;
  practice: {
    moment?: string;
    action?: string;
    reminder?: string;
    identity?: string;
  } | null;
};

export type AccountContinuation = {
  kind: "practice" | "microchallenge" | "spots" | "caveman";
  href: string;
  label: string;
  text: string;
};

export const chooseAccountContinuation = (
  overview: WorkOverview,
): AccountContinuation => {
  if (overview.hasPractice) {
    return {
      kind: "practice",
      href: "/practice",
      label: "Continue Practice",
      text: "Return to the behaviour you are already working through.",
    };
  }
  if (overview.activeChallenge) {
    return {
      kind: "microchallenge",
      href: "/tools/microchallenges",
      label: "Continue your microchallenge",
      text: "Log today’s repetition or review what the experiment is showing you.",
    };
  }
  if (overview.spotCount > 0) {
    return {
      kind: "spots",
      href: "/tools/spots",
      label: "Record a spot",
      text: "Add another concrete situation to the evidence you are building.",
    };
  }
  return {
    kind: "practice",
    href: "/practice",
    label: "Work with one recurring situation",
    text: "Start with something that keeps happening and understand it before choosing a small response.",
  };
};
