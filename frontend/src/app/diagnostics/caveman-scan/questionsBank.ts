import {
  getOptionEvidence,
  validateEvidenceMap,
  type ScanOptionEvidence,
} from "./scanEvidence";

export interface ScanScienceBlock {
  title: string;
  subtitle?: string;
  body: string;
}

export interface ScanOption {
  label: string;
  type: "caveman" | "modern";
  reflection: string;
  science?: ScanScienceBlock | null;
  evidence?: ScanOptionEvidence;
}

export interface ScanQuestion {
  id: number;
  text: string;
  scene?: string[];
  sceneEmphasis?: Record<number, string[]>;
  timeLabel?: string;
  visualAfter?: number;
  calloutIndex?: number;
  visual?: {
    type: "mail-notification" | "moment-card";
    app: string;
    message: string;
    count?: number;
    caption: string;
    detail?: string;
    icon?: "home" | "play" | "chat" | "shoe" | "check" | "dinner" | "book" | "battery" | "clock";
  };
  prompt?: string;
  options: ScanOption[];
}

const taskAvoidanceReflection = `
  <p><strong>Eat that frog.</strong></p>
  <p>Do the hardest thing first. Close the inbox, block distractions, and begin the report.</p>
  <p>Good advice. But the inbox still offers a closer, clearer reward than the report.</p>
  <p>For most of human history, a certain reward now was a good bargain. Food could disappear. Effort cost energy. Tomorrow offered no guarantees. So what was close, clear, and rewarding carried weight.</p>
  <p>The world changed. That bias did not disappear.</p>
  <p>The report asks for effort now and offers an uncertain reward later. The inbox offers small rewards immediately: a clear question, a quick answer, something finished.</p>
  <blockquote>You are not confused about what matters. The automatic response gives more weight to what pays off first.</blockquote>
`;

const taskEngagementReflection = `
  <p><strong>The inbox still had the better immediate offer.</strong></p>
  <p>Clear questions. Quick endings. The quiet satisfaction of making something disappear. The report still offered uncertainty before reward.</p>
  <p>You did not make the whole report feel easier. Closing the inbox moved the nearby donut out of sight. Typing one imperfect sentence turned the frog from a looming task into a first bite.</p>
  <p>Now the report was no longer one large, abstract demand. It was a sentence already begun.</p>
  <blockquote>You did not need to want the report more. You gave it the next visible move.</blockquote>
`;

const taskAvoidanceScience: ScanScienceBlock = {
  title: "Why the donut gets there first",
  body: `
    <p>Human decision-making was shaped in environments where preserving energy mattered and the future was uncertain. An available reward had real value; a delayed reward might never arrive. That history helps explain why immediate, reliable payoffs can still pull harder than larger but distant ones.</p>

    <h5>Effort changes value</h5>
    <p>The brain does not evaluate reward alone. It also weighs the effort, delay, and uncertainty attached to it. As those costs rise, the subjective value of an option can fall. The report carries all three. Each email offers a low-cost action with a visible ending.</p>

    <h5>What dopamine actually adds</h5>
    <p>Dopamine is not a pleasure molecule, and it is not a tiny reward released by every notification. It helps the brain learn from cues, anticipate possible rewards, and repeat actions that have paid off before. The inbox supplies many quick cue-action-completion cycles. The report may not provide one for an hour.</p>

    <blockquote>The inbox keeps making the next reward visible. The report keeps its reward somewhere in the future.</blockquote>

    <p><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC6352317/" target="_blank" rel="noreferrer">Review: dopamine, reward and effort ↗</a><br /><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC3122071/" target="_blank" rel="noreferrer">Review: effort-based decision-making ↗</a></p>
  `,
};

const comparisonReflection = `
  <p><strong>The usual take?</strong></p>
  <p>You’re stuck in a comparison trap.</p>
  <p>Stop measuring yourself against others.</p>
  <p>But your caveman’s not trying to be petty — he’s trying to stay safe.</p>
  <p>In the tribe, your rank determined access to resources, influence, even protection.</p>
  <p>Tracking others’ wins was a survival tactic.</p>
  <p>The trick isn’t stopping comparison — it’s noticing when it starts to steal your momentum.</p>
`;

const comparisonScience: ScanScienceBlock = {
  title: "Why Their Win Feels Like Your Loss",
  subtitle: "Your brain still tracks tribal status — even on LinkedIn",
  body: `
    <h5 class="text-sm font-semibold text-dark mt-2 mb-1">Status Sensitivity</h5>
    <p>Status tracking is deeply wired into the human brain. In ancestral environments, your place in the social hierarchy affected everything — from who you could partner with to whether your voice was heard. Losing status often meant losing influence, security, or survival odds.</p>
    <p>Today’s world is different — but your brain still lights up in response to upward comparisons. The striatum, a reward-processing center, reacts to relative rank — not just absolute success. That’s why someone else’s promotion or perfect vacation photo can feel like it’s about you, even when it isn’t.</p>
    <blockquote class="italic border-l-4 border-accent text-accent pl-4 my-3">
      But status isn’t zero-sum.
    </blockquote>
    <p>In The Modern Caveman, we help you recognize those old signals — and retrain your response, so you can focus on your path without defaulting to tribal scoreboard mode.</p>
  `,
};

const relationshipDriftReflection = `
  <p><strong>The usual take?</strong></p>
  <p>You need to communicate better. Stop avoiding the conversation.</p>
  <p>But your caveman may read tension inside an important relationship as a threat to the bond itself.</p>
  <p>Silence feels safer now because it avoids conflict, judgment, and the possibility of hearing something painful.</p>
  <p>The protection works for the evening. The distance quietly grows underneath it.</p>
`;

const accumulatedPressureReflection = `
  <p><strong>The usual take?</strong></p>
  <p>You overreacted. You need to control your temper.</p>
  <p>But your caveman did not experience this as one small moment.</p>
  <p>It had been keeping watch through every deadline, message, interruption, and unfinished demand of the day.</p>
  <p>The final question was small. It landed on a system that was already braced.</p>
`;

const unfinishedRestReflection = `
  <p><strong>The usual take?</strong></p>
  <p>You need to switch off and learn how to relax.</p>
  <p>But your caveman may treat unfinished and unresolved things as open loops that still require attention.</p>
  <p>Your body has stopped working. The part keeping watch has not received a clear signal that the day is over.</p>
  <p>Rest becomes difficult because nothing inside the system feels fully closed.</p>
`;

const replayReflection = `
  <p><strong>The usual take?</strong></p>
  <p>You are overthinking. Stop replaying it and move on.</p>
  <p>But your caveman may be reviewing the conversation for signs of judgment, rejection, or a change in where you stand.</p>
  <p>Replaying feels useful because the mind believes one more review might find the detail that keeps you socially safe.</p>
  <p>The conversation has ended. The social watch has not.</p>
`;

const unrestoredReflection = `
  <p><strong>The usual take?</strong></p>
  <p>You need more sleep, a better routine, or more discipline with your rest.</p>
  <p>But time away does not always feel like rest to a system that has stayed alert underneath it.</p>
  <p>Your body may have stopped for the night while your caveman continued carrying pressure, unfinished demands, and the sense that something still needed attention.</p>
  <p>The problem is not always that you failed to rest properly. Sometimes unresolved demands keep automatic readiness active even when you have stopped working.</p>
`;

const endOfDayGuiltReflection = `
  <p><strong>The usual take?</strong></p>
  <p>You wasted the day. You need more discipline and a plan you will finally follow.</p>
  <p>But your caveman spent the day choosing the nearest relief over the discomfort of beginning.</p>
  <p>Now guilt makes the unfinished life feel even more threatening, so another perfect plan becomes safer than looking directly at what happened.</p>
  <p>The problem is not that you do not care. The loop keeps offering relief first and self-blame afterwards.</p>
`;

