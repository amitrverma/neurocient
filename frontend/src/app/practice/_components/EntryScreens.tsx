import {
  effectOptions,
  getAdviceOptionsForScene,
  procrastinationScenes,
} from "../_data/procrastinationLoop";
import type { AdviceId, EffectId, Scene, SceneId } from "../_lib/types";
import {
  ChoiceButton,
  ChoiceGrid,
  GhostButton,
  InsightLine,
  PrimaryButton,
  Screen,
} from "./PracticeUi";

export const WelcomeScreen = ({
  onStart,
  onSkip,
}: {
  onStart: () => void;
  onSkip: () => void;
}) => (
  <div className="practice-intro">
    <p className="surface-eyebrow">Practice · Procrastination</p>
    <h1 className="surface-title">
      Work with one loop,
      <span>not your whole life.</span>
    </h1>
    <p className="surface-lede">
      Begin with a recent moment when a task kept getting heavier. Understand
      what happened, then leave with one move you can actually see yourself doing.
    </p>
    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
      <PrimaryButton onClick={onStart}>Start</PrimaryButton>
      <GhostButton onClick={onSkip}>I already know my loop</GhostButton>
    </div>
  </div>
);

export const RecognitionScreen = ({
  selectedSceneId,
  onSelect,
  onContinue,
}: {
  selectedSceneId: SceneId | null;
  onSelect: (id: SceneId) => void;
  onContinue: () => void;
}) => (
  <Screen
    label="Recognition"
    title="Where does procrastination usually begin?"
    body="Pick the one that feels closest to a recent day."
  >
    <ChoiceGrid>
      {procrastinationScenes.map((scene) => (
        <ChoiceButton
          key={scene.id}
          selected={selectedSceneId === scene.id}
          title={scene.title}
          detail={scene.detail}
          onClick={() => onSelect(scene.id)}
        />
      ))}
    </ChoiceGrid>
    <PrimaryButton disabled={!selectedSceneId} onClick={onContinue}>
      Continue
    </PrimaryButton>
  </Screen>
);

export const AdviceScreen = ({
  selectedAdvice,
  selectedSceneId,
  onSelect,
  onContinue,
}: {
  selectedAdvice: AdviceId[];
  selectedSceneId: SceneId;
  onSelect: (id: AdviceId) => void;
  onContinue: () => void;
}) => {
  const adviceOptions = getAdviceOptionsForScene(selectedSceneId);

  return (
    <Screen
      label="Evidence"
      title="What have you already tried?"
      body="Which ones have been in the room with you?"
    >
      <ChoiceGrid compact>
        {adviceOptions.map((item) => (
          <ChoiceButton
            key={item.id}
            selected={selectedAdvice.includes(item.id)}
            title={item.title}
            onClick={() => onSelect(item.id)}
          />
        ))}
      </ChoiceGrid>
      <PrimaryButton disabled={selectedAdvice.length === 0} onClick={onContinue}>
        Continue
      </PrimaryButton>
    </Screen>
  );
};

export const EffectScreen = ({
  effect,
  onSelect,
  onContinue,
}: {
  effect: EffectId | null;
  onSelect: (id: EffectId) => void;
  onContinue: () => void;
}) => (
  <Screen
    label="Effect"
    title="Did it hold?"
    body="Think about the last few times, not the perfect version of the plan."
  >
    <ChoiceGrid compact>
      {effectOptions.map((item) => (
        <ChoiceButton
          key={item.id}
          selected={effect === item.id}
          title={item.title}
          detail={item.detail}
          onClick={() => onSelect(item.id)}
        />
      ))}
    </ChoiceGrid>
    <PrimaryButton disabled={!effect} onClick={onContinue}>
      Continue
    </PrimaryButton>
  </Screen>
);

export const RespectScreen = ({
  onRemember,
  onFinish,
}: {
  onRemember: () => void;
  onFinish: () => void;
}) => (
  <Screen
    label="Respect"
    title="Then keep what works."
    body="If it still helps you start, keep it close. You can also keep a small reminder for the next time the loop shows up."
  >
    <div className="grid gap-3 sm:grid-cols-2">
      <PrimaryButton onClick={onRemember}>Help me remember this</PrimaryButton>
      <GhostButton onClick={onFinish}>Finish for now</GhostButton>
    </div>
  </Screen>
);

export const TurnScreen = ({
  perspective,
  onContinue,
}: {
  perspective: Scene["perspective"];
  onContinue: () => void;
}) => (
  <Screen
    label="Another angle"
    title={perspective.title}
    body={perspective.body}
  >
    <InsightLine>{perspective.line}</InsightLine>
    <PrimaryButton onClick={onContinue}>Look underneath</PrimaryButton>
  </Screen>
);
