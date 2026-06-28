import { RotateCcw } from "lucide-react";
import {
  ActionBlock,
  GhostButton,
  InsightLine,
  PairBlock,
  PreviewMessage,
  PrimaryButton,
  Screen,
} from "./PracticeUi";

export const IdentityScreen = ({
  identity,
  reframe,
  onContinue,
}: {
  identity: string;
  reframe: string;
  onContinue: () => void;
}) => (
  <Screen
    label="Identity"
    title="What are you starting to call yourself?"
    body="A repeated moment can start sounding like a self-story."
  >
    <PairBlock
      firstLabel="What the loop says"
      first={identity}
      secondLabel="Practice instead"
      second={reframe}
    />
    <PrimaryButton onClick={onContinue}>Continue</PrimaryButton>
  </Screen>
);

export const EnvironmentScreen = ({
  environment,
  onContinue,
}: {
  environment: string;
  onContinue: () => void;
}) => (
  <Screen
    label="The setup"
    title="What makes the old loop easy?"
    body={environment}
  >
    <InsightLine>
      Change one cue before asking for more willpower.
    </InsightLine>
    <PrimaryButton onClick={onContinue}>Continue</PrimaryButton>
  </Screen>
);

export const ActionScreen = ({
  action,
  onContinue,
}: {
  action: string;
  onContinue: () => void;
}) => (
  <Screen
    label="The next move"
    title="One move small enough for today."
    body="Keep it small enough to do before the old loop gathers weight."
  >
    <ActionBlock action={action} />
    <PrimaryButton onClick={onContinue}>I can work with this</PrimaryButton>
  </Screen>
);

export const ReinforcementScreen = ({
  reminder,
  onRemember,
  onFinish,
}: {
  reminder: string;
  onRemember: () => void;
  onFinish: () => void;
}) => (
  <Screen
    label="Later"
    title="Want this insight to come back when the loop returns?"
    body="A short prompt can bring this back before the task gets heavy again."
  >
    <div className="grid gap-3">
      <PreviewMessage message={reminder} />
      <div className="grid gap-3 sm:grid-cols-2">
        <PrimaryButton onClick={onRemember}>Help me remember this</PrimaryButton>
        <GhostButton onClick={onFinish}>Not now</GhostButton>
      </div>
    </div>
  </Screen>
);

export const SetupScreen = ({
  userEmail,
  reminder,
  saveStatus,
  saveError,
  onCreateAccount,
  onRetry,
  onRestart,
}: {
  userEmail?: string;
  reminder: string;
  saveStatus: "idle" | "saving" | "saved" | "error";
  saveError: string | null;
  onCreateAccount: () => void;
  onRetry: () => void | Promise<void>;
  onRestart: () => void;
}) => (
  <Screen
    label="Later"
    title="This can come back when the loop returns."
    body="Keep the prompt close enough to meet the moment, not buried after the day is gone."
  >
    <PreviewMessage message={reminder} />
    <p className="font-sans text-sm leading-6 text-brand-dark/70">
      {saveStatus === "saving"
        ? "Keeping this..."
        : saveStatus === "saved"
          ? "Kept with your practice."
          : saveStatus === "error"
            ? saveError || "Could not keep this yet."
            : "Keep this when you want it connected to your practice."}
    </p>
    <div className="flex flex-col gap-3 sm:flex-row">
      {!userEmail ? (
        <PrimaryButton onClick={onCreateAccount}>Keep this</PrimaryButton>
      ) : saveStatus === "error" ? (
        <PrimaryButton onClick={onRetry}>Try again</PrimaryButton>
      ) : saveStatus === "saving" ? (
        <PrimaryButton disabled onClick={() => {}}>
          Keeping...
        </PrimaryButton>
      ) : (
        <PrimaryButton onClick={onRestart}>Done</PrimaryButton>
      )}
      <GhostButton onClick={onRestart}>
        <RotateCcw className="h-4 w-4" />
        Start again
      </GhostButton>
    </div>
  </Screen>
);
