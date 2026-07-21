export type ProtectiveMove =
  | "seek_relief"
  | "restore_control"
  | "social_monitoring"
  | "create_distance"
  | "override_signal"
  | "discharge_pressure"
  | "self_verdict"
  | "flexible_response";

export type ProtectiveConcern =
  | "uncertainty"
  | "status"
  | "belonging"
  | "bond_security"
  | "energy"
  | "overload"
  | "social_ambiguity";

export type Watchtower =
  | "horizon"
  | "campfire"
  | "high_ground"
  | "home_path"
  | "care_circle";

export type EvidenceStrength = "weak" | "moderate" | "strong";

export type ScanOptionEvidence = {
  optionId: string;
  move: ProtectiveMove;
  concern?: ProtectiveConcern;
  watchtower?: Watchtower;
  strength: EvidenceStrength;
  mirror: string;
  cost?: "momentum" | "energy" | "rest" | "connection" | "self_trust";
};

type EvidenceSeed = Omit<ScanOptionEvidence, "optionId">;

const e = (
  move: ProtectiveMove,
  mirror: string,
  concern?: ProtectiveConcern,
  strength: EvidenceStrength = "moderate",
  cost?: ScanOptionEvidence["cost"],
  watchtower?: Watchtower,
): EvidenceSeed => ({ move, mirror, concern, strength, cost, watchtower });

