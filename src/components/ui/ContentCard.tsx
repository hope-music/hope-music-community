import { ViewMoreButton } from "@/components/ui/ViewMoreButton";
import { PLACEHOLDER_ARTICLE } from "@/lib/constants";

type ContentCardProps = {
  title?: string;
  date?: string;
  showViewMore?: boolean;
  href?: string;
};

export function ContentCard({
  title = PLACEHOLDER_ARTICLE.title,
  date = PLACEHOLDER_ARTICLE.date,
  showViewMore = true,
  href = "#",
}: ContentCardProps) {
  return (
    <article className="flex flex-col gap-2 border border-hmc-placeholder-border bg-white p-2">
      <h3 className="line-clamp-3 text-xs font-semibold leading-snug text-hmc-text">
        {title}
      </h3>
      <time className="text-[10px] text-hmc-text-muted" dateTime="2024-05-15">
        {date}
      </time>
      <div
        className="aspect-[4/3] w-full bg-hmc-placeholder"
        aria-label="Article thumbnail placeholder"
      />
      {showViewMore && <ViewMoreButton href={href} size="sm" className="self-start" />}
    </article>
  );
}
