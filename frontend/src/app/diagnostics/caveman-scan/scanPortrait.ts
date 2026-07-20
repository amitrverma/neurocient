import type { ProtectiveMove, ScanOptionEvidence, Watchtower } from "./scanEvidence";

type PatternCopy = {
  eyebrow: string;
  headline: string;
  explanation: string;
  protection: string;
  cue: string;
};

export type ScanPortraitPattern = PatternCopy & {
  move: ProtectiveMove;
  evidence: ScanOptionEvidence[];
};

export type ScanPortrait = {
  headline: string;
  introduction: string;
  primary: ScanPortraitPattern;
  secondary?: ScanPortraitPattern;
  flexibleMoments: ScanOptionEvidence[];
  contexts: string[];
  supportedWatchtowers: Array<{ watchtower: Watchtower; label: string; explanation: string }>;
  continuation: { href: string; title: string; body: string; cta: string };
};

const scenarioContexts: Record<number, string> = {
  1: "meaningful work",
  2: "progress and comparison",
  3: "attention",
  5: "friendship",
  8: "energy and health",
  9: "habits",
  10: "close relationships",
  11: "pressure at home",
  12: "rest",
  13: "social connection",
  14: "recovery",
  15: "self-trust",
};

const watchtowerCopy: Record<Watchtower, { label: string; explanation: string }> = {
  horizon: {
    label: "Safety & certainty",
    explanation: "Your system repeatedly looked for what felt safer, clearer, or more containable.",
  },
  campfire: {
    label: "Belonging",
    explanation: "Your system repeatedly watched for signs that connection or acceptance might have shifted.",
  },
  high_ground: {
    label: "Status & position",
    explanation: "Your system repeatedly checked what the moment might mean about where you stand.",
  },
  home_path: {
    label: "Bond security",
    explanation: "Your system repeatedly moved to protect an important close bond from possible disruption.",
  },
  care_circle: {
    label: "Care for your people",
    explanation: "Your system repeatedly became alert around the safety or wellbeing of people close to you.",
  },
};

const continuationCopy: Record<ProtectiveMove, ScanPortrait["continuation"]> = {
  seek_relief: {
    href: "/insights/doomscrolling",
    title: "See why immediate relief wins so easily",
    body: "Continue with the attention loop most closely connected to your result.",
    cta: "Explore the relief loop",
  },
  restore_control: {
    href: "/insights/anticipatory-anxiety",
    title: "Understand the mind’s search for certainty",
    body: "Continue with how anticipation and control can keep a protective system active.",
    cta: "Explore certainty and control",
  },
  social_monitoring: {
    href: "/insights/why-we-compare",
    title: "Look more closely at the social scoreboard",
    body: "Continue with why another person’s progress or reaction can begin to feel like information about you.",
    cta: "Explore comparison",
  },
  create_distance: {
    href: "/insights/connections",
    title: "See how protection can become distance",
    body: "Continue with the tension between avoiding risk now and preserving connection over time.",
    cta: "Explore connection",
  },
  override_signal: {
    href: "/insights/struggle-to-exercise",
    title: "Understand what your energy is negotiating",
    body: "Continue with the protective logic beneath effort, fatigue, and pushing through.",
    cta: "Explore energy protection",
  },
  discharge_pressure: {
    href: "/inner-caveman",
    title: "Understand why the final moment carries the whole day",
    body: "Continue with how a protective system stays braced and reacts when one more demand arrives.",
    cta: "Meet the protective system",
  },
  self_verdict: {
    href: "/insights/willpower",
    title: "Separate a difficult moment from your identity",
    body: "Continue with why inconsistency so quickly becomes a story about character and willpower.",
    cta: "Explore the self-verdict",
  },
  flexible_response: {
    href: "/inner-caveman",
    title: "Learn what creates room around the signal",
    body: "Continue with the protective system that still speaks first, even when it does not decide what happens next.",
    cta: "Understand your Inner Caveman",
  },
};

