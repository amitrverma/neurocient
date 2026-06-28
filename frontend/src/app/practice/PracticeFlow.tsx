"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AuthModal from "@/app/components/AuthModal";
import { useAuth } from "@/app/context/AuthContext";
import {
  AdviceScreen,
  EffectScreen,
  RecognitionScreen,
  RespectScreen,
  TurnScreen,
  WelcomeScreen,
} from "./_components/EntryScreens";
import {
  ActionScreen,
  EnvironmentScreen,
  IdentityScreen,
  ReinforcementScreen,
  SetupScreen,
} from "./_components/IkeaScreens";
import { CurrentPracticePanel } from "./_components/CurrentPracticePanel";
import { LoopMap } from "./_components/LoopMap";
import { PracticeHeader } from "./_components/PracticeHeader";
import { procrastinationScenes } from "./_data/procrastinationLoop";
import { initialStep, stepOrder } from "./_lib/flowSteps";
import {
  buildPracticeDraft,
  clearPendingPracticeDraft,
  fetchCurrentPractice,
  keepPendingPracticeDraft,
  readPendingPracticeDraft,
  savePracticeDraft,
  type PracticeDraft,
  type SavedPractice,
} from "./_lib/practicePersistence";
import type { AdviceId, EffectId, SceneId, Step } from "./_lib/types";

type PracticeSaveStatus = "idle" | "saving" | "saved" | "error";

export default function PracticeFlow() {
  const { user, ready } = useAuth();
  const [step, setStep] = useState<Step>(initialStep);
  const [selectedSceneId, setSelectedSceneId] = useState<SceneId | null>(null);
  const [selectedAdvice, setSelectedAdvice] = useState<AdviceId[]>([]);
  const [effect, setEffect] = useState<EffectId | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<PracticeDraft | null>(null);
  const [saveStatus, setSaveStatus] = useState<PracticeSaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedPractice, setSavedPractice] = useState<SavedPractice | null>(null);
  const [savedPracticeLoading, setSavedPracticeLoading] = useState(false);

  const selectedScene = useMemo(
    () =>
      procrastinationScenes.find((scene) => scene.id === selectedSceneId) ??
      procrastinationScenes[0],
    [selectedSceneId],
  );

  const noAdvice = selectedAdvice.includes("none");

  const loadSavedPractice = useCallback(async () => {
    if (!ready || !user) {
      setSavedPractice(null);
      setSavedPracticeLoading(false);
      return;
    }

    setSavedPracticeLoading(true);
    try {
      setSavedPractice(await fetchCurrentPractice());
    } catch (error) {
      console.error("Failed to load current practice:", error);
      setSavedPractice(null);
    } finally {
      setSavedPracticeLoading(false);
    }
  }, [ready, user]);

  const persistDraft = useCallback(async (draft: PracticeDraft) => {
    setSaveStatus("saving");
    setSaveError(null);

    try {
      await savePracticeDraft(draft);
      clearPendingPracticeDraft();
      setPendingDraft(null);
      setSaveStatus("saved");
      await loadSavedPractice();
    } catch (error) {
      setSaveStatus("error");
      setSaveError(
        error instanceof Error
          ? error.message
          : "Could not keep this practice yet.",
      );
    }
  }, [loadSavedPractice]);

  useEffect(() => {
    void loadSavedPractice();
  }, [loadSavedPractice]);

  useEffect(() => {
    if (!ready || !user || pendingDraft || saveStatus !== "idle") return;

    const storedDraft = readPendingPracticeDraft();
    if (!storedDraft) return;

    void persistDraft(storedDraft);
  }, [pendingDraft, persistDraft, ready, saveStatus, user]);

  const selectScene = (id: SceneId) => {
    setSelectedSceneId(id);
    setSelectedAdvice([]);
    setEffect(null);
    setSaveStatus("idle");
    setSaveError(null);
  };

  const goBack = () => {
    if (step === "welcome") return;
    if (step === "turn" && noAdvice) return setStep("advice");
    if (step === "reinforcement" && effect === "worked") return setStep("respect");

    const index = stepOrder.indexOf(step);
    setStep(stepOrder[Math.max(index - 1, 0)]);
  };

  const selectAdvice = (id: AdviceId) => {
    setEffect(null);
    setSelectedAdvice((current) => {
      if (id === "none") return current.includes("none") ? [] : ["none"];

      const withoutNone = current.filter((item) => item !== "none");
      return withoutNone.includes(id)
        ? withoutNone.filter((item) => item !== id)
        : [...withoutNone, id];
    });
  };

  const continueFromAdvice = () => {
    if (selectedAdvice.length === 0) return;
    setStep(noAdvice ? "turn" : "effect");
  };

  const continueFromEffect = () => {
    if (!effect) return;
    setStep(effect === "worked" ? "respect" : "turn");
  };

  const openReinforcement = async () => {
    const draft = buildPracticeDraft({
      scene: selectedScene,
      adviceIds: selectedAdvice,
      effectId: effect,
    });

    keepPendingPracticeDraft(draft);
    setPendingDraft(draft);

    if (ready && user) {
      setStep("setup");
      await persistDraft(draft);
      return;
    }

    setAuthOpen(true);
  };

  const completeAuthHandoff = async () => {
    setAuthOpen(false);
    setStep("setup");

    const draft = pendingDraft ?? readPendingPracticeDraft();
    if (!draft) return;

    await persistDraft(draft);
  };

  const retrySave = async () => {
    const draft = pendingDraft ?? readPendingPracticeDraft();
    if (!draft) {
      setAuthOpen(true);
      return;
    }

    if (ready && user) {
      await persistDraft(draft);
      return;
    }

    setAuthOpen(true);
  };

  const reset = () => {
    setStep(initialStep);
    setSelectedSceneId(null);
    setSelectedAdvice([]);
    setEffect(null);
    setPendingDraft(null);
    clearPendingPracticeDraft();
    setSaveStatus("idle");
    setSaveError(null);
  };

  return (
    <main className="min-h-screen bg-white font-serif text-brand-dark">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 md:px-8 md:py-8">
        <PracticeHeader progress={getProgress(step)} step={step} onBack={goBack} />

        <div className="grid flex-1 gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-center lg:py-10">
          <div className="min-w-0">
            <PracticeStep
              step={step}
              selectedSceneId={selectedSceneId}
              selectedAdvice={selectedAdvice}
              effect={effect}
              selectedScene={selectedScene}
              userEmail={user?.email}
              saveStatus={saveStatus}
              saveError={saveError}
              setStep={setStep}
              setSelectedSceneId={selectScene}
              setEffect={setEffect}
              selectAdvice={selectAdvice}
              continueFromAdvice={continueFromAdvice}
              continueFromEffect={continueFromEffect}
              openReinforcement={openReinforcement}
              reset={reset}
              openAuth={() => setAuthOpen(true)}
              retrySave={retrySave}
            />
          </div>

          <div className="grid gap-4 lg:sticky lg:top-8 lg:self-start">
            <LoopMap
              scene={selectedScene}
              hasScene={Boolean(selectedSceneId)}
              advice={selectedAdvice}
              effect={effect}
            />
            {user ? (
              <CurrentPracticePanel
                practice={savedPractice}
                loading={savedPracticeLoading}
              />
            ) : null}
          </div>
        </div>
      </section>

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        context="remember this loop"
        onSuccess={completeAuthHandoff}
      />
    </main>
  );
}

