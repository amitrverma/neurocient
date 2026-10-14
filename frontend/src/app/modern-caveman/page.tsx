import HeroSection from "./sections/HeroSection";
import InsightMismatch from "./sections/InsightMismatch";
import ChangeIsHard from "./sections/ChangeIsHard";
import ProgramOverview from "./sections/ProgramOverview";
import ProgramShift from "./sections/ProgramShift";
import Takeaways from "./sections/Takeaways";
import Pricing from "./sections/Pricing";
import FAQs from "./sections/FAQs";
import WhoIsThisFor from "./sections/WhoIsThisFor";

export default function ModernCavemanPage() {
  return (
    <main className="modern-caveman">
      <div className="mc-storyline" aria-label="The Modern Caveman programme journey">
        <span>Recognise</span>
        <span>Reflect</span>
        <span>Rebuild</span>
      </div>
      <div className="mc-page-flow">
        <HeroSection />
        <InsightMismatch />
        <ChangeIsHard />
        <ProgramOverview />
        <ProgramShift />
        <Takeaways />
        <WhoIsThisFor />
        <Pricing />
        <FAQs />
      </div>
    </main>
  );
}
