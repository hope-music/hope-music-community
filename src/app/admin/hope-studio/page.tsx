"use client";

import { useState } from "react";
import Link from "next/link";

const HOPE_STUDIO_ITEMS = [
  { id: "welcome", title: "Welcome to Hope Music Community", image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800" },
  { id: "studio", title: "Hope Studio", image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800" },
  { id: "jesse-liu", title: "Jesse Liu", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800" },
  { id: "shangri-la", title: "Shangri-La", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800" },
  { id: "works", title: "Works", image: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800" },
  { id: "schedule", title: "Performance Schedule", image: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800" },
];

export default function AdminHopeStudioPage() {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hope Studio</h1>
          <p className="mt-1 text-sm text-gray-500">Fixed content pages - no editing needed</p>
        </div>
      </div>

      <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
        These are fixed content pages. Content is managed in the source code.
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {HOPE_STUDIO_ITEMS.map((item) => (
          <div key={item.id} className="rounded-lg border border-gray-200 bg-white p-4">
            <img src={item.image} alt={item.title} className="h-32 w-full rounded-md object-cover" />
            <h3 className="mt-3 text-center font-medium text-gray-900">{item.title}</h3>
            <div className="mt-3 flex justify-center border-t pt-3">
              <a
                href={`/hope-studio/${item.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-200"
              >
                View Page
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
