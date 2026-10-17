export type ProfileView = "evidence" | "reflections" | "settings" | "preferences";

export const profileViewFromHash = (hash: string): ProfileView => {
  if (hash === "#reflections") return "reflections";
  if (hash === "#preferences") return "preferences";
  if (hash === "#account") return "settings";
  return "evidence";
};
