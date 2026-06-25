"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export interface StudioData {
  subtitle: string;
  introText: string;
  musicalShowsTitle: string;
  musicalShowsContent: string;
  multimediaTitle: string;
  multimediaContent: string;
  image1: string;
  image2: string;
  image3: string;
}

export const DEFAULT_STUDIO_DATA: StudioData = {
  subtitle: "Music dream we create!",
  introText: "Hope Studio is an entertainment studio specializing in musical performance, innovative tourism entertainment, and multimedia production — founded by Jesse Liu.",
  musicalShowsTitle: "Musical Shows",
  musicalShowsContent: `Shangri-La, a musical produced by Hope Studio, is set to be a landmark work in the genre. It features an immersive soundscape that seamlessly blends traditional orchestral music with modern electronic music, offering audiences a truly refreshing experience. Complementing the music, AI-powered VR visuals deliver a breathtaking feast for the eyes.`,
  multimediaTitle: "Multimedia Production",
  multimediaContent: "Hope Studio pioneers innovative forms of tourism entertainment through immersive environments that integrate video, lighting, architecture, sound, and special effects to create remarkable visitor experiences.",
  image1: "/images/hope-studio/Hope Studio 1.png",
  image2: "/images/hope-studio/Hope Studio 2.png",
  image3: "/images/hope-studio/Hope Studio 3.jpg",
};

const STUDIO_STORAGE_KEY = "studio_content";

function StudioContent({ data }: { data: StudioData }) {
  return (
    <div className="space-y-10">
      {/* Subtitle */}
      <div className="text-center">
        <h3 className="text-xl md:text-2xl font-semibold text-gray-800">
          {data.subtitle}
        </h3>
      </div>

      {/* Introduction */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 md:p-8 rounded-xl border-l-4 border-hmc-orange">
        <p className="text-gray-800 leading-relaxed text-lg">
          {data.introText}
        </p>
      </div>

      {/* First Image Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl overflow-hidden h-64 md:h-80 bg-gray-100">
          <Image
            src={data.image1}
            alt="Hope Studio 1"
            width={800}
            height={600}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="rounded-xl overflow-hidden h-64 md:h-80 bg-gray-100">
          <Image
            src={data.image2}
            alt="Hope Studio 2"
            width={800}
            height={600}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Full Width Image */}
      <div className="rounded-xl overflow-hidden h-64 md:h-96 bg-gray-100">
        <Image
          src={data.image3}
          alt="Hope Studio 3"
          width={1200}
          height={600}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Musical Shows Section */}
      <div className="mt-8">
        <h3 className="text-xl md:text-2xl font-bold text-hmc-orange mb-4">
          {data.musicalShowsTitle}
        </h3>
        <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100">
          <p className="text-gray-700 leading-relaxed text-lg">
            {data.musicalShowsContent}
          </p>
        </div>
      </div>

      {/* Multimedia Production Section */}
      <div>
        <h3 className="text-xl md:text-2xl font-bold text-hmc-orange mb-4">
          {data.multimediaTitle}
        </h3>
        <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100">
          <p className="text-gray-700 leading-relaxed text-lg">
            {data.multimediaContent}
          </p>
        </div>
      </div>
    </div>
  );
}

export function StudioSection() {
  const [data, setData] = useState<StudioData>(DEFAULT_STUDIO_DATA);

  useEffect(() => {
    const loadData = () => {
      const stored = localStorage.getItem(STUDIO_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setData({ ...DEFAULT_STUDIO_DATA, ...parsed });
        } catch (e) {
          // Silent fail
        }
      }
    };

    loadData();
    window.addEventListener("storage", loadData);
    const interval = setInterval(loadData, 1000);

    return () => {
      window.removeEventListener("storage", loadData);
      clearInterval(interval);
    };
  }, []);

  return <StudioContent data={data} />;
}

export { STUDIO_STORAGE_KEY };
export type { StudioData };
