import { getInsightIndex } from "@/lib/insightIndex";

const siteUrl = "https://neurocient.com";

export function GET() {
  const insightLinks = getInsightIndex()
    .map(
      (insight) =>
        `- [${insight.title}](${siteUrl}/insights/${insight.slug}): ${insight.description}`,
    )
    .join("\n");
  const body = `# Neurocient Labs

> Neurocient explains why familiar behaviors repeat and helps people turn that understanding into practical, emotionally lightweight change.

Neurocient uses the Inner Caveman as a direct name for evolved automatic processing: fast responses shaped by recurring human concerns such as safety, belonging, status, close bonds, and care for others. It is not a personality, protector, or diagnosis.

## Start here

- [Neurocient home](${siteUrl}/): Why knowing what to do is often not enough to change behavior.
- [The Inner Caveman](${siteUrl}/inner-caveman): The complete explanation of evolved automatic processing in modern life.
- [Insights](${siteUrl}/insights): Explanations organized around concrete questions and recurring situations.
- [Inner Caveman Scan](${siteUrl}/diagnostics/caveman-scan): A short guided scan connecting a person's answers to recurring automatic responses.
- [Practice](${siteUrl}/practice): Neurocient's IKEA plus Reinforcement behavior-change approach.

## Behavior and psychology insights

${insightLinks}

## Programs and company information

- [Programs](${siteUrl}/programs): Self-guided and facilitated ways to work with Neurocient.
- [Modern Caveman](${siteUrl}/modern-caveman): The facilitated personal behavior-change program.
- [Caveman in the Cubicle](${siteUrl}/caveman-cubicle): Workplace learning and behavior-change programs.
- [About Neurocient](${siteUrl}/about): The purpose and approach behind Neurocient Labs.
- [Contact](${siteUrl}/contact): How to contact Neurocient Labs.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