const authoredQuestions: ScanQuestion[] = [
  {
    id: 1,
    text: "9:04 AM. Steam rises off your coffee, carrying that first warm hit of aroma. The cursor blinks beneath the title of the report. This is the one that matters today. A notification slides in: 17 unread messages. You glance over. Your hand moves before you decide it should. The inbox fills the screen. None of it is loud. None of it is urgent. But the report behind that tab suddenly feels miles away. What do you find yourself doing next?",
    scene: [
      "Steam rises off your coffee, carrying that first warm hit of aroma. The cursor blinks beneath the title of the report.",
      "This is the one that matters today.",
      "A notification slides in from the corner: 17 unread messages. You glance over.",
      "Your hand moves before you decide it should. Click. The inbox fills the screen—a wall of bold subject lines. One email: ten seconds to read. Another: “just needs a quick reply.”",
      "None of it is important. None of it matters more than the report. But the report behind that tab suddenly feels miles away, and every little task in front of you feels like something you could finish right now.",
    ],
    timeLabel: "9:04 AM",
    visualAfter: 1,
    calloutIndex: 4,
    sceneEmphasis: {
      0: [
        "carrying that first warm hit of aroma.",
      ],
      1: ["This is the one that matters today."],
      3: ["Click."],
      4: ["None of it matters more than the report."],
    },
    visual: {
      type: "mail-notification",
      app: "Mail",
      message: "17 unread messages",
      count: 17,
      caption: "Ding. A notification slides in from the corner.",
    },
    prompt: "What do you find yourself doing next?",
    options: [
      {
        label: "I answer the email at the top. Then the next one. Twenty minutes disappear.",
        type: "caveman",
        reflection: taskAvoidanceReflection,
        science: taskAvoidanceScience,
      },
      {
        label: "I read one email, then open chat to ping a colleague about it. Three other messages are waiting there too.",
        type: "caveman",
        reflection: taskAvoidanceReflection,
        science: taskAvoidanceScience,
      },
      {
        label: "I go back to the report, fix a few typos, and make the page look cleaner.",
        type: "caveman",
        reflection: taskAvoidanceReflection,
        science: taskAvoidanceScience,
      },
      {
        label: "I click back to the report, read the same sentence twice, then reopen my inbox.",
        type: "caveman",
        reflection: taskAvoidanceReflection,
        science: taskAvoidanceScience,
      },
      {
        label: "I close the inbox and type the first imperfect sentence that comes to mind.",
        type: "modern",
        reflection: taskEngagementReflection,
      },
    ]
  },
  {
    id: 2,
    text: "Dinner is over. The plates are still on the table as you settle into the sofa with Instagram open. A face from college appears in your feed. You have not spoken in years. She is standing outside a new house, holding up the keys, while the comments fill with hearts and congratulations. You are happy for her. You look at the photographs once more. What happens inside you next?",
    scene: [
      "Dinner is over. The plates are still on the table as you settle into the sofa with Instagram open.",
      "A face from college appears in your feed. You have not spoken in years.",
      "She is standing outside a new house, holding up the keys, while the comments fill with hearts and congratulations.",
      "You are happy for her. You look at the photographs once more.",
    ],
    prompt: "What happens inside you next?",
    options: [
      {
        label: "Holy shit — she bought a house already. What have I been doing all these years?",
        type: "caveman",
        reflection: comparisonReflection,
        science: comparisonScience,
      },
      {
        label: "Of course. Everyone is moving ahead, and I am still stuck in the same place.",
        type: "caveman",
        reflection: comparisonReflection,
        science: comparisonScience,
      },
      {
        label: "How does everything seem to fall into place for her? Why is it so much harder for me?",
        type: "caveman",
        reflection: comparisonReflection,
        science: comparisonScience,
      },
      {
        label: "My life felt perfectly fine five minutes ago. Why does it suddenly feel so small?",
        type: "caveman",
        reflection: comparisonReflection,
        science: comparisonScience,
      },
      {
        label: "This is lovely. Good for her. I tap like and keep scrolling.",
        type: "modern",
        reflection: `
          <p>That’s not just positivity — that’s progress.</p>
          <p>Your caveman brain might still twitch — “Are we falling behind?” — but you didn’t follow the signal.</p>
          <p>Someone else’s win didn’t trigger your loss reflex.</p>
          <p>That’s a quiet upgrade to your status software.</p>
        `,
      },
    ]
  },
  {
    id: 3,
    text: "You’re midway through deep work. Your phone lights up with a group chat buzzing about a trending reel. Do you…",
    options:
     [
      {
        label: "Mute the notifications and continue working.",
        type: "modern",
        reflection: `
                    <p>Most people would say, “Good job setting boundaries.” But what you really did?</p>
                    <p>You noticed your caveman — and overrode him.</p>
                    <p>That buzzing thread triggered a survival script, and you chose not to act on it.</p>
                    <p>That’s the real win.</p>
                  `,
        
      },
      {
        label: "Check the thread — don’t want to miss out on the fun.",
        type: "caveman",  
        reflection: `
                    <p><strong>The usual advice?</strong></p>
                    <p>You’re just distracted.</p>
                    <p>Set boundaries.</p>
                    <p>Silence notifications.</p>
                    <p>Focus better.</p>
                    <p>But your caveman brain doesn’t care about productivity.</p>
                    <p>It sees tribe chatter and thinks: “Stay close. Don’t miss the signal. Don’t fall behind.”</p>
                    <p>You’re not weak — you’re wired.</p>
                    <p>This is ancient social vigilance misfiring in a modern world.</p>
                    <p>The trick isn’t to ignore the instinct — it’s to notice when it’s stealing your focus.</p>
                  `,
        science: {
                    title: "Why You Can't Ignore the Ping",
                    subtitle: "Your caveman still thinks every notification is a lifeline",
                    body: `
                        <h5 class="text-sm font-semibold text-dark mt-2 mb-1">Social Cravings & Digital Distractions</h5>
                        <p>Your brain is wired to connect. In ancestral environments, social bonds were crucial for survival. They provided safety, resources, and support. So when a notification pops up, your caveman instinct kicks in: 'Check it out! It might be important!'</p>
                        <p>But in modern life, that instinct can lead to distraction and overwhelm. The brain’s reward system lights up at the thought of social connection — even if it means interrupting deep work.</p>
                        <p>In The Modern Caveman, we teach you how to recognize this bias and create systems that help you stay focused without sacrificing connection.</p>
                      `,
                  }
      }
    ]
  },
  {
    id: 4,
    text: "You’re watching a show with your partner and they seem less into it than you are. Do you:",
    options:
     [
      {
        label: "Keep checking their reactions to see if they’re enjoying it",
        type: "caveman",
        reflection: `
                    <p><strong>The usual take?</strong></p>
                    <p>You’re just being sensitive. Maybe a bit over-attuned.</p>
                    <p>But to your caveman brain?</p>
                    <p>Social sync was survival.</p>
                    <p>If the tribe was out of step with you, that could mean conflict, rejection — or danger.</p>
                    <p>That tiny scan you’re doing? It’s not neediness. It’s ancient pattern-matching — trying to stay aligned with the group.</p>
                  `,
        science: {
                    title: "Are We Still in Sync?",
                    subtitle: "Your brain still scans for social safety — even when nothing’s at risk",
                    body: `
                            <h5 class="text-sm font-semibold text-dark mt-2 mb-1">Affiliation Anxiety & Tribal Reflexes</h5>
                            <p>Your brain is deeply wired for affiliation — the need to belong, sync, and stay connected to others. In early human tribes, falling out of step with the group could mean exclusion. And exclusion wasn’t just emotional; it was existential. Being pushed out of the tribe meant losing access to food, safety, and protection. So your brain evolved to constantly scan for signs of social misalignment — tone, posture, facial expressions — anything that might signal disconnection.</p>
                            <p>That is why even during something as simple as watching a show, you might monitor your partner’s reactions. Automatic social monitoring keeps checking whether the interaction has changed, even when no new evidence has appeared.</p>
                            <p>In The Modern Caveman, we explore how these ancient reflexes still shape modern relationships — and how to quiet them when they no longer serve you.</p>
                          `,
                  }
      },
      {
        label: "Focus on your own experience, letting them have theirs ",
        type: "modern",  
        reflection: `
                      <p>Most would call that maturity. Self-assurance.</p>
                      <p>But it’s also a subtle override of a deeper instinct — the need to constantly monitor for tribal harmony.</p>
                      <p>Letting go of that loop in real time?</p>
                      <p>That’s a quiet win for your modern mind.</p>
                    `,
        
      }
    ]
  },
  {
    id: 5,
    text: "You come across an opportunity that requires you to speak publicly. Do you:",
    options:
     [
      {
        label: "Feel nervous and start thinking of reasons to delay or avoid it",
        type: "caveman",
        reflection: `
                      <p><strong>The usual take?</strong> You have stage fright. You need to practice confidence.</p>
                      <p><strong>But to your caveman brain?</strong> Speaking alone in front of a group once meant being exposed, vulnerable — a prime setup for judgment or rejection. That could have meant banishment.</p>
                      <p>Your anxiety isn’t weakness. It’s an ancient alarm system — going off in a room where the threat no longer exists.</p>
                    `,
        science: {
                    title: "Why Speaking Up Feels So Exposed",
                    subtitle: "Your caveman still thinks the crowd might cast you out",
                    body: `
                            <h5 class="text-sm font-semibold text-dark mt-2 mb-1">Stage Fright & The Spotlight Instinct</h5>
                            <p>Public speaking is often ranked above death in fear surveys — and evolution helps explain why. In ancestral tribes, being the center of attention wasn’t neutral. It meant exposure: your words, your body, your status — all on display. A misstep could lower your rank or threaten your place in the group. The cost wasn’t embarrassment. It was exclusion. Or worse.</p>
                            <p>That wiring didn’t vanish. Your brain still lights up the same way when it senses “eyes on you.” Even if it’s a team presentation. Even if it’s a friendly crowd. Your amygdala doesn’t know it’s 2025.</p>
                            <p>In The Modern Caveman, we teach you how to recognize when these alarms are based on old scripts — and how to move forward without needing to silence them.</p>
                          `,
                  }
      },
      {
        label: "Say yes, even if it makes you uncomfortable",
        type: "modern",  
        reflection: `
                      <p>Most would call that courage — and they’d be right.</p>
                      <p>But it's not just boldness — it’s awareness.</p>
                      <p>You heard the caveman mutter, “this is risky,” and said: “I’ll be fine.”</p>
                      <p>You didn’t silence him. You just didn’t hand him the mic.</p>
                    `,
        
      }
    ]
  },
  {
    id: 6,
    text: "You’ve made a healthy eating plan, but pass by your favorite snack shop. Do you:",
    options:
     [
      {
        label: "Buy the snack “just this once” — I’ve earned it after a long week",
        type: "caveman",
        reflection: `
                      <p><strong>The traditional view?</strong></p>
                      <p>You lack discipline. You gave in.</p>
                      <p>But to your caveman brain? That snack isn’t just tasty — it’s a high-reward signal.</p>
                      <p>In a world of food scarcity, the rule was: “If it’s available, eat it.”</p>
                      <p>Even if you’re full, your wiring says: “Better now than never.”</p>
                      <p>You’re not failing — you’re responding exactly how an ancient human would.</p>
                      <p>The mismatch is the modern abundance.</p>
                    `,
        science: {
                    title: "Why You Crave It — Even When You’re Full",
                    subtitle: "Your caveman brain still thinks this snack might be your last",
                    body: `
                      <h5 class="text-sm font-semibold text-dark mt-2 mb-1">Cravings, Scarcity & The Caveman Diet</h5>
                      <p>Your brain evolved in an environment of unpredictable scarcity — not meal plans and grocery apps. Back then, food wasn’t guaranteed. So when your brain sees calorie-dense options (especially sugar, salt, or fat), it triggers reward pathways that shout louder than reason. It’s not about hunger — it’s about insurance.</p>
                      <p>This is why cravings often show up even when you're not physically hungry. Your caveman brain doesn't trust the future. “What if you don’t get another chance?” it whispers.</p>
                      <p>But the environment has changed. Snacks are everywhere. Your wiring hasn’t caught up.</p>
                      <p>In The Modern Caveman, we teach you how to recognize when these alarms are based on old scripts — and how to move forward without needing to silence them.</p>
                    `,
                  }
      },
      {
        label: "Resist and keep walking, even if it’s tempting to stop",
        type: "modern",  
        reflection: `
                      <p>Most would call that willpower.</p>
                      <p>But really, it’s modern awareness.</p>
                      <p>You overrode a deeply ingrained pattern — one that evolved to hoard energy and avoid hunger.</p>
                      <p>The caveman still whispered, “take it while you can.”</p>
                      <p>You heard it… and chose not to listen.</p>
                    `,
        
      }
    ]
  },
  {
    id: 7,
    text: "You’re in a team setting where your suggestion was ignored. Do you:",
    options:
     [
      {
        label: "Stay quiet the rest of the time and disengage ",
        type: "caveman",
        reflection: `
                    <p><strong>The standard view?</strong></p>
                    <p>You took it personally. You need to build confidence and speak up more.</p>
                    <p>But for your caveman brain? Being ignored is interpreted as a status threat.</p>
                    <p>In tribal life, losing rank could mean losing resources — or protection.</p>
                    <p>So when you weren’t heard, your instincts kicked in: “Go quiet. Stay safe.”</p>
                    <p>That wasn’t overreaction. That was ancient shielding.</p>
                  `,
        science: {
                    title: "Why Being Ignored Feels Like a Threat",
                    subtitle: "Your brain treats social rejection like physical pain — and it’s not wrong",
                    body: `
                      <h5 class="text-sm font-semibold text-dark mt-2 mb-1">Status, Rejection & Social Pain</h5>
                      <p>Humans evolved in status-sensitive hierarchies. In small tribes, being dismissed or ignored wasn’t just rude — it was risky. If your ideas or presence were regularly overlooked, it could threaten your place in the group. And in that world, status was survival.</p>
                      <p>Modern teams don’t carry those same risks, but the brain hasn’t fully updated. The anterior cingulate cortex, which lights up in response to physical pain, also lights up during social rejection. That’s not metaphor — that’s neurobiology.</p>
                      <p>So when you pull back after being dismissed, it’s not drama — it’s defense. The key isn’t to silence that instinct, but to understand it — and know when to gently override it.</p>
                      <p>In The Modern Caveman, we help you read those signals clearly — and re-engage without letting ancient fear run modern conversations.</p>
                    `,
                  }
      },
      {
        label: "Try again later or share your input another way ",
        type: "modern",  
        reflection: `
                      <p>Most would say you showed resilience — and you did.</p>
                      <p>But it was more than that.</p>
                      <p>Your caveman felt the sting of being ignored — and you still chose to stay in the conversation.</p>
                      <p>That’s not just courage. That’s social recalibration: modern leadership in action.</p>
                    `,
        
      }
    ]
  },
  {
    id: 8,
    text: "You plan to exercise after work. At 6 PM, you're drained. Do you:",
    options:
     [
      {
        label: "Skip it — I’ve had a long day and need rest  ",
        type: "caveman",
        reflection: `
                      <p><strong>The usual view?</strong></p>
                      <p>You lacked motivation. You didn’t stick to your plan.</p>
                      <p>But from your caveman’s perspective?</p>
                      <p>You survived the day — the hunt, the conflict, the tribal chaos.</p>
                      <p>So the message is clear: don’t burn energy unless you need to.</p>
                      <p>Your instincts say rest = safety. You’re not weak — you’re wired.</p>
                      <p>The trick is learning when to thank the instinct… and still move forward.</p>
                    `,
        science: {
                    title: "Why You Skip the Gym After Doing Nothing All Day",
                    subtitle: "Your caveman doesn’t care if you’ve been sitting — he’s trying to conserve fuel",
                    body: `
                      <h5 class="text-sm font-semibold text-dark mt-2 mb-1">Energy Conservation & The Exercise Paradox</h5>
                      <p>Your brain didn’t evolve to chase fitness — it evolved to survive. In environments of caloric scarcity and physical danger, the goal wasn’t to stay lean or get stronger. It was to conserve energy for moments of real threat or need.</p>
                      <p>That’s why, at the end of a cognitively or emotionally exhausting day, your body resists physical effort — even if you’ve been sitting all day. Your caveman doesn’t know the difference between being mentally taxed and physically spent. He just sees the fuel gauge dropping.</p>
                      <p>But motion isn’t the enemy — it’s the reset.</p>
                      <p>In The Modern Caveman, we teach you how to design tiny, energy-friendly actions that work with your instinct to conserve — instead of trying to bulldoze it.</p>
                    `,
                  }
      },
      {
        label: "Do a shorter version, even if I’m not at full energy  ",
        type: "modern",  
        reflection: `
                      <p>That’s not just commitment. That’s compromise.</p>
                      <p>Your caveman brain whispered, “Let’s shut it down.”</p>
                      <p>But you said, “How about just a little?”</p>
                      <p>That’s not willpower — that’s momentum design.</p>
                      <p>It works because it speaks your caveman’s language: low threat, low friction, high return.</p>
                    `,
        
      }
    ]
  },
  {
    id: 9,
    text: "You start a new habit. By Day 4, you’ve missed a day. Do you:",
    options:
     [
      {
        label: "Drop the routine — the streak’s broken anyway",
        type: "caveman",
        reflection: `
                      <p><strong>What you’ll usually hear?</strong></p>
                      <p>You need more grit. More structure. More accountability.</p>
                      <p>But here’s what your caveman thinks:</p>
                      <p>If a strategy isn’t working, abandon it — fast.</p>
                      <p>In the wild, persistence could be deadly. Missed signal? Wrong pattern? Bail.</p>
                      <p>“All or nothing” isn’t logic — it’s ancient code: survive or die.</p>
                      <p>But habits aren’t hunting strategies. You can miss a step and still keep going.</p>
                    `,
        science: {
                    title: "Why One Missed Day Feels Like Failure",
                    subtitle: "Your caveman brain still thinks broken = abandoned",
                    body: `
                      <h5 class="text-sm font-semibold text-dark mt-2 mb-1">All-or-Nothing Thinking & The Restart Reflex</h5>
                      <p>Your brain evolved in a world where quick decisions meant survival. If a strategy failed once, the instinct was to move on — not refine. Today, that shows up as all-or-nothing thinking: one slip, and the brain calls the whole thing a bust.</p>
                      <p>Neurologically, this connects to the brain’s error detection system, which flags a missed expectation (like breaking a habit streak) as a signal of potential danger or wasted effort. Instead of recalibrating, we abort.</p>
                      <p>But real growth doesn’t work that way.</p>
                      <p>In The Modern Caveman, we help you train the “restart reflex” — the skill of continuing despite imperfection, instead of collapsing at the first glitch.</p>
                    `,
                  }
      },
      {
        label: "Pick it back up the next day like nothing happened ",
        type: "modern",  
        reflection: `
                      <p>That’s not just consistency — that’s maturity.</p>
                      <p>Your caveman sees “missed day” and wants to mark it as failure.</p>
                      <p>But you didn’t listen. You chose rhythm over perfection.</p>
                      <p>That’s how sustainable habits actually work — and how your modern self stays in charge.</p>
                    `,
        
      }
    ]
  },
  {
    id: 10,
    text: "It is Friday night. You and your partner are eating dinner at the same table, but most of the conversation is about groceries, bills, and what needs doing this weekend. There was a time when the two of you could talk for hours. Lately, every real conversation seems to become uncomfortable, so you both stay with logistics. You want to say, I miss us. The words reach the back of your throat. What happens next?",
    scene: [
      "It is Friday night. You and your partner are eating dinner at the same table, but most of the conversation is about groceries, bills, and what needs doing this weekend.",
      "There was a time when the two of you could talk for hours.",
      "Lately, every real conversation seems to become uncomfortable, so you both stay with logistics.",
      "You want to say, “I miss us.” The words reach the back of your throat.",
    ],
    prompt: "What happens next?",
    options: [
      { label: "Not tonight. We are both tired, and I do not want this to turn into an argument.", type: "caveman", reflection: relationshipDriftReflection },
      { label: "Maybe this is just what long relationships become. There is no point making it a big thing.", type: "caveman", reflection: relationshipDriftReflection },
      { label: "I ask, “Everything okay?” but make it sound casual enough that they can just say yes.", type: "caveman", reflection: relationshipDriftReflection },
      { label: "I reach for my phone and let the moment pass. We can talk properly some other time.", type: "caveman", reflection: relationshipDriftReflection },
      { label: "I say, “I miss us. Can we talk about how distant things have felt lately?”", type: "modern", reflection: relationshipDriftReflection },
    ],
  },
  {
    id: 11,
    text: "It is a little after eight. The day has been one long chain of calls, messages, deadlines, and small things that never quite got finished. You are in the kitchen trying to sort out dinner when someone at home asks, Did you remember to send that thing? It is an ordinary question. Your body reacts before the rest of you catches up. What happens next?",
    scene: [
      "It is a little after eight. The day has been one long chain of calls, messages, deadlines, and small things that never quite got finished.",
      "You are in the kitchen trying to sort out dinner when someone at home asks, “Did you remember to send that thing?”",
      "It is an ordinary question. Your body reacts before the rest of you catches up.",
    ],
    prompt: "What happens next?",
    options: [
      { label: "Can everyone please stop asking me for things for five minutes?", type: "caveman", reflection: accumulatedPressureReflection },
      { label: "I answer much more sharply than the question deserved, then immediately feel bad about it.", type: "caveman", reflection: accumulatedPressureReflection },
      { label: "I go quiet, but inside I am furious that one more thing has landed on me.", type: "caveman", reflection: accumulatedPressureReflection },
      { label: "I leave the room or reach for my phone before I say something worse.", type: "caveman", reflection: accumulatedPressureReflection },
      { label: "I pause and say, “I am overloaded right now. Give me a minute before I answer.”", type: "modern", reflection: accumulatedPressureReflection },
    ],
  },
  {
    id: 12,
    text: "Sunday afternoon. For once, there is nowhere you need to be. You are stretched out on the sofa with a book open and your phone face down beside you. Two pages in, your mind remembers the email you have not answered. Then the bill that needs paying. Then the appointment you still have not booked. Your body is on the sofa. The rest of you is back inside the list. What happens next?",
    scene: [
      "Sunday afternoon. For once, there is nowhere you need to be. You are stretched out on the sofa with a book open and your phone face down beside you.",
      "Two pages in, your mind remembers the email you have not answered. Then the bill that needs paying. Then the appointment you still have not booked.",
      "Your body is on the sofa. The rest of you is back inside the list.",
    ],
    prompt: "What happens next?",
    options: [
      { label: "I should just get up and do one of them. Then maybe I will be able to relax.", type: "caveman", reflection: unfinishedRestReflection },
      { label: "I open my notes and start making a list so I do not forget anything.", type: "caveman", reflection: unfinishedRestReflection },
      { label: "I stay on the sofa, but spend the whole time mentally arranging what I need to do next.", type: "caveman", reflection: unfinishedRestReflection },
      { label: "I pick up my phone and scroll because it is easier than sitting with everything in my head.", type: "caveman", reflection: unfinishedRestReflection },
      { label: "I let the thoughts pass and return to the page in front of me.", type: "modern", reflection: unfinishedRestReflection },
    ],
  },
  {
    id: 13,
    text: "You are brushing your teeth before bed when a sentence from an afternoon conversation returns. You had said something, and the other person paused for half a second before answering, Fine. At the time, you carried on. Now, standing alone in the bathroom, you can see their face again. The conversation begins replaying with better lighting and worse possibilities. What happens inside your head next?",
    scene: [
      "You are brushing your teeth before bed when a sentence from an afternoon conversation returns.",
      "You had said something, and the other person paused for half a second before answering, “Fine.” At the time, you carried on.",
      "Now, standing alone in the bathroom, you can see their face again.",
      "The conversation begins replaying with better lighting and worse possibilities.",
    ],
    prompt: "What happens inside your head next?",
    options: [
      { label: "Why did they pause like that? I definitely said something wrong.", type: "caveman", reflection: replayReflection },
      { label: "I replay my exact words and try to work out how they might have sounded.", type: "caveman", reflection: replayReflection },
      { label: "I start drafting a message to ask if everything is okay between us.", type: "caveman", reflection: replayReflection },
      { label: "This is why I should talk less. I always give people the wrong impression.", type: "caveman", reflection: replayReflection },
      { label: "I notice the replay, remind myself I do not know what the pause meant, and leave it there.", type: "modern", reflection: replayReflection },
    ],
  },
  {
    id: 14,
    text: "Saturday morning. You went to bed early on purpose. The phone stayed away, the room was dark, and you slept for almost eight hours. Still, when you open your eyes, your body feels heavy and your head already feels full. You lie there looking at the ceiling, annoyed because this was supposed to be the morning you finally felt rested. What happens next?",
    scene: [
      "Saturday morning. You went to bed early on purpose. The phone stayed away, the room was dark, and you slept for almost eight hours.",
      "Still, when you open your eyes, your body feels heavy and your head already feels full.",
      "You lie there looking at the ceiling, annoyed because this was supposed to be the morning you finally felt rested.",
    ],
    prompt: "What happens next?",
    options: [
      { label: "Seriously? How am I still tired after doing everything right?", type: "caveman", reflection: unrestoredReflection },
      { label: "I reach for my phone and stay in bed scrolling, hoping I will feel more awake in a few minutes.", type: "caveman", reflection: unrestoredReflection },
      { label: "I force myself up, make strong coffee, and decide I just need to push through it.", type: "caveman", reflection: unrestoredReflection },
      { label: "I start searching for a better sleep routine, meditation, or morning practice to fix this.", type: "caveman", reflection: unrestoredReflection },
      { label: "I accept that my energy is low this morning and make the start of the day gentler.", type: "modern", reflection: unrestoredReflection },
    ],
  },
  {
    id: 15,
    text: "It is 11:47 at night. The printed plan is still taped to the wall above your desk. The gym bag you packed is untouched on the chair, and the bottle of multivitamins is sitting beside your laptop. This morning, you promised yourself that today would be different. Instead, one random video became another, and most of the day disappeared with your phone in your hand. Now the room is quiet enough for the guilt to catch up. What happens inside you next?",
    scene: [
      "It is 11:47 at night. The printed plan is still taped to the wall above your desk.",
      "The gym bag you packed is untouched on the chair, and the bottle of multivitamins is sitting beside your laptop.",
      "This morning, you promised yourself that today would be different. Instead, one random video became another, and most of the day disappeared with your phone in your hand.",
      "Now the room is quiet enough for the guilt to catch up.",
    ],
    prompt: "What happens inside you next?",
    options: [
      { label: "What the hell is wrong with me? I had the whole day and still did nothing with it.", type: "caveman", reflection: endOfDayGuiltReflection },
      { label: "Tomorrow needs a stricter plan. I am going to start properly and do everything right.", type: "caveman", reflection: endOfDayGuiltReflection },
      { label: "The day is ruined anyway. I keep scrolling until I am tired enough to sleep.", type: "caveman", reflection: endOfDayGuiltReflection },
      { label: "I avoid looking at the plan, the gym bag, or anything else that reminds me of what I did not do.", type: "caveman", reflection: endOfDayGuiltReflection },
      { label: "I put the phone away, let the day be over, and choose one small thing to begin with tomorrow.", type: "modern", reflection: endOfDayGuiltReflection },
    ],
  }
];

