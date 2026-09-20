import type { ReactNode } from "react";

export type SceneId = "escape" | "pressure" | "planning" | "messy" | "decision";
export type AdviceId =
  | "timer"
  | "breakdown"
  | "phone"
  | "deadline"
  | "closed_escape"
  | "blocked_sites"
  | "fake_deadline"
  | "calendar_start"
  | "better_plan"
  | "changed_tool"
  | "rough_draft"
  | "lowered_standard"
  | "pros_cons"
  | "asked_someone"
  | "none";
export type EffectId = "worked" | "briefly" | "not-really";

export type Scene = {
  id: SceneId;
  title: string;
  detail: string;
  perspective: {
    title: string;
    body: string;
    line: string;
  };
  identity: string;
  reframe: string;
  environment: string;
  action: string;
  reminder: string;
};

export type Option<TId extends string> = {
  id: TId;
  title: string;
  detail?: string;
};

export type Step =
  | "welcome"
  | "recognition"
  | "advice"
  | "effect"
  | "respect"
  | "turn"
  | "identity"
  | "environment"
  | "action"
  | "reinforcement"
  | "setup";

export type WithChildren = {
  children: ReactNode;
};
