"use client";

import { use } from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CommentSection } from "@/components/comments/CommentSection";

interface ContentItem {
  id: string;
  title: string;
  image: string;
  description: string;
  content: string;
  hidden?: boolean;
}

const DEFAULT_ITEMS: Record<string, ContentItem> = {
  welcome: { id: "welcome", title: "Welcome to Hope Music Community", image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1200", description: "", content: "<p>Welcome to the Hope Music Community!</p>" },
  studio: { id: "studio", title: "Hope Studio", image: "/images/hope-studio/Hope Studio 1.png", description: "", content: `
      <h2 style="font-size: 1.75rem; font-weight: 700; color: #e85d04; margin-bottom: 1rem;">About Hope Studio</h2>
      <h3 style="font-size: 1.25rem; font-weight: 600; color: #333; margin-bottom: 1rem;">Music dream we create!</h3>
      <p style="margin-bottom: 2rem;">Hope Studio is an entertainment studio specializing in musical performance, pioneering forms of tourism entertainment, and multimedia production.</p>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin: 2rem 0;">
        <div style="border-radius: 0.75rem; overflow: hidden; height: 300px;">
          <img src="/images/hope-studio/Hope Studio 1.png" alt="Hope Studio 1" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
        </div>
        <div style="border-radius: 0.75rem; overflow: hidden; height: 300px;">
          <img src="/images/hope-studio/Hope Studio 2.png" alt="Hope Studio 2" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
        </div>
      </div>
      
      <div style="margin: 2rem 0;">
        <img src="/images/hope-studio/Hope Studio 3.jpg" alt="Hope Studio 3" style="width: 100%; height: auto; border-radius: 0.75rem;" />
      </div>
      
      <div style="margin-top: 2.5rem;">
        <h3 style="font-size: 1.25rem; font-weight: 600; color: #e85d04; margin-bottom: 1rem;">Musical Shows</h3>
        <p style="margin-bottom: 1rem;"><strong>Shangri-La</strong>, an upcoming musical produced by Hope Studio, is set to be a landmark work in the genre. It features an immersive soundscape that seamlessly blends traditional orchestral music with modern electronic music, offering audiences a truly refreshing experience. Complementing the music, AI-powered VR visuals deliver a breathtaking feast for the eyes.</p>
      </div>
      
      <div style="margin-top: 2rem;">
        <h3 style="font-size: 1.25rem; font-weight: 600; color: #e85d04; margin-bottom: 1rem;">Multimedia Production</h3>
        <p>Hope Studio pioneers innovative forms of tourism entertainment through immersive environments that integrate video, lighting, architecture, sound, and special effects to create remarkable visitor experiences.</p>
      </div>
    ` },
  "jesse-liu": { id: "jesse-liu", title: "Jesse Liu", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200", description: "", content: "<p>Jesse Liu is the founder.</p>" },
  "shangri-la": { id: "shangri-la", title: "Shangri-La", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200", description: "", content: "<p>Shangri-La experience.</p>" },
  works: { id: "works", title: "Cooperation", image: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=1200", description: "", content: "<p>Our portfolio.</p>" },
  schedule: { id: "schedule", title: "Performance Schedule", image: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1200", description: "", content: "<p>Performance schedule.</p>", hidden: true },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function HopeStudioDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [item, setItem] = useState(DEFAULT_ITEMS[id] || null);

  useEffect(() => {
    const loadData = () => {
      const stored = localStorage.getItem("hope_studio_content");
      if (stored) {
        try {
          const items: ContentItem[] = JSON.parse(stored);
          const found = items.find(i => i.id === id);
          if (found) {
            if (found.hidden) {
              router.replace("/hope-studio");
              return;
            }
            setItem(found);
          }
        } catch (e) {
          // Silent fail - will use empty state
        }
      } else {
        // Check default items for hidden status
        const defaultItem = DEFAULT_ITEMS[id];
        if (defaultItem && defaultItem.hidden) {
          router.replace("/hope-studio");
          return;
        }
      }
    };

    loadData();
    const interval = setInterval(loadData, 1000);
    return () => clearInterval(interval);
  }, [id, router]);

  if (!item) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Page Not Found</h1>
          <Link href="/hope-studio" className="mt-4 inline-block text-hmc-orange hover:underline">
            ← Back to Hope Studio
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="border-b border-t border-hmc-orange">
        <div className="mx-auto max-w-4xl px-4 py-6 text-center">
          <h1 className="text-2xl font-bold uppercase tracking-wider text-hmc-orange">
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
          dangerouslySetInnerHTML={{ __html: item.content || "<p>Content coming soon...</p>" }}
          style={{ fontFamily: "Georgia, serif", fontSize: "16px", lineHeight: "1.8" }}
        />

        <div className="mt-10 border-t pt-6">
          <Link
            href="/hope-studio"
            className="inline-flex items-center gap-2 text-hmc-orange hover:text-hmc-orange"
          >
            ← Back to Hope Studio
          </Link>
        </div>
      </article>

      {/* Comments Section */}
      <div className="mx-auto max-w-4xl px-4 pb-12">
        <CommentSection
          pageId={`hope-studio-${id}`}
          storageKey="hope_studio_comments"
          bannedUsersKey="hope_studio_banned_users"
          title="Hope Studio"
        />
      </div>
    </main>
  );
}
