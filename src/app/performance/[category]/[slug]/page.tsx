"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { CommentSection } from "@/components/comments/CommentSection";
import { PERFORMANCE_CATEGORY_OPTIONS } from "@/lib/constants";
import { supabase } from "@/lib/supabase";

interface PerformanceRow {
  id: number;
  ticketmaster_id: string;
  title: string;
  description: string | null;
  event_date: string | null;
  event_time: string | null;
  image_url: string | null;
  venue: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  region: string | null;
  price_min: number | null;
  price_max: number | null;
  currency: string | null;
  ticket_url: string | null;
  segment: string | null;
  genre: string | null;
  sub_category: string | null;
  source: string | null;
}

const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;

type DateLabel = "future" | "recent" | "archived";

function getDateLabel(eventDateMs?: number): DateLabel {
  if (!eventDateMs) return "future";
  const now = Date.now();
  if (eventDateMs > now) return "future";
  const elapsed = now - eventDateMs;
  if (elapsed <= TWO_WEEKS_MS) return "recent";
  return "archived";
}

function isVisible(eventDateMs?: number): boolean {
  return getDateLabel(eventDateMs) !== "archived";
}

function canBookTickets(eventDateMs?: number): boolean {
  if (!eventDateMs) return false;
  return eventDateMs >= Date.now();
}

function categoryToTable(slug: string): string {
  return `${slug.replace(/-/g, "_")}_events`;
}

