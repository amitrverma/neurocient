import type { Step } from "./types";

export const initialStep: Step = "welcome";

export const stepOrder: Step[] = [
  "welcome",
  "recognition",
  "advice",
  "effect",
  "respect",
  "turn",
  "identity",
  "environment",
  "action",
  "reinforcement",
  "setup",
];

export const stepMeta: Partial<Record<Step, string>> = {
  recognition: "Recognition",
  advice: "Evidence",
  effect: "Effect",
  respect: "Respect",
  turn: "Angle",
  identity: "Identity",
  environment: "Setup",
  action: "Move",
  reinforcement: "Later",
};
