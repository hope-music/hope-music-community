import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { CTA_COPY } from "@/lib/constants";

export function CtaBanner() {
  return (
    <section className="py-4" aria-label="Featured call to action">
      <Container>
        <div className="flex flex-col items-start justify-between gap-4 bg-hmc-red px-4 py-5 text-white sm:flex-row sm:items-center sm:px-6">
          <p className="max-w-3xl text-sm leading-relaxed">{CTA_COPY}</p>
          <Link
            href="#"
            className="shrink-0 bg-white px-5 py-2 text-xs font-semibold uppercase text-hmc-red transition-colors hover:bg-white/90"
          >
            Read More
          </Link>
        </div>
      </Container>
    </section>
  );
}