export default function PerformanceDetailPage() {
  const params = useParams();
  const category = (params?.category as string) || "";
  const slug = (params?.slug as string) || "";

  const [row, setRow] = useState<PerformanceRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!category || !slug) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const tableName = categoryToTable(category);
        const { data, error: dbError } = await supabase
          .from(tableName)
          .select("*")
          .eq("ticketmaster_id", slug)
          .maybeSingle();
        if (cancelled) return;
        if (dbError) {
          setError(dbError.message);
          setRow(null);
        } else {
          setRow((data as PerformanceRow | null) ?? null);
        }
      } catch (err: any) {
        if (cancelled) return;
        setError(err?.message ?? "Failed to load performance");
        setRow(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [category, slug]);

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

  const eventDateMs = useMemo(() => {
    if (!row?.event_date) return undefined;
    const ts = new Date(row.event_date).getTime();
    return Number.isNaN(ts) ? undefined : ts;
  }, [row?.event_date]);

  const formatDate = (ts?: number) => {
    if (!ts) return "";
    return new Date(ts).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  const formatShortDate = (ts?: number) => {
    if (!ts) return "";
    return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatTime = (ts?: number) => {
    if (!ts) return "";
    return new Date(ts).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  };

  const categoryLabel = useMemo(
    () => PERFORMANCE_CATEGORY_OPTIONS.find((c) => c.value === category)?.label || category,
    [category]
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

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Failed to load performance</h1>
        <p className="text-gray-500 mb-8">{error}</p>
        <Link href={`/performance/${category}`} className="px-6 py-3 bg-hmc-orange text-white rounded-full hover:bg-hmc-orange/90">
          Back to {categoryLabel}
        </Link>
      </div>
    );
  }

  if (!row) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Performance Not Found</h1>
        <p className="text-gray-500 mb-8">The performance you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/performance" className="px-6 py-3 bg-hmc-orange text-white rounded-full hover:bg-hmc-orange/90">
          Back to Performance
        </Link>
      </div>
    );
  }

  if (eventDateMs && !isVisible(eventDateMs)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">This Event Has Been Archived</h1>
        <p className="text-gray-500 mb-8">Events are archived 2 weeks after completion.</p>
        <Link href={`/performance/${category}`} className="px-6 py-3 bg-hmc-orange text-white rounded-full hover:bg-hmc-orange/90">
          Back to {categoryLabel}
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-100 z-50">
        <div
          className="h-full bg-gradient-to-r from-hmc-orange to-orange-400 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          {row.image_url ? (
            <Image src={row.image_url} alt={row.title} fill unoptimized className="object-cover" priority />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
        </div>

        <div className="absolute inset-0 flex items-end">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            <nav className="flex items-center gap-2 text-sm text-white/60 mb-6">
              <Link href="/performance" className="hover:text-white transition-colors">Performance</Link>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <Link href={`/performance/${category}`} className="hover:text-white transition-colors">{categoryLabel}</Link>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-white/40 truncate max-w-[200px]">{row.title}</span>
            </nav>

            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-hmc-orange text-white text-xs font-semibold rounded-full uppercase tracking-wider">
                {categoryLabel}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 max-w-4xl">
              {row.title}
            </h1>

            {eventDateMs && (
              <div className="mb-6 flex items-center gap-3">
                <div className="px-5 py-3 bg-hmc-orange text-white rounded-2xl shadow-lg shadow-orange-500/30">
                  <p className="text-2xl font-bold">{formatDate(eventDateMs)}</p>
                  <p className="text-sm opacity-90 mt-0.5">{formatTime(eventDateMs)}</p>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4">
              {row.venue && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white">
                  <svg className="w-5 h-5 text-hmc-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>{row.venue}</span>
                </div>
              )}
              {row.city && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white">
                  <svg className="w-5 h-5 text-hmc-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{row.city}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-white/50 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      <section className="relative -mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-100 p-8 mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="w-1 h-6 bg-hmc-orange rounded-full"></span>
                    About This Performance
                  </h2>
                  <div className="bg-gradient-to-br from-gray-50 to-orange-50/30 rounded-xl p-6 border border-gray-100">
                    <p className="text-gray-600 leading-relaxed text-lg">
                      {row.description || row.venue || "No description available for this performance."}
                    </p>
                  </div>
                </div>

                {(row.sub_category || row.genre || row.segment) && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="w-1 h-6 bg-hmc-orange rounded-full"></span>
                      Details
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {row.sub_category && (
                        <span className="px-3 py-1 rounded-full bg-hmc-orange/10 text-hmc-orange text-sm font-medium">{row.sub_category}</span>
                      )}
                      {row.genre && (
                        <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">{row.genre}</span>
                      )}
                      {row.segment && (
                        <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">{row.segment}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
                  <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4">Event Information</h3>

                  <div className="space-y-4">
                    {eventDateMs && (
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-hmc-orange/20 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-hmc-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-white/40">Date & Time</p>
                          <p className="font-medium">{formatDate(eventDateMs)}</p>
                          <p className="font-semibold text-hmc-orange text-lg">{formatTime(eventDateMs)}</p>
                        </div>
                      </div>
                    )}

                    {row.city && (
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-hmc-orange/20 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-hmc-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-white/40">Venue / City</p>
                          <p className="font-medium">{row.venue || row.city || "TBD"}</p>
                        </div>
                      </div>
                    )}

                    {(row.price_min || row.price_max) && (
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-hmc-orange/20 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-hmc-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8v8" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-white/40">Price</p>
                          <p className="font-medium">
                            {row.price_min && row.price_max
                              ? `${row.currency || "USD"} ${row.price_min}–${row.price_max}`
                              : row.price_min
                                ? `${row.currency || "USD"} ${row.price_min}+`
                                : "TBD"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {canBookTickets(eventDateMs) && (
                    <a
                      href={row.ticket_url || "https://www.ticketmaster.com"}
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
                </div>

                <div className="mt-4 px-4 py-3 bg-white/10 rounded-xl border border-white/20">
                  <p className="text-xs text-white/70 leading-relaxed text-center">
                    Notice: This is a free informational guide only — we do not sell tickets. Schedules may not reflect real-time changes. For tickets and latest updates, visit{" "}
                    <a href="https://www.ticketmaster.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
                      Ticketmaster
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