// Entries are deliberately aligned to the authored option order. Watchtowers
// are assigned only when the scene and response provide genuine evidence.
const evidenceSeeds: Record<number, EvidenceSeed[]> = {
  1: [
    e("restore_control", "You cleared smaller tasks before entering the uncertain work.", "uncertainty", "strong", "momentum", "horizon"),
    e("seek_relief", "One small email carried you into another channel of easier demands.", "uncertainty", "moderate", "momentum"),
    e("restore_control", "You organised the work instead of entering it.", "uncertainty", "strong", "momentum", "horizon"),
    e("seek_relief", "You touched the difficult work, then returned to the safer inbox.", "uncertainty", "strong", "momentum", "horizon"),
    e("flexible_response", "You began the meaningful work while it still felt uncomfortable.", "uncertainty", "moderate"),
  ],
  2: [
    e("social_monitoring", "Her milestone became a measurement of your own progress.", "status", "strong", "self_trust", "high_ground"),
    e("self_verdict", "Her progress became evidence that you were falling behind.", "status", "strong", "self_trust", "high_ground"),
    e("social_monitoring", "You compared the apparent ease of her life with the difficulty of yours.", "status", "strong", "self_trust", "high_ground"),
    e("self_verdict", "A life that felt fine suddenly looked smaller beside hers.", "status", "strong", "self_trust", "high_ground"),
    e("flexible_response", "Her milestone remained good news about her life.", "status", "moderate"),
  ],
  3: [
    e("seek_relief", "You bargained for one more piece of easy stimulation.", "uncertainty", "strong", "momentum"),
    e("seek_relief", "You treated more scrolling as recovery before beginning.", "energy", "moderate", "momentum"),
    e("seek_relief", "You made the escape feel useful enough to continue it.", "uncertainty", "strong", "momentum"),
    e("seek_relief", "You left the feed, met the work, and returned to the feed.", "uncertainty", "strong", "momentum"),
    e("flexible_response", "You changed the environment and returned to the work.", "uncertainty", "moderate"),
  ],
  5: [
    e("create_distance", "You postponed contact until it could feel less awkward.", "belonging", "strong", "connection", "campfire"),
    e("self_verdict", "You waited to feel more worthy of reappearing.", "status", "strong", "connection", "high_ground"),
    e("social_monitoring", "You anticipated rejection before offering contact.", "belonging", "strong", "connection", "campfire"),
    e("create_distance", "You closed the conversation before the other person could respond.", "belonging", "strong", "connection", "campfire"),
    e("flexible_response", "You allowed the message to be simple and slightly awkward.", "belonging", "moderate"),
  ],
  8: [
    e("seek_relief", "You moved the effort into a future moment with more imagined energy.", "energy", "strong", "energy"),
    e("seek_relief", "A short recovery became the condition for beginning.", "energy", "strong", "momentum"),
    e("restore_control", "You searched for a better plan before using the one already available.", "energy", "moderate", "momentum"),
    e("self_verdict", "You stayed beside the intention while guilt replaced movement.", "energy", "moderate", "self_trust"),
    e("flexible_response", "You made the beginning fit the energy you actually had.", "energy", "moderate"),
  ],
  9: [
    e("restore_control", "You exchanged an imperfect continuation for the promise of a clean restart.", "uncertainty", "strong", "momentum", "horizon"),
    e("restore_control", "You answered one missed day by tightening the system.", "uncertainty", "strong", "self_trust", "horizon"),
    e("create_distance", "You stopped looking at the routine once it no longer looked intact.", "uncertainty", "strong", "momentum"),
    e("self_verdict", "One missed day became evidence about what you can never sustain.", "uncertainty", "strong", "self_trust"),
    e("flexible_response", "You allowed the routine to continue imperfectly.", "uncertainty", "moderate"),
  ],
  10: [
    e("create_distance", "You protected the evening from conflict by leaving the distance unnamed.", "bond_security", "strong", "connection", "home_path"),
    e("create_distance", "You made the distance feel inevitable so it would not need confronting.", "bond_security", "strong", "connection", "home_path"),
    e("social_monitoring", "You tested the relationship without making your concern fully visible.", "bond_security", "strong", "connection", "home_path"),
    e("seek_relief", "You let the phone carry you past a vulnerable opening.", "bond_security", "strong", "connection", "home_path"),
    e("flexible_response", "You made the distance speakable before knowing how the conversation would go.", "bond_security", "moderate"),
  ],
  11: [
    e("discharge_pressure", "The accumulated demands came out at the next person who needed something.", "overload", "strong", "connection", "horizon"),
    e("discharge_pressure", "Your response carried more of the day than the question deserved.", "overload", "strong", "connection", "horizon"),
    e("override_signal", "You contained the reaction outwardly while the pressure continued inside.", "overload", "strong", "energy", "horizon"),
    e("create_distance", "You escaped the interaction before the pressure could spill further.", "overload", "moderate", "connection"),
    e("flexible_response", "You named the overload before answering the person.", "overload", "moderate"),
  ],
  12: [
    e("restore_control", "You made completing something the price of being allowed to rest.", "uncertainty", "strong", "rest", "horizon"),
    e("restore_control", "You tried to create closure by capturing everything in a list.", "uncertainty", "strong", "rest", "horizon"),
    e("restore_control", "Your body stopped while your mind continued organising the day.", "uncertainty", "strong", "rest", "horizon"),
    e("seek_relief", "You used stimulation to get away from the unfinished list in your head.", "overload", "strong", "rest"),
    e("flexible_response", "You allowed rest before everything had been resolved.", "uncertainty", "moderate"),
  ],
  13: [
    e("social_monitoring", "A brief pause became evidence that something might be wrong.", "social_ambiguity", "strong", "self_trust", "campfire"),
    e("social_monitoring", "You reviewed your words to locate a possible social mistake.", "social_ambiguity", "strong", "rest", "campfire"),
    e("social_monitoring", "You reached for reassurance before knowing that repair was needed.", "belonging", "strong", "connection", "campfire"),
    e("self_verdict", "An ambiguous pause became a reason to make yourself smaller next time.", "belonging", "strong", "self_trust", "campfire"),
    e("flexible_response", "You let an unexplained pause remain unexplained.", "social_ambiguity", "moderate"),
  ],
  14: [
    e("self_verdict", "Low energy became evidence that you had somehow rested incorrectly.", "energy", "moderate", "self_trust"),
    e("seek_relief", "You reached for stimulation while waiting to feel ready for the morning.", "energy", "moderate", "energy"),
    e("override_signal", "You answered low energy by forcing the system to perform.", "energy", "strong", "energy"),
    e("restore_control", "You searched for another practice that might finally fix your rest.", "energy", "strong", "self_trust"),
    e("flexible_response", "You responded to the energy you had without turning it into a failure.", "energy", "moderate"),
  ],
  15: [
    e("self_verdict", "A lost day became a judgment about what is wrong with you.", "uncertainty", "strong", "self_trust"),
    e("restore_control", "You answered guilt with the promise of a stricter and more perfect tomorrow.", "uncertainty", "strong", "self_trust", "horizon"),
    e("seek_relief", "Because the day felt ruined, you continued using the escape that helped ruin it.", "overload", "strong", "rest"),
    e("create_distance", "You avoided the objects that made the gap between intention and action visible.", "uncertainty", "strong", "self_trust"),
    e("flexible_response", "You let the day end without demanding a total reinvention tomorrow.", "uncertainty", "moderate"),
  ],
};

export const getOptionEvidence = (
  scenarioId: number,
  optionIndex: number,
): ScanOptionEvidence | undefined => {
  const seed = evidenceSeeds[scenarioId]?.[optionIndex];
  return seed
    ? { ...seed, optionId: `${scenarioId}-${optionIndex + 1}` }
    : undefined;
};

export const validateEvidenceMap = (
  scenarioOptionCounts: Array<{ id: number; optionCount: number }>,
) =>
  scenarioOptionCounts.flatMap(({ id, optionCount }) => {
    const mappedCount = evidenceSeeds[id]?.length ?? 0;
    return mappedCount === optionCount
      ? []
      : [`Scenario ${id} has ${optionCount} options but ${mappedCount} evidence entries.`];
  });
