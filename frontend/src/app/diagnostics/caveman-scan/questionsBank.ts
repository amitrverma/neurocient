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
}

export interface ScanQuestion {
  id: number;
  text: string;
  options: ScanOption[];
}

export const questionsBank: ScanQuestion[] = [
  {
    id: 1,
    text: "You’re about to start a task, but suddenly remember a less important one that feels easier to do. Do you:",
    options: [
      {
        label: "Switch to the easier task — just to get some momentum going.",
        type: "caveman",
        reflection: `
          <p><strong>The usual take?</strong></p>
          <p>You’re procrastinating.</p>
          <p>But your caveman sees ambiguity as risk.</p>
          <p>Better to use energy on something safe and familiar.</p>
        `,
          science: {
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
                  }
      },
      {
        label: "Stick with the original task, knowing the switch is just avoidance.",
        type: "modern",
        reflection: `
          <p>Most people would say: good discipline.</p>
          <p>But you overrode the caveman’s urge to avoid discomfort.</p>
          <p>That’s a quiet win.</p>
        `,
      }
    ]
  },
  {
    id: 2,
    text: "You see someone you know post an achievement. Do you:",
    options: [
      {
        label: "Feel behind or question if you’re doing enough.",
        type: "caveman",
        reflection: `
                  <p><strong>The usual take?</strong></p>
                  <p>You’re stuck in a comparison trap.</p>
                  <p>Stop measuring yourself against others.</p>
                  <p>But your caveman’s not trying to be petty — he’s trying to stay safe.</p>
                  <p>In the tribe, your rank determined access to resources, influence, even protection.</p>
                  <p>Tracking others’ wins was a survival tactic.</p>
                  <p>The trick isn’t stopping comparison — it’s noticing when it starts to steal your momentum.</p>
                `,
        science: {
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
                  }
      },
      {
        label: "Celebrate their success without comparing it to your own.",
        type: "modern",
        reflection: `
                  <p>That’s not just positivity — that’s progress.</p>
                  <p>Your caveman brain might still twitch — “Are we falling behind?” — but you didn’t follow the signal.</p>
                  <p>Someone else’s win didn’t trigger your loss reflex.</p>
                  <p>That’s a quiet upgrade to your status software.</p>
                `,
        
      }
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
  }
];
