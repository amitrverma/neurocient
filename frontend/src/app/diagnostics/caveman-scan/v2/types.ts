export type CoreConstruct = "safety" | "belonging" | "status" | "bond" | "kin";

export type WatchtowerId =
  | "horizon"
  | "campfire"
  | "high_ground"
  | "home_path"
  | "care_circle";

export type EvidenceTarget = WatchtowerId | "rational";

export type TriggerId =
  | "waiting" | "evaluation" | "comparison" | "uncertainty" | "belonging"
  | "conflict" | "scarcity" | "reward" | "responsibility" | "relationships"
  | "loss" | "success" | "exposure" | "interruption" | "correction"
  | "change" | "trust" | "favor" | "autonomy" | "recognition";

export type Watchtower = {
  id: WatchtowerId;
  construct: CoreConstruct;
  name: string;
  watchesFor: string[];
};

export type ScanOptionMapping = {
  primary: EvidenceTarget;
  weight: number;
  secondary?: Partial<Record<WatchtowerId, number>>;
};

export type ScanOption = {
  id: string;
  text: string;
  mapping: ScanOptionMapping;
};

export type ScanScenario = {
  id: string;
  triggerId: TriggerId;
  version: number;
  story: string;
  options: ScanOption[];
  status: "draft" | "active" | "retired";
};

export type ScanResponse = {
  scenarioId: string;
  scenarioVersion: number;
  triggerId: TriggerId;
  optionId: string;
  selectedTarget: EvidenceTarget;
  answeredAt: string;
  responseTimeMs?: number;
  presentationIndex: number;
  snapshot: {
    story: string;
    optionText: string;
    mapping: ScanOptionMapping;
  };
};

export type ScanEvidence = {
  watchtowerTotals: Record<WatchtowerId, number>;
  rationalCount: number;
  responseCount: number;
  leadingWatchtowers: WatchtowerId[];
  patternShape: "emerging" | "clear" | "mixed";
  triggerPatterns: Array<{ triggerId: TriggerId; selectedTarget: EvidenceTarget }>;
};

export type PortraitFoundation = {
  scoringVersion: string;
  reportVersion: string;
  evidence: ScanEvidence;
  preview: {
    primaryWatchtower: WatchtowerId | null;
    supportingWatchtower: WatchtowerId | null;
    rationalContexts: TriggerId[];
    primaryContexts: TriggerId[];
  };
};

export type PersistedScanSession = {
  id: string;
  accessToken: string;
  scanVersion: string;
  scoringVersion: string;
  reportVersion: string;
  status: "started" | "completed" | "abandoned";
  scenarioIds: string[];
  responses: ScanResponse[];
  evidence?: ScanEvidence | null;
  portrait?: PortraitFoundation | null;
  startedAt: string | null;
  completedAt: string | null;
  isLinked: boolean;
};