const removedScenarioIds = new Set([4, 6, 7]);

type ScenarioRevision = {
  text: string;
  scene: string[];
  prompt: string;
  cavemanLabels: string[];
  modernLabel: string;
};

type ReflectionRevision = {
  protective: string;
  grounded: string;
};

const scenarioPresentations: Partial<
  Record<number, Pick<ScanQuestion, "visual" | "sceneEmphasis">>
> = {
  2: {
    visual: { type: "moment-card", icon: "home", app: "Instagram", message: "We bought a house!", detail: "1,284 likes · 96 comments", caption: "You look at the photographs once more." },
    sceneEmphasis: { 0: ["Dinner is over."], 2: ["new house"], 3: ["You are happy for her."] },
  },
  3: {
    visual: { type: "moment-card", icon: "play", app: "Screen time", message: "40 minutes", detail: "The next reel has already started", caption: "The laptop screen has gone dim." },
    sceneEmphasis: { 0: ["Saturday afternoon."], 2: ["forty minutes have passed"], 3: ["put the phone down"] },
  },
  5: {
    visual: { type: "moment-card", icon: "chat", app: "Message draft", message: "Hey, it has been ages.", detail: "Not sent", caption: "Your thumb hovers over Send." },
    sceneEmphasis: { 0: ["Sunday evening."], 1: ["We should catch up soon."], 2: ["the year of silence"], 3: ["hovers over Send"] },
  },
  8: {
    visual: { type: "moment-card", icon: "shoe", app: "6:20 PM", message: "Shoes still by the door", detail: "The phone is already in your hand", caption: "The plan was half an hour before dinner." },
    sceneEmphasis: { 0: ["6:20 in the evening."], 2: ["The day seems to arrive in your body all at once."] },
  },
  9: {
    visual: { type: "moment-card", icon: "check", app: "Morning routine", message: "Day 4", detail: "✓  ✓  ✓  —", caption: "The empty space is louder than the three checks." },
    sceneEmphasis: { 0: ["Thursday morning."], 1: ["three neat checks"], 2: ["your eyes go straight to the gap"] },
  },
  10: {
    visual: { type: "moment-card", icon: "dinner", app: "Friday night", message: "Groceries. Bills. Weekend.", detail: "Everything except the two of you", caption: "The words “I miss us” reach the back of your throat." },
    sceneEmphasis: { 0: ["Friday night."], 1: ["talk for hours"], 3: ["I miss us."] },
  },
  11: {
    visual: { type: "moment-card", icon: "chat", app: "8:07 PM", message: "Did you remember to send that thing?", detail: "An ordinary question", caption: "Your body reacts before the rest of you catches up." },
    sceneEmphasis: { 0: ["one long chain"], 2: ["ordinary question"] },
  },
  12: {
    visual: { type: "moment-card", icon: "book", app: "Sunday afternoon", message: "Page 2", detail: "Email · bill · appointment", caption: "Nothing is happening. Everything is still open." },
    sceneEmphasis: { 0: ["nowhere you need to be"], 2: ["None of them is urgent."], 3: ["back inside the list"] },
  },
  13: {
    visual: { type: "moment-card", icon: "chat", app: "Earlier today", message: "“Fine.”", detail: "A half-second pause", caption: "The conversation ended. Its meaning did not." },
    sceneEmphasis: { 0: ["before bed"], 1: ["paused for half a second"], 2: ["Nothing new has happened."], 3: ["worse possibilities"] },
  },
  14: {
    visual: { type: "moment-card", icon: "battery", app: "Saturday morning", message: "7 h 58 m asleep", detail: "Still heavy. Already full.", caption: "The number says enough. Your body has not agreed." },
    sceneEmphasis: { 0: ["almost eight hours"], 2: ["The number says you rested."], 3: ["why it did not work"] },
  },
  15: {
    visual: { type: "moment-card", icon: "clock", app: "11:47 PM", message: "The plan is still on the wall", detail: "The gym bag is still on the chair", caption: "Tomorrow begins to look perfect before today has been understood." },
    sceneEmphasis: { 0: ["11:47 PM."], 2: ["most of the day disappeared"], 3: ["one verdict"] },
  },
};

