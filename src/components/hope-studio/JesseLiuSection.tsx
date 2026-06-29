"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export interface Work {
  title: string;
  type: string;
  description: string;
}

export interface JesseLiuData {
  subtitle: string;
  introText: string;
  quoteText: string;
  image1: string;
  image2: string;
  image3: string;
  image4: string;
  worksTitle: string;
  works: Work[];
}

export const DEFAULT_JESSE_LIU_DATA: JesseLiuData = {
  subtitle: "Vocalist, Composer, Music Producer & AI Musician",
  introText: "As one of the most revered music artists of our time, Jesse Liu is a crossover musician reshaping the industry through his masterful fusion of symphonic grandeur and electronic fashion.",
  quoteText: "AI represents a landmark achievement in modern technology, bringing new possibilities to virtually every corner of the world — and the music industry is no exception. Jesse Liu harnesses AI as a creative tool, broadening his channels for musical inspiration and elevating the efficiency of his production process. It is this forward-thinking approach that has earned him widespread recognition across the industry as a pioneering AI musician.",
  image1: "/images/jesse-liu/Jesse Liu 1.jpg",
  image2: "/images/jesse-liu/Jesse Liu 2.jpg",
  image3: "/images/jesse-liu/Jesse Liu 3.jpg",
  image4: "/images/jesse-liu/Jesse Liu 4.jpg",
  worksTitle: "Works",
  works: [
    { title: "Shangri-La", type: "Musical", description: "An immersive musical experience blending symphonic grandeur with electronic fashion." },
    { title: "RESHAPE: Music Industry Needs", type: "Book", description: "A visionary perspective on the future of the music industry." },
  ],
};

const JESSE_LIU_STORAGE_KEY = "jesse_liu_content";

function WorkCard({ work }: { work: Work }) {
  const badgeColor = work.type === "Musical" ? "bg-hmc-orange" : "bg-gray-800";

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <span className={`inline-block ${badgeColor} text-white text-xs font-semibold px-3 py-1 rounded-full mb-3`}>
        {work.type}
      </span>
      <h4 className="text-lg font-bold text-gray-900 mb-2">{work.title}</h4>
      <p className="text-gray-600 text-sm">{work.description}</p>
    </div>
  );
}

function JesseLiuContent({ data }: { data: JesseLiuData }) {
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

      {/* Quote Section */}
      <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100">
        <p className="text-gray-700 leading-relaxed text-lg italic">
          {data.quoteText}
        </p>
      </div>

      {/* First Image Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl overflow-hidden h-64 md:h-80 bg-gray-100">
          <Image
            src={data.image1}
            alt="Jesse Liu 1"
            width={800}
            height={600}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="rounded-xl overflow-hidden h-64 md:h-80 bg-gray-100">
          <Image
            src={data.image2}
            alt="Jesse Liu 2"
            width={800}
            height={600}
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Second Image Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl overflow-hidden h-64 md:h-80 bg-gray-100">
          <Image
            src={data.image3}
            alt="Jesse Liu 3"
            width={800}
            height={600}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="rounded-xl overflow-hidden h-64 md:h-80 bg-gray-100">
          <Image
            src={data.image4}
            alt="Jesse Liu 4"
            width={800}
            height={600}
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Works Section */}
      <div className="mt-10">
        <h3 className="text-xl md:text-2xl font-bold text-hmc-orange mb-6">
          {data.worksTitle}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.works.map((work, index) => (
            <WorkCard key={index} work={work} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function JesseLiuSection() {
  const [data, setData] = useState<JesseLiuData>(DEFAULT_JESSE_LIU_DATA);

  useEffect(() => {
    const loadData = () => {
      const stored = localStorage.getItem(JESSE_LIU_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setData({ ...DEFAULT_JESSE_LIU_DATA, ...parsed });
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

  return <JesseLiuContent data={data} />;
}

export { JESSE_LIU_STORAGE_KEY };
