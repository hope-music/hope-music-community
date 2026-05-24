"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface Service {
  id: string;
  serviceName: string;
  description: string;
  availability: string;
  pricing: string;
  category: string;
  coverImage: string;
  content: string;
}

const CATEGORIES = [
  { value: "recording", label: "Recording" },
  { value: "mixing", label: "Mixing" },
  { value: "mastering", label: "Mastering" },
  { value: "production", label: "Production" },
  { value: "lessons", label: "Lessons" },
  { value: "rental", label: "Rental" },
  { value: "other", label: "Other" },
];

export default function HopeStudioPage() {
  const [items, setItems] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("admin_hope_studio");
    if (stored) setItems(JSON.parse(stored));
    setLoading(false);
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <div className="border-b border-t border-[#D96A32]">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center">
          <h1 className="text-2xl font-bold uppercase tracking-wider text-[#D96A32]">Hope Studio</h1>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10">
        {loading ? (
          <div className="py-20 text-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#D96A32]"></div></div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center text-gray-500"><p className="text-lg">No services available yet.</p></div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <Link key={item.id} href={`/hope-studio/${item.id}`} className="group flex flex-col">
                <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-100">
                  {item.coverImage ? (
                    <img src={item.coverImage} alt={item.serviceName} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gray-200">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-[#D96A32]/10 px-2 py-0.5 text-xs font-medium text-[#D96A32]">
                      {CATEGORIES.find((c) => c.value === item.category)?.label || item.category}
                    </span>
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-gray-900 group-hover:text-[#C8102E]">{item.serviceName}</h3>
                  {item.description && <p className="mt-2 text-sm text-gray-500 line-clamp-2">{item.description.replace(/<[^>]*>/g, "")}</p>}
                  {item.pricing && <p className="mt-2 text-sm font-semibold text-green-600">{item.pricing}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
