import {
  getOptionEvidence,
  validateEvidenceMap,
  type ScanOptionEvidence,
} from "./scanEvidence";

export interface ScanScienceBlock {
  title: string;
  subtitle: string;
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
  prompt?: string;
  options: ScanOption[];
}

const taskAvoidanceReflection = `
  <p><strong>The usual take?</strong></p>
  <p>You’re procrastinating.</p>
  <p>But your caveman sees ambiguity as risk.</p>
  <p>Better to use energy on something safe and familiar.</p>
`;

const taskAvoidanceScience: ScanScienceBlock = {
  title: "The Survival Logic Behind Procrastination",
  subtitle: "Why your brain chooses low-effort tasks — even when you know better",
  body: `
    <h5 class="text-sm font-semibold text-dark mt-2 mb-1">Ancestral Logic</h5>
    <p>Your brain evolved to keep you alive — not to help you finish slide decks or write marketing copy.</p>
    <p>In uncertain environments, our ancestors needed to conserve energy for moments that truly mattered: escaping predators, finding food, securing shelter. So the brain developed a simple bias:</p>
    <blockquote class="italic border-l-4 border-accent text-accent pl-4 my-3">
      If something feels unfamiliar, unclear, or effortful — delay it.
    </blockquote>
    <h5 class="text-sm font-semibold text-dark mt-4 mb-1">Modern Mismatch</h5>
    <p>That bias still runs today.</p>
    <p>The problem? Most modern tasks (writing a pitch, starting a creative draft, making a tough decision) are effortful and uncertain. They don’t come with clear payoffs or immediate danger — but your brain still treats them as risky. So it offers an easier option: 'Just do this one thing first.'</p>
    <blockquote class="italic border-l-4 border-accent text-accent pl-4 my-3">
      It feels like productive multitasking.
    </blockquote>
    <p>But it’s actually energy protection dressed up as logic.</p>
    <p>In The Modern Caveman, we teach you how to spot this misfire early — and build systems that reduce the friction your brain tries so hard to avoid.</p>
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
  <p>The problem is not always that you failed to rest properly. Sometimes the protective system never received the message that it was safe to stand down.</p>
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
    text: "It is just after nine. Your coffee is still hot, your laptop is open, and the document you need to work on is sitting in front of you. You know this is the thing that matters today. You move the cursor towards it and notice seventeen unread emails in the corner of the screen. One will take less than a minute. Another only needs a quick reply. You also remember the small form you meant to submit yesterday. Nothing is especially urgent. Still, the document begins to feel heavier while everything else suddenly feels easy. What do you find yourself doing next?",
    scene: [
      "It is just after nine. Your coffee is still hot, your laptop is open, and the document you need to work on is sitting in front of you.",
      "You know this is the thing that matters today.",
      "You move the cursor towards it and notice seventeen unread emails in the corner of the screen. One will take less than a minute. Another only needs a quick reply. You also remember the small form you meant to submit yesterday.",
      "Nothing is especially urgent. Still, the document begins to feel heavier while everything else suddenly feels easy.",
    ],
    prompt: "What do you find yourself doing next?",
    options: [
      {
        label: "Let me clear these emails first. Then I’ll be able to focus properly.",
        type: "caveman",
        reflection: taskAvoidanceReflection,
        science: taskAvoidanceScience,
      },
      {
        label: "I just need one quick win before I deal with the big thing.",
        type: "caveman",
        reflection: taskAvoidanceReflection,
        science: taskAvoidanceScience,
      },
      {
        label: "Actually, I should update my task list so I know exactly what needs doing.",
        type: "caveman",
        reflection: taskAvoidanceReflection,
        science: taskAvoidanceScience,
      },
      {
        label: "I open the document, stare at it for a minute, then find myself back in my inbox.",
        type: "caveman",
        reflection: taskAvoidanceReflection,
        science: taskAvoidanceScience,
      },
      {
        label: "I leave the emails alone and begin the work I originally sat down to do.",
        type: "modern",
        reflection: `
          <p>Most people would say: good discipline.</p>
          <p>But you overrode the caveman’s urge to avoid discomfort.</p>
          <p>That’s a quiet win.</p>
        `,
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
                            <p>That’s why even during something as simple as watching a show, part of you might monitor your partner’s reactions. Your nervous system is doing its ancient job: checking, “Are we still in sync?” The stakes are no longer life-or-death, but the software hasn’t updated.</p>
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

const protectiveReflection = (
  usualTake: string,
  cavemanTake: string,
  retrievableInsight: string,
) => `
  <p><strong>The usual take?</strong></p>
  <p>${usualTake}</p>
  <p><strong>The Inner Caveman take?</strong></p>
  <p>${cavemanTake}</p>
  <blockquote>${retrievableInsight}</blockquote>
`;

const groundedReflection = (body: string, retrievableInsight: string) => `
  <p><strong>What happened here?</strong></p>
  <p>${body}</p>
  <p>This does not mean the Caveman has disappeared. In this moment, it did not need to turn the situation into something larger.</p>
  <blockquote>${retrievableInsight}</blockquote>
`;

const scenarioRevisions: Partial<Record<number, ScenarioRevision>> = {
  3: {
    text: "Saturday afternoon. You have finally sat down with your laptop to work on something you have been putting off all week. Your phone is beside you. You pick it up to check one message. Instagram opens where you left it. One reel becomes another. When you glance up, forty minutes have passed and the laptop screen has gone dim. A quiet thought says, put the phone down. The next video has already started. What happens next?",
    scene: [
      "Saturday afternoon. You have finally sat down with your laptop to work on something you have been putting off all week.",
      "Your phone is beside you. You pick it up to check one message. Instagram opens where you left it. One reel becomes another.",
      "When you glance up, forty minutes have passed and the laptop screen has gone dim.",
      "A quiet thought says, put the phone down. The next video has already started.",
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
    text: "Sunday evening. An old friend crosses your mind, and you open the chat you have not touched in more than a year. Their last message is still there. You type, Hey, it has been ages. Then you read it back. It suddenly feels awkward arriving after so much silence with nothing particularly impressive to say about your life. Your thumb hovers over Send. What do you do next?",
    scene: [
      "Sunday evening. An old friend crosses your mind, and you open the chat you have not touched in more than a year.",
      "Their last message is still there. You type, “Hey, it has been ages.” Then you read it back.",
      "It suddenly feels awkward arriving after so much silence with nothing particularly impressive to say about your life.",
      "Your thumb hovers over Send.",
    ],
    prompt: "What do you do next?",
    cavemanLabels: [
      "This is going to feel so random. I should wait until I have a reason to message.",
      "I’ll reach out when my life is a little more together and I actually have something to say.",
      "What if they have moved on and do not really want to hear from me?",
      "I close the chat and tell myself I’ll send something another day.",
    ],
    modernLabel: "I stop rewriting it and send the simple message as it is.",
  },
  8: {
    text: "It is 6:20 in the evening. You have just come home, dropped your keys on the table, and noticed the exercise shoes you left by the door that morning. The plan was to change and move for half an hour before dinner. Instead, you sit down for a minute. Your body feels heavy. Your phone is already in your hand. What happens next?",
    scene: [
      "It is 6:20 in the evening. You have just come home, dropped your keys on the table, and noticed the exercise shoes you left by the door that morning.",
      "The plan was to change and move for half an hour before dinner.",
      "Instead, you sit down for a minute. Your body feels heavy. Your phone is already in your hand.",
    ],
    prompt: "What happens next?",
    cavemanLabels: [
      "Not today. I’ll do it tomorrow when I have more energy.",
      "I’ll sit here for ten minutes first. I just need to recover from the day.",
      "Maybe I should find a shorter, better workout before I start.",
      "I keep looking at the shoes, feeling guilty, but I still do not get up.",
    ],
    modernLabel: "I put the phone down, change my shoes, and begin with five minutes.",
  },
  9: {
    text: "A new routine is written neatly on the page beside your bed: wake up, stretch, journal, begin the day properly. The first three mornings went well. Yesterday did not. This morning, you see the empty space where the fourth check mark should have been. The plan already looks broken. What do you find yourself thinking?",
    scene: [
      "A new routine is written neatly on the page beside your bed: wake up, stretch, journal, begin the day properly.",
      "The first three mornings went well. Yesterday did not.",
      "This morning, you see the empty space where the fourth check mark should have been. The plan already looks broken.",
    ],
    prompt: "What do you find yourself thinking?",
    cavemanLabels: [
      "Great. I have ruined it already. I may as well restart properly on Monday.",
      "I need a stricter plan. This one was obviously not organised enough.",
      "I avoid looking at the page again and the routine quietly disappears.",
      "This is exactly what always happens. I can never make anything stick.",
    ],
    modernLabel: "Yesterday was one missed day. I continue with the routine this morning.",
  },
};

const reflectionRevisions: Partial<Record<number, ReflectionRevision>> = {
  1: {
    protective: protectiveReflection(
      "You are procrastinating. Stop avoiding the important work and be more disciplined.",
      "The important document is unclear, effortful, and capable of exposing what you do not yet know. The inbox offers visible endings and small rewards. Your Caveman is not choosing what matters most; it is choosing what feels safest to complete right now.",
      "The easier task is not more important. It is more certain.",
    ),
    grounded: groundedReflection(
      "You noticed the pull of the smaller, clearer tasks without letting them decide what happened next. The uncertainty remained, but it did not have to be removed before you began.",
      "You began before the work felt easy.",
    ),
  },
  2: {
    protective: protectiveReflection(
      "You are stuck in a comparison trap. Stop measuring your life against other people’s.",
      "Your Caveman is not trying to be petty. It is checking where you stand. In a small social world, changes in relative position could affect influence, opportunity, and security. A modern feed gives that old monitoring system an endless view of people appearing to move ahead.",
      "Her achievement is information about her life. Your Caveman reads it as information about yours.",
    ),
    grounded: groundedReflection(
      "The post remained good news about someone else. Your attention did not need to turn it into a measurement of your own progress.",
      "Her milestone did not have to become your scoreboard.",
    ),
  },
  3: {
    protective: protectiveReflection(
      "You waste too much time on your phone. Put it away and exercise some self-control.",
      "The work asks you to enter effort, uncertainty, or discomfort. The feed asks almost nothing and delivers something new every few seconds. Your Caveman reaches for the nearest relief before the distant reward has a chance to matter.",
      "The scroll is not asking from you what the task is asking.",
    ),
    grounded: groundedReflection(
      "You caught the moment when a quick check had become an escape and changed the environment before the next reel made the decision for you.",
      "You noticed the exit while it was still available.",
    ),
  },
  5: {
    protective: protectiveReflection(
      "Stop overthinking it. If you miss your friend, just send the message.",
      "Reappearing after a long silence carries uncertainty: how you will be received, what the distance means, and whether the connection still exists. Waiting protects you from possible awkwardness or rejection now, even while it allows the relationship to become more distant.",
      "Waiting to feel ready can quietly become more distance.",
    ),
    grounded: groundedReflection(
      "You allowed the message to be simple and slightly awkward. You did not need proof that the connection was safe before making contact.",
      "Connection began before confidence arrived.",
    ),
  },
  8: {
    protective: protectiveReflection(
      "You are making excuses. If exercise mattered enough, you would find the discipline.",
      "After a demanding day, movement can register as another immediate cost. Sitting down and reaching for the phone offer energy conservation and relief now; the benefit of exercise lives later. Your Caveman naturally gives the immediate cost more weight.",
      "The plan sees a workout. Your Caveman sees another demand.",
    ),
    grounded: groundedReflection(
      "You did not demand a full-energy performance from a low-energy body. Making the beginning smaller allowed movement without pretending the tiredness was not real.",
      "Smaller made starting believable.",
    ),
  },
  9: {
    protective: protectiveReflection(
      "You lack consistency. You need a stricter routine and more accountability.",
      "The clean streak made progress feel certain. One empty space breaks that certainty, and restarting later offers the relief of a perfect beginning again. Your Caveman would rather abandon a routine that looks broken than remain inside an imperfect one.",
      "One missed day became a verdict on the whole attempt.",
    ),
    grounded: groundedReflection(
      "You treated the missed day as one event rather than evidence about who you are or whether the routine works. The rhythm could continue without becoming perfect again first.",
      "The routine survived being imperfect.",
    ),
  },
  10: {
    protective: protectiveReflection(
      "You need to communicate better. Stop avoiding the difficult conversation.",
      "Tension inside an important relationship can feel like a threat to the bond itself. Silence protects you from conflict, judgment, and the possibility of hearing something painful now. That protection works for the evening while the distance quietly grows underneath it.",
      "Avoiding the difficult moment can preserve tonight and cost the connection over time.",
    ),
    grounded: groundedReflection(
      "You allowed the importance of the bond to make the conversation worth entering, even without knowing how it would go.",
      "You chose contact over the safety of silence.",
    ),
  },
  11: {
    protective: protectiveReflection(
      "You overreacted. You need to control your temper.",
      "Your Caveman did not experience this as one small question. It had been keeping watch through every deadline, message, interruption, and unfinished demand of the day. The question was small; it landed on a system that was already braced.",
      "The final question was small. The pressure behind it was not.",
    ),
    grounded: groundedReflection(
      "You noticed that the intensity belonged to the whole day, not to the person standing in front of you. Naming the overload created a little room before it became their problem.",
      "You answered the pressure before answering the person.",
    ),
  },
  12: {
    protective: protectiveReflection(
      "You need to switch off and learn how to relax.",
      "Unfinished and unresolved things can remain open in the protective system. Your body has stopped working, but the part keeping watch has not received a clear signal that the day is over. Doing, listing, and scrolling all promise different forms of temporary closure.",
      "Your body reached the sofa before your watchfulness did.",
    ),
    grounded: groundedReflection(
      "The unfinished things remained real, but they did not all need to be solved inside this hour. You allowed rest to exist before complete closure.",
      "Not everything had to be finished for this moment to be restful.",
    ),
  },
  13: {
    protective: protectiveReflection(
      "You are overthinking. Stop replaying it and move on.",
      "Your Caveman may be reviewing the conversation for signs of judgment, rejection, or a change in where you stand. Replaying feels useful because one more review might uncover the detail that keeps you socially safe.",
      "The conversation ended. The social watch did not.",
    ),
    grounded: groundedReflection(
      "You noticed the mind asking for certainty that the conversation could not provide. The pause was allowed to remain unexplained instead of becoming evidence against you.",
      "A pause stayed a pause, not a verdict.",
    ),
  },
  14: {
    protective: protectiveReflection(
      "You need more sleep, a better routine, or more discipline with your rest.",
      "Fatigue can have many causes. But when pressure and watchfulness are part of the picture, time in bed does not always create a felt sense of rest. The body may stop while the protective system continues carrying unfinished demands into the night.",
      "Hours away from work are not always hours free from watchfulness.",
    ),
    grounded: groundedReflection(
      "You did not turn low energy into another personal failure or another performance problem to solve immediately. You responded to the morning you actually had.",
      "Gentleness did not require an explanation first.",
    ),
  },
  15: {
    protective: protectiveReflection(
      "You wasted the day. You need more discipline and a plan you will finally follow.",
      "Your Caveman spent the day choosing the nearest relief over the discomfort of beginning. Now guilt makes the unfinished life feel even more threatening, so another perfect plan—or another hour of escape—feels safer than looking directly at what happened.",
      "The loop offers relief first and self-blame afterwards.",
    ),
    grounded: groundedReflection(
      "You allowed the day to end without turning it into a judgment on your character or a demand for total reinvention tomorrow. One small beginning remained enough.",
      "A lost day did not have to become a lost week.",
    ),
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

  return {
    ...question,
    options: question.options.map((option) => ({
      ...option,
      reflection: option.type === "caveman" ? revision.protective : revision.grounded,
      science: null,
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

const activeQuestions = authoredQuestions
  .filter((question) => !removedScenarioIds.has(question.id))
  .map(applyScenarioRevision)
  .map(applyReflectionRevision)
  .map(applyEvidence);

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
