export type WorkOverview = {
  status: "loading" | "ready" | "unavailable";
  savedCount: number;
  spotCount: number;
  challengeCount: number;
  activeChallenge: boolean;
  hasPractice: boolean;
  hasPortrait: boolean;
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
  latestReflection: string | null;
};

export type AccountContinuation = {
  href: string;
  label: string;
  text: string;
};

export const buildReturnQuestion = (overview: WorkOverview) => {
  if (overview.activeChallengeTitle) {
    return overview.activeChallengeLoggedToday
      ? `You logged today’s repetition of “${overview.activeChallengeTitle}”. What did it show you?`
      : `You are testing “${overview.activeChallengeTitle}”. What happened the last time the situation returned?`;
  }
  if (overview.practice?.action) {
    return `You intended to ${lowercaseStart(overview.practice.action)}. What happened when the situation returned?`;
  }
  if (overview.latestSpot?.description) {
    return `You recently noticed “${shorten(overview.latestSpot.description)}”. Has the same response appeared again?`;
  }
  if (overview.savedArticles[0]?.title) {
    return `You kept “${overview.savedArticles[0].title}”. What made that idea worth returning to?`;
  }
  return "What has been happening repeatedly, even though you know what you would prefer to do?";
};

const lowercaseStart = (value: string) =>
  value ? `${value.charAt(0).toLowerCase()}${value.slice(1)}` : value;

const shorten = (value: string) =>
  value.length > 110 ? `${value.slice(0, 107).trimEnd()}…` : value;

export const chooseAccountContinuation = (
  overview: WorkOverview,
): AccountContinuation => {
  if (overview.hasPractice) {
    return {
      href: "/practice",
      label: "Continue Practice",
      text: "Return to the behavior loop you are already working through.",
    };
  }
  if (overview.activeChallenge) {
    return {
      href: "/tools/microchallenges",
      label: "Continue your microchallenge",
      text: "Log today’s repetition or review what the experiment is showing you.",
    };
  }
  if (overview.hasPortrait) {
    return {
      href: "/tools/spots",
      label: "Record a spot",
      text: "Add one concrete situation to the evidence connected to your portrait.",
    };
  }
  return {
    href: "/practice",
    label: "Work with one recurring situation",
    text: "Start with something that keeps happening and understand the behavior before choosing a small response.",
  };
};