const scenarioScienceRevisions: Partial<Record<number, ScanScienceBlock>> = {
  2: {
    title: "Why somebody else's milestone can feel personal",
    body: `<p>Humans evolved in groups where position was not merely symbolic. It could affect influence, access to resources, choice of partners, and whose support was available when things went wrong. Sensitivity to relative standing therefore carried useful social information.</p><h5>The modern mismatch</h5><p>A feed turns that sensitivity toward a stream of selected milestones from hundreds of people. It shows the house without the mortgage, the promotion without the stalled years, and the celebration without the ordinary Tuesday. The comparison is immediate; the context is missing.</p><h5>Social comparison in the brain</h5><p>Research suggests that upward and downward comparisons recruit partly different networks. Upward comparisons have been associated with regions involved in salience, conflict, and painful affect; downward comparisons more consistently recruit reward-related regions. That does not mean one brain area “causes envy.” It means relative standing can be processed with some of the same machinery used to register gains and losses.</p><blockquote>The feed presents her milestone. The comparison system quietly asks what it means about you.</blockquote><p><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC4934127/" target="_blank" rel="noreferrer">Review: the social neuroscience of comparison ↗</a><br /><a href="https://pubmed.ncbi.nlm.nih.gov/29064617/" target="_blank" rel="noreferrer">Meta-analysis: upward and downward comparison ↗</a></p>`,
  },
  3: {
    title: "Why the next reel keeps winning",
    body: `<p>New and surprising information can interrupt ongoing attention because it may be worth learning from. Research links novelty to changes across attention, arousal, learning, and memory, although the precise role of dopamine in human novelty processing remains more complicated than the familiar “dopamine hit” story suggests.</p><h5>Uncertainty keeps the question open</h5><p>Every swipe resolves one uncertainty—what comes next—and immediately creates another. Reinforcement-learning models help describe how unexpected outcomes update value and make rewarded actions more likely to be repeated. A feed compresses that action-feedback loop into a thumb movement.</p><h5>The competing task</h5><p>The laptop offers no comparable rhythm. Its reward is delayed, its ending is unclear, and progress requires sustained cognitive effort. The feed does not need to be more important. It only needs to make the next payoff easier to see.</p><blockquote>One swipe closes a question and opens another. The work keeps asking you to stay with the same one.</blockquote><p><a href="https://pubmed.ncbi.nlm.nih.gov/26601905/" target="_blank" rel="noreferrer">Systematic review: neurotransmitters and novelty ↗</a><br /><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC7393303/" target="_blank" rel="noreferrer">Review: reinforcement learning in social neuroscience ↗</a><br /><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC4193662/" target="_blank" rel="noreferrer">Review: novelty, curiosity, and attention ↗</a></p>`,
  },
  5: {
    title: "Why belonging feels safer while the answer is unknown",
    body: `<p>Humans have depended deeply on social groups for shared resources, care, information, and security. Research on belonging treats the maintenance of stable relationships as a fundamental motive, not a decorative preference. A possible change in a valued bond can therefore command attention even when the modern action is only sending a message.</p><h5>Why silence can feel easier</h5><p>Social uncertainty can produce both approach and withdrawal. Sending creates the possibility of reconnection, but also an answer you cannot control. Closing the chat removes that discomfort immediately. In learning terms, relief can negatively reinforce avoidance: when not sending makes the tension drop, not sending becomes easier to repeat.</p><h5>What neuroscience can—and cannot—say</h5><p>Rejection engages networks involved in salience, distress, self-relevance, and regulation. It is often described as “social pain,” but meta-analytic evidence does not support the simple claim that rejection is processed exactly like physical pain. The neural picture is broader and depends on the relationship and context.</p><blockquote>The unsent message keeps the friendship possible. Sending it allows the friendship to answer.</blockquote><p><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC3392591/" target="_blank" rel="noreferrer">Review: affiliative and avoidant responses to exclusion ↗</a><br /><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC8894646/" target="_blank" rel="noreferrer">Review: relief and avoidance learning ↗</a><br /><a href="https://pubmed.ncbi.nlm.nih.gov/24002359/" target="_blank" rel="noreferrer">Meta-analysis: neural responses to rejection ↗</a></p>`,
  },
  8: {
    title: "Why immediate effort outweighs a delayed reward",
    body: `<p>When people evaluate an action, its reward is weighed alongside costs such as effort and delay. Research on effort discounting shows that increasing physical effort can reduce an outcome's subjective value. At the door, the cost of exercise is immediate; most of its benefits live later.</p><h5>How exercise feels matters</h5><p>Exercise motivation is not built from health knowledge alone. Reviews suggest that remembered, anticipated, and in-the-moment feelings around movement can influence future activity. If exercise has become associated with strain, obligation, or another demand, those learned feelings can arrive before the workout does.</p><h5>The evolutionary claim needs care</h5><p>Conserving energy is an appealing evolutionary explanation, but the evidence does not support a simple story that humans are biologically programmed to avoid exercise. Humans evolved substantial capacities for movement, and physical activity itself can become rewarding. The useful point is narrower: unnecessary effort carries a cost, especially when a lower-effort reward is already within reach.</p><blockquote>Your future self receives the benefit. Your present body receives the bill.</blockquote><p><a href="https://pubmed.ncbi.nlm.nih.gov/26876919/" target="_blank" rel="noreferrer">Study: physical, emotional, and cognitive effort discounting ↗</a><br /><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC7735992/" target="_blank" rel="noreferrer">Review: affective determinants of physical activity ↗</a><br /><a href="https://pubmed.ncbi.nlm.nih.gov/29556981/" target="_blank" rel="noreferrer">Systematic review: the rewarding value of exercise ↗</a></p>`,
  },
  9: {
    title: "Why a broken pattern makes starting over feel cleaner",
    body: `<p>Goal pursuit depends partly on comparing what happened with what was expected. A missing check is therefore not visually neutral: it is the first piece of evidence that departs from the pattern. Neuroscience studies of goal monitoring implicate distributed systems involved in detecting conflict, evaluating progress, and adjusting behaviour—not a single “consistency centre.”</p><h5>Why Monday feels better</h5><p>Research on the fresh-start effect shows that temporal landmarks can increase motivation by separating the current self from a past, imperfect one. Monday offers that clean boundary. It can genuinely help people begin—but it can also become attractive before any behaviour changes, because it moves the miss into an older chapter.</p><h5>All-or-nothing needs humility</h5><p>All-or-nothing responses to disrupted exercise plans have only recently received direct research attention. Early qualitative work suggests that rigid ideals can make modification feel like failure, but the evidence base is still developing. Loss aversion is a useful analogy for why a miss may loom large; it should not be presented as a proven explanation for every broken streak.</p><blockquote>The blank box is real. “The whole routine is broken” is the story built around it.</blockquote><p><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC4159987/" target="_blank" rel="noreferrer">Review: the neural basis of monitoring goal progress ↗</a><br /><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC4839284/" target="_blank" rel="noreferrer">Study: temporal landmarks and fresh starts ↗</a><br /><a href="https://pubmed.ncbi.nlm.nih.gov/41420223/" target="_blank" rel="noreferrer">Qualitative study: all-or-nothing exercise thinking ↗</a></p>`,
  },
  10: {
    title: "Why uncertainty grows with the importance of the bond",
    body: `<p>Attachment theory treats certain close relationships as sources of security, comfort, and help with regulating distress. Reviews of close-relationship neuroscience suggest that representations of close others involve distributed systems related to reward, salience, social cognition, and emotion regulation. There is no single attachment spot in the brain.</p><h5>Conflict changes the stakes</h5><p>Relationship conflict can activate attachment-related concerns, but people respond differently. Some pursue reassurance; others reduce emotional exposure, redirect attention, or withdraw. Staying with logistics may keep the interaction predictable even while the underlying distance remains.</p><h5>Avoidance is not a diagnosis</h5><p>One quiet dinner cannot reveal an attachment style. Patterns such as demand-withdrawal are studied across repeated interactions, and both partners shape what happens. The useful observation here is smaller: not naming distance removes the immediate risk of conflict or an unwanted answer.</p><blockquote>The sentence risks disturbing the evening because the relationship matters beyond the evening.</blockquote><p><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC6399606/" target="_blank" rel="noreferrer">Review: neural representation of close others ↗</a><br /><a href="https://pubmed.ncbi.nlm.nih.gov/28813296/" target="_blank" rel="noreferrer">Review: couple conflict through attachment theory ↗</a><br /><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC4845754/" target="_blank" rel="noreferrer">Review: attachment, stress, and romantic relationships ↗</a></p>`,
  },
  11: {
    title: "Why accumulated stress lends its force to the next demand",
    body: `<p>Stress is not only a feeling. Brain–body systems adjust attention, energy, cardiovascular activity, and behaviour to meet demands. This mobilization can be useful in the short term. The difficulty comes when one demand follows another without enough recovery for the system to settle.</p><h5>Flexibility becomes harder</h5><p>Acute stress can affect working memory, cognitive flexibility, goal-directed behaviour, and deliberate emotion regulation. These effects vary with timing, intensity, controllability, and the person. They do not mean that the “rational brain switches off,” but they can make a fast, habitual response easier to reach than a proportionate one.</p><h5>Do not misuse allostatic load</h5><p>Allostatic load refers to cumulative wear across repeated or chronic activation and is studied through longer-term patterns and biological measures. One difficult day is not a diagnosis of allostatic load. Here, “load” is the ordinary fact that the final question arrived after many unresolved demands.</p><blockquote>The question supplied the final cue. The day supplied the intensity.</blockquote><p><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC4268774/" target="_blank" rel="noreferrer">Review: acute stress and cognitive emotion regulation ↗</a><br /><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC8725649/" target="_blank" rel="noreferrer">Review: brain–body responses to chronic stress ↗</a><br /><a href="https://pubmed.ncbi.nlm.nih.gov/39909150/" target="_blank" rel="noreferrer">Systematic review: stress hormones and emotion regulation ↗</a></p>`,
  },
  12: {
    title: "Why unfinished intentions keep returning to attention",
    body: `<p>When we commit to something, related cues receive greater priority in attention and memory. An unanswered email or unbooked appointment can therefore return without being deliberately summoned. Research does not support the popular claim that every unfinished task is automatically remembered better; what reliably matters is whether the goal remains active, relevant, and without a sufficient ending.</p><h5>Modern life rarely supplies an ending</h5><p>For much of human life, keeping an unmet need available—food to find, shelter to repair, someone to return to—made forgetting costly. The same useful tendency now meets dozens of abstract obligations that can remain open for days. The clock says Sunday afternoon; none of those intentions has received a clear “later.”</p><h5>Closure has several substitutes</h5><p>Doing one task creates progress. Writing everything down creates a trusted place to return. Scrolling can displace the thoughts without resolving them. Studies find that unfinished work is associated with poorer psychological detachment, while deliberate planning can reduce unfinished tasks and rumination. Rest is easier when attention no longer has to keep rehearsing the reminder.</p><blockquote>Your body found the sofa. Your attention was still keeping the promises.</blockquote><p><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC3708449/" target="_blank" rel="noreferrer">Review: goals guide attention and thought ↗</a><br /><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC5751022/" target="_blank" rel="noreferrer">Diary study: unfinished tasks and recovery ↗</a><br /><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC10952538/" target="_blank" rel="noreferrer">Field experiment: planning, unfinished tasks, and rumination ↗</a></p>`,
  },
  13: {
    title: "Why social ambiguity keeps demanding an answer",
    body: `<p>A delayed reply, altered tone, or brief expression can support many explanations. Because the cue is incomplete, the brain has to interpret it. Research on interpretation bias shows that mood and anxiety can influence which meaning ambiguity receives; the replay is not a neutral recording of what happened.</p><h5>Social information carries unusual weight</h5><p>Humans have long depended on other people for cooperation, care, information, and belonging. Sensitivity to a possible change in how we are regarded is therefore useful. In modern conversations, however, a half-second pause can remain available for analysis long after the relationship itself has moved on.</p><h5>Replay feels like investigation</h5><p>Researchers call repeated review after a social encounter post-event processing. It is strongly associated with social-anxiety symptoms, but replaying one conversation does not imply a disorder. The crucial limit is informational: repetition can strengthen a negative interpretation or memory without adding evidence about what the other person meant.</p><blockquote>The mind can produce another explanation. It cannot produce the missing answer.</blockquote><p><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC11018455/" target="_blank" rel="noreferrer">Systematic review and meta-analysis: post-event rumination ↗</a><br /><a href="https://pubmed.ncbi.nlm.nih.gov/27019398/" target="_blank" rel="noreferrer">Review: interpretation of ambiguity in emotional disorders ↗</a><br /><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC2927639/" target="_blank" rel="noreferrer">Study: post-event processing and memory bias ↗</a></p>`,
  },
  14: {
    title: "Why sleep duration is not restoration",
    body: `<p>Researchers describe sleep health across several dimensions: duration, continuity, timing, regularity, satisfaction, and alertness during the day. Nearly eight hours describes quantity. It cannot tell you how continuous the sleep was, where it fell in your circadian rhythm, or whether it met your individual need.</p><h5>Waking is a transition</h5><p>Reduced alertness and impaired performance immediately after waking are known as sleep inertia. Its strength varies with prior sleep, biological timing, and other conditions, and it usually dissipates with time awake. A heavy first minute therefore does not necessarily describe the entire day—or prove that the night failed.</p><h5>The feeling has many possible causes</h5><p>Fatigue can reflect sleep, stress, illness, medication, mood, workload, or other factors. One morning cannot identify which. If tiredness is persistent, marked, or concerning, it deserves proper medical attention rather than endless routine optimization. The useful insight in this moment is narrower: the discrepancy between “7 h 58 m” and “still tired” creates uncertainty, and uncertainty invites a fast attempt to explain, override, or fix the body.</p><blockquote>The clock measured the night. It did not issue a verdict on how you must feel.</blockquote><p><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC3902880/" target="_blank" rel="noreferrer">Review: the dimensions of sleep health ↗</a><br /><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC6710480/" target="_blank" rel="noreferrer">Review: sleep inertia and waking alertness ↗</a><br /><a href="https://pubmed.ncbi.nlm.nih.gov/33054339/" target="_blank" rel="noreferrer">Systematic review: sleep timing, regularity, and health ↗</a></p>`,
  },
  15: {
    title: "Why guilt leads to another perfect plan",
    body: `<p>Procrastination is not explained by emotion regulation alone, but research consistently links delay with task aversion, negative emotion, and attempts to feel better in the short term. The feed removes contact with the difficult task now; the cost is transferred to the future self.</p><h5>Guilt changes the target</h5><p>At the end of the day, attention can move from a specific behaviour—“I avoided beginning”—to a global judgment—“something is wrong with me.” Self-attack feels like accountability because it makes the failure emotionally expensive. Yet greater distress can make the next encounter with the task more aversive, recreating the condition that favoured escape.</p><h5>A perfect tomorrow offers immediate repair</h5><p>A strict new plan restores order, hope, and a preferred image of the self before any action occurs. That relief is real, but it can substitute for examining the friction that made today difficult. Evidence links self-forgiveness and adaptive emotion regulation with less subsequent procrastination; this does not mean excusing the behaviour, but preserving enough psychological room to respond differently.</p><blockquote>Punishment explains the pain. A smaller next step changes the loop.</blockquote><p><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC7671960/" target="_blank" rel="noreferrer">Study: emotion-regulation difficulties and procrastination ↗</a><br /><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC10049005/" target="_blank" rel="noreferrer">Conceptual review: procrastination, stress, and context ↗</a><br /><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC5846767/" target="_blank" rel="noreferrer">Research review: self-forgiveness and forward movement ↗</a></p>`,
  },
};

