import { Sparkles } from "lucide-react";
import { effectOptions, getAdviceTitle } from "../_data/procrastinationLoop";
import type { AdviceId, EffectId, Scene } from "../_lib/types";

export const LoopMap = ({
  scene,
  hasScene,
  advice,
  effect,
}: {
  scene: Scene;
  hasScene: boolean;
  advice: AdviceId[];
  effect: EffectId | null;
}) => {
  const adviceLabel = advice.length
    ? advice
        .map((id) => getAdviceTitle(id))
        .filter(Boolean)
        .join(", ")
    : "Not answered yet";
  const effectLabel =
    effectOptions.find((item) => item.id === effect)?.title ??
    "Not answered yet";

  return (
    <aside className="rounded-lg border border-brand-dark/12 bg-white/45 p-4">
      <div className="flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">
        <Sparkles className="h-4 w-4" aria-hidden="true" />
        Loop map
      </div>

      <div className="mt-5 grid gap-4">
        <MapItem label="Moment" value={hasScene ? scene.title : "Not chosen yet"} />
        <MapItem label="Advice tried" value={adviceLabel} />
        <MapItem label="Effect" value={effectLabel} />
        <MapItem
          label="What the loop says"
          value={hasScene ? scene.identity : "Pending"}
        />
        <MapItem
          label="Practice instead"
          value={hasScene ? scene.reframe : "Pending"}
        />
        <MapItem label="Why" value={hasScene ? scene.perspective.line : "Pending"} />
        <MapItem
          label="Setup"
          value={hasScene ? scene.environment : "Pending"}
        />
        <MapItem label="Next move" value={hasScene ? scene.action : "Pending"} />
      </div>
    </aside>
  );
};

const MapItem = ({ label, value }: { label: string; value: string }) => (
  <section className="border-t border-brand-dark/10 pt-3">
    <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.15em] text-brand-dark/45">
      {label}
    </p>
    <p className="mt-1 font-sans text-sm leading-6 text-brand-dark">{value}</p>
  </section>
);
