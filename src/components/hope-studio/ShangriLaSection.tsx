"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

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
      description: "Jesse Liu is a crossover musician reshaping the industry through his masterful fusion of symphonic grandeur and electronic fashion. As one of the most revered music artists of our time, he brings a unique vision to Shangri-La's electronic soundscape.",
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

function JesseLiuCard({ member }: { member: TeamMember }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 text-center border-b border-gray-100">
        <p className="text-gray-600 text-sm mb-1">{member.role}</p>
        <h4 className="text-xl font-bold text-gray-900">{member.name}</h4>
      </div>
      <div className="p-6">
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
          {member.description}
        </p>
      </div>
    </div>
  );
}

function DaisyLiCard({ member }: { member: TeamMember }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 text-center border-b border-gray-100">
        <p className="text-gray-600 text-sm mb-1">{member.role}</p>
        <h4 className="text-xl font-bold text-gray-900">{member.name}</h4>
      </div>
      {member.image && (
        <div className="p-6 flex justify-center">
          <div className="w-40 h-40 rounded-full overflow-hidden bg-gray-100">
            <Image
              src={member.image}
              alt={member.name}
              width={160}
              height={160}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}
      <div className="p-6 pt-0">
        {member.description?.split('\n\n').map((paragraph, index) => (
          <p key={index} className="text-gray-700 leading-relaxed mb-4 last:mb-0">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}

function TeamMemberCard({ member }: { member: TeamMember }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 text-center">
      <p className="text-gray-600 text-sm mb-1">{member.role}</p>
      <h4 className="text-lg font-bold text-gray-900">{member.name}</h4>
    </div>
  );
}

function ShangriLaContent({ data }: { data: ShangriLaData }) {
  const jesseLiu = data.teamMembers.find(m => m.id === "jesse-liu");
  const daisyLi = data.teamMembers.find(m => m.id === "daisy-li");
  const otherMembers = data.teamMembers.filter(m => m.id !== "jesse-liu" && m.id !== "daisy-li");

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

      {/* Image Grid - 4 images before Core Creative Team */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { key: "image1" as const, src: data.image1, alt: "Shangri-La 1" },
          { key: "image2" as const, src: data.image2, alt: "Shangri-La 2" },
          { key: "image3" as const, src: data.image3, alt: "Shangri-La 3" },
          { key: "image4" as const, src: data.image4, alt: "Shangri-La 4" },
        ].map(({ key, src, alt }) => (
          <div key={key} className="rounded-xl overflow-hidden h-40 md:h-48 bg-gray-100">
            <Image
              src={src}
              alt={alt}
              width={400}
              height={300}
              className="w-full h-full object-contain"
            />
          </div>
        ))}
      </div>

      {/* Core Creative Team Section */}
      <div>
        <h3 className="text-xl md:text-2xl font-bold text-hmc-orange mb-6">
          {data.coreTeamTitle}
        </h3>

        {/* Jesse Liu Card */}
        {jesseLiu && <JesseLiuCard member={jesseLiu} />}

        {/* Daisy Li Card with Photo */}
        {daisyLi && <DaisyLiCard member={daisyLi} />}

        {/* Other Team Members */}
        {otherMembers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {otherMembers.map((member) => (
              <TeamMemberCard key={member.id} member={member} />
            ))}
          </div>
        )}
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
