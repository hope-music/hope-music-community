"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export interface TeamMember {
  id: string;
  role: string;
  name: string;
  description?: string;
  image?: string;
}

export interface ShangriLaData {
  introText1: string;
  introText2: string;
  coreTeamTitle: string;
  teamMembers: TeamMember[];
  image1: string;
  image2: string;
  image3: string;
  image4: string;
}

export const DEFAULT_SHANGRI_LA_DATA: ShangriLaData = {
  introText1: "The musical Shangri-La is a proof of concept that people from various walks of life can come together to build meaningful friendships. The vision behind Cultural Fusion events has always centred on uniting people through the shared joy of song and dance.",
  introText2: "In the musical, audiences are treated not only to beautiful music and stunning visuals, but also to a profound exploration of love. It is a touching story that showcases love's remarkable power to transcend time and space.",
  coreTeamTitle: "Core creative team:",
  teamMembers: [
    {
      id: "jesse-liu",
      role: "Music and Lyrics by",
      name: "Jesse Liu",
    },
    {
      id: "daisy-li",
      role: "Book and Lyrics by",
      name: "Daisy Li",
      description: "Daisy Li is a masterful storyteller. She conceived the story within a fictional musical kingdom called Shangri-La, transporting its setting to the future to give full expression to the grandeur of its electronic soundscape. The result is an epic space journey to rescue the music kingdom — a narrative canvas that lets the electronic score truly soar.\n\nAt the heart of the story lies Daisy Li's inspired invention: the \"Music Seeds.\" Their transformation drives the entire arc of the plot, while simultaneously illuminating music as the living soul of the Kingdom of Shangri-La.",
      image: "/images/shangri-la/Li.jpg",
    },
  ],
  image1: "/images/shangri-la/Shangri-La 1.jpg",
  image2: "/images/shangri-la/Shangri-La 2.jpg",
  image3: "/images/shangri-la/Shangri-La 3.jpg",
  image4: "/images/shangri-la/Shangri-La 4.jpg",
};

const SHANGRI_LA_STORAGE_KEY = "shangri_la_content";

function ShangriLaContent({ data }: { data: ShangriLaData }) {
  const jesseLiu = data.teamMembers.find(m => m.id === "jesse-liu");
  const daisyLi = data.teamMembers.find(m => m.id === "daisy-li");

  return (
    <div className="space-y-12">
      {/* Section 1: First paragraph + Images 1 & 2 */}
      <div>
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 md:p-8 rounded-xl border-l-4 border-hmc-orange mb-6">
          <p className="text-gray-800 leading-relaxed text-lg">
            {data.introText1}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl overflow-hidden h-64 md:h-80 bg-gray-100">
            <Image
              src={data.image1}
              alt="Shangri-La 1"
              width={800}
              height={500}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="rounded-xl overflow-hidden h-64 md:h-80 bg-gray-100">
            <Image
              src={data.image2}
              alt="Shangri-La 2"
              width={800}
              height={500}
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Second paragraph + Images 3 & 4 */}
      <div>
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 md:p-8 rounded-xl border-l-4 border-hmc-orange mb-6">
          <p className="text-gray-800 leading-relaxed text-lg">
            {data.introText2}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl overflow-hidden h-64 md:h-80 bg-gray-100">
            <Image
              src={data.image3}
              alt="Shangri-La 3"
              width={800}
              height={500}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="rounded-xl overflow-hidden h-64 md:h-80 bg-gray-100">
            <Image
              src={data.image4}
              alt="Shangri-La 4"
              width={800}
              height={500}
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>

      {/* Core Creative Team Section */}
      <div>
        <h3 className="text-xl md:text-2xl font-bold text-hmc-orange mb-6">
          {data.coreTeamTitle}
        </h3>

        <div className="space-y-8">
          {/* Jesse Liu - Full width card */}
          {jesseLiu && (
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-100 px-6 py-4">
                <p className="text-gray-500 text-sm">{jesseLiu.role}</p>
                <Link href="/hope-studio/jesse-liu" className="text-xl font-bold text-gray-900 hover:text-hmc-orange">
                  {jesseLiu.name}
                </Link>
              </div>
              <div className="p-6">
                <p className="text-gray-500 italic">Learn more about Jesse Liu's musical journey</p>
              </div>
            </div>
          )}

          {/* Daisy Li - Image + Text side by side */}
          {daisyLi && (
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="border-b-2 border-hmc-orange px-6 py-4">
                <p className="text-gray-500 text-sm">{daisyLi.role}</p>
                <h4 className="text-xl font-bold text-gray-900">{daisyLi.name}</h4>
              </div>
              <div className="md:flex md:items-stretch">
                {/* Image on the left - smaller, centered */}
                <div className="md:w-1/4 md:flex md:items-center md:justify-center bg-gray-50 p-6">
                  {daisyLi.image ? (
                    <Image
                      src={daisyLi.image}
                      alt={daisyLi.name}
                      width={200}
                      height={200}
                      className="w-40 h-40 md:w-44 md:h-44 rounded-md object-cover"
                    />
                  ) : (
                    <div className="w-40 h-40 md:w-44 md:h-44 flex items-center justify-center text-gray-400 bg-gray-100 rounded-md">
                      No Photo
                    </div>
                  )}
                </div>
                {/* Content on the right - larger, centered */}
                <div className="md:w-3/4 p-6 md:flex md:items-center">
                  <div className="prose prose-gray max-w-none w-full">
                    {daisyLi.description?.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="text-gray-700 leading-relaxed mb-4 last:mb-0">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ShangriLaSection() {
  const [data, setData] = useState<ShangriLaData>(DEFAULT_SHANGRI_LA_DATA);

  useEffect(() => {
    const loadData = () => {
      const stored = localStorage.getItem(SHANGRI_LA_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setData({ ...DEFAULT_SHANGRI_LA_DATA, ...parsed });
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

  return <ShangriLaContent data={data} />;
}

export { SHANGRI_LA_STORAGE_KEY };
export type { ShangriLaData };
