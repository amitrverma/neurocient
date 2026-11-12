const SECTION_HEADING = /^##\s+/m;
const TOP_LEVEL_HEADING = /^#\s+.*(?:\r?\n)+/;

export type InsightContentParts = {
  publicLead: string;
  meteredBody: string;
};

function normalizePublicLead(value: string) {
  return value.replace(TOP_LEVEL_HEADING, "").trim();
}

export function splitInsightContent(
  content: string,
  fallbackLead: string,
): InsightContentParts {
  const section = SECTION_HEADING.exec(content);
  if (!section || section.index === 0) {
    return {
      publicLead: fallbackLead.trim(),
      meteredBody: content.trim(),
    };
  }

  const publicLead = normalizePublicLead(content.slice(0, section.index));
  return {
    publicLead: publicLead || fallbackLead.trim(),
    meteredBody: content.slice(section.index).trim(),
  };
}
