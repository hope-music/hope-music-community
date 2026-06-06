"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ViewMoreButton } from "@/components/ui/ViewMoreButton";
import { CategoryBox } from "@/components/ui/CategoryBox";
import { INTERACTION_CATEGORY_LABELS } from "@/lib/constants";
import { INTERACTION_CATEGORY_KEYS, normalizeInteractionItems, readInteractionItems } from "@/lib/interaction";

interface InteractionItem {
  id: string;
  title: string;
  category: string;
  description: string;
  coverImage: string;
  author: string;
  createdAt: number;
}

const CATEGORY_LABELS = INTERACTION_CATEGORY_LABELS;

const CATEGORY_KEYS = INTERACTION_CATEGORY_KEYS;

const PLACEHOLDER_POSTS: Record<string, { id: string; title: string }[]> = {
  software: [
    { id: "ph-soft-1", title: "ISAT Interaction 2023 v1.0.4 Released" },
    { id: "ph-soft-2", title: "How to optimize latent settings in DAW Soundworks" },
    { id: "ph-soft-3", title: "MIDI controller mapping tutorial for live performance" },
    { id: "ph-soft-4", title: "Best free VST plugins for orchestral composition" },
    { id: "ph-soft-5", title: "Audio interface latency troubleshooting guide" },
    { id: "ph-soft-6", title: "Setting up multi-monitor workspace for mixing" },
    { id: "ph-soft-7", title: "Cloud collaboration tools for remote music production" },
    { id: "ph-soft-8", title: "Automating reverb sends with sidechain compression" },
    { id: "ph-soft-9", title: "Exporting stems correctly for film scoring projects" },
    { id: "ph-soft-10", title: "Building a custom macro pad for live DJ sets" },
  ],
  hardware: [
    { id: "ph-hard-1", title: "Best audio interfaces of 2026 — comprehensive comparison" },
    { id: "ph-hard-2", title: "Monitor speaker placement guide — acoustics for small rooms" },
    { id: "ph-hard-3", title: "Understanding microphone polar patterns" },
    { id: "ph-hard-4", title: "DI box explained: active vs passive" },
    { id: "ph-hard-5", title: "Audio cabling basics — balanced vs unbalanced" },
    { id: "ph-hard-6", title: "DIY acoustic treatment on a budget" },
    { id: "ph-hard-7", title: "Headphone amplifier pairing guide" },
    { id: "ph-hard-8", title: "How to choose the right MIDI keyboard" },
    { id: "ph-hard-9", title: "Studio furniture and desk setup essentials" },
    { id: "ph-hard-10", title: "Power conditioning and surge protection guide" },
  ],
  music: [
    { id: "ph-music-1", title: "Songwriting 101: Finding your unique melodic voice" },
    { id: "ph-music-2", title: "Orchestral arrangement tips for small ensembles" },
    { id: "ph-music-3", title: "Understanding modal scales beyond major and minor" },
    { id: "ph-music-4", title: "Music theory for producers" },
    { id: "ph-music-5", title: "Creating emotional chord progressions" },
    { id: "ph-music-6", title: "Rhythm and groove fundamentals" },
    { id: "ph-music-7", title: "Melody writing techniques" },
    { id: "ph-music-8", title: "Harmonic color — using extended chords" },
    { id: "ph-music-9", title: "Arranging for different ensembles" },
    { id: "ph-music-10", title: "Music production workflow optimization" },
  ],
  production: [
    { id: "ph-prod-1", title: "Lighting design fundamentals for live stage" },
    { id: "ph-prod-2", title: "Sound reinforcement setup for live theater" },
    { id: "ph-prod-3", title: "Stage rigging safety standards" },
    { id: "ph-prod-4", title: "Projection mapping techniques" },
    { id: "ph-prod-5", title: "Set design and construction on a budget" },
    { id: "ph-prod-6", title: "AV system integration for venues" },
    { id: "ph-prod-7", title: "Backstage communication protocols" },
    { id: "ph-prod-8", title: "Pyrotechnics and special effects safety" },
    { id: "ph-prod-9", title: "Live mixing techniques for bands" },
    { id: "ph-prod-10", title: "Stage management best practices" },
  ],
  article: [
    { id: "ph-art-1", title: "The rich history of musical theater" },
    { id: "ph-art-2", title: "The evolution of recording technology" },
    { id: "ph-art-3", title: "The 10 most influential composers of the 21st century" },
    { id: "ph-art-4", title: "Psychoacoustics: how the brain processes music" },
    { id: "ph-art-5", title: "Music therapy research — evidence-based practice" },
    { id: "ph-art-6", title: "Copyright law for independent musicians" },
    { id: "ph-art-7", title: "The streaming era — understanding music economics" },
    { id: "ph-art-8", title: "AI in music composition" },
    { id: "ph-art-9", title: "The future of live music performances" },
    { id: "ph-art-10", title: "Music education trends and innovations" },
  ],
  others: [
    { id: "ph-oth-1", title: "Community guidelines — keeping our forum respectful" },
    { id: "ph-oth-2", title: "Community event calendar — upcoming meetups" },
    { id: "ph-oth-3", title: "Introduce yourself to the Hope Music Community!" },
    { id: "ph-oth-4", title: "Resources and tutorials master list" },
    { id: "ph-oth-5", title: "Collaboration opportunities" },
    { id: "ph-oth-6", title: "Gear marketplace — buy, sell, and trade" },
    { id: "ph-oth-7", title: "Feedback welcome — share your thoughts" },
    { id: "ph-oth-8", title: "Support and help desk" },
    { id: "ph-oth-9", title: "Weekly listening sessions schedule" },
    { id: "ph-oth-10", title: "Feature requests and suggestions board" },
  ],
};

