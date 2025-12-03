"use client";

interface Props {
  onStart: () => void;
}

const CavemanScanIntro = ({ onStart }: Props) => {
  return (
    <div className="max-w-2xl mx-auto p-6 text-brand-dark">

      <h1 className="text-3xl font-bold mb-4">Your Inner Caveman Scan</h1>

      <p className="mb-4 text-lg leading-relaxed">
        This scan helps you spot the ancient instincts driving your everyday choices —  
        the split-second reactions behind procrastination, impulse switches, hesitation,
        comfort-seeking, or emotional loops.
      </p>

      <ul className="list-disc list-inside mb-4 text-brand-dark/90 leading-relaxed">
        <li>Why do you switch tasks even when you don’t intend to?</li>
        <li>Why do some habits feel effortless while others feel impossible?</li>
        <li>Why do emotions hijack decisions before logic even enters?</li>
      </ul>

      <p className="mb-6 leading-relaxed">
        You’ll answer 9 short scenarios.  
        After each one, you’ll get a quick behavioral insight —  
        and if you want the deeper evolutionary explanation, tap{" "}
        <span className="italic">“Want the science?”</span>.
      </p>

      <button
        onClick={onStart}
        className="inline-block border text-brand-dark font-semibold px-6 py-3 rounded-xl shadow
                   hover:bg-brand-teal hover:text-white transition"
      >
        Start Scan
      </button>
    </div>
  );
};

export default CavemanScanIntro;
