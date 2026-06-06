"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface ContentItem {
  id: string;
  title: string;
  image: string;
  description: string;
  content: string;
}

const DEFAULT_ITEMS: ContentItem[] = [
  { id: "welcome", title: "Welcome to Hope Music Community", image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800", description: "Discover the vibrant world of Hope Music Community, where music lovers unite.", content: "" },
  { id: "studio", title: "Hope Studio", image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800", description: "Professional recording, mixing, and mastering services in our state-of-the-art facility.", content: "" },
  { id: "jesse-liu", title: "Jesse Liu", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800", description: "Meet Jesse Liu, our founder and creative director.", content: "" },
  { id: "shangri-la", title: "Shangri-La", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800", description: "An immersive musical experience that transports you to another world.", content: "" },
  { id: "works", title: "Works", image: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800", description: "Explore our portfolio of completed projects and collaborations.", content: "" },
  { id: "schedule", title: "Performance Schedule", image: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800", description: "Stay updated with our upcoming performances and events.", content: "" },
];

export default function HopeStudioPage() {
  const [items, setItems] = useState<ContentItem[]>(DEFAULT_ITEMS);

  useEffect(() => {
    const loadData = () => {
      const stored = localStorage.getItem("hope_studio_content");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setItems(parsed);
          }
        } catch (e) {
          // Silent fail - will use empty state
        }
      }
    };

    loadData();

    // Listen for storage changes (when admin updates)
    window.addEventListener("storage", loadData);

    // Poll for changes every second (for same-tab updates)
    const interval = setInterval(loadData, 1000);

    return () => {
      window.removeEventListener("storage", loadData);
      clearInterval(interval);
    };
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <div className="border-b border-t border-hmc-orange">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center">
          <h1 className="text-2xl font-bold uppercase tracking-wider text-hmc-orange">Hope Studio</h1>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/hope-studio/${item.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col"
            >
              <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-100">
                <Image
                  src={item.image}
                  alt={item.title}
                  width={800}
                  height={600}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-hmc-red">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                  {item.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