type PracticeStepProps = {
  step: Step;
  selectedSceneId: SceneId | null;
  selectedAdvice: AdviceId[];
  effect: EffectId | null;
  selectedScene: (typeof procrastinationScenes)[number];
  userEmail?: string;
  saveStatus: PracticeSaveStatus;
  saveError: string | null;
  setStep: (step: Step) => void;
  setSelectedSceneId: (id: SceneId) => void;
  setEffect: (id: EffectId) => void;
  selectAdvice: (id: AdviceId) => void;
  continueFromAdvice: () => void;
  continueFromEffect: () => void;
  openReinforcement: () => void | Promise<void>;
  reset: () => void;
  openAuth: () => void;
  retrySave: () => void | Promise<void>;
};

const PracticeStep = ({
  step,
  selectedSceneId,
  selectedAdvice,
  effect,
  selectedScene,
  userEmail,
  saveStatus,
  saveError,
  setStep,
  setSelectedSceneId,
  setEffect,
  selectAdvice,
  continueFromAdvice,
  continueFromEffect,
  openReinforcement,
  reset,
  openAuth,
  retrySave,
}: PracticeStepProps) => {
  if (step === "welcome") {
    return (
      <WelcomeScreen
        onStart={() => setStep("recognition")}
        onSkip={() => setStep("reinforcement")}
      />
    );
  }

  if (step === "recognition") {
    return (
      <RecognitionScreen
        selectedSceneId={selectedSceneId}
        onSelect={setSelectedSceneId}
        onContinue={() => setStep("advice")}
      />
    );
  }

  if (step === "advice") {
    return (
      <AdviceScreen
        selectedAdvice={selectedAdvice}
        selectedSceneId={selectedScene.id}
        onSelect={selectAdvice}
        onContinue={continueFromAdvice}
      />
    );
  }

  if (step === "effect") {
    return (
      <EffectScreen
        effect={effect}
        onSelect={setEffect}
        onContinue={continueFromEffect}
      />
    );
  }

  if (step === "respect") {
    return <RespectScreen onRemember={openReinforcement} onFinish={reset} />;
  }

  if (step === "turn") {
    return (
      <TurnScreen
        perspective={selectedScene.perspective}
        onContinue={() => setStep("identity")}
      />
    );
  }

  if (step === "identity") {
    return (
      <IdentityScreen
        identity={selectedScene.identity}
        reframe={selectedScene.reframe}
        onContinue={() => setStep("environment")}
      />
    );
  }

  if (step === "environment") {
    return (
      <EnvironmentScreen
        environment={selectedScene.environment}
        onContinue={() => setStep("action")}
      />
    );
  }

  if (step === "action") {
    return (
      <ActionScreen
        action={selectedScene.action}
        onContinue={() => setStep("reinforcement")}
      />
    );
  }

  if (step === "reinforcement") {
    return (
      <ReinforcementScreen
        reminder={selectedScene.reminder}
        onRemember={openReinforcement}
        onFinish={reset}
      />
    );
  }

  return (
    <SetupScreen
      userEmail={userEmail}
      reminder={selectedScene.reminder}
      saveStatus={saveStatus}
      saveError={saveError}
      onCreateAccount={openAuth}
      onRetry={retrySave}
      onRestart={reset}
    />
  );
};

const getProgress = (step: Step) => {
  const currentIndex = stepOrder.indexOf(step);
  const visibleIndex = Math.max(currentIndex, 0);
  return Math.round(((visibleIndex + 1) / stepOrder.length) * 100);
};
