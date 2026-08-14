"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useNewsById } from "@/lib/api";
import { CommentSection } from "@/components/comments/CommentSection";

export default function NewsDetailPage() {
  const params = useParams();
  const articleId = params.id as string;
  const { data: article, loading } = useNewsById(articleId);

  const [readProgress, setReadProgress] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxImage, setLightboxImage] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const pageLoading = !articleId || loading;

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setReadProgress(Math.min(progress, 100));
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const formatDate = (timestamp?: number): string => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const estimateReadTime = (content: string): number => {
    const text = content.replace(/<[^>]*>/g, "");
    const words = text.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title,
          text: article?.title,
          url,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  const openLightbox = (imgSrc: string) => {
    setLightboxImage(imgSrc);
    setShowLightbox(true);
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-hmc-orange mb-4"></div>
          <p className="text-gray-500">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-20">
        <div className="text-6xl mb-4">📰</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
        <p className="text-gray-500 mb-8">The article you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          href="/news"
          className="px-6 py-3 bg-hmc-orange text-white rounded-lg hover:bg-orange-600 transition-all hover:shadow-lg"
        >
          Back to News
        </Link>
      </div>
    );
  }

  const readTime = estimateReadTime(article.content || "");

  return (
    <>
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-gray-200">
        <div
          className="h-full bg-gradient-to-r from-hmc-orange to-orange-400 transition-all duration-100"
          style={{ width: `${readProgress}%` }}
        />
      </div>

      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Breadcrumb Navigation */}
        <div className="bg-white border-b border-gray-100 shadow-sm">
          <div className="mx-auto max-w-4xl px-4 py-4">
            <nav className="flex items-center gap-2 text-sm">
              <Link href="/" className="text-gray-400 hover:text-hmc-orange transition-colors">
                Home
              </Link>
              <span className="text-gray-300">/</span>
              <Link href="/news" className="text-gray-400 hover:text-hmc-orange transition-colors">
                News
              </Link>
              <span className="text-gray-300">/</span>
              <span className="text-hmc-orange font-medium truncate max-w-[200px]">
                {article.title}
              </span>
            </nav>
          </div>
        </div>

        {/* Hero Section with Gradient */}
        <div className="bg-gradient-to-br from-hmc-orange/5 via-white to-orange-50 py-12">
          <article className="max-w-4xl mx-auto px-4">
            {/* Category Badge */}
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-hmc-orange text-white text-xs font-semibold uppercase tracking-wider">
                News
              </span>
              {article.isFeatured && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-400 text-yellow-900 text-xs font-semibold">
                  <span>⭐</span> Featured
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              {article.title}
            </h1>

            {/* Meta Info Bar */}
            <div className={`flex flex-wrap items-center gap-6 pb-8 border-b border-gray-200 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              {article.authorName && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-hmc-orange to-orange-400 flex items-center justify-center text-white font-bold">
                    {article.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Written by</p>
                    <p className="font-semibold text-gray-900">{article.authorName}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-500">
                {article.publishDate && (
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formatDate(article.publishDate)}</span>
                  </div>
                )}

                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{readTime} min read</span>
                </div>
              </div>

              {/* Share Button */}
              <button
                onClick={handleShare}
                className="ml-auto flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:text-hmc-orange hover:border-hmc-orange transition-all shadow-sm hover:shadow"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </button>
            </div>
          </article>
        </div>

        {/* Cover Image with Overlay Effect */}
        {article.coverImage && (
          <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-10">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl group cursor-pointer"
                 onClick={() => openLightbox(article.coverImage!)}>
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full aspect-[21/9] object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-4">
                  <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Article Content */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Drop Cap Style Article Content */}
          <div className="relative">
            {/* Decorative Sidebar */}
            <div className="absolute -left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-hmc-orange via-orange-300 to-transparent rounded-full hidden lg:block" />

            <div className={`prose prose-lg lg:prose-xl text-gray-700 max-w-none transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <style jsx>{`
                .prose p:first-of-type::first-letter {
                  float: left;
                  font-size: 4rem;
                  line-height: 1;
                  font-weight: bold;
                  color: #FF6B35;
                  margin-right: 0.5rem;
                  margin-top: 0.25rem;
                }
                .prose :global(img) {
                  border-radius: 1rem;
                  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                  cursor: pointer;
                  transition: transform 0.3s, box-shadow 0.3s;
                }
                .prose :global(img:hover) {
                  transform: scale(1.02);
                  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
                }
                .prose :global(h2) {
                  color: #FF6B35;
                  font-weight: 700;
                  margin-top: 2.5rem;
                  padding-bottom: 0.5rem;
                  border-bottom: 2px solid #FEE2C8;
                }
                .prose :global(h3) {
                  color: #333;
                  font-weight: 600;
                }
                .prose :global(blockquote) {
                  border-left-color: #FF6B35;
                  background: #FFF7F3;
                  padding: 1rem 1.5rem;
                  border-radius: 0 1rem 1rem 0;
                  font-style: italic;
                }
                .prose :global(ul), .prose :global(ol) {
                  padding-left: 1.5rem;
                }
                .prose :global(li) {
                  margin: 0.5rem 0;
                }
                .prose :global(a) {
                  color: #FF6B35;
                  text-decoration: underline;
                  text-decoration-color: #FEE2C8;
                  text-underline-offset: 3px;
                }
                .prose :global(a:hover) {
                  text-decoration-color: #FF6B35;
                }
              `}</style>
              <div
                dangerouslySetInnerHTML={{ __html: article.content }}
                onClick={(e) => {
                  const img = (e.target as HTMLElement).closest('img');
                  if (img && img.src) {
                    openLightbox(img.src);
                  }
                }}
              />
            </div>
          </div>

          {/* Article Footer */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Tags */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Tags:</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">News</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">Update</span>
              </div>

              {/* Share */}
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-5 py-2.5 bg-hmc-orange text-white rounded-lg hover:bg-orange-600 transition-all hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share this article
              </button>
            </div>
          </div>

          {/* Author Card */}
          {article.authorName && (
            <div className="mt-12 p-6 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl border border-orange-100">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-hmc-orange to-orange-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {article.authorName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm text-hmc-orange font-medium">Article Author</p>
                  <h3 className="text-xl font-bold text-gray-900">{article.authorName}</h3>
                  <p className="text-sm text-gray-500 mt-1">Hope Music Community Team</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Back to News CTA */}
        <div className="bg-gray-50 border-t border-gray-200 py-12">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Enjoyed this article?</h3>
            <p className="text-gray-500 mb-6">Check out more news and updates from Hope Music Community</p>
            <Link
              href="/news"
              className="inline-flex items-center gap-2 px-6 py-3 bg-hmc-orange text-white rounded-lg hover:bg-orange-600 transition-all hover:shadow-lg font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              View All News
            </Link>
          </div>
        </div>

        {/* Comments Section */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Comments</h2>
            <p className="text-gray-500">Share your thoughts on this article</p>
          </div>
          <CommentSection
            pageId={`news-${articleId}`}
            storageKey="news_comments"
            bannedUsersKey="news_banned_users"
            title="News"
          />
        </div>
      </main>

      {/* Lightbox Modal */}
      {showLightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setShowLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-hmc-orange transition-colors"
            onClick={() => setShowLightbox(false)}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={lightboxImage}
            alt=""
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
          />
        </div>
      )}
    </>
  );
}
