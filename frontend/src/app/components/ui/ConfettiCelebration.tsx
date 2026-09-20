"use client";

import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

const ConfettiCelebration = ({ trigger }: { trigger: boolean }) => {
  const { width, height } = useWindowSize();

  if (!trigger || width === 0 || height === 0) return null;

  return <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />;
};

export default ConfettiCelebration;
