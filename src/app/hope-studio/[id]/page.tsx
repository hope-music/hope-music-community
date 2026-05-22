import Image from "next/image";
import Link from "next/link";

const CARDS = [
  {
    id: "welcome",
    title: "WELCOME TO HOPE MUSIC COMMUNITY",
    imageUrl: "https://images.unsplash.com/photo-1501612780327-45045538702b?w=1200",
    date: "Established 2024",
    content: [
      "Hope Music Community was founded on a simple belief: that music has the power to transform lives, connect cultures, and inspire greatness. From our first rehearsal room to the global stage, we have remained committed to nurturing talent, fostering creativity, and delivering unforgettable performances.",
      "Our community brings together musicians, composers, producers, stage technicians, and music lovers from every background. Whether you are here to perform, to learn, or simply to listen — you belong here. Hope Music Community is more than an organization; it is a living, breathing ecosystem where artistic vision meets technical excellence.",
      "We invite you to explore our performances, engage with our community forums, and discover the passion that drives everything we do. The stage is set. The music is ready. Welcome home.",
    ],
    replies: [
      {
        author: "StudioVisitor_Maya",
        avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        date: "June 26, 2026 at 9:15 AM",
        content: "What an inspiring mission statement. I've been following Hope Studio's work for two years now and the growth has been remarkable. Can't wait to see what comes next!",
      },
      {
        author: "AudioEngineer_Mike",
        avatarUrl: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop",
        date: "June 26, 2026 at 10:30 AM",
        content: "As someone who has worked behind the scenes at several Hope productions, I can confirm — the attention to detail here is unlike anywhere else. Truly a world-class team.",
      },
    ],
  },
  {
    id: "hope-studio",
    title: "HOPE STUDIO",
    imageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200",
    date: "Our Creative Home",
    content: [
      "Hope Studio is the creative engine of Hope Music Community — a space where ideas become experiences and musicians become storytellers. From songwriting to stage production, our studio operations span the full lifecycle of a performance.",
      "Our team of producers, sound engineers, lighting designers, and stage managers work in close collaboration to ensure that every show is technically flawless and emotionally resonant. We believe that the audience should feel the music in their bones — and our studio is built to make that possible.",
      "From our flagship Shangri-La immersive musical to community workshops and touring productions, Hope Studio is where the magic begins. Explore our work, meet our artists, and discover what makes this studio truly special.",
    ],
    replies: [
      {
        author: "LiveSound_Tech",
        avatarUrl: "https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=100&h=100&fit=crop",
        date: "June 25, 2026 at 3:45 PM",
        content: "The studio facilities here are exceptional. I've worked with touring productions across the country and Hope Studio's equipment and team are among the very best.",
      },
    ],
  },
  {
    id: "jesse-liu",
    title: "JESSE LIU | MUSIC ARTIST & FOUNDER",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200",
    date: "Founder & Artistic Director",
    content: [
      "Jesse Liu is the visionary founder and artistic director of Hope Music Community. A classically trained pianist turned multidisciplinary music producer, Jesse's career spans two decades of work in orchestral composition, electronic music production, and immersive theater design.",
      "After performing on stages across Asia and Europe, Jesse founded Hope Music Community with a singular mission: to create a space where musicians of all backgrounds could collaborate without barriers. Jesse's compositions blend Eastern harmonic traditions with Western orchestral structures, creating a sound that is entirely their own.",
      "Most notably, Jesse is the creative force behind Shangri-La — an ambitious immersive musical that has been in development since 2022. Described by critics as 'a work of profound emotional and technical ambition,' Shangri-La represents Jesse's vision for the future of live performance.",
      "When not composing or directing, Jesse mentors young musicians through the Hope Studio apprenticeship program and advocates for arts education in underserved communities.",
    ],
    replies: [
      {
        author: "HarmonyGuru_Omar",
        avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
        date: "June 24, 2026 at 8:00 AM",
        content: "Jesse's work on Shangri-La changed how I think about immersive theater. The way music, visuals, and spatial design work together is unlike anything I've experienced.",
      },
      {
        author: "SongCraft_Maya",
        avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop",
        date: "June 24, 2026 at 11:20 AM",
        content: "Having collaborated with Jesse on three productions now, I can say they have an extraordinary ability to find the emotional core of every piece. A true artist and a generous collaborator.",
      },
      {
        author: "TheaterHistorian_Mara",
        avatarUrl: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop",
        date: "June 25, 2026 at 2:10 PM",
        content: "Jesse's commitment to accessible arts education is as impressive as their artistic output. Hope Studio's mentorship program has launched so many young careers.",
      },
    ],
  },
  {
    id: "shangri-la",
    title: "SHANGRI-LA — A NEW MUSICAL —",
    imageUrl: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1200",
    date: "In Development Since 2022",
    content: [
      "Shangri-La is Hope Studio's most ambitious project to date — a fully immersive musical experience that dissolves the boundary between performer and audience. Currently in development, the show merges live orchestral performance, electronic sound design, interactive projection mapping, and original choreography into a single, seamless theatrical event.",
      "Set in a mythical valley where music has the power to heal, transform, and reveal hidden truths, Shangri-La follows three strangers who arrive at a mysterious sanctuary seeking refuge from a fractured world. As they participate in the sanctuary's rituals and confront their own histories, they discover that the music they have been running from was the very thing that could save them.",
      "Hope Studio's creative team has been developing Shangri-La in collaboration with dramaturgs, cultural consultants, and accessibility specialists to ensure the production is both artistically bold and widely inclusive. The show is planned for its world premiere in 2027.",
      "Shangri-La represents everything Hope Music Community stands for: bold artistic ambition, technical innovation, and a deep belief in music's power to change lives. We cannot wait to share it with the world.",
    ],
    replies: [
      {
        author: "SongCraft_Maya",
        avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop",
        date: "June 23, 2026 at 7:30 AM",
        content: "I was lucky enough to see a work-in-progress showing last year. Even in its unfinished form, Shangri-La was one of the most emotionally powerful theatrical experiences of my life.",
      },
      {
        author: "GearReviewer",
        avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
        date: "June 23, 2026 at 9:45 AM",
        content: "The technical design for this production is groundbreaking. The way they're integrating spatial audio with live performance is going to set a new industry standard.",
      },
      {
        author: "CommunityLead_Amara",
        avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        date: "June 24, 2026 at 12:00 PM",
        content: "Pre-registration for the world premiere is already open on the community site. Don't sleep on this — it's going to sell out fast.",
      },
    ],
  },
  {
    id: "works",
    title: "WORKS",
    imageUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200",
    date: "Productions & Projects",
    content: [
      "Hope Studio's portfolio spans a diverse range of productions — from intimate chamber concerts and community showcases to large-scale touring musicals and site-specific immersive experiences. Each project is approached with the same rigor, passion, and commitment to excellence.",
      "Our production philosophy centers on the belief that every show, regardless of scale, deserves world-class execution. This means investing in the best composers, the most talented performers, and the most innovative technical teams — because audiences everywhere deserve to be moved.",
      "Current and recent works include the Shangri-La immersive musical (in development), the annual Hope Music Festival touring program, community showcase nights at partner venues, educational workshops in partnership with regional music schools, and behind-the-scenes documentation series available on our community platform.",
      "Every production we undertake is an opportunity to push creative boundaries, forge new artistic partnerships, and demonstrate that music and theater can be both commercially sustainable and deeply meaningful.",
    ],
    replies: [
      {
        author: "AudioEngineer_Mike",
        avatarUrl: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop",
        date: "June 22, 2026 at 4:00 PM",
        content: "The production quality across all of Hope Studio's works is consistently exceptional. Whether it's a small chamber concert or a full stage production, the standard never slips.",
      },
      {
        author: "LiveSound_Tech",
        avatarUrl: "https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=100&h=100&fit=crop",
        date: "June 22, 2026 at 6:30 PM",
        content: "Been part of three Hope Studio productions now. The collaborative spirit here is unmatched — everyone from the director to the stage crew feels genuinely invested in the work.",
      },
    ],
  },
  {
    id: "schedule",
    title: "PERFORMANCE SCHEDULE",
    imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200",
    date: "Upcoming Events",
    content: [
      "Hope Music Community presents a dynamic schedule of performances, workshops, and community events throughout the year. From intimate acoustic sessions to full theatrical productions, our calendar reflects the breadth and diversity of our community.",
      "Upcoming highlights include the Summer Showcase Series (July–August), featuring emerging artists from our mentorship program alongside established names; the annual Hope Music Festival in September, a three-day celebration of live performance across multiple venues; community open rehearsals where audiences can experience works-in-progress and offer feedback; and the Shangri-La world premiere, dates to be announced.",
      "All tickets and registration are available through our community platform. Community members receive priority booking access and discounted rates for all events. Join Hope Music Community today to stay informed about upcoming performances, workshops, and exclusive behind-the-scenes content.",
      "For group bookings, venue partnerships, and educational institution rates, please contact our production office directly through the community portal.",
    ],
    replies: [
      {
        author: "HarmonyGuru_Omar",
        avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
        date: "June 21, 2026 at 10:00 AM",
        content: "The Summer Showcase Series lineup this year is incredible. I've already booked my tickets for three shows. Hope Music Community always delivers top-tier programming.",
      },
      {
        author: "CommunityLead_Amara",
        avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        date: "June 21, 2026 at 1:30 PM",
        content: "Don't forget — community members get first access to the Shangri-La premiere tickets before public release. Make sure your membership is active!",
      },
      {
        author: "TheaterHistorian_Mara",
        avatarUrl: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop",
        date: "June 22, 2026 at 9:15 AM",
        content: "The open rehearsal events are such a unique offering. There's nothing quite like seeing a work develop and being part of the creative process as an audience member.",
      },
    ],
  },
];

