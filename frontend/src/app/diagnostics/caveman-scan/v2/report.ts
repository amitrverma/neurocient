import type { PortraitFoundation, TriggerId, WatchtowerId } from "./types";

export const WATCHTOWER_REPORT: Record<WatchtowerId, {
  publicName: string;
  headline: string;
  question: string;
  portrait: string;
  protection: string;
  modernLife: string;
}> = {
  horizon: {
    publicName: "Safety & Survival",
    headline: "Your Inner Caveman notices uncertainty first.",
    question: "What might go wrong?",
    portrait: "Unclear moments can pull attention toward danger, instability, missing information, or the need to prepare.",
    protection: "It is trying to protect continuity and safety before the situation has fully revealed itself.",
    modernLife: "This can appear as anticipation, contingency planning, hesitation, or difficulty leaving uncertainty unresolved.",
  },
  campfire: {
    publicName: "Belonging & Affiliation",
    headline: "Your Inner Caveman notices belonging first.",
    question: "Am I still included?",
    portrait: "Moments involving other people can draw attention toward acceptance, shared understanding, and whether your place in the group is intact.",
    protection: "It is trying to protect connection to the people and groups that make life feel secure.",
    modernLife: "This can appear as monitoring reactions, replaying interactions, comparison, or noticing signs of exclusion early.",
  },
  high_ground: {
    publicName: "Status & Hierarchy",
    headline: "Your Inner Caveman notices where you stand first.",
    question: "Where do I stand?",
    portrait: "Ambiguous moments can draw attention toward position, recognition, competence, and how your contribution may be seen.",
    protection: "It is trying to protect standing and influence in a social world where position once shaped access and security.",
    modernLife: "This can appear around evaluation, visibility, comparison, correction, credit, or performance.",
  },
  home_path: {
    publicName: "Mate & Bond Security",
    headline: "Your Inner Caveman notices changes in close bonds first.",
    question: "Is this bond still safe?",
    portrait: "Small shifts in closeness, trust, tone, or availability can become especially meaningful before more information arrives.",
    protection: "It is trying to protect the bonds that provide intimacy, reassurance, and a reliable way back to one another.",
    modernLife: "This can appear as checking where you stand, reading distance closely, or looking for meaning in relational ambiguity.",
  },
  care_circle: {
    publicName: "Kin Care",
    headline: "Your Inner Caveman notices who may need you first.",
    question: "Are my people okay?",
    portrait: "Responsibility and other people's wellbeing can come into focus quickly, sometimes before your own capacity or position.",
    protection: "It is trying to protect the people, responsibilities, and vulnerable relationships entrusted to you.",
    modernLife: "This can appear as carrying emotional load, anticipating needs, over-responsibility, or finding it difficult not to step in.",
  },
};

export const TRIGGER_LABELS: Record<TriggerId, string> = {
  waiting: "waiting", evaluation: "evaluation", comparison: "comparison",
  uncertainty: "uncertainty", belonging: "group belonging", conflict: "conflict",
  scarcity: "scarcity", reward: "unexpected reward", responsibility: "responsibility",
  relationships: "close relationships", loss: "loss", success: "success",
  exposure: "being put on the spot", interruption: "interruption", correction: "public correction",
  change: "change", trust: "trust", favor: "requests for help", autonomy: "autonomy",
  recognition: "recognition and credit",
};

export const summarizeContexts = (contexts: TriggerId[], limit = 3) =>
  [...new Set(contexts)].slice(0, limit).map((id) => TRIGGER_LABELS[id]);

export const getPortraitCopy = (portrait: PortraitFoundation) => {
  const primary = portrait.preview.primaryWatchtower;
  const supporting = portrait.preview.supportingWatchtower;
  return {
    primary: primary ? WATCHTOWER_REPORT[primary] : null,
    primaryName: primary ? WATCHTOWER_REPORT[primary].publicName : null,
    supporting: supporting ? WATCHTOWER_REPORT[supporting] : null,
    supportingName: supporting ? WATCHTOWER_REPORT[supporting].publicName : null,
    primaryContexts: summarizeContexts(portrait.preview.primaryContexts),
    rationalContexts: summarizeContexts(portrait.preview.rationalContexts),
  };
};