const optionLabelRevisions: Partial<Record<number, string[]>> = {
  1: [
    "I answer the email at the top. Then the next one. Twenty minutes disappear.",
    "I read one email, then open chat to ask a colleague about it. Three messages are waiting there too.",
    "I go back to the report, fix a few typos, and make the page look cleaner.",
    "I go back to the report, stare at the cursor, then reopen the inbox.",
    "I close the inbox before replying and type one rough opening line.",
  ],
  2: [
    "I zoom in on the keys, then catch myself counting how far behind I am.",
    "I open her profile and scroll back through the milestones I missed.",
    "I put my phone down, but my own life suddenly feels smaller than it did at dinner.",
    "I keep scrolling and start noticing everyone else who seems further ahead.",
    "I tap like, put the phone down, and go back to clearing the plates.",
  ],
  3: [
    "I watch the reel that is already playing. Then I swipe to the next one.",
    "I send one reel to a friend and stay to see what appears next.",
    "I save a productivity video, then keep scrolling instead of opening the laptop.",
    "I lock the phone, stare at the dim screen, then unlock it again a minute later.",
    "I lock the phone mid-reel and put it on the other side of the room.",
  ],
  5: [
    "I delete the draft. Better to wait until I have a real reason to message.",
    "I rewrite the opening three times, then leave the new version sitting unsent.",
    "I open their profile to work out whether they would even want to hear from me.",
    "I leave it there. I will send something when my own life feels more worth sharing.",
    "I leave the message simple and press Send before I rewrite it again.",
  ],
  8: [
    "I unlock my phone. The shoes can wait until tomorrow.",
    "I give myself ten minutes to recover and look up when dinner is nearly due.",
    "I search for a shorter workout, then keep comparing videos without choosing one.",
    "I move the shoes out of sight so they stop reminding me.",
    "I change into the shoes and tell myself I can stop after five minutes.",
  ],
  9: [
    "There it is. I have broken it already. I may as well restart on Monday.",
    "The routine was not strict enough. I need clearer times and stronger rules.",
    "I turn the page. I do not want to keep looking at the broken row.",
    "This always happens. I can begin things; I just cannot make them stick.",
    "I leave yesterday blank and do this morning's stretch.",
  ],
  10: [
    "I swallow the words and ask whether we need anything else from the shop.",
    "I clear the plates and keep the conversation safely on the weekend plans.",
    "I ask, “Everything okay?” in a tone that makes “yes” the easiest answer.",
    "I reach for my phone and let the opening pass.",
    "I say, “I have missed us lately,” and wait.",
  ],
  11: [
    "I snap, “Can everyone stop asking me for things for five minutes?”",
    "I answer far more sharply than the question deserves, then see their face change.",
    "I keep chopping in silence while the anger runs through the conversation in my head.",
    "I leave the kitchen before I say the thing already forming in my mouth.",
    "I put the knife down. “I am overloaded. Give me a minute.”",
  ],
  12: [
    "I put the book down and answer the email so I can earn the rest.",
    "I open my notes and capture every unfinished thing I can remember.",
    "I keep holding the book while mentally arranging the rest of the afternoon.",
    "I pick up my phone and scroll until the list in my head goes quiet for a while.",
    "I read the sentence again, even with the list still running in the background.",
  ],
  13: [
    "I replay the pause and decide I must have said something wrong.",
    "I run through my exact words, changing the tone each time.",
    "I rinse, reach for my phone, and start drafting, “Are we okay?”",
    "I promise myself I will talk less the next time I see them.",
    "I tell myself, “I do not know what that pause meant,” and finish brushing my teeth.",
  ],
  14: [
    "I stay under the covers, angry that doing everything right still did not work.",
    "I reach for my phone and scroll while I wait to feel awake enough to move.",
    "I force myself up, make the strongest coffee I can, and push into the day.",
    "I search for another sleep routine that might finally fix this.",
    "I sit up, put both feet on the floor, and start more slowly than I planned.",
  ],
  15: [
    "I stare at the plan and ask myself how I managed to waste another whole day.",
    "I make tomorrow's plan stricter before I go to bed.",
    "I pick the phone back up because the day already feels ruined.",
    "I turn away from the plan and leave the gym bag where it is.",
    "I put the phone on its charger and write down one thing to begin after breakfast.",
  ],
};

