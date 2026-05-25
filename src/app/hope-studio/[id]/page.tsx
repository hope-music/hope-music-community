"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";

interface ContentItem {
  id: string;
  title: string;
  image: string;
  description: string;
  content: string;
}

const DEFAULT_ITEMS: Record<string, ContentItem> = {
  welcome: { id: "welcome", title: "Welcome to Hope Music Community", image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1200", description: "", content: "<p>Welcome to the Hope Music Community! We are dedicated to creating a vibrant space where music lovers, artists, and professionals come together.</p><p>Our community is built on the passion for music and the desire to share it with the world. Whether you are a musician, a producer, or simply a music enthusiast, you will find a home here.</p><p>Join us on this musical journey and discover endless possibilities in the world of sound.</p>" },
  studio: { id: "studio", title: "Hope Studio", image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200", description: "", content: "<p>Hope Studio offers professional recording, mixing, and mastering services in our state-of-the-art facility.</p><p>Equipped with the latest technology and acoustics, our studio provides the perfect environment for capturing your sound.</p><p>Our experienced engineers work with artists across all genres to bring their vision to life.</p>" },
  "jesse-liu": { id: "jesse-liu", title: "Jesse Liu", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200", description: "", content: "<p>Jesse Liu is the founder and creative director of Hope Music Community.</p><p>With over 20 years of experience in the music industry, Jesse has worked with numerous artists and produced countless albums.</p><p>His vision is to create a community that nurtures creativity and brings people together through music.</p>" },
  "shangri-la": { id: "shangri-la", title: "Shangri-La", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200", description: "", content: "<p>Shangri-La is an immersive musical experience designed to transport you to another world.</p><p>Combining live performances, visual art, and innovative soundscapes, Shangri-La creates unforgettable moments.</p><p>Experience music in a way you never have before.</p>" },
  works: { id: "works", title: "Works", image: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=1200", description: "", content: "<p>Explore our portfolio of completed projects and collaborations.</p><p>From albums and singles to live performances and multimedia productions, our work spans across genres and formats.</p><p>Each project reflects our commitment to excellence and our passion for music.</p>" },
  schedule: { id: "schedule", title: "Performance Schedule", image: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1200", description: "", content: "<p>Stay updated with our upcoming performances and events.</p><p>We host regular concerts, workshops, and community gatherings throughout the year.</p><p>Check back often for new events and don't miss out on the music!</p>" },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function HopeStudioDetailPage({ params }: PageProps) {
  const { id } = use(params);

  // Try to get from localStorage first
  let item = DEFAULT_ITEMS[id];
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("hope_studio_content");
    if (stored) {
      const items: ContentItem[] = JSON.parse(stored);
      const found = items.find(i => i.id === id);
      if (found) item = found;
    }
  }

  if (!item) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Page Not Found</h1>
          <Link href="/hope-studio" className="mt-4 inline-block text-[#D96A32] hover:underline">
            ← Back to Hope Studio
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="border-b border-t border-[#D96A32]">
        <div className="mx-auto max-w-4xl px-4 py-6 text-center">
          <h1 className="text-2xl font-bold uppercase tracking-wider text-[#D96A32]">
            {item.title}
          </h1>
        </div>
      </div>

      <article className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-8 aspect-[16/9] w-full overflow-hidden rounded-xl bg-gray-100">
          <Image
            src={item.image}
            alt={item.title}
            width={1200}
            height={675}
            className="h-full w-full object-cover"
          />
        </div>

        <div
          className="prose prose-gray max-w-none"
          dangerouslySetInnerHTML={{ __html: item.content || "<p>Content coming soon...</p>" }}
          style={{ fontFamily: "Georgia, serif", fontSize: "16px", lineHeight: "1.8" }}
        />

        <div className="mt-10 border-t pt-6">
          <Link
            href="/hope-studio"
            className="inline-flex items-center gap-2 text-[#D96A32] hover:text-[#c45a28]"
          >
            ← Back to Hope Studio
          </Link>
        </div>
      </article>
    </main>
  );
}