const deepSignals = (allEvidence: ScanOptionEvidence[], primaryMove: ProtectiveMove) => {
  const contexts = [...new Set(
    allEvidence
      .filter(({ move }) => move === primaryMove)
      .map(({ optionId }) => scenarioContexts[Number(optionId.split("-")[0])])
      .filter(Boolean),
  )];
  const watchtowerCounts = allEvidence.reduce((counts, item) => {
    if (item.move !== "flexible_response" && item.watchtower) {
      counts.set(item.watchtower, (counts.get(item.watchtower) ?? 0) + 1);
    }
    return counts;
  }, new Map<Watchtower, number>());
  const supportedWatchtowers = [...watchtowerCounts.entries()]
    .filter(([, count]) => count >= 2)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([watchtower]) => ({ watchtower, ...watchtowerCopy[watchtower] }));

  return {
    contexts,
    supportedWatchtowers,
    continuation: continuationCopy[primaryMove],
  };
};

const patternCopy: Record<Exclude<ProtectiveMove, "flexible_response">, PatternCopy> = {
  seek_relief: {
    eyebrow: "The move that repeated",
    headline: "When discomfort rises, your attention looks for relief.",
    explanation:
      "The situations changed, but the movement was similar: away from what asked more of you and towards something easier, clearer, or immediately rewarding.",
    protection:
      "Your Inner Caveman is reducing the discomfort of this moment. The relief is real. The cost often arrives later as lost momentum, energy, or rest.",
    cue: "Something meaningful starts to feel heavy, and an easier thing suddenly becomes unusually attractive.",
  },
  restore_control: {
    eyebrow: "The move that repeated",
    headline: "When life feels uncertain, you try to make it orderly again.",
    explanation:
      "Planning, organising, tightening the system, or promising a cleaner restart can make a messy moment feel manageable before anything has actually changed.",
    protection:
      "Your Inner Caveman gets certainty now. But sometimes the plan quietly replaces the life the plan was meant to support.",
    cue: "Entering the moment feels uncomfortable, and improving the plan begins to feel more urgent than using it.",
  },
  social_monitoring: {
    eyebrow: "The move that repeated",
    headline: "When the social picture is unclear, you begin reading between the lines.",
    explanation:
      "Someone else’s progress, a pause, or an uncertain response can turn your attention into a monitor for where you stand and what the moment might mean about you.",
    protection:
      "Your Inner Caveman is trying to catch a change in status, belonging, or connection before it becomes costly. The watch can continue even when there is little evidence of danger.",
    cue: "A small social detail starts producing a much larger story about where you stand.",
  },
  create_distance: {
    eyebrow: "The move that repeated",
    headline: "When contact feels risky, distance offers protection.",
    explanation:
      "Silence, postponement, withdrawal, or letting the moment pass can remove the possibility of awkwardness, conflict, or rejection right now.",
    protection:
      "Your Inner Caveman protects the bond by avoiding a dangerous moment inside it. That can preserve the present while allowing distance to grow over time.",
    cue: "You care about the connection, but waiting for a safer moment starts to feel wiser than making contact now.",
  },
  override_signal: {
    eyebrow: "The move that repeated",
    headline: "When your system signals strain, you ask it to keep performing.",
    explanation:
      "Pressure or low energy does not always lead you to stop. Sometimes you contain it, force your way through, or treat the signal as another obstacle to overcome.",
    protection:
      "Pushing through can preserve competence and keep demands moving. It can also prevent the strain from being understood until it emerges somewhere else.",
    cue: "Your body or mood signals that something is too much, and your first response is to become stricter with yourself.",
  },
  discharge_pressure: {
    eyebrow: "The move that repeated",
    headline: "Pressure stays contained—until a small moment gives it somewhere to go.",
    explanation:
      "The final question or interruption may be ordinary, but it lands on a system that has been carrying much more than the person in front of you can see.",
    protection:
      "Your Inner Caveman is trying to create space from one more demand. The reaction protects capacity in the moment, while someone nearby may receive the accumulated force of the day.",
    cue: "A response feels larger than the immediate event. Look behind it for everything your system has already been carrying.",
  },
  self_verdict: {
    eyebrow: "The move that repeated",
    headline: "A difficult moment can quickly become a verdict about you.",
    explanation:
      "Instead of remaining one missed day, one comparison, one awkward pause, or one tired morning, the moment begins to say something larger about who you are.",
    protection:
      "A harsh conclusion creates certainty: if you are the problem, the ambiguity is over. But that certainty can cost self-trust and make the next attempt feel heavier.",
    cue: "Notice when the sentence changes from ‘this happened’ to ‘this is what I am like.’",
  },
};

