"use client";

import HeroSection from "./sections/HeroSection";
import InsightMismatch from "./sections/InsightMismatch";
import ChangeIsHard from "./sections/ChangeIsHard";
import OriginStory from "./sections/OriginStory";
import AboutMe from "./sections/AboutMe";
import ProgramOverview from "./sections/ProgramOverview";
import ProgramShift from "./sections/ProgramShift";
import Takeaways from "./sections/Takeaways";
import Pricing from "./sections/Pricing";
import FAQs from "./sections/FAQs";
import WhoIsThisFor from "./sections/WhoIsThisFor";

export default function ModernCavemanPage() {
  return (
    <main className="flex flex-col px-6 py-20 bg-white font-serif">
      <div className="max-w-6xl mx-auto space-y-5">

        {/* === 1. Hero Section === */}
        <HeroSection />

        {/* === 3. Insight Mismatch Block === */}
        <InsightMismatch />

        {/* === 4. The Real Reason Change Feels Hard === */}
        <ChangeIsHard />

        {/* === 5. Origin Story === */}
        <OriginStory />

        {/* === 6. About Me === */}
        <AboutMe/>

        {/* === 8. Program Overview === */}
        <ProgramOverview/>

        {/* === 9. Program Shift === */}
        <ProgramShift/>

        {/* === 10. Takeaways === */}
        <Takeaways/>

        {/* === 11. Pricing === */}
        <Pricing/>

        {/* === 12. FAQs === */}
        <FAQs/>

        {/* === 13. Who Is This For === */}
        <WhoIsThisFor/>

      </div>
    </main>
  );
}
