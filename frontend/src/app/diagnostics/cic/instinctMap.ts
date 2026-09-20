
// instinctMap.js
// Mapping each diagnostic question and choice to behavioral insights

export interface InstinctEntry {
  motive: string;        // e.g. "Safety & Self-Protection"
  instinct: string;      // e.g. "Conflict Avoidance"
  feedback: string;      // short user-facing feedback
  explanation: string;   // why this happens (deeper dive)
  microShift?: string;   // optional suggestion for change
}
// Top-level structure: q1, q2, etc. → choices (A, B, C...)
export type InstinctMap = {
  [questionId: string]: {
    [choice: string]: InstinctEntry;
  };
};

export const instinctMap: InstinctMap = {
  q1: {
    A: {
      motive: "Safety & Self-Protection",
      instinct: "Optimism Bias",
      feedback: "This may be Optimism Bias — we expect best-case outcomes without friction.",
      explanation: "Our brains evolved to prioritize short-term success and hope for the best. In modern planning, this often leads us to underestimate complexity, risk, and delays.",
      microShift: "During planning, ask each team member to list what could go wrong — and build in space for it."
    },
    B: {
      motive: "Affiliation & Belonging",
      instinct: "Conflict Avoidance",
      feedback: "This reflects Conflict Avoidance — we’d rather agree than push for realism.",
      explanation: "In group settings, challenging timelines can feel confrontational. To stay liked or avoid friction, people often accept unrealistic plans.",
      microShift: "Use anonymous estimation or a red-team role to safely challenge assumptions."
    },
    C: {
      motive: "Status & Social Hierarchy",
      instinct: "Status Anxiety",
      feedback: "This may be Status Anxiety — asking for more time can feel risky.",
      explanation: "In hierarchical environments, admitting you need more time can feel like losing face. People avoid it to protect their perceived competence.",
      microShift: "Normalize check-in points where re-estimating is expected, not penalized."
    },
    D: {
      motive: "Status & Social Hierarchy",
      instinct: "Busyness Bias",
      feedback: "This shows the Busyness Bias — mistaking motion for real progress.",
      explanation: "Visible activity can feel productive, but it doesn’t always mean we’re ready. Without alignment, we may start executing prematurely.",
      microShift: "Define ‘ready to start’ checklists before execution begins."
    },
    E: {
      motive: "",
      instinct: "",
      feedback: "Looks like this isn’t a major friction point in your team.",
      explanation: "",
      microShift: "",
    }
    },
  q2: {
    A: {
      motive: "Safety & Self-Protection",
      instinct: "Curse of Knowledge",
      feedback: "This might be the Curse of Knowledge — we assume others understand what we do.",
      explanation: "Once we understand something well, it's hard to imagine not knowing it. We skip steps, rush context, and assume clarity that isn’t shared.",
      microShift: "Use 'teach-back' — ask listeners to repeat what they understood, in their own words."
    },
    B: {
      motive: "Affiliation & Belonging",
      instinct: "Execution Blind Spot",
      feedback: "This may reflect a Blind Spot — we don’t realize gaps until action reveals them.",
      explanation: "Plans often sound good until they hit reality. Many teams discover misunderstandings only during execution.",
      microShift: "Run a mini-pilot or dry run — reveal gaps before full launch."
    },
    C: {
      motive: "Status & Social Hierarchy",
      instinct: "Fear of Exposure",
      feedback: "This could be Fear of Exposure — asking clarifying questions can feel risky in public.",
      explanation: "People hesitate to ask for clarification if it risks looking slow, lost, or unprepared — especially in group settings.",
      microShift: "Build in anonymous Q&A or pre/post-meeting clarification channels."
    },
    D: {
      motive: "Status & Social Hierarchy",
      instinct: "Over-Reliance on Asynchronous Communication",
      feedback: "This shows Over-Reliance on Async — we mistake documentation for dialogue.",
      explanation: "Documents and messages create the illusion of alignment, but real-time feedback often uncovers misinterpretation.",
      microShift: "Set a rule — if it takes more than 2 replies to clarify, move to conversation."
    },
    E: {
      motive: "",
      instinct: "",
      feedback: "Looks like this isn’t a major friction point in your team.",
      explanation: "",
      microShift: ""
    }
    },
  q3: {
    A: {
      motive: "Safety & Self-Protection",
      instinct: "Diffusion of Responsibility",
      feedback: "This might be Diffusion of Responsibility — when ownership isn’t clear, no one acts.",
      explanation: "In groups, people assume someone else will take charge. If roles aren't explicit, accountability gets diluted.",
      microShift: "Assign a 'single point of truth' for each task — even when collaboration is involved."
    },
    B: {
      motive: "Affiliation & Belonging",
      instinct: "Assumed Alignment",
      feedback: "This reflects Assumed Alignment — we think others agreed when they didn’t fully commit.",
      explanation: "When ownership is implied, it often lacks emotional or practical commitment — leading to dropped balls.",
      microShift: "Use a shared task review where every assignment is spoken aloud and confirmed."
    },
    C: {
      motive: "Status & Social Hierarchy",
      instinct: "Fear of Repercussions",
      feedback: "This may be Fear of Repercussions — taking charge feels risky if things go wrong.",
      explanation: "People hesitate to own initiatives if failure might be blamed or penalized, especially in unclear power structures.",
      microShift: "Normalize 'ownership with support' — reward initiative regardless of outcome."
    },
    D: {
      motive: "Status & Social Hierarchy",
      instinct: "Self-Prioritization",
      feedback: "This shows Self-Prioritization — personal goals override team-level shared work.",
      explanation: "When incentives or recognition are individual, people focus inward — even if collective tasks suffer.",
      microShift: "Make shared outcomes visible and celebrated in regular rhythms."
    },
    E: {
      motive: "",
      instinct: "",
      feedback: "Looks like this isn’t a major friction point in your team.",
      explanation: "",
      microShift: ""
    }
  },

  q4: {
    A: {
      motive: "Safety & Self-Protection",
      instinct: "Scarcity Mindset",
      feedback: "This may be Scarcity Mindset — rest feels like falling behind.",
      explanation: "In high-pressure environments, pausing feels unsafe. Productivity becomes a protective behavior.",
      microShift: "Make downtime visible and endorsed — model it from leadership."
    },
    B: {
      motive: "Affiliation & Belonging",
      instinct: "Endurance Culture",
      feedback: "This reflects Endurance Culture — effort is rewarded more than recovery.",
      explanation: "We often admire resilience without questioning why it's needed constantly.",
      microShift: "Celebrate recovery habits, not just hustle moments."
    },
    C: {
      motive: "Status & Social Hierarchy",
      instinct: "Status Comparison",
      feedback: "This may be Status Comparison — visible busyness equals perceived commitment.",
      explanation: "People stay 'on' because rest can be misread as slacking — especially in competitive cultures.",
      microShift: "Publicly appreciate thoughtful pauses and boundary-setting."
    },
    D: {
      motive: "Status & Social Hierarchy",
      instinct: "Lack of Norms for Recovery",
      feedback: "This shows Absence of Recovery Norms — there’s no shared script for slowing down.",
      explanation: "If no one stops, no one feels safe to be the first. A break becomes a deviation instead of a design.",
      microShift: "Build breaks into team rituals — Friday winds-down, async Mondays, etc."
    },
    E: {
      motive: "",
      instinct: "",
      feedback: "Looks like this isn’t a major friction point in your team.",
      explanation: "",
      microShift: ""
    }
    },

  q5: {
    A: {
      motive: "Safety & Self-Protection",
      instinct: "Friction Sensitivity",
      feedback: "This may be Friction Sensitivity — we resist anything that adds effort without payoff.",
      explanation: "New processes often feel clunky before they feel helpful. Without payoff, the effort feels wasted.",
      microShift: "Pair new processes with visible quick wins — even symbolic ones."
    },
    B: {
      motive: "Affiliation & Belonging",
      instinct: "Wait-and-See Bias",
      feedback: "This reflects Wait-and-See Bias — people hold back to see if change is real.",
      explanation: "If change has flipped in the past, teams wait to see if this one will last.",
      microShift: "Commit to small, consistent reinforcement over time instead of one-time rollouts."
    },
    C: {
      motive: "Status & Social Hierarchy",
      instinct: "Habit Inertia",
      feedback: "This might be Habit Inertia — under stress, the old way feels safer.",
      explanation: "Change needs energy. Under pressure, brains default to known paths — even inefficient ones.",
      microShift: "Build support systems that kick in when stress does — like fallback checklists."
    },
    D: {
      motive: "Status & Social Hierarchy",
      instinct: "Follow-Through Gaps",
      feedback: "This shows Follow-Through Gaps — no one carries the change beyond kickoff.",
      explanation: "Ideas decay quickly without follow-through. When support fades, so does the shift.",
      microShift: "Assign a 'change buddy' for every rollout — accountability sustains motion."
    },
    E: {
      motive: "",
    instinct: "",
      feedback: "Looks like this isn’t a major friction point in your team.",
      explanation: "",
      microShift: ""
    }
  },

  q6: {
    A: {
      motive: "Safety & Self-Protection",
      instinct: "Status Deference",
      feedback: "This reflects Status Deference — senior voices carry hidden weight.",
      explanation: "Even in open cultures, hierarchy influences whose ideas get airtime or traction.",
      microShift: "Rotate idea pitching so juniors go first — it neutralizes status signals."
    },
    B: {
      motive: "Affiliation & Belonging",
      instinct: "Voice Inequity",
      feedback: "This may be Voice Inequity — louder voices shape outcomes.",
      explanation: "Comfort with speaking isn’t evenly distributed. Talk time ≠ idea quality.",
      microShift: "Track who speaks how often — rebalance time as a team experiment."
    },
    C: {
      motive: "Status & Social Hierarchy",
      instinct: "Harmony Bias",
      feedback: "This may reflect Harmony Bias — we downplay disagreement to keep the peace.",
      explanation: "Dissent feels risky, especially in tight-knit teams or with strong group identity.",
      microShift: "Use red-blue team tactics — design safe dissent roles."
    },
    D: {
      motive: "Status & Social Hierarchy",
      instinct: "Informal Coalitions",
      feedback: "This might be Informal Coalitions — social alliances shape who gets heard.",
      explanation: "Team politics aren’t always explicit — but patterns of who supports whom can distort openness.",
      microShift: "Anonymous ranking or idea voting breaks alliance visibility."
    },
    E: {
      motive: "",   
        instinct: "",
      feedback: "Looks like this isn’t a major friction point in your team.",
      explanation: "",
      microShift: ""
    }
  },

  q7: {
    A: {
      motive: "Safety & Self-Protection",
      instinct: "Authority Anchoring",
      feedback: "This reflects Authority Anchoring — senior views become the default choice.",
      explanation: "People anchor on what leaders say — and rarely challenge or expand the frame.",
      microShift: "Run leader-last brainstorms where the most senior voice speaks last."
    },
    B: {
      motive: "Affiliation & Belonging",
      instinct: "Fear of Conflict",
      feedback: "This may be Fear of Conflict — we avoid challenge to preserve harmony.",
      explanation: "Even mild disagreement can feel emotionally costly — especially in hierarchical setups.",
      microShift: "Make dissent a norm — rotate 'designated challenger' in key meetings."
    },
    C: {
      motive: "Status & Social Hierarchy",
      instinct: "Decision Rigidity",
      feedback: "This shows Decision Rigidity — changing course feels like weakness.",
      explanation: "Once a call is made, sunk cost and ego resist revisiting. Even new data can be ignored.",
      microShift: "Schedule formal revisit points with a 'change is strength' framing."
    },
    D: {
      motive: "Status & Social Hierarchy",
      instinct: "Agreement Pressure",
      feedback: "This reflects Agreement Pressure — speed beats scrutiny.",
      explanation: "We push for consensus to keep momentum — even if real alignment is lacking.",
      microShift: "Delay consensus — ask: 'what are we missing?' before approving."
    },
    E: {
            motive: "",   
        instinct: "",
      feedback: "Looks like this isn’t a major friction point in your team.",
      explanation: "",
      microShift: ""
    }
  },

  q8: {
    A: {
      motive: "Safety & Self-Protection",
      instinct: "Energy Drain Loop",
      feedback: "This shows an Energy Drain Loop — output keeps flowing while fuel runs low.",
      explanation: "Without pause built in, teams run long past their recovery point. Fatigue becomes normalized.",
      microShift: "Use energy check-ins — before task planning, ask about recovery status."
    },
    B: {
      motive: "Affiliation & Belonging",
      instinct: "Cycle Compression",
      feedback: "This may reflect Cycle Compression — there's no slack between sprints.",
      explanation: "When work is always 'on', recovery becomes something to fit in — not something to design for.",
      microShift: "Build decompression phases post-release as a ritual, not an exception."
    },
    C: {
      motive: "Status & Social Hierarchy",
      instinct: "Emotional Suppression",
      feedback: "This shows Emotional Suppression — people push through without signaling overwhelm.",
      explanation: "Expressing strain feels unsafe — so people stay quiet until breakdown.",
      microShift: "Normalize energy flags — color-coded check-ins, weekly ‘emotional standups.’"
    },
    D: {
      motive: "Status & Social Hierarchy",
      instinct: "Pace Worship",
      feedback: "This reflects Pace Worship — high-speed effort is the only effort that gets noticed.",
      explanation: "We reward visible hustle — and ignore silent fatigue.",
      microShift: "Recognize slowness when it’s strategic — model thoughtful pacing from the top."
    },
    E: {
            motive: "",   
        instinct: "",
      feedback: "Looks like this isn’t a major friction point in your team.",
      explanation: "",
      microShift: ""
    }
  },

  q9: {
    A: {
      motive: "Safety & Self-Protection",
      instinct: "Error Aversion",
      feedback: "This may be Error Aversion — admitting gaps feels unsafe.",
      explanation: "When perfection is prized, people hide imperfection — even when it would help to share it.",
      microShift: "Share leadership mistakes openly — model safety around imperfection."
    },
    B: {
      motive: "Affiliation & Belonging",
      instinct: "Psychological Insecurity",
      feedback: "This reflects Psychological Insecurity — fear blocks open challenge.",
      explanation: "In unsafe teams, even smart disagreements stay buried.",
      microShift: "Run 'conflict sprints' — space where challenge is welcome and expected."
    },
    C: {
      motive: "Status & Social Hierarchy",
      instinct: "Feedback Anxiety",
      feedback: "This shows Feedback Anxiety — candor gets watered down.",
      explanation: "To preserve relationships, teams soften or skip real talk.",
      microShift: "Use structured formats — ‘What worked / What was tricky / What I need’."
    },
    D: {
      motive: "Status & Social Hierarchy",
      instinct: "Trust Fragmentation",
      feedback: "This may be Trust Fragmentation — safety depends on who’s in the room.",
      explanation: "Inconsistent norms across teams/managers erode safety at scale.",
      microShift: "Standardize safety rituals — check-ins, closers, inclusive facilitation across teams."
    },
    E: {
            motive: "",   
        instinct: "",
      feedback: "Looks like this isn’t a major friction point in your team.",
      explanation: "",
      microShift: ""
    }
  },

  q10: {
    A: {
      motive: "Safety & Self-Protection",
      instinct: "Motivational Depletion",
      feedback: "This may be Motivational Depletion — energy fades even when direction is clear.",
      explanation: "Doing isn’t the same as wanting. People lose spark when tasks lack meaning or feedback.",
      microShift: "Pair tasks with small rewards, gamified progress, or peer nudges."
    },
    B: {
      motive: "Affiliation & Belonging",
      instinct: "Routine Numbness",
      feedback: "This reflects Routine Numbness — repetition dulls engagement.",
      explanation: "Even capable teams tune out when the rhythm stays unchanged.",
      microShift: "Break routine with ‘off-script’ check-ins or rotating facilitators."
    },
    C: {
      motive: "Status & Social Hierarchy",
      instinct: "Weekday Fatigue Curve",
      feedback: "This shows a Fatigue Curve — energy depletes without micro-recovery.",
      explanation: "Even well-paced teams get worn down across a week. Accumulated strain dims motivation.",
      microShift: "Run a mid-week slowdown or social reset."
    },
    D: {
      motive: "Status & Social Hierarchy",
      instinct: "Avoidance Loop",
      feedback: "This may be Avoidance Loop — we delay what feels like sustained effort.",
      explanation: "The brain avoids long, uncertain tasks — it defaults to shallow wins.",
      microShift: "Time-box deep work and protect the start ritual (no Slack, no email)."
    },
    E: {
            motive: "",   
        instinct: "",
      feedback: "Looks like this isn’t a major friction point in your team.",
      explanation: "",
      microShift: ""
    }
  },

  q11: {
    A: {
      motive: "Safety & Self-Protection",
      instinct: "Busyness Bias",
      feedback: "This reflects Busyness Bias — we confuse activity for impact.",
      explanation: "When output is measured by motion, we fill time instead of pursuing meaning.",
      microShift: "End the week with a single 'most valuable contribution' reflection."
    },
    B: {
      motive: "Affiliation & Belonging",
      instinct: "Meeting Overload",
      feedback: "This may be Meeting Overload — time vanishes in sync cycles.",
      explanation: "Too many meetings dilute momentum. We stay coordinated but rarely move.",
      microShift: "Set a max meeting budget per role per week — and stick to it."
    },
    C: {
      motive: "Status & Social Hierarchy",
      instinct: "Distraction Creep",
      feedback: "This reflects Distraction Creep — attention is fragmented by noise.",
      explanation: "Each distraction feels small, but together they splinter focus beyond recovery.",
      microShift: "Create quiet zones — 2-hour blocks where interruptions are off-limits."
    },
    D: {
      motive: "Status & Social Hierarchy",
      instinct: "Multi-Tasking Myth",
      feedback: "This shows the Multitasking Myth — we think we’re splitting focus, but we’re just switching inefficiently.",
      explanation: "The brain doesn’t multi-task well. Jumping between tasks adds latency and drops quality.",
      microShift: "Cluster similar tasks and batch-switch — not rapid toggle."
    },
    E: {
            motive: "",   
        instinct: "",
      feedback: "Looks like this isn’t a major friction point in your team.",
      explanation: "",
      microShift: ""
    }
  }
}