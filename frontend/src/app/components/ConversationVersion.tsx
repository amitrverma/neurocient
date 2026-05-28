type Props = {
  audioUrl: string;
  duration?: string;
  reflection?: string;
};

export default function ConversationVersion({
  audioUrl,
  duration = "Audio",
  reflection,
}: Props) {
  return (
    <section className="article-audio-module">
      <div className="text-base text-brand-dark">
        <div className="mb-2 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
          Prefer listening?
        </div>

        <p className="mb-4 font-serif text-2xl leading-tight text-brand-dark">
          Here&apos;s the {duration} audio conversation exploring this idea.
        </p>

        <audio
          controls
          preload="metadata"
          playsInline
          controlsList="nodownload"
          className="mb-3 w-full"
        >
          <source src={audioUrl} type="audio/mpeg" />
        </audio>

        {reflection && (
          <p className="font-sans text-sm italic leading-6 text-brand-dark/70">
            {reflection}
          </p>
        )}
      </div>
    </section>
  );
}
