import { Container } from "@/components/ui/Container";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="py-4" aria-label="Featured highlight">
      <Container>
        <div className="relative aspect-[21/7] w-full overflow-hidden">
          <Image
            src="/images/home-hero.jpg"
            alt="Shangri-La - HopeStudio's immersive musical experience"
            fill
            className="object-contain"
            priority
          />
        </div>
        <div className="mt-2 flex flex-col items-center gap-2">
          <a
            href="/hope-studio/shangri-la"
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer text-[12px] text-hmc-text-muted transition-colors hover:text-hmc-orange"
          >
            <span className="italic">Shangri-La</span>
          </a>
          <div className="w-full" style={{ borderBottom: "1px solid border-hmc-orange" }} />
        </div>
      </Container>
    </section>
  );
}
