import { CategoryBox } from "@/components/ui/CategoryBox";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ViewMoreButton } from "@/components/ui/ViewMoreButton";
import {
  INTERACTION_CATEGORIES,
  SOFTWARE_PLACEHOLDER_ITEMS,
} from "@/lib/constants";

export function InteractionSection() {
  return (
    <section className="py-6" aria-labelledby="interaction-heading">
      <Container>
        <SectionHeading title="Interaction" />
        <div
          id="interaction-heading"
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          {INTERACTION_CATEGORIES.map((category) => (
            <CategoryBox
              key={category}
              title={category}
              headerVariant="interaction"
              headerAction={
                <ViewMoreButton
                  href="/interaction"
                  size="sm"
                  className="!bg-white !text-hmc-text"
                />
              }
            >
              {category === "Software" ? (
                <ul className="list-disc space-y-1 pl-4 text-[10px] text-hmc-text">
                  {SOFTWARE_PLACEHOLDER_ITEMS.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </CategoryBox>
          ))}
        </div>
      </Container>
    </section>
  );
}
