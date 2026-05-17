import { CategoryBox } from "@/components/ui/CategoryBox";
import { Container } from "@/components/ui/Container";
import { ContentCard } from "@/components/ui/ContentCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PERFORMANCE_CATEGORIES } from "@/lib/constants";

const CATEGORIES_WITH_CARDS = new Set(["Musical", "Ballet"]);

export function PerformanceSection() {
  return (
    <section className="py-6" aria-labelledby="performance-heading">
      <Container>
        <SectionHeading title="Performance" />
        <div
          id="performance-heading"
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          {PERFORMANCE_CATEGORIES.map((category) => (
            <CategoryBox key={category} title={category}>
              {CATEGORIES_WITH_CARDS.has(category) ? (
                <ContentCard href="/performance" />
              ) : null}
            </CategoryBox>
          ))}
        </div>
      </Container>
    </section>
  );
}
