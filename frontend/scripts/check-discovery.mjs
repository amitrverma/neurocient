const canonicalOrigin = "https://neurocient.com";
const targetOrigin = (process.env.DISCOVERY_BASE_URL || canonicalOrigin).replace(/\/$/, "");

function fail(message) {
  throw new Error(message);
}

function fetchUrl(canonicalUrl) {
  const url = new URL(canonicalUrl);
  return `${targetOrigin}${url.pathname}${url.search}`;
}

function decodeXml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function canonicalFrom(html) {
  const tags = html.match(/<link\b[^>]*>/gi) || [];
  for (const tag of tags) {
    if (!/\brel=["'][^"']*canonical[^"']*["']/i.test(tag)) continue;
    return tag.match(/\bhref=["']([^"']+)["']/i)?.[1] || null;
  }
  return null;
}

function visibleText(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#xA0;/gi, " ")
    .replace(/&[a-z0-9#]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function get(url) {
  return fetch(url, {
    redirect: "follow",
    headers: { "user-agent": "NeurocientDiscoveryCheck/1.0" },
  });
}

const robotsResponse = await get(`${targetOrigin}/robots.txt`);
if (!robotsResponse.ok) fail(`/robots.txt returned ${robotsResponse.status}`);
const robots = await robotsResponse.text();
if (!/^User-Agent:\s*\*/im.test(robots) || !/^Sitemap:\s*https:\/\/neurocient\.com\/sitemap\.xml/im.test(robots)) {
  fail("robots.txt does not expose the expected general crawler rule and sitemap");
}

const llmsResponse = await get(`${targetOrigin}/llms.txt`);
if (!llmsResponse.ok) fail(`/llms.txt returned ${llmsResponse.status}`);
if (!/^#\s+Neurocient/im.test(await llmsResponse.text())) {
  fail("llms.txt is missing its Neurocient H1");
}

const sitemapResponse = await get(`${targetOrigin}/sitemap.xml`);
if (!sitemapResponse.ok) fail(`/sitemap.xml returned ${sitemapResponse.status}`);
const sitemapXml = await sitemapResponse.text();
const urls = [...sitemapXml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)].map((match) =>
  decodeXml(match[1].trim()),
);
if (!urls.length) fail("sitemap.xml contains no URLs");

const failures = [];
const concurrency = 8;
let cursor = 0;

async function inspectNext() {
  while (cursor < urls.length) {
    const canonicalUrl = urls[cursor++];
    const expectedFetchUrl = fetchUrl(canonicalUrl).replace(/\/$/, "");
    try {
      const response = await get(fetchUrl(canonicalUrl));
      const html = await response.text();
      const actualUrl = response.url.replace(/\/$/, "");
      const canonical = canonicalFrom(html)?.replace(/\/$/, "");
      const text = visibleText(html);

      if (response.status !== 200) failures.push(`${canonicalUrl}: status ${response.status}`);
      if (actualUrl !== expectedFetchUrl) failures.push(`${canonicalUrl}: redirected to ${response.url}`);
      if (canonical !== canonicalUrl.replace(/\/$/, "")) {
        failures.push(`${canonicalUrl}: canonical is ${canonical || "missing"}`);
      }
      if (/<meta\b[^>]*\bcontent=["'][^"']*noindex/i.test(html)) {
        failures.push(`${canonicalUrl}: contains noindex`);
      }
      if (text.length < 200) failures.push(`${canonicalUrl}: initial HTML is too insubstantial (${text.length} characters)`);

      const pathname = new URL(canonicalUrl).pathname;
      if (pathname.startsWith("/insights/") && pathname !== "/insights/all") {
        if (!html.includes("public-insight-lead")) failures.push(`${canonicalUrl}: public Insight lead is missing`);
        if (!/"@type"\s*:\s*"Article"/.test(html)) failures.push(`${canonicalUrl}: Article JSON-LD is missing`);
      }
      if (pathname === "/diagnostics/caveman-scan" && !/See what happens[\s\S]*before intention catches up/i.test(html)) {
        failures.push(`${canonicalUrl}: Scan explanation is missing from initial HTML`);
      }
    } catch (error) {
      failures.push(`${canonicalUrl}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

await Promise.all(Array.from({ length: concurrency }, inspectNext));

if (failures.length) {
  console.error(`Discovery verification failed for ${failures.length} check(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Discovery verification passed for ${urls.length} sitemap URLs at ${targetOrigin}.`);
}
