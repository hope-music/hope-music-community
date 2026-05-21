import { CategoryBox } from "@/components/ui/CategoryBox";
import { Container } from "@/components/ui/Container";
import { ContentCard } from "@/components/ui/ContentCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PERFORMANCE_CATEGORIES } from "@/lib/constants";

const PLACEHOLDER_SLUG = "teacher-appreciation-campaign";

const CATEGORY_SLUG_MAP: Record<string, string> = {
  Musical: "musical",
  Opera: "opera",
  Concert: "concert",
  EDM: "edm",
  "Rock & Roll": "rock-roll",
  Festival: "festival",
  Ballet: "ballet",
  "Tourist Performance": "tourist-performance",
  Others: "others",
};

export function PerformanceSection() {
  return (
    <section className="py-6" aria-labelledby="performance-heading">
      <Container>
        <SectionHeading title="Performance" />
        <div
          id="performance-heading"
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          {PERFORMANCE_CATEGORIES.map((category) => {
            const categorySlug = CATEGORY_SLUG_MAP[category];
            const categoryHref = `/performance/${categorySlug}`;

            return (
              <CategoryBox
                key={category}
                title={category}
                categoryHref={categoryHref}
              >
                <ContentCard
                  categoryHref={categoryHref}
                  slug={PLACEHOLDER_SLUG}
                  category={categorySlug}
                />
              </CategoryBox>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
