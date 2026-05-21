import React from 'react';
import Link from 'next/link';

function ShangriLaBanner() {
  return (
    <div className="mx-auto max-w-6xl px-4 lg:px-8 py-6">
      {/* The Main Red Card - Aligned with CooperationBar width */}
      <div className="w-full bg-[#C8102E] rounded-2xl shadow-md px-8 md:px-12 py-12 md:py-16 flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* Left Text Side */}
        <div className="max-w-3xl flex-1 text-center md:text-left">
          <p className="text-white text-base md:text-lg lg:text-xl font-normal leading-relaxed tracking-wide">
            Fusing diverse musical genres with immersive audio and visuals, the innovative{" "}
            <span className="font-semibold">Shangri-La</span> sits at the cutting edge of modern
            musical theater.
          </p>
        </div>

        {/* Right Button Side */}
        <div className="flex-shrink-0">
          <Link
            href="/performance/musical/shangri-la"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-gray-900 font-medium px-8 py-3 rounded-full text-sm shadow transition-all duration-200 hover:bg-gray-100 hover:scale-105"
          >
            Go to <span className="italic">Shangri-La</span>
          </Link>
        </div>

      </div>
    </div>
  );
}

export { ShangriLaBanner as CtaBanner };
export default ShangriLaBanner;
