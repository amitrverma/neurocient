import { BlockList, isIP } from "node:net";

const GOOGLE_COMMON_CRAWLERS_URL =
  "https://developers.google.com/static/crawling/ipranges/common-crawlers.json";
const GOOGLEBOT_USER_AGENT = /(?:^|[\s;(])Googlebot(?:[/\s;)])/i;

type GoogleCrawlerPrefix = {
  ipv4Prefix?: unknown;
  ipv6Prefix?: unknown;
};

type GoogleCrawlerRanges = {
  prefixes?: unknown;
};

type VerificationOptions = {
  vercelEnvironment?: string;
  loadPrefixes?: () => Promise<string[]>;
};

function normalizeIp(value: string) {
  const candidate = value.split(",", 1)[0].trim();
  const mappedIpv4 = candidate.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i)?.[1];
  return mappedIpv4 && isIP(mappedIpv4) === 4 ? mappedIpv4 : candidate;
}

export function ipMatchesPrefixes(ipValue: string, prefixes: string[]) {
  const ip = normalizeIp(ipValue);
  const family = isIP(ip);
  if (!family) return false;

  const blockList = new BlockList();
  for (const prefix of prefixes) {
    const [network, rawLength, extra] = prefix.split("/");
    const networkFamily = isIP(network);
    const length = Number(rawLength);
    const maximum = networkFamily === 4 ? 32 : 128;
    if (
      extra !== undefined ||
      !networkFamily ||
      !Number.isInteger(length) ||
      length < 0 ||
      length > maximum
    ) {
      continue;
    }
    blockList.addSubnet(network, length, networkFamily === 4 ? "ipv4" : "ipv6");
  }

  return blockList.check(ip, family === 4 ? "ipv4" : "ipv6");
}

async function loadGoogleCommonCrawlerPrefixes() {
  const response = await fetch(GOOGLE_COMMON_CRAWLERS_URL, {
    next: { revalidate: 86_400 },
  });
  if (!response.ok) throw new Error("Google crawler ranges are unavailable");

  const payload = (await response.json()) as GoogleCrawlerRanges;
  if (!Array.isArray(payload.prefixes)) {
    throw new Error("Google crawler ranges are malformed");
  }

  return payload.prefixes.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const prefix = entry as GoogleCrawlerPrefix;
    if (typeof prefix.ipv4Prefix === "string") return [prefix.ipv4Prefix];
    if (typeof prefix.ipv6Prefix === "string") return [prefix.ipv6Prefix];
    return [];
  });
}

export async function isVerifiedGooglebotRequest(
  requestHeaders: Headers,
  options: VerificationOptions = {},
) {
  const vercelEnvironment = options.vercelEnvironment ?? process.env.VERCEL_ENV;
  if (vercelEnvironment !== "production") return false;

  const userAgent = requestHeaders.get("user-agent") || "";
  if (!GOOGLEBOT_USER_AGENT.test(userAgent)) return false;

  const clientIp = requestHeaders.get("x-vercel-forwarded-for");
  if (!clientIp) return false;

  try {
    const prefixes = await (options.loadPrefixes ?? loadGoogleCommonCrawlerPrefixes)();
    return ipMatchesPrefixes(clientIp, prefixes);
  } catch {
    return false;
  }
}
