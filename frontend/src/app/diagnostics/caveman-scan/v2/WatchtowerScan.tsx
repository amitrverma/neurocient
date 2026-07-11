"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, LoaderCircle, RotateCcw } from "lucide-react";
import AuthModal from "@/app/components/AuthModal";
import { useAuth } from "@/app/context/AuthContext";
import {
  buildPortraitFoundation,
  createResponse,
  orderScenarioOptions,
  selectScenarios,
} from "./engine";
import { createScanSession, getLatestScanSession, linkScanSession, saveScanSession } from "./persistence";
import { getPortraitCopy, WATCHTOWER_REPORT } from "./report";
import { SCENARIO_BANK } from "./scenarios";
import { WATCHTOWER_IDS } from "./watchtowers";
import type {
  PersistedScanSession,
  PortraitFoundation,
  ScanResponse,
  ScanScenario,
} from "./types";

type Stage = "intro" | "questions" | "reflection" | "preparing" | "preview" | "full";
type LocalState = {
  seed: string;
  scenarioIds: string[];
  responses: ScanResponse[];
  current: number;
  stage: Stage;
  session: PersistedScanSession | null;
  portrait: PortraitFoundation | null;
};

const STORAGE_KEY = "neurocient:watchtower-scan-v1";

const createSeed = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

