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
    title: "Foundation – Inner Caveman 101",
    description: "Get the big picture of why modern struggles feel ancient.",
    articles: [
      { slug: "evolutionary-lag", title: "Still Running on Caveman Code", order: 1 },
    ],
    books: ["The Story of the Human Body – Daniel Lieberman"],
    research: ["Lieberman et al. (2013) – Evolutionary mismatch and modern health"],
    tools: [{ title: "Inner Caveman Scan", href: "/diagnostics/caveman-scan" }],
  },

  social: {
    id: "social",
    title: "Social & Belonging",
    description: "Why connection feels thin in the digital age.",
    articles: [
      { slug: "connections", title: "We’ve Never Been More Connected – Yet Why Are We Lonelier Than Ever?", order: 1 },
      { slug: "silent-team", title: "The Status Threat That Keeps Teams Quiet", order: 2 },
      { slug: "spotlight-bias", title: "All Eyes on Me?", order: 3 },
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
    tools: [{ title: "Inner Caveman Scan", href: "/diagnostics/caveman-scan" }],
  },

  workplace: {
    id: "workplace",
    title: "Workplace & Leadership",
    description: "How ancient instincts shape teams, conflict, and decision-making.",
    articles: [
      { slug: "lnd-workshops", title: "From Inspiration to Inaction: The Workshop Trap", order: 1 },
      { slug: "planning-fallacy", title: "Why Smart People Still Miss Deadlines", order: 2 },
      { slug: "groupthink", title: "Conformity Over Creativity: The Groupthink Trap", order: 3 },
      { slug: "performance-reviews", title: "When Feedback Feels Like Fight-or-Flight", order: 4 },
      { slug: "team-building", title: "From Campfires to Conference Rooms: The Mismatch in Team-Building", order: 5 },
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
    tools: [{ title: "CIC Diagnostic Tool", href: "/diagnostics/cic" }],
  },

  health: {
    id: "health",
    title: "Health & Habits",
    description: "Your body is calibrated for survival, not modern routines.",
    articles: [
      { slug: "struggle-to-exercise", title: "The Ancient Instinct That Keeps You Off the Treadmill", order: 1 },
      { slug: "stress-comfort-food", title: "Why Stress Sends You to Sugar and Snacks", order: 2 },
      { slug: "willpower", title: "Why Willpower Isn’t the Answer", order: 3 },
      { slug: "doomscrolling", title: "Why Do You Scroll Endlessly on Social Media?", order: 4 },
      { slug: "binge-watch", title: "Why our Inner Caveman can’t resist Next Episode", order: 5 },
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
     tools: [],
  },

  deepDive: {
    id: "deepDive",
    title: "Deep Dive & Advanced Thinking",
    description: "Bringing it all together — cognition, emotion, society, and health.",
    articles: [
      { slug: "negativity-bias", title: "Why Our Minds Hold On to Criticism", order: 1 },
      { slug: "false-patterns", title: "Faces in the Clouds, Tigers in the Grass: Why We See Patterns", order: 2 },
      { slug: "loss-aversion", title: "Why Loss Hurts Twice as Much as Gain Feels Good", order: 3 },
      { slug: "replay-arguments", title: "The Real Reason You Keep Replaying Arguments", order: 4 },
      { slug: "big-numbers", title: "Stone Age Minds in a Statistical World", order: 5 },
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

