export type ProfileView = "evidence" | "settings" | "preferences";

export const profileViewFromHash = (hash: string): ProfileView => {
  // Old reflection links now lead to Home, where the AI reflection lives.
  if (hash === "#reflections") return "evidence";
  if (hash === "#preferences") return "preferences";
  if (hash === "#account") return "settings";
  return "evidence";
};