function TopicList({
  category,
  items,
  placeholderItems,
}: {
  category: string;
  items: InteractionItem[];
  placeholderItems: { id: string; title: string }[];
}) {
  const displayItems = items.length >= 10 ? items.slice(0, 10) : [...items, ...placeholderItems].slice(0, 10);

  return (
    <ul className="space-y-0.5">
      {displayItems.map((item) => (
        <li key={item.id}>
          <Link
            href={`/interaction/${category}/${item.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-2 rounded px-2 py-1.5 text-sm text-hmc-text transition-colors duration-150 hover:bg-amber-50/50 hover:text-hmc-red"
          >
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-hmc-orange transition-colors duration-150 group-hover:bg-hmc-red" />
            <span className="flex-1 leading-snug">{item.title}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function InteractionSection() {
  const [allItems, setAllItems] = useState<InteractionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      setAllItems(normalizeInteractionItems(readInteractionItems<InteractionItem>()));
    } catch (e) {
      setAllItems([]);
    }
    setLoading(false);
  }, []);

  // Group items by category
  const itemsByCategory: Record<string, InteractionItem[]> = {};
  CATEGORY_KEYS.forEach((cat) => {
    itemsByCategory[cat] = allItems.filter((item) => item.category === cat);
  });

  return (
    <section className="py-6" aria-labelledby="interaction-heading">
      <Container>
        <SectionHeading title="Interaction" />
        <div
          id="interaction-heading"
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          {CATEGORY_KEYS.map((categorySlug) => {
            const items = itemsByCategory[categorySlug] || [];
            const categoryLabel = CATEGORY_LABELS[categorySlug] || categorySlug;
            const placeholders = PLACEHOLDER_POSTS[categorySlug] || [];

            return (
              <CategoryBox
                key={categorySlug}
                title={categoryLabel}
                headerVariant="interaction"
                headerAction={
                  <ViewMoreButton
                    href={`/interaction/${categorySlug}`}
                    size="sm"
                    className="!bg-white !text-hmc-text"
                  />
                }
              >
                {loading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-hmc-orange"></div>
                  </div>
                ) : (
                  <TopicList
                    category={categorySlug}
                    items={items}
                    placeholderItems={placeholders}
                  />
                )}
              </CategoryBox>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
