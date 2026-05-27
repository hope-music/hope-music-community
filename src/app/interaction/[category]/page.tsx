"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Interaction {
  id: string;
  title: string;
  category: string;
  description: string;
  coverImage: string;
  author: string;
}

const CATEGORIES = [
  { value: "software", label: "Software" },
  { value: "hardware", label: "Hardware" },
  { value: "music", label: "Music" },
  { value: "production", label: "Production" },
  { value: "resources", label: "Resources" },
  { value: "other", label: "Other" },
  { value: "artical", label: "Artical" },
  { value: "others", label: "Others" },
];

const PLACEHOLDER_ITEMS: Record<string, { id: string; title: string; description: string; coverImage: string }[]> = {
  software: [
    { id: "ph-soft-1", title: "ISAT Interaction 2023 v1.0.4 Released", description: "The latest version of ISAT Interaction brings new features and improvements.", coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800" },
    { id: "ph-soft-2", title: "How to optimize latent settings in DAW Soundworks", description: "Learn how to reduce latency and improve your workflow.", coverImage: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800" },
    { id: "ph-soft-3", title: "MIDI controller mapping tutorial for live performance", description: "A comprehensive guide to mapping your MIDI controller.", coverImage: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=800" },
    { id: "ph-soft-4", title: "Best free VST plugins for orchestral composition", description: "Top free VST plugins for creating orchestral arrangements.", coverImage: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800" },
    { id: "ph-soft-5", title: "Audio interface latency troubleshooting guide", description: "Fix latency issues with your audio interface.", coverImage: "https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=800" },
    { id: "ph-soft-6", title: "Setting up multi-monitor workspace for mixing", description: "Optimize your studio with multiple monitors.", coverImage: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800" },
    { id: "ph-soft-7", title: "Cloud collaboration tools for remote music production", description: "Work together with musicians around the world.", coverImage: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800" },
    { id: "ph-soft-8", title: "Automating reverb sends with sidechain compression", description: "Create dynamic reverb effects for your mixes.", coverImage: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800" },
    { id: "ph-soft-9", title: "Exporting stems correctly for film scoring projects", description: "Everything you need to know about stem exports.", coverImage: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800" },
    { id: "ph-soft-10", title: "Building a custom macro pad for live DJ sets", description: "Create your own MIDI macro pad for performances.", coverImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800" },
  ],
  hardware: [
    { id: "ph-hard-1", title: "Best audio interfaces of 2026", description: "Comprehensive comparison of top audio interfaces.", coverImage: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800" },
    { id: "ph-hard-2", title: "Monitor speaker placement guide", description: "Acoustics tips for small rooms.", coverImage: "https://images.unsplash.com/photo-1558584673-0c8b4f5a3c5f?w=800" },
    { id: "ph-hard-3", title: "Understanding microphone polar patterns", description: "When to use each type of microphone.", coverImage: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800" },
    { id: "ph-hard-4", title: "DI box explained", description: "Active vs passive DI boxes.", coverImage: "https://images.unsplash.com/photo-1558584673-0c8b4f5a3c5f?w=800" },
    { id: "ph-hard-5", title: "Audio cabling basics", description: "Balanced vs unbalanced, XLR vs TRS.", coverImage: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800" },
    { id: "ph-hard-6", title: "DIY acoustic treatment", description: "Acoustic panels and bass traps on a budget.", coverImage: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=800" },
    { id: "ph-hard-7", title: "Headphone amplifier pairing guide", description: "Getting the most from your headphones.", coverImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800" },
    { id: "ph-hard-8", title: "How to choose the right MIDI keyboard", description: "Keys, pads, and knobs explained.", coverImage: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800" },
    { id: "ph-hard-9", title: "Studio furniture and desk setup", description: "Essential furniture for your studio.", coverImage: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800" },
    { id: "ph-hard-10", title: "Power conditioning guide", description: "Surge protection for your gear.", coverImage: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800" },
  ],
  music: [
    { id: "ph-music-1", title: "Songwriting 101", description: "Finding your unique melodic voice.", coverImage: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800" },
    { id: "ph-music-2", title: "Orchestral arrangement tips", description: "Arranging for small ensembles.", coverImage: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800" },
    { id: "ph-music-3", title: "Understanding modal scales", description: "Beyond major and minor.", coverImage: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800" },
    { id: "ph-music-4", title: "Music theory for producers", description: "Bridging theory and practice.", coverImage: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800" },
    { id: "ph-music-5", title: "Creating emotional chord progressions", description: "Step by step guide.", coverImage: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800" },
    { id: "ph-music-6", title: "Rhythm and groove fundamentals", description: "For all genres.", coverImage: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800" },
    { id: "ph-music-7", title: "Melody writing techniques", description: "Used by professional composers.", coverImage: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800" },
    { id: "ph-music-8", title: "Harmonic color", description: "Using extended chords.", coverImage: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800" },
    { id: "ph-music-9", title: "Arranging for ensembles", description: "Different ensemble types.", coverImage: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800" },
    { id: "ph-music-10", title: "Music production workflow", description: "Optimization techniques.", coverImage: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800" },
  ],
  production: [
    { id: "ph-prod-1", title: "Lighting design fundamentals", description: "For live stage productions.", coverImage: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800" },
    { id: "ph-prod-2", title: "Sound reinforcement setup", description: "For live theater and concerts.", coverImage: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800" },
    { id: "ph-prod-3", title: "Stage rigging safety", description: "Standards and best practices.", coverImage: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800" },
    { id: "ph-prod-4", title: "Projection mapping techniques", description: "For immersive theater.", coverImage: "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=800" },
    { id: "ph-prod-5", title: "Set design on a budget", description: "Construction tips.", coverImage: "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=800" },
    { id: "ph-prod-6", title: "AV system integration", description: "For multi-purpose venues.", coverImage: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800" },
    { id: "ph-prod-7", title: "Backstage communication", description: "Protocols for smooth shows.", coverImage: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800" },
    { id: "ph-prod-8", title: "Pyrotechnics safety", description: "Regulations and safety.", coverImage: "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=800" },
    { id: "ph-prod-9", title: "Live mixing techniques", description: "For bands.", coverImage: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800" },
    { id: "ph-prod-10", title: "Stage management", description: "Best practices.", coverImage: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800" },
  ],
  artical: [
    { id: "ph-art-1", title: "History of musical theater", description: "From Broadway to global stages.", coverImage: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800" },
    { id: "ph-art-2", title: "Evolution of recording technology", description: "Five decades of innovation.", coverImage: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800" },
    { id: "ph-art-3", title: "Influential composers", description: "The 10 most influential of the 21st century.", coverImage: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800" },
    { id: "ph-art-4", title: "Psychoacoustics", description: "How the brain processes music.", coverImage: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800" },
    { id: "ph-art-5", title: "Music therapy research", description: "Evidence-based practice.", coverImage: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800" },
    { id: "ph-art-6", title: "Copyright law for musicians", description: "Protecting your work.", coverImage: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800" },
    { id: "ph-art-7", title: "The streaming era", description: "Understanding music economics.", coverImage: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800" },
    { id: "ph-art-8", title: "AI in music composition", description: "Opportunity or threat?", coverImage: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800" },
    { id: "ph-art-9", title: "Future of live music", description: "Performances and trends.", coverImage: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800" },
    { id: "ph-art-10", title: "Music education trends", description: "Innovations in teaching.", coverImage: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800" },
  ],
  others: [
    { id: "ph-oth-1", title: "Community guidelines", description: "Keeping our forum respectful.", coverImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800" },
    { id: "ph-oth-2", title: "Community event calendar", description: "Upcoming meetups and sessions.", coverImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800" },
    { id: "ph-oth-3", title: "Introduce yourself!", description: "Welcome to Hope Music Community!", coverImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800" },
    { id: "ph-oth-4", title: "Resources and tutorials", description: "Curated community collection.", coverImage: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800" },
    { id: "ph-oth-5", title: "Collaboration opportunities", description: "Find your creative partner.", coverImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800" },
    { id: "ph-oth-6", title: "Gear marketplace", description: "Buy, sell, and trade.", coverImage: "https://images.unsplash.com/photo-1558584673-0c8b4f5a3c5f?w=800" },
    { id: "ph-oth-7", title: "Feedback welcome", description: "Share your thoughts.", coverImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800" },
    { id: "ph-oth-8", title: "Support and help desk", description: "Technical issues help.", coverImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800" },
    { id: "ph-oth-9", title: "Weekly listening sessions", description: "Schedule and topics.", coverImage: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800" },
    { id: "ph-oth-10", title: "Feature requests", description: "Suggestions board.", coverImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800" },
  ],
  resources: [
    { id: "ph-res-1", title: "Free sample packs 2026", description: "Best free samples this year.", coverImage: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800" },
    { id: "ph-res-2", title: "Music production cheat sheet", description: "Quick reference guide.", coverImage: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800" },
    { id: "ph-res-3", title: "DAW keyboard shortcuts", description: "Speed up your workflow.", coverImage: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800" },
    { id: "ph-res-4", title: "Mixing checklist", description: "Never miss a step.", coverImage: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800" },
    { id: "ph-res-5", title: "Mastering reference tracks", description: "Professional examples.", coverImage: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800" },
    { id: "ph-res-6", title: "Studio setup guide", description: "From beginner to pro.", coverImage: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=800" },
    { id: "ph-res-7", title: "Music theory worksheets", description: "Practice exercises.", coverImage: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800" },
    { id: "ph-res-8", title: "Genre-specific guides", description: "Tailored production tips.", coverImage: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800" },
    { id: "ph-res-9", title: "Plugin recommendations", description: "Must-have VSTs.", coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800" },
    { id: "ph-res-10", title: "Sound design basics", description: "Create unique sounds.", coverImage: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800" },
  ],
  other: [
    { id: "ph-ot-1", title: "Community guidelines", description: "Keeping our forum respectful.", coverImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800" },
    { id: "ph-ot-2", title: "Event calendar", description: "Upcoming meetups.", coverImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800" },
    { id: "ph-ot-3", title: "Introduce yourself!", description: "Welcome!", coverImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800" },
    { id: "ph-ot-4", title: "Resources master list", description: "Curated collection.", coverImage: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800" },
    { id: "ph-ot-5", title: "Collaboration", description: "Find partners.", coverImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800" },
    { id: "ph-ot-6", title: "Gear marketplace", description: "Buy and sell.", coverImage: "https://images.unsplash.com/photo-1558584673-0c8b4f5a3c5f?w=800" },
    { id: "ph-ot-7", title: "Feedback", description: "Share thoughts.", coverImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800" },
    { id: "ph-ot-8", title: "Support desk", description: "Get help.", coverImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800" },
    { id: "ph-ot-9", title: "Listening sessions", description: "Weekly schedule.", coverImage: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800" },
    { id: "ph-ot-10", title: "Feature requests", description: "Suggestions.", coverImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800" },
  ],
};

interface PageProps {
  params: Promise<{ category: string }>;
}

export default function InteractionCategoryPage({ params }: PageProps) {
  const [items, setItems] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState("");
  const [currentCategory, setCurrentCategory] = useState("");

  useEffect(() => {
    async function loadData() {
      const resolvedParams = await params;
      const category = resolvedParams.category;
      
      setCurrentCategory(category);
      setCategoryName(CATEGORIES.find((c) => c.value === category)?.label || category);

      const stored = localStorage.getItem("admin_interaction");
      if (stored) {
        const data = JSON.parse(stored);
        const filtered = data.filter((item: Interaction) => item.category === category);
        setItems(filtered);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#D96A32]"></div>
      </div>
    );
  }

  // If no real items, show placeholders
  const displayItems = items.length > 0 ? items : (PLACEHOLDER_ITEMS[currentCategory] || []);

  return (
    <main className="min-h-screen bg-white">
      <div className="border-b border-t border-[#D96A32]">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center">
          <h1 className="text-2xl font-bold uppercase tracking-wider text-[#D96A32]">{categoryName}</h1>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayItems.map((item) => (
            <Link
              key={item.id}
              href={`/interaction/${item.category || currentCategory}/${item.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-full flex-col overflow-hidden rounded-xl border border-hmc-placeholder-border bg-white shadow-sm hover:shadow-md"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100">
                {item.coverImage ? (
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gray-200">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <h3 className="text-sm font-semibold text-hmc-text group-hover:text-[#C8102E]">{item.title}</h3>
                {"description" in item && item.description && (
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {item.description.replace(/<[^>]*>/g, "")}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
