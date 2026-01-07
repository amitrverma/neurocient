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
    <section className="my-10 border-y border-gray-300 py-6">
      <div className="text-base text-brand-dark/90">
        <div className="mb-2 font-sans font-medium">
          🎧 Conversation version
        </div>

        <p className="mb-3 text-brand-dark/80">
          {duration} audio conversation exploring this idea.
        </p>

        <audio
          controls
          preload="metadata"
          playsInline
          controlsList="nodownload"
          className="w-full mb-3"
        >
          <source src={audioUrl} type="audio/mpeg" />
        </audio>

        {reflection && (
          <p className="italic text-sm text-brand-dark/70">
            {reflection}
          </p>
        )}
      </div>
    </section>
  );
}
