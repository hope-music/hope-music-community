"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export interface TeamMember {
  role: string;
  name: string;
}

export interface ShangriLaData {
  introText1: string;
  introText2: string;
  coreTeamTitle: string;
  teamMembers: TeamMember[];
  daisyLiTitle: string;
  daisyLiContent: string;
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
    { role: "Music and Lyrics by", name: "Jesse Liu" },
    { role: "Book and Lyrics by", name: "Daisy Li" },
  ],
  daisyLiTitle: "About Daisy Li",
  daisyLiContent: "Daisy Li is a masterful storyteller. She conceived the story within a fictional musical kingdom called Shangri-La, transporting its setting to the future to give full expression to the grandeur of its electronic soundscape. The result is an epic space journey to rescue the music kingdom — a narrative canvas that lets the electronic score truly soar.\n\nAt the heart of the story lies Daisy Li's inspired invention: the \"Music Seeds.\" Their transformation drives the entire arc of the plot, while simultaneously illuminating music as the living soul of the Kingdom of Shangri-La.",
  image1: "/images/shangri-la/Shangri-La 1.jpg",
  image2: "/images/shangri-la/Shangri-La 2.jpg",
  image3: "/images/shangri-la/Shangri-La 3.jpg",
  image4: "/images/shangri-la/Shangri-La 4.jpg",
};

const SHANGRI_LA_STORAGE_KEY = "shangri_la_content";

function TeamMemberCard({ member }: { member: TeamMember }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 text-center">
      <p className="text-gray-600 text-sm mb-1">{member.role}</p>
      <h4 className="text-lg font-bold text-gray-900">{member.name}</h4>
    </div>
  );
}

function ShangriLaContent({ data }: { data: ShangriLaData }) {
  return (
    <div className="space-y-10">
      {/* Introduction Section */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 md:p-8 rounded-xl border-l-4 border-hmc-orange">
        <p className="text-gray-800 leading-relaxed text-lg mb-4">
          {data.introText1}
        </p>
        <p className="text-gray-800 leading-relaxed text-lg">
          {data.introText2}
        </p>
      </div>

      {/* Core Creative Team Section */}
      <div>
        <h3 className="text-xl md:text-2xl font-bold text-hmc-orange mb-6">
          {data.coreTeamTitle}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.teamMembers.map((member, index) => (
            <TeamMemberCard key={index} member={member} />
          ))}
        </div>
      </div>

      {/* First Image Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl overflow-hidden h-64 md:h-80 bg-gray-100">
          <Image
            src={data.image1}
            alt="Shangri-La 1"
            width={800}
            height={600}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="rounded-xl overflow-hidden h-64 md:h-80 bg-gray-100">
          <Image
            src={data.image2}
            alt="Shangri-La 2"
            width={800}
            height={600}
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* About Daisy Li Section */}
      <div>
        <h3 className="text-xl md:text-2xl font-bold text-hmc-orange mb-4">
          {data.daisyLiTitle}
        </h3>
        <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100">
          {data.daisyLiContent.split('\n\n').map((paragraph, index) => (
            <p key={index} className="text-gray-700 leading-relaxed text-lg mb-4 last:mb-0">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* Second Image Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl overflow-hidden h-64 md:h-80 bg-gray-100">
          <Image
            src={data.image3}
            alt="Shangri-La 3"
            width={800}
            height={600}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="rounded-xl overflow-hidden h-64 md:h-80 bg-gray-100">
          <Image
            src={data.image4}
            alt="Shangri-La 4"
            width={800}
            height={600}
            className="w-full h-full object-contain"
          />
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
