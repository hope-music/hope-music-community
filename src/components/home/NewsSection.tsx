import { Container } from "@/components/ui/Container";
import { ContentCard } from "@/components/ui/ContentCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ViewMoreButton } from "@/components/ui/ViewMoreButton";

export function NewsSection() {
  return (
    <section className="py-6 pb-10" aria-labelledby="news-heading">
      <Container>
        <SectionHeading
          title="News"
          action={<ViewMoreButton href="/news" />}
        />
        <div id="news-heading" className="max-w-xs">
          <ContentCard href="/news" />
        </div>
      </Container>
    </section>
  );
}