const VALID_IDS = CARDS.map((c) => c.id);

interface HopeStudioDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function HopeStudioDetailPage({ params }: HopeStudioDetailPageProps) {
  const { id } = await params;
  const card = CARDS.find((c) => c.id === id);

  if (!card) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <h1 className="mb-4 text-3xl font-bold text-gray-900">Page Not Found</h1>
          <p className="text-gray-500">
            This page does not exist.
          </p>
          <Link href="/hope-studio" className="mt-4 inline-block text-[#D96A32] hover:underline">
            ← Back to Hope Studio
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-[#D96A32] transition-colors">Home</Link>
            <span>/</span>
            <Link href="/hope-studio" className="hover:text-[#D96A32] transition-colors">Hope Studio</Link>
            <span>/</span>
            <span className="truncate max-w-xs text-gray-400">{card.title}</span>
          </nav>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative w-full aspect-[21/9] overflow-hidden bg-gray-100">
        <Image
          src={card.imageUrl}
          alt={card.title}
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10">
        {/* Header */}
        <div className="mb-6 flex items-start gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{card.title}</h1>
              <span className="shrink-0 rounded bg-[#C8102E] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                #1
              </span>
            </div>
            <p className="text-sm text-gray-500">{card.date}</p>
          </div>
        </div>

        {/* Content */}
        <article className="prose max-w-none space-y-6 leading-relaxed lg:prose-lg">
          {card.content.map((para, i) => (
            <p key={i} className="text-[15px] text-gray-700">{para}</p>
          ))}
        </article>

        {/* Reply Count */}
        <div className="mb-4 mt-10 flex items-center justify-between border-b border-gray-200 pb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            {card.replies.length} {card.replies.length === 1 ? "Reply" : "Replies"}
          </h2>
          <Link href="/hope-studio" className="text-sm text-[#D96A32] hover:underline">
            ← Back to Hope Studio
          </Link>
        </div>

        {/* Replies */}
        <div className="mb-8 flex flex-col gap-4">
          {card.replies.map((reply, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-[#D96A32] hover:shadow-md"
            >
              <div className="mb-3 flex items-center gap-3">
                <img
                  src={reply.avatarUrl}
                  alt={reply.author}
                  className="h-9 w-9 shrink-0 rounded-full object-cover"
                />
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-800">{reply.author}</span>
                  <span className="shrink-0 rounded bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    #{idx + 2}
                  </span>
                </div>
                <span className="ml-auto text-xs text-gray-400">{reply.date}</span>
              </div>
              <p className="text-[15px] leading-relaxed text-gray-700">{reply.content}</p>
            </div>
          ))}
        </div>

        {/* Leave a Reply */}
        <div className="rounded-xl border-2 border-dashed border-[#D96A32] bg-orange-50 p-6 text-center">
          <p className="mb-3 text-sm font-medium text-gray-600">
            Want to share your thoughts on this?
          </p>
          <button
            type="button"
            className="rounded-xl bg-[#C8102E] px-8 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-sm transition-all duration-200 hover:bg-[#a00d26] hover:shadow-md active:scale-95"
          >
            Leave a Reply
          </button>
        </div>
      </div>
    </main>
  );
}
