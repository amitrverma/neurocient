export type UsageType = 'articles' | 'spots' | 'microchallenges';

interface UsageLimits {
  articles: number;
  spots?: number;
  microchallenges?: number;
}

export const usageLimits: Record<"guest" | "user", UsageLimits> = {
  guest: { articles: 5 },
  user: { articles: 20, spots: 20, microchallenges: 5 },
};

function storageKey(isLoggedIn: boolean) {
  return isLoggedIn ? 'usage_user' : 'usage_guest';
}

function readUsage(isLoggedIn: boolean) {
  if (typeof window === 'undefined') return {} as Record<UsageType, number>;
  const raw = localStorage.getItem(storageKey(isLoggedIn));
  return raw ? JSON.parse(raw) : {};
}

function writeUsage(isLoggedIn: boolean, data: Record<UsageType, number>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(storageKey(isLoggedIn), JSON.stringify(data));
}

export function getUsage(type: UsageType, isLoggedIn: boolean) {
  const data = readUsage(isLoggedIn);
  return data[type] || 0;
}

export function incrementUsage(type: UsageType, isLoggedIn: boolean) {
  const data = readUsage(isLoggedIn);
  data[type] = (data[type] || 0) + 1;
  writeUsage(isLoggedIn, data);
  const limits = usageLimits[isLoggedIn ? 'user' : 'guest'];
  const limit = (limits[type] as number | undefined) ?? Infinity;
  return { count: data[type], limit, allowed: data[type] <= limit };
}
