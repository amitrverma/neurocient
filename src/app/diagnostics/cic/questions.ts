
// questions.js
// Contains all diagnostic questions and their answer options

export interface DiagnosticQuestion {
  id: string;                        // e.g. "q1"
  title: string;                     // Short header
  question: string;                  // Full question text
  options: Record<string, string>;   // { A: "Option text", B: "..." }
}

export const diagnosticQuestions: DiagnosticQuestion[] = [
  {
    id: "q1",
    title: "Planning Problem",
    question: "Do projects in your team often take longer than expected - even when everyone tries to plan better? What feels like the real reason?",
    options: {
      A: "We assume things will go smoothly.",
      B: "We accept timelines to avoid conflict.",
      C: "We avoid asking for more time.",
      D: "We confuse activity with readiness.",
      E: "No - we generally complete projects on time."
    }
  },
  {
    id: "q2",
    title: "Communication Clarity",
    question: "Have you seen work go off track - even though the communication seemed clear at the time? What do you think causes that kind of disconnect?",
    options: {
      A: "We assume people 'get it' without checking for shared understanding.",
      B: "Misunderstandings surface only after the work begins.",
      C: "People avoid asking for clarification in group settings.",
      D: "We rely more on documents and messages than real conversations.",
      E: "No - communication in our team is usually clear and well-aligned."
    }
  },
  {
    id: "q3",
    title: "Accountability & Ownership",
    question: "Have you seen work fall through the cracks - even though it seemed like someone was handling it? What do you think causes that?",
    options: {
      A: "No one explicitly owned it—so everyone assumed someone else would.",
      B: "Ownership was implied, but never really agreed upon.",
      C: "People feared taking charge—it might backfire if it went wrong.",
      D: "We prioritize our own tasks—even if shared work slips.",
      E: "No - that kind of confusion rarely happens in our team."
    }
  },
  {
    id: "q4",
    title: "Burnout Patterns",
    question: "Have you noticed people staying “on” all the time - but showing signs of wear beneath the surface? What do you think keeps them pushing through?",
    options: {
      A: "Taking a break feels like falling behind.",
      B: "We celebrate endurance more than recovery.",
      C: "People fear being seen as less committed.",
      D: "There's no real space to pause without guilt.",
      E: "No - people in our team manage their energy well."
    }
  },
  {
    id: "q5",
    title: "Change Resistance",
    question: "Have you seen teams adopt a new tool, process, or behavior - only to quietly slip back into the old way? What do you think drives that return?",
    options: {
      A: "The new way adds friction without clear benefit.",
      B: "People wait to see if the change will actually stick.",
      C: "Old habits resurface when pressure ramps up.",
      D: "No one follows up—so we naturally revert.",
      E: "No - we usually sustain changes we commit to."
    }
  },
  {
    id: "q6",
    title: "Collaboration Dynamics",
    question: "Have you seen teams that seem collaborative - yet certain voices dominate while others hold back? What do you think causes that imbalance?",
    options: {
      A: "People defer to status or experience, even when they disagree.",
      B: "Some team members are louder—or more comfortable claiming space.",
      C: "We avoid conflict, so dissent gets softened or left unsaid.",
      D: "Unspoken alliances shape whose ideas get traction.",
      E: "No - our team is genuinely inclusive and balanced in discussions."
    }
  },
  {
    id: "q7",
    title: "Decision-Making",
    question: "Have you seen decisions that seemed quick and aligned - but later felt flawed or hard to challenge? What do you think contributes to that pattern?",
    options: {
      A: "Decisions tend to reflect the opinion of the most senior person.",
      B: "People hesitate to challenge decisions, especially from leadership.",
      C: "We rarely revisit decisions, even when new information emerges.",
      D: "We prioritize fast agreement over slow disagreement.",
      E: "No - decision-making in our team is usually thoughtful and open."
    }
  },
  {
    id: "q8",
    title: "Energy Drain",
    question: "Have you seen people running on empty - still showing up, but clearly stretched too thin? What do you think keeps that pattern going?",
    options: {
      A: "Work drains more energy than it gives back.",
      B: "There's little time to recover between intense cycles.",
      C: "People feel overwhelmed, but rarely speak up about it.",
      D: "Our culture rewards pushing through, not pausing to reset.",
      E: "No - energy is managed well, and recovery is built into our culture."
    }
  },
  {
    id: "q9",
    title: "Trust & Psychological Safety",
    question: "Have you seen people hold back their real thoughts - especially when something feels unclear, wrong, or risky? What do you think drives that caution?",
    options: {
      A: "People hesitate to admit mistakes or uncertainty.",
      B: "It doesn’t feel safe to challenge popular or senior-held opinions.",
      C: "Feedback is softened to avoid tension or conflict.",
      D: "Trust varies a lot depending on the team or the manager.",
      E: "No - people in our team speak up, admit freely, and challenge constructively."
    }
  },
  {
    id: "q10",
    title: "Effort Problem",
    question: "Have you seen motivation dip, even when tasks are clear and doable? What do you think contributes to that drop in effort?",
    options: {
      A: "It’s hard to stay motivated—even when I know what needs to be done.",
      B: "People seem disengaged during routine tasks or meetings.",
      C: "Energy noticeably drops as the week progresses.",
      D: "Tasks that require sustained effort often get avoided or delayed.",
      E: "No - our team stays motivated and energized throughout the week."
    }
  },
  {
    id: "q11",
    title: "Productivity Problem",
    question: "Have you ever felt like you were working constantly - yet not making meaningful progress? What do you think drives that kind of busyness?",
    options: {
      A: "I often feel busy, but not necessarily productive.",
      B: "Meetings take up time without always leading to outcomes.",
      C: "Recurring distractions make it hard to focus deeply.",
      D: "Multitasking is the norm—even for work that needs full attention.",
      E: "No - our work culture supports deep, focused, meaningful progress."
    }
  }
];
