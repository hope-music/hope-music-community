"use client";

import Image from "next/image";

const WELCOME_IMAGES = {
  image1: "/images/Welcome to Hope Music Community/Welcome to Hope Music Community 1.jpg",
  image2: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
  image3: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800",
  image4: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800",
};

export function WelcomeSection() {
  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <div className="text-center py-8">
        <h2 className="text-3xl font-bold text-hmc-orange mb-4">
          Welcome home!
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
          The Hope Music Community website was designed and developed by Hope Studio, leveraging advanced AI-assisted development tools.
        </p>
      </div>

      {/* Introduction */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 md:p-8 rounded-xl border-l-4 border-hmc-orange">
        <p className="text-gray-800 leading-relaxed text-lg mb-4">
          Hope Music Community is home to music lovers from every corner of the world.
        </p>
        <p className="text-gray-800 leading-relaxed text-lg">
          You don't need to be a prodigy or pay for lessons. All you need is a dream — start here, where the music dreams of ordinary people come alive, simply because you love music.
        </p>
      </div>

      {/* First Image Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl overflow-hidden h-64 md:h-80 bg-gray-100">
          <Image
            src={WELCOME_IMAGES.image1}
            alt="Community"
            width={800}
            height={600}
            className="w-full h-full object-cover"
            priority
          />
        </div>
        <div className="rounded-xl overflow-hidden h-64 md:h-80 bg-gray-100">
          <Image
            src={WELCOME_IMAGES.image2}
            alt="Music"
            width={800}
            height={600}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Song Section */}
      <div className="text-center py-10 px-6 bg-gradient-to-b from-orange-50 to-amber-50 rounded-xl">
        <h3 className="text-2xl font-bold text-hmc-orange italic mb-6">
          (The Song)
        </h3>
        <div className="space-y-1 text-gray-700 text-lg leading-relaxed">
          {`Because you love music,
The world begins to sing.
Because you love music,
Every heart takes wing.

No need for fame, no need for gold,
Just a dream and a song to hold.

Because you love music,
We all belong.`.split('\n').map((line, index) => (
            <p key={index} className={line === "" ? "h-4" : ""}>
              {line}
            </p>
          ))}
        </div>
      </div>

      {/* Second Image Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl overflow-hidden h-64 md:h-80 bg-gray-100">
          <Image
            src={WELCOME_IMAGES.image3}
            alt="Performance"
            width={800}
            height={600}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="rounded-xl overflow-hidden h-64 md:h-80 bg-gray-100">
          <Image
            src={WELCOME_IMAGES.image4}
            alt="Concert"
            width={800}
            height={600}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Final CTA */}
      <div className="text-center py-8">
        <p className="text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto">
          Join us in this musical journey and let your voice be heard.
        </p>
      </div>
    </div>
  );
}
