"use client";

interface Props {
  onStart: () => void;
}

const DiagnosticIntro = ({ onStart }: Props) => {
  return (
    <div className="max-w-2xl mx-auto p-6 text-gray-800">
      <h1 className="text-3xl font-bold mb-4">Caveman in the Cubicle</h1>
      <p className="mb-4 text-lg">
        This diagnostic helps you spot ancient instincts behind modern workplace misfires.
        It’s not about blame or personality — it’s about design mismatches between your brain and your environment.
      </p>

      <ul className="list-disc list-inside mb-4 text-gray-700">
        <li>Why do smart teams still miss deadlines?</li>
        <li>Why does “alignment” unravel in execution?</li>
        <li>Why do people hold back, even in “safe” spaces?</li>
      </ul>

      <p className="mb-6">
        You’ll answer 11 short questions. After each, you’ll get a behavioral insight — and at the end, a summary of your team’s most likely instincts.
      </p>

      <button
        onClick={onStart}
        className="bg-blue-600 text-white px-5 py-3 rounded hover:bg-blue-700"
      >
        Start Diagnostic →
      </button>
    </div>
  );
};

export default DiagnosticIntro;
