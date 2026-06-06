import { Container } from "@/components/ui/Container";
import { HERO_CAPTION } from "@/lib/constants";

export function HeroSection() {
  return (
    <section className="py-4" aria-label="Featured highlight">
      <Container>
        <div
          className="aspect-[21/7] w-full bg-gradient-to-br from-sky-200 via-emerald-100 to-slate-300"
          aria-label="Hero image placeholder"
        />
        <div className="mt-2 flex flex-col items-center gap-2">
          <a
            href="/hope-studio"
            className="cursor-pointer text-[12px] text-hmc-text-muted transition-colors hover:text-hmc-orange"
          >
            <span className="italic">Shangri-La</span>, HopeStudio&apos;s unperformed immersive musical
          </a>
          <div className="w-full" style={{ borderBottom: "1px solid border-hmc-orange" }} />
        </div>
      </Container>
    </section>
  );
}
