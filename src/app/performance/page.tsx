"use client";

import { useState, useEffect } from "react";

interface DisplayEvent {
  name: string;
  date: string;
  image: string;
  hasEvents: boolean;
}

export default function PerformancePage() {
  const [operaEvent, setOperaEvent] = useState<DisplayEvent>({
    name: "Opera",
    date: "No upcoming events",
    image: "",
    hasEvents: false
  });

  const [musicalEvent, setMusicalEvent] = useState<DisplayEvent>({
    name: "Musical",
    date: "No upcoming events",
    image: "",
    hasEvents: false
  });

  const [classicalEvent, setClassicalEvent] = useState<DisplayEvent>({
    name: "Classical",
    date: "No upcoming events",
    image: "",
    hasEvents: false
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/ticketmaster/Opera/data.json")
      .then((res) => {
        if (!res.ok) throw new Error("No file yet");
        return res.json();
      })
      .then((data) => {
        if (data && data.length > 0) {
          const firstEvent = data[0];
          setOperaEvent({
            name: firstEvent.name,
            date: `Next: ${firstEvent.dates?.start?.localDate || "TBA"}`,
            image: firstEvent.images?.[0]?.url || "",
            hasEvents: true
          });
        }
      })
      .catch((err) => {
        console.log("Opera data not ready:", err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetch("/data/ticketmaster/Musical/data.json")
      .then((res) => {
        if (!res.ok) throw new Error("No file yet");
        return res.json();
      })
      .then((data) => {
        if (data && data.length > 0) {
          const firstEvent = data[0];
          setMusicalEvent({
            name: firstEvent.name,
            date: `Next: ${firstEvent.dates?.start?.localDate || "TBA"}`,
            image: firstEvent.images?.[0]?.url || "",
            hasEvents: true
          });
        }
      })
      .catch((err) => {
        console.log("Musical data not ready:", err.message);
      });
  }, []);

  useEffect(() => {
    fetch("/data/ticketmaster/Classical/data.json")
      .then((res) => {
        if (!res.ok) throw new Error("No file yet");
        return res.json();
      })
      .then((data) => {
        if (data && data.length > 0) {
          const firstEvent = data[0];
          setClassicalEvent({
            name: firstEvent.name,
            date: `Next: ${firstEvent.dates?.start?.localDate || "TBA"}`,
            image: firstEvent.images?.[0]?.url || "",
            hasEvents: true
          });
        }
      })
      .catch((err) => {
        console.log("Classical data not ready:", err.message);
      });
  }, []);

  const categories = [
    { id: "musical", label: "MUSICAL", defaultName: musicalEvent.name, status: musicalEvent.date, img: musicalEvent.image, has: musicalEvent.hasEvents, link: "/performance/musical" },
    { id: "opera", label: "OPERA", defaultName: operaEvent.name, status: operaEvent.date, img: operaEvent.image, has: operaEvent.hasEvents, link: "/performance/opera" },
    { id: "classical", label: "CLASSICAL", defaultName: classicalEvent.name, status: classicalEvent.date, img: classicalEvent.image, has: classicalEvent.hasEvents, link: "/performance/classical" },
    { id: "music", label: "MUSIC", defaultName: "Music", status: "No upcoming events", img: "", has: false, link: "/performance/music" },
    { id: "electronic", label: "ELECTRONIC", defaultName: "Electronic", status: "No upcoming events", img: "", has: false, link: "/performance/electronic" },
    { id: "pop-rock", label: "POP & ROCK", defaultName: "Pop & Rock", status: "No upcoming events", img: "", has: false, link: "/performance/pop-rock" },
    { id: "performance-art", label: "PERFORMANCE ART", defaultName: "Performance Art", status: "No upcoming events", img: "", has: false, link: "/performance/performance-art" },
    { id: "dance", label: "DANCE", defaultName: "Dance", status: "No upcoming events", img: "", has: false, link: "/performance/dance" },
    { id: "other", label: "OTHER", defaultName: "Other", status: "No upcoming events", img: "", has: false, link: "/performance/other" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-orange-500"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-orange-600 mb-8 border-b pb-4">Performance</h1>

        {/* 3x3 完美格子网格布局 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div key={cat.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white flex flex-col h-full">
              {/* 大栏目顶部的标签 */}
              <div className="bg-gray-100 text-center py-2 border-b font-bold text-gray-700 tracking-wider text-sm">
                {cat.label}
              </div>

              {/* 卡片内部细节 */}
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{cat.defaultName}</h3>
                <p className={`text-xs mb-4 ${cat.has ? "text-emerald-600 font-medium" : "text-gray-500"}`}>
                  {cat.status}
                </p>

                {/* 封面图片：如果有图就展示，没图就显示灰色占位块 */}
                <div className="aspect-[16/10] w-full overflow-hidden rounded-lg bg-gray-100 mb-6">
                  {cat.img ? (
                    <img src={cat.img} alt={cat.defaultName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gray-100 border border-dashed rounded-lg">
                      <span className="text-gray-400 text-sm">🎭 No Image</span>
                    </div>
                  )}
                </div>

                {/* 点击进入二级子页面的按钮 */}
                <a
                  href={cat.link}
                  className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition-colors mt-auto text-sm"
                >
                  View More
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
