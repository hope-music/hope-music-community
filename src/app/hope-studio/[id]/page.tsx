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
  jsx?: React.ReactNode;
}

const DEFAULT_ITEMS: Record<string, ContentItem> = {
  welcome: { id: "welcome", title: "Welcome to Hope Music Community", image: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=1200", description: "", content: `
      <h2 style="font-size: 1.75rem; font-weight: 700; color: #e85d04; margin-bottom: 1.5rem;">Welcome Home</h2>
      
      <div style="background: linear-gradient(135deg, #fef3e2 0%, #fff8f0 100%); padding: 1.5rem; border-radius: 0.75rem; margin: 2rem 0; border-left: 4px solid #e85d04;">
        <p style="line-height: 1.8;">Hope Music Community is home to music lovers from every corner of the world. Welcome home!</p>
        <p style="line-height: 1.8; margin-top: 1rem;">You don't need to be a prodigy or pay for lessons. All you need is a dream — start here, where the music dreams of ordinary people come alive, simply because you love music.</p>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin: 2.5rem 0;">
        <div style="border-radius: 0.75rem; overflow: hidden; height: 300px; background: #f5f5f5;">
          <img src="https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=800" alt="Community" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
        </div>
        <div style="border-radius: 0.75rem; overflow: hidden; height: 300px; background: #f5f5f5;">
          <img src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800" alt="Music" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
        </div>
      </div>
      
      <div style="text-align: center; padding: 2.5rem; background: linear-gradient(135deg, #fff8f0 0%, #fef3e2 100%); border-radius: 0.75rem; margin: 2rem 0;">
        <h3 style="font-size: 1.5rem; font-weight: 700; color: #e85d04; margin-bottom: 1.5rem; font-style: italic;">(The Song)</h3>
        <div style="line-height: 2.2; font-size: 1.1rem; color: #444;">
          <p style="margin-bottom: 0.5rem;">Because you love music,</p>
          <p style="margin-bottom: 0.5rem;">The world begins to sing.</p>
          <p style="margin-bottom: 0.5rem;">Because you love music,</p>
          <p style="margin-bottom: 1.5rem;">Every heart takes wing.</p>
          <p style="margin-bottom: 0.5rem;">No need for fame, no need for gold,</p>
          <p style="margin-bottom: 0.5rem;">Just a dream and a song to hold.</p>
          <p style="margin-bottom: 0;">Because you love music,</p>
          <p style="font-weight: 700; color: #e85d04; margin-top: 0.5rem;">We all belong.</p>
        </div>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin: 0 0 2.5rem 0;">
        <div style="border-radius: 0.75rem; overflow: hidden; height: 300px; background: #f5f5f5;">
          <img src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800" alt="Performance" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
        </div>
        <div style="border-radius: 0.75rem; overflow: hidden; height: 300px; background: #f5f5f5;">
          <img src="https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800" alt="Concert" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
        </div>
      </div>
    ` },
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
  "jesse-liu": { id: "jesse-liu", title: "Jesse Liu", image: "/images/jesse-liu/Jesse Liu 1.jpg", description: "Vocalist, Composer, Music Producer & AI Musician", content: `
      <h2 style="font-size: 1.75rem; font-weight: 700; color: #e85d04; margin-bottom: 0.5rem;">Biography</h2>
      <h3 style="font-size: 1.25rem; font-weight: 600; color: #333; margin-bottom: 1.5rem;">Vocalist, Composer, Music Producer & AI Musician</h3>
      <p style="margin-bottom: 2rem; line-height: 1.8;">As one of the most revered music artists of our time, Jesse Liu is a crossover musician reshaping the industry through his masterful fusion of symphonic grandeur and electronic fashion.</p>
      
      <div style="background: linear-gradient(135deg, #fef3e2 0%, #fff8f0 100%); padding: 1.5rem; border-radius: 0.75rem; margin: 2rem 0; border-left: 4px solid #e85d04;">
        <p style="margin-bottom: 1rem; line-height: 1.8;">AI represents a landmark achievement in modern technology, bringing new possibilities to virtually every corner of the world — and the music industry is no exception.</p>
        <p style="margin-bottom: 0; line-height: 1.8;">Jesse Liu harnesses AI as a creative tool, broadening his channels for musical inspiration and elevating the efficiency of his production process. It is this forward-thinking approach that has earned him widespread recognition across the industry as a pioneering AI musician.</p>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin: 2.5rem 0;">
        <div style="border-radius: 0.75rem; overflow: hidden; height: 300px; background: #f5f5f5;">
          <img src="/images/jesse-liu/Jesse Liu 1.jpg" alt="Jesse Liu 1" style="width: 100%; height: 100%; object-fit: contain; display: block;" />
        </div>
        <div style="border-radius: 0.75rem; overflow: hidden; height: 300px; background: #f5f5f5;">
          <img src="/images/jesse-liu/Jesse Liu 2.jpg" alt="Jesse Liu 2" style="width: 100%; height: 100%; object-fit: contain; display: block;" />
        </div>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin: 0 0 2.5rem 0;">
        <div style="border-radius: 0.75rem; overflow: hidden; height: 300px; background: #f5f5f5;">
          <img src="/images/jesse-liu/Jesse Liu 3.jpg" alt="Jesse Liu 3" style="width: 100%; height: 100%; object-fit: contain; display: block;" />
        </div>
        <div style="border-radius: 0.75rem; overflow: hidden; height: 300px; background: #f5f5f5;">
          <img src="/images/jesse-liu/Jesse Liu 4.jpg" alt="Jesse Liu 4" style="width: 100%; height: 100%; object-fit: contain; display: block;" />
        </div>
      </div>
      
      <div style="margin-top: 2.5rem;">
        <h3 style="font-size: 1.25rem; font-weight: 600; color: #e85d04; margin-bottom: 1.5rem;">Works</h3>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
          <div style="background: #fff; border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <span style="display: inline-block; background: #e85d04; color: white; font-size: 0.75rem; font-weight: 600; padding: 0.25rem 0.75rem; border-radius: 9999px; margin-bottom: 0.75rem;">Musical</span>
            <h4 style="font-size: 1.125rem; font-weight: 700; color: #333; margin-bottom: 0.5rem;">Shangri-La</h4>
            <p style="color: #666; font-size: 0.875rem;">An immersive musical experience blending symphonic grandeur with electronic fashion.</p>
          </div>
          <div style="background: #fff; border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <span style="display: inline-block; background: #333; color: white; font-size: 0.75rem; font-weight: 600; padding: 0.25rem 0.75rem; border-radius: 9999px; margin-bottom: 0.75rem;">Book</span>
            <h4 style="font-size: 1.125rem; font-weight: 700; color: #333; margin-bottom: 0.5rem;">RESHAPE: Music Industry Needs</h4>
            <p style="color: #666; font-size: 0.875rem;">A visionary perspective on the future of the music industry.</p>
          </div>
        </div>
      </div>
    ` },
  "shangri-la": { id: "shangri-la", title: "Shangri-La", image: "/images/shangri-la/Shangri-La 1.jpg", description: "An immersive musical experience blending symphonic grandeur with electronic fashion", content: `
      <h2 style="font-size: 1.75rem; font-weight: 700; color: #e85d04; margin-bottom: 1.5rem;">About the Musical</h2>
      
      <div style="background: linear-gradient(135deg, #fef3e2 0%, #fff8f0 100%); padding: 1.5rem; border-radius: 0.75rem; margin: 2rem 0; border-left: 4px solid #e85d04;">
        <p style="line-height: 1.8;">The musical Shangri-La is a proof of concept that people from various walks of life can come together to build meaningful friendships. The vision behind Cultural Fusion events has always centred on uniting people through the shared joy of song and dance.</p>
      </div>
      
      <p style="line-height: 1.8; margin-bottom: 2rem;">In the musical, audiences are treated not only to beautiful music and stunning visuals, but also to a profound exploration of love. It is a touching story that showcases love's remarkable power to transcend time and space.</p>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin: 2.5rem 0;">
        <div style="border-radius: 0.75rem; overflow: hidden; height: 300px; background: #f5f5f5;">
          <img src="/images/shangri-la/Shangri-La 1.jpg" alt="Shangri-La 1" style="width: 100%; height: 100%; object-fit: contain; display: block;" />
        </div>
        <div style="border-radius: 0.75rem; overflow: hidden; height: 300px; background: #f5f5f5;">
          <img src="/images/shangri-la/Shangri-La 2.jpg" alt="Shangri-La 2" style="width: 100%; height: 100%; object-fit: contain; display: block;" />
        </div>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin: 0 0 2.5rem 0;">
        <div style="border-radius: 0.75rem; overflow: hidden; height: 300px; background: #f5f5f5;">
          <img src="/images/shangri-la/Shangri-La 3.jpg" alt="Shangri-La 3" style="width: 100%; height: 100%; object-fit: contain; display: block;" />
        </div>
        <div style="border-radius: 0.75rem; overflow: hidden; height: 300px; background: #f5f5f5;">
          <img src="/images/shangri-la/Shangri-La 4.jpg" alt="Shangri-La 4" style="width: 100%; height: 100%; object-fit: contain; display: block;" />
        </div>
      </div>
    ` },
  works: { id: "works", title: "Cooperation", image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200", description: "", content: "", jsx: (
      <>
        <h2 style={{ fontSize: "1.75rem", fontWeight: "700", color: "#e85d04", marginBottom: "1.5rem" }}>Join Our Creative Team</h2>
        
        <div style={{ background: "linear-gradient(135deg, #fef3e2 0%, #fff8f0 100%)", padding: "1.5rem", borderRadius: "0.75rem", margin: "2rem 0", borderLeft: "4px solid #e85d04" }}>
          <p style={{ lineHeight: "1.8", fontSize: "1.1rem", color: "#333" }}>Production is officially underway for the musical Shangri-La! We warmly welcome talented singers, instrumentalists, and dancers from all over the world to join our creative team.</p>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", margin: "2.5rem 0" }}>
          <div style={{ borderRadius: "0.75rem", overflow: "hidden", height: "300px", background: "#f5f5f5" }}>
            <img src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800" alt="Auditions" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
          <div style={{ borderRadius: "0.75rem", overflow: "hidden", height: "300px", background: "#f5f5f5" }}>
            <img src="https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800" alt="Performance" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
        </div>
        
        <div style={{ background: "#fff", borderRadius: "0.75rem", padding: "2rem", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", margin: "2rem 0" }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#e85d04", marginBottom: "1rem" }}>For Individual Artists</h3>
          <p style={{ lineHeight: "1.8", color: "#555" }}>Whether you represent an agency, performance group, theater, or other organization—or are an individual artist—we would love to explore a partnership with you.</p>
          <p style={{ lineHeight: "1.8", marginTop: "1rem", color: "#555" }}>To apply, please navigate to the "COOPERATION" section on our homepage and select <button onClick={() => window.dispatchEvent(new CustomEvent('openCooperationModal'))} style={{ color: "#e85d04", fontWeight: "600", textDecoration: "underline", cursor: "pointer", background: "none", border: "none", padding: 0, font: "inherit" }}>"WELCOME TO OUR MUSICAL PERFORMANCE TEAM."</button></p>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", margin: "0 0 2.5rem 0" }}>
          <div style={{ borderRadius: "0.75rem", overflow: "hidden", height: "300px", background: "#f5f5f5" }}>
            <img src="https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800" alt="Studio" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
          <div style={{ borderRadius: "0.75rem", overflow: "hidden", height: "300px", background: "#f5f5f5" }}>
            <img src="https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800" alt="Music" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
        </div>
        
        <div style={{ background: "linear-gradient(135deg, #e85d04 0%, #ff7b00 100%)", borderRadius: "0.75rem", padding: "2rem", margin: "2rem 0", color: "white" }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem" }}>Looking for Partners</h3>
          <p style={{ lineHeight: "1.8" }}>To connect with us, please visit the "COOPERATION" section on our homepage and select <button onClick={() => window.dispatchEvent(new CustomEvent('openBusinessCooperationModal'))} style={{ color: "white", fontWeight: "600", textDecoration: "underline", cursor: "pointer", background: "none", border: "none", padding: 0, font: "inherit" }}>"WE LOOK FORWARD TO COOPERATING WITH YOU ON ALL TYPES OF MUSIC BUSINESS PROJECTS."</button></p>
        </div>
      </>
    ) },
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
        <div className="mb-8 w-full overflow-hidden rounded-xl bg-gray-100" style={{ aspectRatio: "16/9" }}>
          <Image
            src={item.image}
            alt={item.title}
            width={1200}
            height={675}
            className="h-full w-full object-contain"
            style={{ backgroundColor: "#f5f5f5" }}
          />
        </div>

        <div
          dangerouslySetInnerHTML={{ __html: item.content || "<p>Content coming soon...</p>" }}
          style={{ fontFamily: "Georgia, serif", fontSize: "16px", lineHeight: "1.8", display: item.jsx ? "none" : "block" }}
        />
        {item.jsx && (
          <div style={{ fontFamily: "Georgia, serif", fontSize: "16px", lineHeight: "1.8" }}>
            {item.jsx}
          </div>
        )}

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
