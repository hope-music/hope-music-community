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
  "live-performance": [
    { id: "ph-live-1", title: "Tips for engaging a live audience" },
    { id: "ph-live-2", title: "Stage presence techniques for performers" },
    { id: "ph-live-3", title: "Managing stage fright and performance anxiety" },
    { id: "ph-live-4", title: "Live sound engineering basics" },
    { id: "ph-live-5", title: "Designing an immersive live performance" },
    { id: "ph-live-6", title: "Setlist planning for maximum impact" },
    { id: "ph-live-7", title: "Working with backing tracks in live shows" },
    { id: "ph-live-8", title: "Touring on a budget — practical guide" },
    { id: "ph-live-9", title: "Audience interaction during live sets" },
    { id: "ph-live-10", title: "Adapting to different venue acoustics" },
  ],
  "dj-edm": [
    { id: "ph-edm-1", title: "Beatmatching techniques for beginners" },
    { id: "ph-edm-2", title: "Choosing the right DJ controller for your style" },
    { id: "ph-edm-3", title: "EQ mixing for smooth transitions" },
    { id: "ph-edm-4", title: "Building a signature sound in electronic music" },
    { id: "ph-edm-5", title: "Reading the crowd and adjusting your set" },
    { id: "ph-edm-6", title: "Using effects processors live" },
    { id: "ph-edm-7", title: "Understanding BPM and key compatibility" },
    { id: "ph-edm-8", title: "Vinyl vs. digital DJing — pros and cons" },
    { id: "ph-edm-9", title: "EDM production techniques for club sounds" },
    { id: "ph-edm-10", title: "Setting up a home DJ studio" },
  ],
  "ambient-music": [
    { id: "ph-amb-1", title: "Creating atmospheric textures with synthesizers" },
    { id: "ph-amb-2", title: "The philosophy of ambient music composition" },
    { id: "ph-amb-3", title: "Using field recordings in ambient works" },
    { id: "ph-amb-4", title: "Ambient music for meditation and relaxation" },
    { id: "ph-amb-5", title: "Evolving pads and drones techniques" },
    { id: "ph-amb-6", title: "Brian Eno and the origins of ambient" },
    { id: "ph-amb-7", title: "Sound design for ambient productions" },
    { id: "ph-amb-8", title: "Spatial audio and panning in ambient mixes" },
    { id: "ph-amb-9", title: "Film scoring with ambient textures" },
    { id: "ph-amb-10", title: "Minimalism in ambient composition" },
  ],
  "pop-rock": [
    { id: "ph-pop-1", title: "Writing catchy pop hooks that stick" },
    { id: "ph-pop-2", title: "Rock guitar tone — from clean to heavy" },
    { id: "ph-pop-3", title: "Song structure in modern pop music" },
    { id: "ph-pop-4", title: "Vocal production techniques for pop tracks" },
    { id: "ph-pop-5", title: "Rock drumming — groove and power" },
    { id: "ph-pop-6", title: "Producing radio-ready pop vocals" },
    { id: "ph-pop-7", title: "Bass lines that drive a pop-rock song" },
    { id: "ph-pop-8", title: "Topline songwriting — writing over beats" },
    { id: "ph-pop-9", title: "The evolution of pop production trends" },
    { id: "ph-pop-10", title: "Collaborating as a pop-rock band" },
  ],
  "classical": [
    { id: "ph-class-1", title: "Understanding counterpoint in classical composition" },
    { id: "ph-class-2", title: "Orchestration basics for young composers" },
    { id: "ph-class-3", title: "Interpretation and expression in performance" },
    { id: "ph-class-4", title: "The role of dynamics in classical music" },
    { id: "ph-class-5", title: "Baroque vs. Romantic — stylistic differences" },
    { id: "ph-class-6", title: "Conducting techniques and score reading" },
    { id: "ph-class-7", title: "Chamber music collaboration strategies" },
    { id: "ph-class-8", title: "Classical piano repertoire — intermediate level" },
    { id: "ph-class-9", title: "Music history — key periods and composers" },
    { id: "ph-class-10", title: "Contemporary classical music trends" },
  ],
  "film-music": [
    { id: "ph-film-1", title: "Creating emotional arcs with orchestral scores" },
    { id: "ph-film-2", title: "Syncing music to picture — timing techniques" },
    { id: "ph-film-3", title: "Leitmotif development in film scoring" },
    { id: "ph-film-4", title: "Working with temp music and director feedback" },
    { id: "ph-film-5", title: "Hybrid orchestral — blending live and electronic" },
    { id: "ph-film-6", title: "Music for short films vs. feature length" },
    { id: "ph-film-7", title: "Budget scoring — getting great results cheaply" },
    { id: "ph-film-8", title: "The business of getting hired as a film composer" },
    { id: "ph-film-9", title: "Ambient and silence as scoring tools" },
    { id: "ph-film-10", title: "Spotting sessions and spotting notes explained" },
  ],
  "fusion-music": [
    { id: "ph-fusion-1", title: "Jazz-rock fusion — a historical overview" },
    { id: "ph-fusion-2", title: "Blending electronic and acoustic instruments" },
    { id: "ph-fusion-3", title: "World music influences in contemporary fusion" },
    { id: "ph-fusion-4", title: "Rhythm complexity in progressive fusion" },
    { id: "ph-fusion-5", title: "Improvisation in fusion ensembles" },
    { id: "ph-fusion-6", title: "Funk and soul fusion techniques" },
    { id: "ph-fusion-7", title: "Harmony innovations in modern fusion" },
    { id: "ph-fusion-8", title: "Collaborating across genre boundaries" },
    { id: "ph-fusion-9", title: "Fusion production — balancing organic and synthetic" },
    { id: "ph-fusion-10", title: "The future of musical fusion genres" },
  ],
  "music-production": [
    { id: "ph-prod-1", title: "Mixing fundamentals — getting started" },
    { id: "ph-prod-2", title: "Mastering your first track" },
    { id: "ph-prod-3", title: "Sound selection and sound design" },
    { id: "ph-prod-4", title: "Arrangement techniques for any genre" },
    { id: "ph-prod-5", title: "Compression — when and how to use it" },
    { id: "ph-prod-6", title: "EQ strategies for a clean mix" },
    { id: "ph-prod-7", title: "Reference tracks — how to use them effectively" },
    { id: "ph-prod-8", title: "Building a home studio on a budget" },
    { id: "ph-prod-9", title: "Collaboration workflows for remote producers" },
    { id: "ph-prod-10", title: "Stem exporting and session organization" },
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
