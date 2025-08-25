// src/content/pathways.ts

// 🟢 Types
export type PathwayId = "foundation" | "social" | "workplace" | "health" | "deepDive";

export interface ArticleRef {
  slug: string;
  title: string;
  order: number;
}

export interface ToolRef {
  title: string;
  href: string;
}

export interface Pathway {
  id: PathwayId;
  title: string;
  description: string;
  articles: ArticleRef[];
  books: string[];
  research: string[];
  tools: ToolRef[];
}

// 🟡 Config
export const pathways: Record<PathwayId, Pathway> = {
  foundation: {
    id: "foundation",
    title: "🪨 Foundation – Inner Caveman 101",
    description: "Get the big picture of why modern struggles feel ancient.",
    articles: [
      { slug: "modern-struggles", title: "Why Modern Struggles Feel So Ancient", order: 1 },
    ],
    books: [
      "The Story of the Human Body – Daniel Lieberman",
    ],
    research: [
      "Lieberman et al. (2013) – Evolutionary mismatch and modern health",
    ],
    tools: [
      { title: "Spot Your Caveman Quiz", href: "/tools/caveman-quiz" },
    ],
  },

  social: {
    id: "social",
    title: "🧑‍🤝‍🧑 Social & Belonging",
    description: "Why connection feels thin in the digital age.",
    articles: [
      { slug: "disconnected", title: "Why You Feel Disconnected Even with Hundreds of Online Friends", order: 1 },
      { slug: "tribes", title: "Why Your Brain Still Thinks in Tribes", order: 2 },
      { slug: "social-feeds", title: "Why Social Feeds Don’t Feed Belonging", order: 3 },
    ],
    books: [
      "The Village Effect – Susan Pinker",
      "The Social Leap – William von Hippel",
      "Bowling Alone – Robert Putnam",
      "Connected – Nicholas Christakis & James Fowler",
    ],
    research: [
      "Dunbar (1992) – Neocortex size as constraint on group size",
      "Turkle (2011) – Alone Together",
      "Primack et al. (2019) – Digital Media Use and Perceived Social Isolation",
    ],
    tools: [
      { title: "Spot Your Caveman Quiz", href: "/tools/caveman-quiz" },
    ],
  },

  workplace: {
    id: "workplace",
    title: "💼 Workplace & Leadership",
    description: "How ancient instincts shape teams, conflict, and decision-making.",
    articles: [
      { slug: "caveman-in-the-cubicle", title: "Caveman in the Cubicle", order: 1 },
      { slug: "planning-fallacy", title: "Why Teams Fall into the Planning Fallacy", order: 2 },
      { slug: "groupthink", title: "The Hidden Danger of Groupthink", order: 3 },
    ],
    books: [
      "Behave – Robert Sapolsky",
      "The Human Swarm – Mark Moffett",
      "Thinking, Fast and Slow – Daniel Kahneman",
    ],
    research: [
      "Kahneman & Tversky – Planning Fallacy",
      "Janis – Groupthink",
      "Gino & Staats (2012) – Why Organizations Don’t Learn",
    ],
    tools: [
      { title: "CIC Diagnostic Tool", href: "/tools/cic" },
    ],
  },

  health: {
    id: "health",
    title: "🏃 Health & Habits",
    description: "Your body is calibrated for survival, not modern routines.",
    articles: [
      { slug: "exercise-caveman-brain", title: "Why Exercise is Non-Negotiable for Your Caveman Brain", order: 1 },
      { slug: "silent-theft-body", title: "The Silent Theft (on physical erosion from digital ease)", order: 2 },
    ],
    books: [
      "Spark – John Ratey",
      "Why We Get Sick – Randolph Nesse & George Williams",
      "The Story of the Human Body – Daniel Lieberman",
    ],
    research: [
      "Lieberman et al. (2005) – Evolutionary fitness & mismatch",
      "Studies on sedentary lifestyle impact on cognition",
    ],
    tools: [
      { title: "IKEA Framework Installer", href: "/tools/ikea" },
    ],
  },

  deepDive: {
    id: "deepDive",
    title: "🔍 Deep Dive & Advanced Thinking",
    description: "Bringing it all together — cognition, emotion, society, and health.",
    articles: [
      { slug: "silent-theft", title: "The Silent Theft: Humanity vs Digital Convenience", order: 1 },
      { slug: "modern-struggles", title: "Why Modern Struggles Feel So Ancient", order: 2 },
    ],
    books: [
      "How Emotions Are Made – Lisa Feldman Barrett",
      "Thinking in Bets – Annie Duke",
      "Behave – Robert Sapolsky (advanced chapters)",
      "The Good Life – Robert Waldinger",
    ],
    research: [
      "Barrett (2006) – Theory of Constructed Emotion",
      "Sapolsky – Stress & Mismatch",
      "Recent mismatch studies (food, social design, etc.)",
    ],
    tools: [],
  },
};
