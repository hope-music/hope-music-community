import Image from "next/image";
import Link from "next/link";
import { HOPE_STUDIO_CARDS } from "@/lib/mock-hope-studio-data";

export const metadata = { title: "Hope Studio" };

export default function HopeStudioPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Page Header */}
      <div className="border-b border-t border-[#D96A32] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center">
          <h1 className="text-2xl font-bold uppercase tracking-wider text-[#D96A32]">
            Hope Studio
          </h1>
        </div>
      </div>

      {/* 6-Card Premium Grid */}
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {HOPE_STUDIO_CARDS.map((card) => (
            <Link
              key={card.id}
              href={`/hope-studio/${card.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col"
            >
              {/* Image */}
              <div className="aspect-[3/4] w-full overflow-hidden rounded-2xl bg-gray-100 shadow-md">
                <Image
                  src={card.imageUrl}
                  alt={card.title}
                  width={600}
                  height={800}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              {/* Label */}
              <div className="mt-4 text-center">
                <h2 className="text-base font-bold uppercase tracking-wider text-[#D96A32]">
                  {card.title}
                </h2>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