const scenarioRevisions: Partial<Record<number, ScenarioRevision>> = {
  3: {
    text: "Saturday afternoon. You have finally sat down with your laptop to work on something you have been putting off all week. Your phone is beside you. You pick it up to check one message. Instagram opens where you left it. One reel becomes another. When you glance up, forty minutes have passed and the laptop screen has gone dim. A quiet thought says, put the phone down. However the next video has already started. What happens next?",
    scene: [
      "Saturday afternoon. You have finally sat down with your laptop to work on something you have been putting off all week.",
      "Your phone is beside you. You pick it up to check one message. Instagram opens where you left it. One reel becomes another.",
      "When you glance up, forty minutes have passed and the laptop screen has gone dim.",
      "A quiet thought says, put the phone down. However the next video has already started.",
    ],
    prompt: "What happens next?",
    cavemanLabels: [
      "Okay, one more. I’ll stop after this one.",
      "I’ve had a long week. Maybe I just need this before I can focus.",
      "I save a video about productivity and tell myself at least this is useful.",
      "I close Instagram, stare at the laptop, and open it again a few minutes later.",
    ],
    modernLabel: "I lock the phone, move it away from me, and return to the laptop.",
  },
  5: {
    text: "Sunday evening. An old friend crosses your mind, and you open the chat you have not touched in more than a year. The last exchange ends with: We should catch up soon. You type, Hey, it has been ages. At first, the message feels simple. Then the year of silence seems to enter the chat with you. Why now? What do you even have to say? Your thumb hovers over Send. What do you do next?",
    scene: [
      "Sunday evening. An old friend crosses your mind, and you open the chat you have not touched in more than a year.",
      "The last exchange ends with: “We should catch up soon.” You type, “Hey, it has been ages.”",
      "At first, the message feels simple. Then the year of silence seems to enter the chat with you. Why now? What do you even have to say?",
      "Your thumb hovers over Send.",
    ],
    prompt: "What do you do next?",
    cavemanLabels: [
      "I delete the draft. Better to wait until I have a real reason to message.",
      "I rewrite the opening three times, then leave the new version sitting unsent.",
      "I open their profile to work out whether they would even want to hear from me.",
      "I leave it there. I will send something when my own life feels more worth sharing.",
    ],
    modernLabel: "I read the simple message once, let it feel awkward, and press Send.",
  },
  8: {
    text: "It is 6:20 in the evening. Your keys hit the table. The exercise shoes you left by the door that morning are exactly where you put them. The plan was half an hour of movement before dinner. You sit down for one minute first. The day seems to arrive in your body all at once. Your phone is already in your hand. What happens next?",
    scene: [
      "It is 6:20 in the evening. Your keys hit the table. The exercise shoes you left by the door that morning are exactly where you put them.",
      "The plan was to change and move for half an hour before dinner.",
      "You sit down for one minute first. The day seems to arrive in your body all at once. Your phone is already in your hand.",
    ],
    prompt: "What happens next?",
    cavemanLabels: [
      "I unlock my phone. The shoes can wait until tomorrow.",
      "I give myself ten minutes to recover and look up when dinner is nearly due.",
      "I search for a shorter workout, then keep comparing videos without choosing one.",
      "I move the shoes out of sight so they stop reminding me.",
    ],
    modernLabel: "I put the phone down, change my shoes, and begin with five minutes.",
  },
  9: {
    text: "Thursday morning. The notebook beside your bed is open to a new routine: wake up, stretch, journal, begin properly. Monday, Tuesday, Wednesday—three neat checks. Yesterday began with an early meeting, and the fourth box is empty. Nothing else on the page has changed. Still, your eyes go straight to the gap. What thought arrives first?",
    scene: [
      "Thursday morning. The notebook beside your bed is open to a new routine: wake up, stretch, journal, begin properly.",
      "Monday, Tuesday, Wednesday—three neat checks. Yesterday began with an early meeting, and the fourth box is empty.",
      "Nothing else on the page has changed. Still, your eyes go straight to the gap.",
    ],
    prompt: "What thought arrives first?",
    cavemanLabels: [
      "There it is. I have broken it already. I may as well restart on Monday.",
      "The routine was not strict enough. I need clearer times and stronger rules.",
      "I turn the page. I do not want to keep looking at the broken row.",
      "This always happens. I can begin things; I just cannot make them stick.",
    ],
    modernLabel: "I leave the box empty and continue with this morning's routine.",
  },
  10: {
    text: "Friday night. Dinner is getting cold while you and your partner work through groceries, bills, and what needs doing this weekend. There was a time when the two of you could talk for hours without needing a subject. Lately, anything more personal seems to tighten the room, so the conversation returns to logistics. The words I miss us rise to the back of your throat. What happens next?",
    scene: [
      "Friday night. Dinner is getting cold while you and your partner work through groceries, bills, and what needs doing this weekend.",
      "There was a time when the two of you could talk for hours without needing a subject.",
      "Lately, anything more personal seems to tighten the room, so the conversation returns to logistics.",
      "The words “I miss us” rise to the back of your throat.",
    ],
    prompt: "What happens next?",
    cavemanLabels: [
      "I swallow the words and ask whether we need anything else from the shop.",
      "I clear the plates and keep the conversation safely on the weekend plans.",
      "I ask, “Everything okay?” in a tone that makes “yes” the easiest answer.",
      "I reach for my phone and let the opening pass.",
    ],
    modernLabel: "I say, “I miss us. Can we talk about how distant this has felt?”",
  },
  11: {
    text: "It is 8:07 PM. The day has been one long chain of calls, messages, deadlines, and small things left unfinished. You are chopping vegetables in the kitchen when someone at home asks, Did you remember to send that thing? It is an ordinary question. Your grip tightens around the knife. Your shoulders rise. The answer reaches your mouth before the rest of the room comes back into focus. What happens next?",
    scene: [
      "It is 8:07 PM. The day has been one long chain of calls, messages, deadlines, and small things left unfinished.",
      "You are chopping vegetables in the kitchen when someone at home asks, “Did you remember to send that thing?”",
      "It is an ordinary question. Your grip tightens around the knife. Your shoulders rise.",
      "The answer reaches your mouth before the rest of the room comes back into focus.",
    ],
    prompt: "What happens next?",
    cavemanLabels: [
      "I snap, “Can everyone stop asking me for things for five minutes?”",
      "I answer far more sharply than the question deserves, then see their face change.",
      "I keep chopping in silence while the anger runs through the conversation in my head.",
      "I leave the kitchen before I say the thing already forming in my mouth.",
    ],
    modernLabel: "I put the knife down and say, “I am overloaded. Give me a minute.”",
  },
  12: {
    text: "Sunday afternoon. For once, there is nowhere you need to be. You are stretched out on the sofa with a book open and your phone face down beside you. Two pages in, the unanswered email appears in your mind. Then the bill. Then the appointment you still have not booked. None of them is urgent. Each arrives with the small pressure of something that must not be forgotten. Your body is on the sofa. The rest of you is back inside the list. What happens next?",
    scene: [
      "Sunday afternoon. For once, there is nowhere you need to be. You are stretched out on the sofa with a book open and your phone face down beside you.",
      "Two pages in, the unanswered email appears in your mind. Then the bill. Then the appointment you still have not booked.",
      "None of them is urgent. Each arrives with the small pressure of something that must not be forgotten.",
      "Your body is on the sofa. The rest of you is back inside the list.",
    ],
    prompt: "What happens next?",
    cavemanLabels: [
      "I put the book down and answer the email so I can earn the rest.",
      "I open my notes and capture every unfinished thing I can remember.",
      "I keep holding the book while mentally arranging the rest of the afternoon.",
      "I pick up my phone and scroll until the list in my head goes quiet for a while.",
    ],
    modernLabel: "I leave the phone face down and return to the sentence in front of me.",
  },
  13: {
    text: "You are brushing your teeth before bed when a conversation from earlier returns. You had made a joke. The other person paused for half a second, then said, Fine. At the time, the moment passed. Now you can see their face again. Nothing new has happened. Still, each replay seems to reveal another possible meaning in the pause. What happens inside your head next?",
    scene: [
      "You are brushing your teeth before bed when a conversation from earlier returns.",
      "You had made a joke. The other person paused for half a second, then said, “Fine.” At the time, the moment passed.",
      "Now you can see their face again. Nothing new has happened.",
      "Still, each replay seems to reveal another possible meaning in the pause.",
    ],
    prompt: "What happens inside your head next?",
    cavemanLabels: [
      "I replay the pause and become increasingly certain that I said something wrong.",
      "I run through my exact words, changing their tone each time.",
      "I rinse, reach for my phone, and begin drafting, “Are we okay?”",
      "I decide I should say less the next time I see them.",
    ],
    modernLabel: "I notice the replay, admit I do not know what the pause meant, and leave it unanswered.",
  },
  14: {
    text: "Saturday morning. You went to bed early on purpose. The phone stayed away, the room was dark, and the sleep tracker says 7 hours 58 minutes. Still, when you open your eyes, your body feels heavy and your head already feels full. The number says you rested. Your body has not agreed. Before your feet reach the floor, the morning has become a problem: why did it not work? What happens next?",
    scene: [
      "Saturday morning. You went to bed early on purpose. The phone stayed away, the room was dark, and the sleep tracker says 7 hours 58 minutes.",
      "Still, when you open your eyes, your body feels heavy and your head already feels full.",
      "The number says you rested. Your body has not agreed.",
      "Before your feet reach the floor, the morning has become a problem: why did it not work?",
    ],
    prompt: "What happens next?",
    cavemanLabels: [
      "I stay under the covers, angry that doing everything right still did not work.",
      "I reach for my phone and scroll while I wait to feel awake enough to move.",
      "I force myself up, make the strongest coffee I can, and push into the day.",
      "I search for another sleep routine that might finally fix this.",
    ],
    modernLabel: "I get up slowly and make the morning gentler without turning it into a failure.",
  },
  15: {
    text: "It is 11:47 PM. The plan you printed this morning is still taped above the desk. The gym bag is untouched. One random video became another, and most of the day disappeared with the phone in your hand. Now the stimulation has gone quiet. The distance between the day you planned and the day you lived collapses into one verdict: I wasted it. Tomorrow immediately begins assembling itself—earlier, stricter, perfect. What happens inside you next?",
    scene: [
      "It is 11:47 PM. The plan you printed this morning is still taped above the desk. The gym bag is untouched.",
      "One random video became another, and most of the day disappeared with the phone in your hand.",
      "Now the stimulation has gone quiet. The distance between the day you planned and the day you lived collapses into one verdict: “I wasted it.”",
      "Tomorrow immediately begins assembling itself—earlier, stricter, perfect.",
    ],
    prompt: "What happens inside you next?",
    cavemanLabels: [
      "I stare at the plan and ask myself how I managed to waste another whole day.",
      "I make tomorrow’s plan stricter before I go to bed.",
      "I pick the phone back up because the day already feels ruined.",
      "I turn away from the plan and leave the gym bag where it is.",
    ],
    modernLabel: "I put the phone down, let today end, and choose one small start for tomorrow.",
  },
};

