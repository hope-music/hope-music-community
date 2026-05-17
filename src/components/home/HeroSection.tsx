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
        <p className="mt-2 text-center text-xs italic text-hmc-text-muted">
          {HERO_CAPTION}
        </p>
      </Container>
    </section>
  );
}
