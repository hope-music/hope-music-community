import Link from "next/link";
import { CategoryBox } from "@/components/ui/CategoryBox";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ViewMoreButton } from "@/components/ui/ViewMoreButton";
import {
  INTERACTION_CATEGORIES,
  SOFTWARE_PLACEHOLDER_ITEMS,
  HARDWARE_PLACEHOLDER_ITEMS,
  MUSIC_PLACEHOLDER_ITEMS,
  STAGE_PRODUCTION_PLACEHOLDER_ITEMS,
  ARTICAL_PLACEHOLDER_ITEMS,
  OTHERS_PLACEHOLDER_ITEMS,
} from "@/lib/constants";

const CATEGORY_SLUG_MAP: Record<string, string> = {
  Software: "software",
  Hardware: "hardware",
  Music: "music",
  "Stage Production": "stage-production",
  Artical: "artical",
  Others: "others",
};

const CATEGORY_ITEMS_MAP: Record<string, readonly { id: string; title: string }[]> = {
  Software: SOFTWARE_PLACEHOLDER_ITEMS,
  Hardware: HARDWARE_PLACEHOLDER_ITEMS,
  Music: MUSIC_PLACEHOLDER_ITEMS,
  "Stage Production": STAGE_PRODUCTION_PLACEHOLDER_ITEMS,
  Artical: ARTICAL_PLACEHOLDER_ITEMS,
  Others: OTHERS_PLACEHOLDER_ITEMS,
};

function TopicList({
  category,
  items,
}: {
  category: string;
  items: readonly { id: string; title: string }[];
}) {
  const slug = CATEGORY_SLUG_MAP[category];
  return (
    <ul className="space-y-0.5">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            href={`/interaction/${slug}/${item.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-2 rounded px-2 py-1.5 text-sm text-hmc-text transition-colors duration-150 hover:bg-amber-50/50 hover:text-[#C8102E]"
          >
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#D96A32] transition-colors duration-150 group-hover:bg-[#C8102E]" />
            <span className="flex-1 leading-snug">{item.title}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function InteractionSection() {
  return (
    <section className="py-6" aria-labelledby="interaction-heading">
      <Container>
        <SectionHeading title="Interaction" />
        <div
          id="interaction-heading"
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          {INTERACTION_CATEGORIES.map((category) => {
            const slug = CATEGORY_SLUG_MAP[category];
            const items = CATEGORY_ITEMS_MAP[category];
            return (
              <CategoryBox
                key={category}
                title={category}
                headerVariant="interaction"
                headerAction={
                  <ViewMoreButton
                    href={`/interaction/${slug}`}
                    size="sm"
                    className="!bg-white !text-hmc-text"
                  />
                }
              >
                {items && <TopicList category={category} items={items} />}
              </CategoryBox>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
