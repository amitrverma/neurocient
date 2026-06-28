import type { AdviceId, EffectId, Scene, SceneId } from "./types";

const pendingPracticeKey = "neurocient.practice.pendingLoop";

export type PracticeDraft = {
  loopSlug: string;
  sceneId: SceneId;
  sceneTitle: string;
  adviceIds: AdviceId[];
  effectId: EffectId | null;
  identity: string;
  reframe: string;
  knowledge: {
    title: string;
    body: string;
    line: string;
  };
  environment: string;
  action: string;
  reminder: string;
  createdAt: string;
};

export type PracticeSaveResult = {
  id: string;
};

export type SavedPractice = {
  id: string;
  moment: string;
  identity: string;
  oldStory: string;
  knowledge: string;
  environment: string;
  action: string;
  reminder: string;
  loopSlug: string;
  sceneId: string | null;
  createdAt: string | null;
};

export const buildPracticeDraft = ({
  scene,
  adviceIds,
  effectId,
}: {
  scene: Scene;
  adviceIds: AdviceId[];
  effectId: EffectId | null;
}): PracticeDraft => ({
  loopSlug: "procrastination",
  sceneId: scene.id,
  sceneTitle: scene.title,
  adviceIds,
  effectId,
  identity: scene.identity,
  reframe: scene.reframe,
  knowledge: scene.perspective,
  environment: scene.environment,
  action: scene.action,
  reminder: scene.reminder,
  createdAt: new Date().toISOString(),
});

export const keepPendingPracticeDraft = (draft: PracticeDraft) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(pendingPracticeKey, JSON.stringify(draft));
};

export const readPendingPracticeDraft = (): PracticeDraft | null => {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(pendingPracticeKey);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as PracticeDraft;
  } catch {
    window.localStorage.removeItem(pendingPracticeKey);
    return null;
  }
};

export const clearPendingPracticeDraft = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(pendingPracticeKey);
};

export const savePracticeDraft = async (
  draft: PracticeDraft,
): Promise<PracticeSaveResult> => {
  const res = await fetch("/api/practice/loops", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(draft),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.detail || "Could not keep this practice yet.");
  }

  return data as PracticeSaveResult;
};

export const fetchCurrentPractice = async (): Promise<SavedPractice | null> => {
  const res = await fetch("/api/practice/loops", {
    method: "GET",
    credentials: "include",
  });

  if (res.status === 404) return null;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.detail || "Could not load your current practice.");
  }

  return data as SavedPractice;
};
