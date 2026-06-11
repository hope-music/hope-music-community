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
  hidden?: boolean;
}

const DEFAULT_ITEMS: ContentItem[] = [
  { id: "welcome", title: "Welcome to Hope Music Community", image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800", description: "Discover the vibrant world of Hope Music Community, where music lovers unite.", content: "" },
  { id: "studio", title: "Hope Studio", image: "/images/hope-studio/Hope Studio 1.png", description: "Professional recording, mixing, and mastering services in our state-of-the-art facility.", content: "" },
  { id: "jesse-liu", title: "Jesse Liu", image: "/images/jesse-liu/Jesse Liu 1.jpg", description: "Vocalist, Composer, Music Producer & AI Musician.", content: "" },
  { id: "shangri-la", title: "Shangri-La", image: "/images/shangri-la/Shangri-La 1.jpg", description: "An immersive musical experience that transports you to another world.", content: "" },
  { id: "works", title: "Cooperation", image: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800", description: "Explore our portfolio of completed projects and collaborations.", content: "", hidden: false },
  { id: "schedule", title: "Performance Schedule", image: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800", description: "Stay updated with our upcoming performances and events.", content: "", hidden: true },
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
          {items.filter(item => item.hidden !== true).map((item) => (
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
                  className="h-full w-full object-contain"
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