const reflectionRevisions: Partial<Record<number, ReflectionRevision>> = {
  1: {
    protective: taskAvoidanceReflection,
    grounded: taskEngagementReflection,
  },
  2: {
    protective: `
      <p><strong>“Comparison is the thief of joy.”</strong></p>
      <p>So the usual advice is simple: stop measuring your life against someone else’s. Be grateful. Stay in your own lane.</p>
      <p>Useful advice. But it does not explain why another person’s milestone can feel personal before you have had time to think it through.</p>
      <p>In a small group, where you stood could affect influence, opportunity, access to resources, and who stood beside you when life became difficult. Other people’s movement carried information about your own place.</p>
      <p>That sensitivity is still part of the system. Only now it meets a polished photograph, stripped of almost everything except the milestone.</p>
      <blockquote>You see her new house. The old social-ranking system registers movement, and for a moment, your own place feels less certain.</blockquote>
    `,
    grounded: `
      <p><strong>The social map was still there.</strong></p>
      <p>A familiar person had reached a visible milestone. The comparison was easy to make, and the old sensitivity to relative position had not disappeared.</p>
      <p>But tapping like and moving on kept one important boundary intact: her new house was news about her life, not a measurement of your own.</p>
      <blockquote>The comparison was available. It did not have to become a verdict.</blockquote>
    `,
  },
  3: {
    protective: `
      <p><strong>Put the phone down.</strong></p>
      <p>Block the app. Set a timer. Have enough self-control to return to what matters.</p>
      <p>Good advice. But the next reel is not competing fairly with the dim laptop beside you.</p>
      <p>In a changing environment, new information deserved attention. A movement, a sound, or a shift in the group might reveal danger, food, opportunity, or something worth knowing. Automatic processing still gives unusual priority to what is new.</p>
      <p>A feed turns that sensitivity into an endless surface. Every swipe brings a fresh face, sound, joke, threat, or social signal. There is no natural end—only another piece of information already arriving.</p>
      <p>The work asks you to stay with uncertainty and wait for its reward. The feed replaces uncertainty every few seconds and rewards the smallest possible movement.</p>
      <blockquote>You are not choosing forty minutes of scrolling. You are choosing the next few seconds—again and again.</blockquote>
    `,
    grounded: `
      <p><strong>The next reel had already begun.</strong></p>
      <p>It still had the easier offer: novelty now, no effort required. The laptop still asked you to cross the uncomfortable space between opening the work and feeling rewarded by it.</p>
      <p>You did not suddenly want the work more. You moved the source of novelty out of reach, so it could no longer replace itself every few seconds.</p>
      <blockquote>You did not defeat the whole feed. You stopped it from making the next choice for you.</blockquote>
    `,
  },
  5: {
    protective: `
      <p><strong>Just send the message.</strong></p>
      <p>If you miss someone, reach out. Stop making it complicated.</p>
      <p>Good advice. But after a year of silence, this is no longer only a message. It is a small test of whether your old place in the relationship still exists.</p>
      <p>For most of human history, bonds were practical as well as emotional. The people around you shared food, knowledge, care, and resources. Losing a place in the group—or discovering that a bond had weakened—could carry real consequences. Automatic processing still gives social uncertainty unusual weight.</p>
      <p>The modern message is harmless. The answer is uncertain. Deleting the draft keeps the friendship possible without forcing that uncertainty to resolve.</p>
      <blockquote>The words are simple. What the reply might reveal about where you belong is not.</blockquote>
    `,
    grounded: `
      <p><strong>The awkwardness came with you to Send.</strong></p>
      <p>The year of silence was still there. So was the unanswered question of how the message would be received.</p>
      <p>Pressing Send did not make the bond safe or guarantee a reply. It ended the smaller loop in which uncertainty kept producing another rewrite, another check, and another reason to wait.</p>
      <blockquote>You did not need certainty that you still belonged. You allowed the relationship to answer for itself.</blockquote>
    `,
  },
  8: {
    protective: `
      <p><strong>At 6:20, the advice is obvious.</strong></p>
      <p>Do not wait for motivation. Change your shoes and get moving. You never regret a workout.</p>
      <p>The plan makes perfect sense—except the version of you who made it imagined the benefit. The version sitting by the door is meeting the cost.</p>
      <p>For most of human history, movement usually answered something immediate: find food, carry water, reach shelter, follow the group. Energy spent had a visible reason. Exercise asks you to spend it now for health, strength, or mood that mostly arrives later.</p>
      <p>That mismatch changes the next response. The phone offers relief without another demand. The shoes ask an already tired body to pay first.</p>
      <blockquote>Your future self receives the benefit. Your present body receives the bill.</blockquote>
    `,
    grounded: `
      <p><strong>The phone was still easier than the shoes.</strong></p>
      <p>The day had not become lighter. The reward from exercise was still later, and the effort still had to begin now.</p>
      <p>Five minutes changed the price of entry. You were no longer asking a tired body to agree to an entire workout—only to change shoes and begin moving.</p>
      <p>Once movement started, it could produce information the plan could not: how your body actually felt after the first minute.</p>
      <blockquote>You did not manufacture more motivation. You made the first cost small enough to pay.</blockquote>
    `,
  },
  9: {
    protective: `
      <p><strong>One empty box should be easy to ignore.</strong></p>
      <p>Yesterday happened. Continue today. Never miss twice.</p>
      <p>Yet your eyes keep finding the gap, because it has already changed what the page means.</p>
      <p>Automatic processing gives priority to breaks in a pattern. In less predictable environments, noticing that something had changed—a route, a food source, the weather, another person's behaviour—could matter more than noticing that three days had stayed the same.</p>
      <p>The notebook turns that old sensitivity toward your own progress. Three checks say the plan is working. One gap introduces uncertainty. Monday offers a clean pattern again, without asking you to continue inside one that is already imperfect.</p>
      <blockquote>The routine did not break. The picture of perfect progress did.</blockquote>
    `,
    grounded: `
      <p><strong>The empty box stayed empty.</strong></p>
      <p>Continuing today did not repair the row, restore the streak, or make yesterday disappear.</p>
      <p>It created a different pattern instead: a miss can be followed by a return. The interruption no longer had to predict the ending.</p>
      <blockquote>You did not save a perfect streak. You taught the routine how to survive an imperfect day.</blockquote>
    `,
  },
  10: {
    protective: `
      <p><strong>From outside the dinner, the answer looks simple.</strong></p>
      <p>Stop avoiding the real conversation. Say what you feel before the distance grows.</p>
      <p>From inside it, “I miss us” does not only describe the bond. It tests it.</p>
      <p>For most of human history, close bonds carried care, cooperation, shared resources, and continuity. A possible change in an important bond still receives unusual weight because the answer once reached far beyond one uncomfortable dinner.</p>
      <p>Logistics preserves something familiar: the two of you are still functioning together. Naming the distance risks conflict—or confirmation that the other person feels it too.</p>
      <blockquote>Silence does not always mean the bond matters less. Sometimes the answer matters more.</blockquote>
    `,
    grounded: `
      <p><strong>The sentence did not repair the distance.</strong></p>
      <p>It made the distance shared. Until then, each person could remain inside the safer possibility that nothing needed naming.</p>
      <p>“I miss us” introduced uncertainty into the room: how your partner would hear it, whether they felt the same, and what the conversation might ask of both of you.</p>
      <p>But it also changed the problem from a private signal into something the relationship could respond to.</p>
      <blockquote>You did not make the bond secure. You let the bond become honest.</blockquote>
    `,
  },
  11: {
    protective: `
      <p><strong>The reaction looks too large for the moment.</strong></p>
      <p>It was one ordinary question. The other person did not create the day you were carrying, and they did not deserve its full force.</p>
      <p>But your body did not begin responding at 8:07.</p>
      <p>Calls, deadlines, interruptions, and unfinished demands had kept asking for readiness. Rapid mobilization can be useful when another demand requires action and costly when one demand follows another without recovery.</p>
      <p>The question arrived as one more request for something you had not finished. Its words belonged to the kitchen. The intensity behind your answer belonged to the whole day.</p>
      <blockquote>The question was one sentence. Your body answered the accumulated day.</blockquote>
    `,
    grounded: `
      <p><strong>The pressure was already in the room.</strong></p>
      <p>Putting the knife down did not remove it. Your shoulders were still raised; the unfinished thing was still unfinished; the question still needed an answer.</p>
      <p>“I am overloaded” located the intensity before it attached itself entirely to the person in front of you. “Give me a minute” delayed the answer until the room—and the relationship inside it—could come back into view.</p>
      <blockquote>You did not become calm on command. You stopped the whole day from answering through you.</blockquote>
    `,
  },
  12: {
    protective: `
      <p><strong>Nothing is asking for your attention. That is the strange part.</strong></p>
      <p>The phone is face down. The afternoon is free. The book is already open.</p>
      <p>Rest is usually presented as a simple instruction: stop working, put the list away, and be present. That changes what you are doing. It does not necessarily give an unfinished intention an ending.</p>
      <p>Still, the unfinished day keeps arriving—because stopping is something the clock can do. Feeling finished requires a different signal.</p>
      <p>Automatic processing keeps unmet needs available. Forgetting the food still to find, the shelter still to mend, or the person still waiting could once carry a real cost. An open intention earned another appearance in thought.</p>
      <p>Modern life leaves far more things open than any afternoon can close. The sofa signals that work has stopped. The unanswered email, unpaid bill, and unbooked appointment still signal: <em>do not lose this.</em></p>
      <p>Doing one, listing all three, or drowning them out in the feed each offers a quicker ending than simply resting beside them.</p>
      <blockquote>Your body found the sofa. Your attention was still keeping the promises.</blockquote>
    `,
    grounded: `
      <p><strong>The list returned. You did not have to follow it.</strong></p>
      <p>The email was still unanswered. The bill still needed paying. Returning to the sentence did not make any of that less real.</p>
      <p>It separated remembering from responding. The thought could arrive as a reminder without becoming an instruction for what this minute had to contain.</p>
      <p>Rest did not require an empty mind or a finished life. It required letting one open thing remain open while attention came back to the page.</p>
      <blockquote>The thought remained unfinished. It did not have to become the next action.</blockquote>
    `,
  },
  13: {
    protective: `
      <p><strong>The replay feels like a way to find out what happened.</strong></p>
      <p>From outside, it looks like overthinking: stop analysing the pause and move on. But moving on is difficult while the mind still treats the pause as missing social information.</p>
      <p>Slow the moment down. Examine the pause. Reconstruct your tone. There must be a detail that settles what they meant.</p>
      <p>That search follows an old social-information bias. In a life built around other people, a shift in someone’s warmth, trust, or willingness to cooperate was valuable information. An ambiguous social cue was worth another look because where you stood with others could matter far beyond one conversation.</p>
      <p>But memory is not a second camera angle. Each replay is another interpretation made with the unease you feel now. The pause supplies no new evidence, so the mind begins producing possibilities—and then reacting to the possibilities it produced.</p>
      <blockquote>The conversation ended. Your social radar was left with a signal and no meaning.</blockquote>
    `,
    grounded: `
      <p><strong>The pause remained unexplained.</strong></p>
      <p>You did not decide that everything was fine. You also did not turn uncertainty into proof that something was wrong.</p>
      <p>“I do not know” interrupted the false investigation. There was no new face to read, no new sentence to hear, and no missing fact hiding in the next replay.</p>
      <p>The relationship could provide more information later. Tonight, the half-second pause was allowed to remain only what it was: incomplete evidence.</p>
      <blockquote>You did not find a kinder answer. You stopped inventing certainty.</blockquote>
    `,
  },
  14: {
    protective: `
      <p><strong>The number and the feeling disagree.</strong></p>
      <p>Nearly eight hours should equal energy. When it does not, the mind reaches quickly for a cause: the routine failed, the body failed, or something else needs fixing.</p>
      <p>Automatic processing responds to available energy. Low energy changes what the body can afford—effort, exploration, patience, even how costly the day ahead appears. A state that affects readiness is useful to notice.</p>
      <p>What human automatic processing never had was a sleep score promising that readiness should already be here. The tracker turns one part of the night into an expectation. Waking heavy then feels less like a passing state and more like evidence that something has gone wrong.</p>
      <p>Scrolling waits for alertness without asking anything of you. Coffee overrides the signal. A new routine promises control. Each resolves the uncertainty faster than simply meeting the body you woke up in.</p>
      <blockquote>The body reports low energy. The mind turns it into a failed equation.</blockquote>
    `,
    grounded: `
      <p><strong>The heaviness came out of bed with you.</strong></p>
      <p>A gentler morning did not prove that the sleep was good, explain the fatigue, or guarantee that energy would arrive later.</p>
      <p>It kept one uncertain morning from becoming a judgment about your discipline. Instead of forcing the body to match the number, you let the number remain one piece of information and responded to the state that was actually present.</p>
      <p>If the fatigue forms a pattern, the pattern can be investigated. This morning did not need a verdict before breakfast.</p>
      <blockquote>You did not ignore the signal. You stopped demanding that it explain itself immediately.</blockquote>
    `,
  },
  15: {
    protective: `
      <p><strong>The guilt appears to be the opposite of avoidance.</strong></p>
      <p>The scrolling said, <em>not now.</em> The voice at 11:47 says, <em>this is unacceptable.</em> One escaped the standard; the other seems determined to enforce it.</p>
      <p>But both offer something immediate.</p>
      <p>The feed changed how the difficult moment felt without requiring the difficult action. Self-attack now converts a messy day into a simple cause: you lacked discipline. A perfect plan restores order just as quickly. Tonight, you can become the person who wakes early, follows every line, and finally gets it right.</p>
      <p>That imagined tomorrow relieves the distance between who you meant to be and what happened today. It does not yet change the boredom, uncertainty, effort, or discomfort that made the first step easy to avoid.</p>
      <blockquote>The feed softened the discomfort. The perfect plan softens the guilt.</blockquote>
    `,
    grounded: `
      <p><strong>Today was allowed to end without being redeemed or prosecuted.</strong></p>
      <p>Putting the phone down did not recover the hours. Choosing one small start did not transform the day into a success.</p>
      <p>It changed the level at which you responded. “I wasted the day” was a verdict about the whole self. One small start was a decision about one observable moment tomorrow.</p>
      <p>The smaller plan offered less emotional drama and less immediate redemption. It also asked tomorrow’s version of you to cross a threshold that could actually be seen.</p>
      <blockquote>You did not promise to become different overnight. You gave tomorrow somewhere honest to begin.</blockquote>
    `,
  },
};

