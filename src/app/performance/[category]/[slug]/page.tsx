"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { CommentSection } from "@/components/comments/CommentSection";
import { PERFORMANCE_CATEGORY_OPTIONS } from "@/lib/constants";
import { useStageProductionDetail } from "@/lib/useSupabase";

interface Production {
  _id: string;
  title: string;
  category: string;
  description: string;
  coverImage: string;
  content: string;
  status: "upcoming" | "past" | "draft";
  eventDate?: number;
  city?: string;
  url?: string;
}

const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;

type DisplayStatus = "upcoming" | "recent" | "archived";

function getDisplayStatus(eventDate?: number): DisplayStatus {
  if (!eventDate) return "upcoming";
  const now = Date.now();
  if (eventDate > now) return "upcoming";
  const elapsed = now - eventDate;
  if (elapsed <= TWO_WEEKS_MS) return "recent";
  return "archived";
}

function isVisible(eventDate?: number): boolean {
  return getDisplayStatus(eventDate) !== "archived";
}

function canBookTickets(eventDate?: number): boolean {
  if (!eventDate) return false;
  return eventDate >= Date.now();
}

export default function PerformanceDetailPage() {
  const params = useParams();
  const category = (params?.category as string) || "";
  const slug = (params?.slug as string) || "";

  const [scrollProgress, setScrollProgress] = useState(0);

  // Supabase query
  const { item, loading } = useStageProductionDetail(slug);

  const relatedItems = []; // Supabase detail fetch doesn't include related items; skip for now

  const categoryLabel = useMemo(() =>
    PERFORMANCE_CATEGORY_OPTIONS.find((c) => c.value === item?.category)?.label || item?.category || "",
    [item?.category]
  );

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      setScrollProgress(scrolled);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const formatDate = (ts?: number) => {
    if (!ts) return "";
    return new Date(ts).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  const formatTime = (ts?: number) => {
    if (!ts) return "";
    return new Date(ts).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  };

  const formatShortDate = (ts?: number) => {
    if (!ts) return "";
    return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) +
      " at " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  };

  const categoryLabel = useMemo(() => 
    PERFORMANCE_CATEGORY_OPTIONS.find((c) => c.value === item?.category)?.label || item?.category || "",
    [item?.category]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-orange-200 border-t-hmc-orange animate-spin"></div>
          <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-b-orange-300 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }}></div>
        </div>
      </div>
    );
  }

  // If item is found but archived, redirect to category page
  if (item && getDisplayStatus(item.eventDate) === "archived") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">This Event Has Been Archived</h1>
        <p className="text-gray-500 mb-8">Events are archived 2 weeks after completion.</p>
        <Link href={`/performance/${item.category}`} className="group px-6 py-3 bg-hmc-orange text-white rounded-full hover:bg-hmc-orange transition-all duration-300 flex items-center gap-2 shadow-lg shadow-orange-200">
          <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to {categoryLabel}
        </Link>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Performance Not Found</h1>
        <p className="text-gray-500 mb-8">The performance you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/performance" className="group px-6 py-3 bg-hmc-orange text-white rounded-full hover:bg-hmc-orange transition-all duration-300 flex items-center gap-2 shadow-lg shadow-orange-200">
          <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Performance
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-100 z-50">
        <div 
          className="h-full bg-gradient-to-r from-hmc-orange to-orange-400 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          {item.coverImage ? (
            <Image
              src={item.coverImage}
              alt={item.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
          )}
          {/* Multi-layer gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-8 w-24 h-24 border border-white/10 rounded-full animate-pulse" />
        <div className="absolute bottom-32 right-16 w-32 h-32 border border-white/5 rounded-full" />
        
        {/* Content */}
        <div className="absolute inset-0 flex items-end">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-white/60 mb-6">
              <Link href="/performance" className="hover:text-white transition-colors">Performance</Link>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <Link href={`/performance/${item.category}`} className="hover:text-white transition-colors">{categoryLabel}</Link>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-white/40 truncate max-w-[200px]">{item.title}</span>
            </nav>

            {/* Category Badge */}
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-hmc-orange text-white text-xs font-semibold rounded-full uppercase tracking-wider">
                {categoryLabel}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 max-w-4xl">
              {item.title}
            </h1>

            {/* Prominent Time Display */}
            {item.eventDate && (
              <div className="mb-6 flex items-center gap-3">
                <div className="px-5 py-3 bg-hmc-orange text-white rounded-2xl shadow-lg shadow-orange-500/30">
                  <p className="text-2xl font-bold">{formatDate(item.eventDate)}</p>
                  <p className="text-sm opacity-90 mt-0.5">{formatTime(item.eventDate)}</p>
                </div>
              </div>
            )}

            {/* Quick Info Pills */}
            <div className="flex flex-wrap items-center gap-4">
              {item.city && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white">
                  <svg className="w-5 h-5 text-hmc-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>{item.city}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-white/50 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="relative -mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Floating Info Card */}
          <div className="bg-white rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-100 p-8 mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Event Details */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="w-1 h-6 bg-hmc-orange rounded-full"></span>
                    About This Performance
                  </h2>
                  <div className="bg-gradient-to-br from-gray-50 to-orange-50/30 rounded-xl p-6 border border-gray-100">
                    <p className="text-gray-600 leading-relaxed text-lg">
                      {item.description || "No description available for this performance."}
                    </p>
                  </div>
                </div>

                {item.content && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="w-1 h-6 bg-hmc-orange rounded-full"></span>
                      Event Details
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.content }} />
                  </div>
                )}
              </div>

              {/* Sidebar - Event Info & CTA */}
              <div className="space-y-6">
                {/* Event Info Card */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
                  <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4">Event Information</h3>
                  
                  <div className="space-y-4">
                    {item.eventDate && (
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-hmc-orange/20 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-hmc-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-white/40">Date & Time</p>
                          <p className="font-medium">{formatDate(item.eventDate)}</p>
                          <p className="font-semibold text-hmc-orange text-lg">{formatTime(item.eventDate)}</p>
                        </div>
                      </div>
                    )}

                    {item.city && (
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-hmc-orange/20 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-hmc-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-white/40">Venue / City</p>
                          <p className="font-medium">{item.city || "TBD"}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CTA Button */}
                  {canBookTickets(item.eventDate) && item.status !== "draft" && (
                    <a
                      href={item.url || "https://www.ticketmaster.com"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-hmc-orange transition-colors hover:bg-white/90"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                      Book Tickets
                    </a>
                  )}

                  {/* Draft Notice */}
                  {item.status === "draft" && (
                    <div className="mt-4 px-4 py-3 bg-white/20 rounded-xl text-center">
                      <p className="text-xs text-white/60">This is a draft event</p>
                    </div>
                  )}

                  {/* Disclaimer */}
                  <div className="mt-4 px-4 py-3 bg-white/10 rounded-xl border border-white/20">
                    <p className="text-xs text-white/70 leading-relaxed text-center">
                      Notice: This is a free informational guide only — we do not sell tickets. Schedules may not reflect real-time changes. For tickets and latest updates, visit{" "}
                      <a
                        href="https://www.ticketmaster.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-white"
                      >
                        Ticketmaster
                      </a>
                      .
                    </p>
                  </div>

                  {/* Share & Actions */}
                  <div className="flex items-center gap-2 mt-4">
                    <button className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Share
                    </button>
                    <button className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Performances */}
      {relatedItems.length > 0 && (
        <section className="bg-gradient-to-b from-gray-50 to-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-1.5 bg-hmc-orange rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-900">More {categoryLabel}</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedItems.map((related) => (
                <Link
                  key={related._id}
                  href={`/performance/${related.category}/${related._id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 mb-3">
                    {related.coverImage ? (
                      <Image
                        src={related.coverImage}
                        alt={related.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <span className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">
                        {formatShortDate(related.eventDate)}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-hmc-orange transition-colors line-clamp-2">
                    {related.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Comments Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-8 w-1.5 bg-hmc-orange rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-900">Comments</h2>
          </div>

          {slug && (
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <CommentSection
                pageId={slug}
                storageKey="performance_comments"
                bannedUsersKey="performance_banned_users"
              />
            </div>
          )}
        </div>
      </section>

      {/* Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-8 right-8 w-12 h-12 bg-hmc-orange text-white rounded-full shadow-lg shadow-orange-500/30 flex items-center justify-center hover:bg-hmc-orange transition-all duration-300 hover:-translate-y-1 opacity-0 pointer-events-none"
        id="back-to-top"
        style={{ opacity: scrollProgress > 10 ? 1 : 0, pointerEvents: scrollProgress > 10 ? "auto" : "none" }}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </main>
  );
}
