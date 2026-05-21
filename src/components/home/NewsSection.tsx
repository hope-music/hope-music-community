import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ViewMoreButton } from "@/components/ui/ViewMoreButton";

const NEWS_ITEMS = [
  {
    id: "1",
    title: "Announcing the 2024 Global Musicals Gala line-up",
    date: "June 25, 2026",
    image: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=500",
    href: "/news/1",
  },
  {
    id: "2",
    title: "Hope Studio partners with industry leader for pro-audio workshop series",
    date: "June 25, 2026",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=500",
    href: "/news/2",
  },
  {
    id: "3",
    title: "Artist Community Spotlight: Rising stars share their journey with HOPE",
    date: "June 25, 2026",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500",
    href: "/news/3",
  },
];

export function NewsSection() {
  return (
    <section className="py-6 pb-10" aria-labelledby="news-heading">
      <Container>
        <div className="mb-4 flex items-center justify-between">
          <h2 id="news-heading" className="text-lg font-semibold text-hmc-text">
            News
          </h2>
          <ViewMoreButton href="/news" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {NEWS_ITEMS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-full flex-col overflow-hidden rounded-xl border border-hmc-placeholder-border bg-white shadow-sm transition-shadow duration-200 hover:shadow-md"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-hmc-placeholder">
                <Image
                  src={item.image}
                  alt={item.title}
                  width={500}
                  height={375}
                  className="h-full w-full rounded-xl object-cover transition-transform duration-200 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <time
                  className="text-xs text-hmc-text-muted"
                  dateTime="2026-06-25"
                >
                  {item.date}
                </time>
                <h3 className="text-sm font-semibold leading-snug text-hmc-text transition-colors duration-150 group-hover:text-[#C8102E]">
                  {item.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