const applyScenarioRevision = (question: ScanQuestion): ScanQuestion => {
  const revision = scenarioRevisions[question.id];
  if (!revision) return question;

  const cavemanTemplate = question.options.find((option) => option.type === "caveman");
  const modernTemplate = question.options.find((option) => option.type === "modern");
  if (!cavemanTemplate || !modernTemplate) return question;

  return {
    ...question,
    text: revision.text,
    scene: revision.scene,
    prompt: revision.prompt,
    options: [
      ...revision.cavemanLabels.map((label) => ({ ...cavemanTemplate, label })),
      { ...modernTemplate, label: revision.modernLabel },
    ],
  };
};

const applyReflectionRevision = (question: ScanQuestion): ScanQuestion => {
  const revision = reflectionRevisions[question.id];
  if (!revision) return question;

  const scenarioScience = question.options.find(
    (option) => option.science,
  )?.science;

  return {
    ...question,
    options: question.options.map((option) => ({
      ...option,
      reflection: option.type === "caveman" ? revision.protective : revision.grounded,
      science: option.science ?? scenarioScience ?? null,
    })),
  };
};

const applyScenarioPresentation = (question: ScanQuestion): ScanQuestion => ({
  ...question,
  ...scenarioPresentations[question.id],
});

const applyScenarioScience = (question: ScanQuestion): ScanQuestion => {
  const science = scenarioScienceRevisions[question.id];
  if (!science) return question;
  return {
    ...question,
    options: question.options.map((option) => ({ ...option, science })),
  };
};

const applyOptionLabels = (question: ScanQuestion): ScanQuestion => {
  const labels = optionLabelRevisions[question.id];
  if (!labels || labels.length !== question.options.length) return question;
  return {
    ...question,
    options: question.options.map((option, index) => ({
      ...option,
      label: labels[index],
    })),
  };
};

const applyEvidence = (question: ScanQuestion): ScanQuestion => ({
  ...question,
  options: question.options.map((option, index) => ({
    ...option,
    evidence: getOptionEvidence(question.id, index),
  })),
});

// Keep the grounded continuation from becoming a positional answer key.
// Evidence is attached before this display-only reorder so its authored
// scenario/option identity remains intact.
const optionDisplayOrders: Partial<Record<number, number[]>> = {
  1: [0, 4, 1, 2, 3],
  2: [0, 1, 2, 4, 3],
  3: [0, 1, 4, 2, 3],
  5: [0, 4, 1, 2, 3],
  8: [0, 1, 2, 4, 3],
  9: [0, 1, 4, 2, 3],
  10: [0, 4, 1, 2, 3],
  11: [0, 1, 2, 4, 3],
  12: [0, 1, 4, 2, 3],
  13: [0, 1, 2, 4, 3],
  14: [0, 4, 1, 2, 3],
  15: [0, 1, 4, 2, 3],
};

const applyOptionDisplayOrder = (question: ScanQuestion): ScanQuestion => {
  const order = optionDisplayOrders[question.id];
  if (!order || order.length !== question.options.length) return question;

  const reordered = order.map((index) => question.options[index]);
  return reordered.some((option) => !option)
    ? question
    : { ...question, options: reordered };
};

const activeQuestions = authoredQuestions
  .filter((question) => !removedScenarioIds.has(question.id))
  .map(applyScenarioRevision)
  .map(applyScenarioPresentation)
  .map(applyScenarioScience)
  .map(applyOptionLabels)
  .map(applyReflectionRevision)
  .map(applyEvidence)
  .map(applyOptionDisplayOrder);

const evidenceErrors = validateEvidenceMap(
  activeQuestions.map((question) => ({
    id: question.id,
    optionCount: question.options.length,
  })),
);

if (evidenceErrors.length > 0) {
  throw new Error(`Invalid Caveman Scan evidence map: ${evidenceErrors.join(" ")}`);
}

export const questionsBank = activeQuestions;
