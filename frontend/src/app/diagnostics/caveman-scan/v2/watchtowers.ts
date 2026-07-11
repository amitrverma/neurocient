import type { Watchtower, WatchtowerId } from "./types";

export const WATCHTOWERS: Record<WatchtowerId, Watchtower> = {
  horizon: {
    id: "horizon", construct: "safety", name: "Horizon",
    watchesFor: ["danger", "instability", "scarcity", "uncertainty"],
  },
  campfire: {
    id: "campfire", construct: "belonging", name: "Campfire",
    watchesFor: ["inclusion", "acceptance", "group connection", "exclusion"],
  },
  high_ground: {
    id: "high_ground", construct: "status", name: "High Ground",
    watchesFor: ["position", "recognition", "competence", "visibility"],
  },
  home_path: {
    id: "home_path", construct: "bond", name: "Home Path",
    watchesFor: ["closeness", "distance", "trust", "attachment"],
  },
  care_circle: {
    id: "care_circle", construct: "kin", name: "Care Circle",
    watchesFor: ["responsibility", "provision", "vulnerability", "dependants"],
  },
};

export const WATCHTOWER_IDS = Object.keys(WATCHTOWERS) as WatchtowerId[];