const strengthWeight = { weak: 1, moderate: 2, strong: 3 } as const;

const makePattern = (
  move: Exclude<ProtectiveMove, "flexible_response">,
  evidence: ScanOptionEvidence[],
): ScanPortraitPattern => ({ move, evidence: evidence.slice(0, 3), ...patternCopy[move] });

export const buildScanPortrait = (allEvidence: ScanOptionEvidence[]): ScanPortrait => {
  const flexibleMoments = allEvidence.filter(({ move }) => move === "flexible_response");
  const protective = allEvidence.filter(
    (item): item is ScanOptionEvidence & { move: Exclude<ProtectiveMove, "flexible_response"> } =>
      item.move !== "flexible_response",
  );

  const groups = new Map<Exclude<ProtectiveMove, "flexible_response">, ScanOptionEvidence[]>();
  protective.forEach((item) => {
    const group = groups.get(item.move) ?? [];
    group.push(item);
    groups.set(item.move, group);
  });

  const ranked = [...groups.entries()].sort(([, a], [, b]) => {
    if (b.length !== a.length) return b.length - a.length;
    return (
      b.reduce((sum, item) => sum + strengthWeight[item.strength], 0) -
      a.reduce((sum, item) => sum + strengthWeight[item.strength], 0)
    );
  });

  const repeated = ranked.filter(([, evidence]) => evidence.length >= 2);
  const primaryEntry = repeated[0] ?? ranked[0];

  if (!primaryEntry) {
    const flexibilityCopy: PatternCopy = {
      eyebrow: "What appeared across the scan",
      headline: "You often left the moment as it was, without making it larger.",
      explanation:
        "Across these situations, you frequently noticed the pull without needing to follow it. That is flexibility in these moments—not proof that protective reactions never appear elsewhere.",
      protection:
        "The Inner Caveman still speaks first. Your answers suggest that, in these particular scenes, its signal did not have to become the decision.",
      cue: "Keep noticing the small pause between the first signal and what you do next.",
    };
    const primaryMove = "flexible_response" as const;
    return {
      headline: "You showed room between the signal and the response.",
      introduction:
        "This is not a type or a score. It is a reflection of how you pictured yourself moving through these twelve moments.",
      primary: {
        move: "flexible_response",
        evidence: flexibleMoments.slice(0, 3),
        ...flexibilityCopy,
      },
      flexibleMoments: flexibleMoments.slice(0, 2),
      ...deepSignals(allEvidence, primaryMove),
    };
  }

  const primary = makePattern(primaryEntry[0], primaryEntry[1]);
  const secondaryEntry = repeated.find(([move]) => move !== primary.move);

  return {
    headline: primary.headline,
    introduction:
      "Your answers do not define a personality type. They show a movement that appeared across different parts of ordinary life—and the protective logic that may sit underneath it.",
    primary,
    secondary: secondaryEntry ? makePattern(secondaryEntry[0], secondaryEntry[1]) : undefined,
    flexibleMoments: flexibleMoments.slice(0, 2),
    ...deepSignals(allEvidence, primary.move),
  };
};