export default function WatchtowerScan() {
  const { user, ready } = useAuth();
  const [seed, setSeed] = useState(createSeed);
  const [scenarios, setScenarios] = useState<ScanScenario[]>([]);
  const [responses, setResponses] = useState<ScanResponse[]>([]);
  const [current, setCurrent] = useState(0);
  const [stage, setStage] = useState<Stage>("intro");
  const [session, setSession] = useState<PersistedScanSession | null>(null);
  const [portrait, setPortrait] = useState<PortraitFoundation | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [questionStartedAt, setQuestionStartedAt] = useState(Date.now());
  const [showAuth, setShowAuth] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);
  const [checkedAccountPortrait, setCheckedAccountPortrait] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as LocalState;
      const restoredScenarios = saved.scenarioIds
        .map((id) => SCENARIO_BANK.find((item) => item.id === id))
        .filter((item): item is ScanScenario => Boolean(item));
      if (restoredScenarios.length !== saved.scenarioIds.length) return;
      setSeed(saved.seed);
      setScenarios(restoredScenarios);
      setResponses(saved.responses || []);
      setCurrent(Math.min(saved.current || 0, restoredScenarios.length - 1));
      setStage(saved.stage === "preparing" ? "preview" : saved.stage);
      setSession(saved.session || null);
      setPortrait(saved.portrait || null);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setRestored(true);
    }
  }, []);

  useEffect(() => {
    if (!restored || !ready || checkedAccountPortrait) return;
    if (!user || scenarios.length > 0 || stage !== "intro") {
      setCheckedAccountPortrait(true);
      return;
    }

    setCheckedAccountPortrait(true);
    getLatestScanSession()
      .then((saved) => {
        if (!saved.portrait) return;
        const restoredScenarios = saved.scenarioIds
          .map((id) => SCENARIO_BANK.find((item) => item.id === id))
          .filter((item): item is ScanScenario => Boolean(item));
        setSession(saved);
        setScenarios(restoredScenarios);
        setResponses(saved.responses || []);
        setPortrait(saved.portrait);
        setStage("full");
      })
      .catch(() => {
        // A missing saved portrait is a normal first-time state.
      });
  }, [checkedAccountPortrait, ready, restored, scenarios.length, stage, user]);

  useEffect(() => {
    if (!restored) return;
    const state: LocalState = {
      seed, scenarioIds: scenarios.map((item) => item.id), responses,
      current, stage, session, portrait,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [current, portrait, responses, restored, scenarios, seed, session, stage]);

  useEffect(() => {
    const response = responses[current];
    setSelectedOptionId(response?.optionId ?? null);
    setQuestionStartedAt(Date.now());
  }, [current, responses]);

  const scenario = scenarios[current];
  const orderedOptions = useMemo(
    () => scenario ? orderScenarioOptions(scenario, seed) : [],
    [scenario, seed],
  );

  const start = async () => {
    setError(null);
    const nextSeed = createSeed();
    const selected = selectScenarios(SCENARIO_BANK, nextSeed);
    setSeed(nextSeed);
    setScenarios(selected);
    setResponses([]);
    setCurrent(0);
    setPortrait(null);
    setStage("questions");
    try {
      setSession(await createScanSession(selected.map((item) => item.id)));
    } catch {
      setError("Your answers are safe on this device for now. We will try to connect the portrait again when you finish.");
    }
  };

  const choose = (optionId: string) => {
    if (!scenario) return;
    setSelectedOptionId(optionId);
    const response = createResponse(scenario, optionId, current, Date.now() - questionStartedAt);
    setResponses((existing) => {
      const next = [...existing];
      next[current] = response;
      return next;
    });
  };

  const next = async () => {
    if (!selectedOptionId) return;
    const nextIndex = current + 1;
    if (nextIndex < scenarios.length) {
      setCurrent(nextIndex);
      if (nextIndex === 4 || nextIndex === 8) setStage("reflection");
      return;
    }
    await complete();
  };

  const complete = async () => {
    setStage("preparing");
    setError(null);
    const completedPortrait = buildPortraitFoundation(responses);
    setPortrait(completedPortrait);
    let activeSession = session;
    try {
      if (!activeSession) {
        activeSession = await createScanSession(scenarios.map((item) => item.id));
        setSession(activeSession);
      }
      const saved = await saveScanSession(activeSession, responses, "completed", completedPortrait);
      setSession(saved);
      setStage(saved.isLinked || Boolean(user) ? "full" : "preview");
    } catch {
      setError("Your portrait is available on this device, but we could not save it online yet.");
      setStage(user ? "full" : "preview");
    }
  };

  const handleAuthSuccess = async () => {
    setShowAuth(false);
    if (!session) {
      setError("You are signed in. We could not connect this earlier scan yet, but your portrait remains on this device.");
      setStage("full");
      return;
    }
    try {
      setSession(await linkScanSession(session));
      setStage("full");
    } catch {
      setError("You are signed in, but the portrait could not be connected yet. It remains available on this device.");
      setStage("full");
    }
  };

  const restart = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setSeed(createSeed());
    setScenarios([]);
    setResponses([]);
    setCurrent(0);
    setSession(null);
    setPortrait(null);
    setError(null);
    setStage("intro");
  };

  if (!restored || !ready) return <Preparing label="Opening the scan" />;

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-[#f6f3eb] font-serif text-brand-dark">
      {stage === "intro" && <Intro onStart={start} />}
      {stage === "questions" && scenario && (
        <Question
          scenario={scenario}
          options={orderedOptions}
          selectedOptionId={selectedOptionId}
          current={current}
          total={scenarios.length}
          onChoose={choose}
          onNext={next}
          onBack={() => current > 0 && setCurrent((value) => value - 1)}
        />
      )}
      {stage === "reflection" && (
        <Reflection
          completed={current}
          responses={responses.slice(0, current)}
          onContinue={() => setStage("questions")}
        />
      )}
      {stage === "preparing" && <Preparing label="Noticing the pattern" />}
      {stage === "preview" && portrait && (
        <PortraitPreview
          portrait={portrait}
          error={error}
          onKeep={() => user ? setStage("full") : setShowAuth(true)}
          onRestart={restart}
        />
      )}
      {stage === "full" && portrait && (
        <FullPortrait portrait={portrait} error={error} onRestart={restart} />
      )}
      {error && (stage === "questions" || stage === "reflection") ? (
        <p className="fixed bottom-4 left-1/2 z-20 w-[min(92vw,42rem)] -translate-x-1/2 rounded-lg border border-brand-secondary/60 bg-white px-4 py-3 text-center font-sans text-xs leading-5 shadow-lg">
          {error}
        </p>
      ) : null}
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={handleAuthSuccess}
        context="keep and explore your portrait"
      />
    </main>
  );
}

