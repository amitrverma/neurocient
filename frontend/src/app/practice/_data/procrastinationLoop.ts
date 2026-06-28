import type {
  AdviceId,
  EffectId,
  Option,
  Scene,
  SceneId,
} from "../_lib/types";

export const procrastinationScenes: Scene[] = [
  {
    id: "escape",
    title: "The task sits there, but I keep opening easier things.",
    detail:
      "A tab, a message, a small chore. Anything with a cleaner first step than the real work.",
    perspective: {
      title: "Your brain is choosing the safer door.",
      body: "The real task asks for uncertainty first. The easier thing gives a clear move and a small reward now.",
      line: "An older system inside you is built to take nearby relief before distant reward.",
    },
    identity: "I am lazy.",
    reframe:
      "I am someone who starts better when the first move is visible.",
    environment:
      "The escape is already open, closer, and more rewarding than the first useful move.",
    action:
      "Close one escape tab and leave only the task plus a blank note titled: next visible move.",
    reminder:
      "Yesterday you noticed easier things win when the first move is hidden. Is the next move visible right now?",
  },
  {
    id: "pressure",
    title: "I wait until pressure makes the decision for me.",
    detail:
      "The deadline gets close enough that panic starts doing what planning could not.",
    perspective: {
      title: "Pressure turns a vague task into a visible threat.",
      body: "Before the deadline gets close, the task can stay abstract. Once the cost is near, your brain finally treats it as real.",
      line: "The older part of the system responds faster to immediate danger than distant benefit.",
    },
    identity: "I only work under pressure.",
    reframe:
      "I am someone who can begin before pressure has to take over.",
    environment:
      "Nothing in the room asks for a start until the deadline becomes loud.",
    action:
      "Put a 10-minute start on the calendar and write what will be open when it begins.",
    reminder:
      "You noticed pressure has been acting as the cue. Can we create a smaller cue before it gets loud?",
  },
  {
    id: "planning",
    title: "I keep planning the work instead of touching the work.",
    detail:
      "The list gets cleaner. The system gets adjusted. The task itself stays untouched.",
    perspective: {
      title: "Planning feels safer than contact.",
      body: "The plan gives you order without exposing the work. The task itself brings mess, judgment, and uncertainty into the room.",
      line: "A protective part of the brain may choose control now over contact with uncertainty.",
    },
    identity: "I am someone who keeps preparing instead of beginning.",
    reframe:
      "I am someone who can begin before the plan feels perfect.",
    environment:
      "Your tools make organizing easier than beginning. The plan is visible; the first move is not.",
    action: "Write one line of the actual work before changing the plan again.",
    reminder:
      "You noticed planning can become a shelter. Have you touched the work itself yet?",
  },
  {
    id: "messy",
    title: "I avoid the first messy version because it might be bad.",
    detail:
      "The blank page is safe. The rough draft is evidence. So the task stays perfect by staying unopened.",
    perspective: {
      title: "The blank page has no evidence against you.",
      body: "A rough first version can be judged. Until it exists, the imagined version can stay safe and untouched.",
      line: "The protective move is delay: no draft, no judgment, no immediate threat.",
    },
    identity: "I am bad at finishing things.",
    reframe:
      "I am someone who can let rough work exist before judging it.",
    environment:
      "The work begins in a place that looks final, so a rough start feels more exposed than it needs to.",
    action: "Write one deliberately ugly sentence and label it: rough, not final.",
    reminder:
      "You noticed the first version needs permission to be rough. What is one ugly sentence?",
  },
  {
    id: "decision",
    title: "I delay the decision, then the decision becomes the task.",
    detail:
      "You do not start because starting first requires choosing what starting even means.",
    perspective: {
      title: "Ambiguity is being treated like danger.",
      body: "Before the work can begin, your brain is trying to choose the door, the order, the angle, or the first verb.",
      line: "When the next move is unclear, the protective move is to wait.",
    },
    identity: "I am bad at deciding.",
    reframe:
      "I am someone who can choose one small verb before the whole path is clear.",
    environment:
      "The task name is too large. It points to a project, not to an action someone could watch.",
    action:
      "Rename the task as the next physical move: open, send, draft, ask, sort, or read.",
    reminder:
      "You noticed the project name was hiding the first move. What is the verb today?",
  },
];

const adviceOptionById: Record<AdviceId, Option<AdviceId>> = {
  timer: { id: "timer", title: "I tried a timer." },
  breakdown: { id: "breakdown", title: "I broke it into smaller tasks." },
  phone: { id: "phone", title: "I put my phone away." },
  deadline: { id: "deadline", title: "I waited for deadline pressure." },
  closed_escape: { id: "closed_escape", title: "I closed the easier tabs." },
  blocked_sites: { id: "blocked_sites", title: "I blocked the usual escapes." },
  fake_deadline: { id: "fake_deadline", title: "I made an earlier deadline." },
  calendar_start: { id: "calendar_start", title: "I put a start time on the calendar." },
  better_plan: { id: "better_plan", title: "I made the plan cleaner." },
  changed_tool: { id: "changed_tool", title: "I changed the tool or system." },
  rough_draft: { id: "rough_draft", title: "I tried a rough first draft." },
  lowered_standard: { id: "lowered_standard", title: "I told myself it could be bad." },
  pros_cons: { id: "pros_cons", title: "I made a pros and cons list." },
  asked_someone: { id: "asked_someone", title: "I asked someone what to choose." },
  none: { id: "none", title: "None of these, honestly." },
};

const adviceIdsByScene: Record<SceneId, AdviceId[]> = {
  escape: ["closed_escape", "blocked_sites", "phone", "timer", "none"],
  pressure: ["fake_deadline", "calendar_start", "breakdown", "deadline", "none"],
  planning: ["better_plan", "changed_tool", "breakdown", "timer", "none"],
  messy: ["rough_draft", "lowered_standard", "timer", "breakdown", "none"],
  decision: ["pros_cons", "asked_someone", "breakdown", "deadline", "none"],
};

export const getAdviceOptionsForScene = (sceneId: SceneId): Option<AdviceId>[] =>
  adviceIdsByScene[sceneId].map((id) => adviceOptionById[id]);

export const getAdviceTitle = (id: AdviceId) => adviceOptionById[id]?.title;

export const effectOptions: Option<EffectId>[] = [
  {
    id: "worked",
    title: "It actually worked.",
    detail: "It helped you start and still feels usable.",
  },
  {
    id: "briefly",
    title: "Briefly, then the loop came back.",
    detail: "It helped once or twice, then faded.",
  },
  {
    id: "not-really",
    title: "Not really.",
    detail: "You knew the advice, but the moment did not move.",
  },
];
