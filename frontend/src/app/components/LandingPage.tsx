import HeroSection from "./landing/HeroSection";
import StrugglesSection from "./landing/StrugglesSection";
import ModernFixesSection from "./landing/ModernFixesSection";
import PerspectiveSection from "./landing/PerspectiveSection";
import InnerCavemanSection from "./landing/InnerCavemanSection";
import CavemanScanSection from "./landing/CavemanScanSection";

export default function LandingPage() {
  return (
    <main className="landing-page flex flex-col overflow-hidden bg-white font-serif text-brand-dark selection:bg-brand-secondary/60">
      <HeroSection />
      <StrugglesSection />
      <ModernFixesSection />
      <PerspectiveSection />
      <InnerCavemanSection />
      <CavemanScanSection />
    </main>
  );
}