const Intro = ({ onStart }: { onStart: () => void }) => (
  <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-12 px-6 py-14 lg:grid-cols-[1.08fr_0.92fr]">
    <div>
      <Eyebrow>Inner Caveman Scan</Eyebrow>
      <h1 className="max-w-3xl text-[clamp(3.4rem,7.7vw,7.4rem)] font-bold leading-[0.88] tracking-[-0.045em]">
        What does your Inner Caveman notice first?
      </h1>
      <p className="mt-8 max-w-2xl border-l-4 border-brand-secondary pl-5 font-sans text-lg leading-9 text-brand-dark/78">
        Twelve ordinary moments. No right answers. Notice which inner voice sounds most familiar before the moment has been explained away.
      </p>
      <div className="mt-9 flex flex-wrap items-center gap-5">
        <PrimaryButton onClick={onStart}>Start the scan <ArrowRight className="h-4 w-4" /></PrimaryButton>
        <span className="font-sans text-sm text-brand-dark/58">About 5 minutes · Free</span>
      </div>
    </div>
    <div className="border-y border-brand-dark/18 py-8 lg:border-l lg:border-y-0 lg:py-4 lg:pl-12">
      <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal">What this notices</p>
      <p className="mt-5 text-3xl font-bold leading-tight">Not who you are.</p>
      <p className="mt-2 text-3xl font-bold leading-tight text-brand-accent">What catches your attention first.</p>
      <p className="mt-6 font-sans text-base leading-8 text-brand-dark/70">
        The same situation can make one person notice safety, another belonging, another where they stand—or simply stay as an ordinary moment that needs no larger meaning.
      </p>
    </div>
  </section>
);

