import { CtaBanner } from "@/components/home/CtaBanner";
import { HeroSection } from "@/components/home/HeroSection";
import { InteractionSection } from "@/components/home/InteractionSection";
import { NewsSection } from "@/components/home/NewsSection";
import { PerformanceSection } from "@/components/home/PerformanceSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <PerformanceSection />
      <CtaBanner />
      <InteractionSection />
      <NewsSection />
    </>
  );
}