const Question = ({ scenario, options, selectedOptionId, current, total, onChoose, onNext, onBack }: {
  scenario: ScanScenario;
  options: ScanScenario["options"];
  selectedOptionId: string | null;
  current: number;
  total: number;
  onChoose: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}) => (
  <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-4xl flex-col px-5 py-8 md:px-8 md:py-12">
    <div className="flex items-center gap-4 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-dark/50">
      <span>{String(current + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
      <span className="h-px flex-1 bg-brand-dark/14"><span className="block h-px bg-brand-accent transition-all" style={{ width: `${((current + 1) / total) * 100}%` }} /></span>
    </div>
    <div className="my-auto py-10">
      <Eyebrow>A small moment</Eyebrow>
      <h1 className="max-w-3xl text-[clamp(2rem,4.6vw,3.9rem)] font-bold leading-[1.06] tracking-[-0.025em]">{scenario.story}</h1>
      <p className="mt-6 font-sans text-sm font-semibold text-brand-dark/58">Which voice sounds most familiar?</p>
      <div className="mt-5 grid gap-3">
        {options.map((item) => {
          const selected = item.id === selectedOptionId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChoose(item.id)}
              aria-pressed={selected}
              className={`group flex w-full items-start gap-4 rounded-xl border px-5 py-4 text-left font-sans text-sm leading-7 transition md:px-6 md:py-5 md:text-base ${selected ? "border-brand-accent bg-white shadow-[0_12px_34px_rgba(4,42,43,0.07)]" : "border-brand-dark/14 bg-white/45 hover:border-brand-teal hover:bg-white"}`}
            >
              <span className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected ? "border-brand-accent bg-brand-accent text-white" : "border-brand-dark/25"}`}>
                {selected ? <Check className="h-3 w-3" /> : null}
              </span>
              <span>{item.text}</span>
            </button>
          );
        })}
      </div>
    </div>
    <div className="flex items-center justify-between border-t border-brand-dark/12 pt-5">
      <button onClick={onBack} disabled={current === 0} className="inline-flex items-center gap-2 font-sans text-sm font-semibold disabled:opacity-25"><ArrowLeft className="h-4 w-4" /> Back</button>
      <PrimaryButton onClick={onNext} disabled={!selectedOptionId}>{current + 1 === total ? "See what emerged" : "Continue"} <ArrowRight className="h-4 w-4" /></PrimaryButton>
    </div>
  </section>
);

const Reflection = ({ completed, responses, onContinue }: { completed: number; responses: ScanResponse[]; onContinue: () => void }) => {
  const portrait = buildPortraitFoundation(responses);
  const primary = portrait.preview.primaryWatchtower;
  const rational = portrait.evidence.rationalCount;
  return (
    <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl items-center px-6 py-14">
      <div className="w-full border-y border-brand-dark/16 py-12 text-center md:py-16">
        <Eyebrow>After {completed} moments</Eyebrow>
        <h1 className="text-[clamp(2.8rem,6vw,5.4rem)] font-bold leading-[0.95] tracking-[-0.035em]">I’m noticing something.</h1>
        <p className="mx-auto mt-7 max-w-xl font-sans text-base leading-8 text-brand-dark/72">
          {primary
            ? `${WATCHTOWER_REPORT[primary].question} That question has sounded familiar more than once. ${rational ? "In some other moments, you were comfortable staying with what was actually known." : "A fuller pattern is still taking shape."}`
            : "No single protective concern is leading yet. A fuller pattern is still taking shape."}
        </p>
        <PrimaryButton onClick={onContinue} className="mt-8">Keep going <ArrowRight className="h-4 w-4" /></PrimaryButton>
      </div>
    </section>
  );
};

const Preparing = ({ label }: { label: string }) => (
  <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-[#f6f3eb] px-6 text-brand-dark">
    <div className="text-center"><LoaderCircle className="mx-auto h-7 w-7 animate-spin text-brand-accent" /><p className="mt-5 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal">{label}</p></div>
  </main>
);

const PortraitPreview = ({ portrait, error, onKeep, onRestart }: { portrait: PortraitFoundation; error: string | null; onKeep: () => void; onRestart: () => void }) => {
  const copy = getPortraitCopy(portrait);
  if (!copy.primary) return null;
  return (
    <section className="mx-auto max-w-5xl px-6 py-12 md:py-20">
      <Eyebrow>Your first glimpse</Eyebrow>
      <h1 className="max-w-4xl text-[clamp(3rem,7vw,6.5rem)] font-bold leading-[0.9] tracking-[-0.04em]">{copy.primary.headline}</h1>
      <div className="mt-10 grid gap-8 border-y border-brand-dark/16 py-9 md:grid-cols-[0.72fr_1.28fr]">
        <div><p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">It asks</p><p className="mt-3 text-3xl font-bold text-brand-accent">{copy.primary.question}</p></div>
        <div className="space-y-5 font-sans text-base leading-8 text-brand-dark/76">
          <p>{copy.primary.portrait}</p>
          {copy.primaryContexts.length ? <p>This appeared most clearly around <strong className="text-brand-dark">{copy.primaryContexts.join(", ")}</strong>.</p> : null}
          {copy.rationalContexts.length ? <p>There were also moments—such as <strong className="text-brand-dark">{copy.rationalContexts.join(", ")}</strong>—where you could stay closer to what was actually known.</p> : null}
        </div>
      </div>
      <div className="mt-10 rounded-xl border border-brand-dark/16 bg-white p-6 md:p-8">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">There is more to the pattern</p>
        <h2 className="mt-3 text-3xl font-bold">Keep your portrait.</h2>
        <p className="mt-4 max-w-2xl font-sans text-sm leading-7 text-brand-dark/70">Create a free account to see the other protective concern that appeared, the situations that changed your response, and where your Rational Mind already stays grounded. Your portrait can then connect to Inner Caveman 101 and Practice.</p>
        {error ? <p className="mt-4 font-sans text-xs text-brand-accent">{error}</p> : null}
        <div className="mt-6 flex flex-wrap gap-4"><PrimaryButton onClick={onKeep}>Keep and explore it <ArrowRight className="h-4 w-4" /></PrimaryButton><button onClick={onRestart} className="font-sans text-sm font-semibold text-brand-dark/65">Start again</button></div>
      </div>
    </section>
  );
};

const FullPortrait = ({ portrait, error, onRestart }: { portrait: PortraitFoundation; error: string | null; onRestart: () => void }) => {
  const copy = getPortraitCopy(portrait);
  if (!copy.primary) return null;
  const totals = portrait.evidence.watchtowerTotals;
  const selectedCount = Math.max(1, portrait.evidence.responseCount - portrait.evidence.rationalCount);
  return (
    <section className="mx-auto max-w-6xl px-6 py-12 md:py-20">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div><Eyebrow>Your living portrait</Eyebrow><h1 className="max-w-4xl text-[clamp(3rem,7vw,6.5rem)] font-bold leading-[0.9] tracking-[-0.04em]">{copy.primary.headline}</h1></div>
        <button onClick={onRestart} className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-brand-dark/62"><RotateCcw className="h-4 w-4" /> Retake</button>
      </div>
      {error ? <p className="mt-6 rounded-lg border border-brand-secondary/60 bg-white px-4 py-3 font-sans text-xs">{error}</p> : null}
      <div className="mt-12 grid gap-12 lg:grid-cols-[0.72fr_1.28fr]">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">What appeared across 12 moments</p>
          <div className="mt-5 space-y-4">
            {WATCHTOWER_IDS.map((id) => (
              <div key={id}>
                <div className="flex justify-between gap-4 font-sans text-xs font-semibold"><span>{WATCHTOWER_REPORT[id].publicName}</span><span className="shrink-0">{totals[id]} moments</span></div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-brand-dark/10"><span className="block h-full rounded-full bg-brand-teal" style={{ width: `${Math.min(100, (totals[id] / selectedCount) * 100)}%` }} /></div>
              </div>
            ))}
          </div>
          <p className="mt-6 font-sans text-xs leading-6 text-brand-dark/55">These are moments of attention, not percentages of your personality.</p>
        </aside>
        <div className="space-y-12">
          <ReportSection label="What it notices first" title={copy.primary.question}><p>{copy.primary.portrait}</p><p>{copy.primary.protection}</p></ReportSection>
          <ReportSection label="Where it becomes alert" title={copy.primaryContexts.length ? `Around ${copy.primaryContexts.join(", ")}` : "Across ordinary uncertainty"}><p>{copy.primary.modernLife}</p></ReportSection>
          {copy.supporting && copy.supportingName ? (
            <ReportSection label="Another part of the portrait" title={`${copy.supportingName} also appeared`}><p>{copy.supporting.portrait}</p><p>This is not a lesser or secondary part of you. Different situations bring different protective concerns forward.</p></ReportSection>
          ) : null}
          <ReportSection label="Rational Mind" title={copy.rationalContexts.length ? "Some moments stayed ordinary" : "A protective concern spoke first in these moments"}>
            {copy.rationalContexts.length ? <p>You stayed closer to the available evidence around {copy.rationalContexts.join(", ")}. That does not erase the Caveman; it shows where ambiguity can remain ambiguity without immediately becoming a warning.</p> : <p>Across these scenarios, one of the protective interpretations usually felt more familiar than the grounded alternative. This is a snapshot of twelve moments, not a verdict on your capacity to reason.</p>}
          </ReportSection>
          <div className="border-t border-brand-dark/16 pt-10">
            <Eyebrow>Where to go next</Eyebrow>
            <h2 className="text-4xl font-bold">Make the portrait useful.</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <NextCard href="/inner-caveman" label="Understand" title="Inner Caveman 101" text="See why these protective responses exist and how ancient priorities meet modern life." />
              <NextCard href="/practice" label="Apply" title="Begin with Practice" text="Follow one recurring pattern underneath the behavior and into a small real-life move." />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const ReportSection = ({ label, title, children }: { label: string; title: string; children: React.ReactNode }) => (
  <section className="border-t border-brand-dark/16 pt-8"><p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">{label}</p><h2 className="mt-3 text-4xl font-bold leading-tight">{title}</h2><div className="mt-5 space-y-4 font-sans text-base leading-8 text-brand-dark/74">{children}</div></section>
);

const NextCard = ({ href, label, title, text }: { href: string; label: string; title: string; text: string }) => (
  <Link href={href} className="group rounded-xl border border-brand-dark/14 bg-white p-5 transition hover:border-brand-teal"><p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">{label}</p><h3 className="mt-2 text-2xl font-bold">{title}</h3><p className="mt-3 font-sans text-sm leading-7 text-brand-dark/66">{text}</p><span className="mt-5 inline-flex items-center gap-2 font-sans text-sm font-semibold text-brand-accent">Continue <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span></Link>
);

const Eyebrow = ({ children }: { children: React.ReactNode }) => <p className="mb-5 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal">{children}</p>;

const PrimaryButton = ({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button {...props} className={`inline-flex items-center justify-center gap-2 rounded-full border border-brand-dark bg-brand-dark px-6 py-3 font-sans text-sm font-semibold text-white transition hover:border-brand-primary hover:bg-brand-primary disabled:opacity-35 ${className}`}>{children}</button>
);
