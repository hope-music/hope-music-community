"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Interaction {
  id: string;
  title: string;
  category: string;
  description: string;
  coverImage: string;
  content: string;
  author: string;
}

interface Comment {
  id: string;
  authorName: string;
  content: string;
  createdAt: number;
  replies: { id: string; authorName: string; content: string; createdAt: number }[];
}

const CATEGORIES = [
  { value: "software", label: "Software" },
  { value: "hardware", label: "Hardware" },
  { value: "music", label: "Music" },
  { value: "production", label: "Production" },
  { value: "resources", label: "Resources" },
  { value: "artical", label: "Artical" },
  { value: "other", label: "Other" },
  { value: "others", label: "Others" },
];

const PLACEHOLDER_POSTS: Record<string, Record<string, { title: string; description: string }>> = {
  software: {
    "ph-soft-1": { title: "ISAT Interaction 2023 v1.0.4 Released", description: "The latest version of ISAT Interaction brings new features and improvements for music production." },
    "ph-soft-2": { title: "How to optimize latent settings in DAW Soundworks", description: "Learn how to reduce latency and improve your workflow in digital audio workstations." },
    "ph-soft-3": { title: "MIDI controller mapping tutorial for live performance", description: "A comprehensive guide to mapping your MIDI controller for live shows." },
    "ph-soft-4": { title: "Best free VST plugins for orchestral composition", description: "Top free VST plugins for creating orchestral arrangements." },
    "ph-soft-5": { title: "Audio interface latency troubleshooting guide", description: "Fix latency issues with your audio interface." },
    "ph-soft-6": { title: "Setting up multi-monitor workspace for mixing", description: "Optimize your studio with multiple monitors." },
    "ph-soft-7": { title: "Cloud collaboration tools for remote music production", description: "Work together with musicians around the world." },
    "ph-soft-8": { title: "Automating reverb sends with sidechain compression", description: "Create dynamic reverb effects for your mixes." },
    "ph-soft-9": { title: "Exporting stems correctly for film scoring projects", description: "Everything you need to know about stem exports." },
    "ph-soft-10": { title: "Building a custom macro pad for live DJ sets", description: "Create your own MIDI macro pad for performances." },
  },
  hardware: {
    "ph-hard-1": { title: "Best audio interfaces of 2026", description: "Comprehensive comparison of top audio interfaces." },
    "ph-hard-2": { title: "Monitor speaker placement guide", description: "Acoustics tips for small rooms." },
    "ph-hard-3": { title: "Understanding microphone polar patterns", description: "When to use each type of microphone." },
    "ph-hard-4": { title: "DI box explained", description: "Active vs passive DI boxes." },
    "ph-hard-5": { title: "Audio cabling basics", description: "Balanced vs unbalanced, XLR vs TRS." },
    "ph-hard-6": { title: "DIY acoustic treatment", description: "Acoustic panels and bass traps on a budget." },
    "ph-hard-7": { title: "Headphone amplifier pairing guide", description: "Getting the most from your headphones." },
    "ph-hard-8": { title: "How to choose the right MIDI keyboard", description: "Keys, pads, and knobs explained." },
    "ph-hard-9": { title: "Studio furniture and desk setup", description: "Essential furniture for your studio." },
    "ph-hard-10": { title: "Power conditioning guide", description: "Surge protection for your gear." },
  },
  music: {
    "ph-music-1": { title: "Songwriting 101", description: "Finding your unique melodic voice." },
    "ph-music-2": { title: "Orchestral arrangement tips", description: "Arranging for small ensembles." },
    "ph-music-3": { title: "Understanding modal scales", description: "Beyond major and minor." },
    "ph-music-4": { title: "Music theory for producers", description: "Bridging theory and practice." },
    "ph-music-5": { title: "Creating emotional chord progressions", description: "Step by step guide." },
    "ph-music-6": { title: "Rhythm and groove fundamentals", description: "For all genres." },
    "ph-music-7": { title: "Melody writing techniques", description: "Used by professional composers." },
    "ph-music-8": { title: "Harmonic color", description: "Using extended chords." },
    "ph-music-9": { title: "Arranging for ensembles", description: "Different ensemble types." },
    "ph-music-10": { title: "Music production workflow", description: "Optimization techniques." },
  },
  production: {
    "ph-prod-1": { title: "Lighting design fundamentals", description: "For live stage productions." },
    "ph-prod-2": { title: "Sound reinforcement setup", description: "For live theater and concerts." },
    "ph-prod-3": { title: "Stage rigging safety", description: "Standards and best practices." },
    "ph-prod-4": { title: "Projection mapping techniques", description: "For immersive theater." },
    "ph-prod-5": { title: "Set design on a budget", description: "Construction tips." },
    "ph-prod-6": { title: "AV system integration", description: "For multi-purpose venues." },
    "ph-prod-7": { title: "Backstage communication", description: "Protocols for smooth shows." },
    "ph-prod-8": { title: "Pyrotechnics safety", description: "Regulations and safety." },
    "ph-prod-9": { title: "Live mixing techniques", description: "For bands." },
    "ph-prod-10": { title: "Stage management", description: "Best practices." },
  },
  artical: {
    "ph-art-1": { title: "History of musical theater", description: "From Broadway to global stages." },
    "ph-art-2": { title: "Evolution of recording technology", description: "Five decades of innovation." },
    "ph-art-3": { title: "Influential composers", description: "The 10 most influential of the 21st century." },
    "ph-art-4": { title: "Psychoacoustics", description: "How the brain processes music." },
    "ph-art-5": { title: "Music therapy research", description: "Evidence-based practice." },
    "ph-art-6": { title: "Copyright law for musicians", description: "Protecting your work." },
    "ph-art-7": { title: "The streaming era", description: "Understanding music economics." },
    "ph-art-8": { title: "AI in music composition", description: "Opportunity or threat?" },
    "ph-art-9": { title: "Future of live music", description: "Performances and trends." },
    "ph-art-10": { title: "Music education trends", description: "Innovations in teaching." },
  },
  others: {
    "ph-oth-1": { title: "Community guidelines", description: "Keeping our forum respectful." },
    "ph-oth-2": { title: "Community event calendar", description: "Upcoming meetups and sessions." },
    "ph-oth-3": { title: "Introduce yourself!", description: "Welcome to Hope Music Community!" },
    "ph-oth-4": { title: "Resources and tutorials", description: "Curated community collection." },
    "ph-oth-5": { title: "Collaboration opportunities", description: "Find your creative partner." },
    "ph-oth-6": { title: "Gear marketplace", description: "Buy, sell, and trade." },
    "ph-oth-7": { title: "Feedback welcome", description: "Share your thoughts." },
    "ph-oth-8": { title: "Support and help desk", description: "Technical issues help." },
    "ph-oth-9": { title: "Weekly listening sessions", description: "Schedule and topics." },
    "ph-oth-10": { title: "Feature requests", description: "Suggestions board." },
  },
  resources: {
    "ph-res-1": { title: "Free sample packs 2026", description: "Best free samples this year." },
    "ph-res-2": { title: "Music production cheat sheet", description: "Quick reference guide." },
    "ph-res-3": { title: "DAW keyboard shortcuts", description: "Speed up your workflow." },
    "ph-res-4": { title: "Mixing checklist", description: "Never miss a step." },
    "ph-res-5": { title: "Mastering reference tracks", description: "Professional examples." },
    "ph-res-6": { title: "Studio setup guide", description: "From beginner to pro." },
    "ph-res-7": { title: "Music theory worksheets", description: "Practice exercises." },
    "ph-res-8": { title: "Genre-specific guides", description: "Tailored production tips." },
    "ph-res-9": { title: "Plugin recommendations", description: "Must-have VSTs." },
    "ph-res-10": { title: "Sound design basics", description: "Create unique sounds." },
  },
  other: {
    "ph-ot-1": { title: "Community guidelines", description: "Keeping our forum respectful." },
    "ph-ot-2": { title: "Event calendar", description: "Upcoming meetups." },
    "ph-ot-3": { title: "Introduce yourself!", description: "Welcome!" },
    "ph-ot-4": { title: "Resources master list", description: "Curated collection." },
    "ph-ot-5": { title: "Collaboration", description: "Find partners." },
    "ph-ot-6": { title: "Gear marketplace", description: "Buy and sell." },
    "ph-ot-7": { title: "Feedback", description: "Share thoughts." },
    "ph-ot-8": { title: "Support desk", description: "Get help." },
    "ph-ot-9": { title: "Listening sessions", description: "Weekly schedule." },
    "ph-ot-10": { title: "Feature requests", description: "Suggestions." },
  },
};

interface PageProps {
  params: Promise<{ category: string; id: string }>;
}

export default function InteractionDetailPage({ params }: PageProps) {
  const [item, setItem] = useState<Interaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [authorName, setAuthorName] = useState("");
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyAuthor, setReplyAuthor] = useState("");
  const [itemId, setItemId] = useState<string>("");
  const [currentCategory, setCurrentCategory] = useState<string>("");
  const [isPlaceholder, setIsPlaceholder] = useState(false);
  const [placeholderData, setPlaceholderData] = useState<{ title: string; description: string } | null>(null);

  // Resolve params Promise and load data
  useEffect(() => {
    async function loadData() {
      const resolvedParams = await params;
      const id = resolvedParams.id;
      const category = resolvedParams.category;
      
      setItemId(id);
      setCurrentCategory(category);

      // Check if it's a placeholder post
      if (id.startsWith("ph-")) {
        const placeholderPost = PLACEHOLDER_POSTS[category]?.[id];
        if (placeholderPost) {
          setIsPlaceholder(true);
          setPlaceholderData(placeholderPost);
          setLoading(false);
          return;
        }
      }

      // Load item from localStorage
      const stored = localStorage.getItem("admin_interaction");
      if (stored) {
        const data = JSON.parse(stored);
        const found = data.find((i: Interaction) => i.id === id);
        setItem(found || null);
      }

      // Load comments
      const commentsStored = localStorage.getItem("interaction_comments");
      if (commentsStored) {
        const all = JSON.parse(commentsStored);
        setComments(all[id] || []);
      }

      setLoading(false);
    }
    loadData();
  }, []);

  const saveComments = (saveItemId: string, newComments: Comment[]) => {
    const stored = localStorage.getItem("interaction_comments");
    const all = stored ? JSON.parse(stored) : {};
    all[saveItemId] = newComments;
    localStorage.setItem("interaction_comments", JSON.stringify(all));
    setComments(newComments);
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !newComment.trim() || !itemId) return;
    const comment: Comment = { id: Date.now().toString(), authorName: authorName.trim(), content: newComment.trim(), createdAt: Date.now(), replies: [] };
    saveComments(itemId, [comment, ...comments]);
    setNewComment("");
  };

  const handleSubmitReply = (e: React.FormEvent, commentId: string) => {
    e.preventDefault();
    if (!replyAuthor.trim() || !replyContent.trim() || !itemId) return;
    const reply = { id: Date.now().toString(), authorName: replyAuthor.trim(), content: replyContent.trim(), createdAt: Date.now() };
    const updated = comments.map((c) => c.id === commentId ? { ...c, replies: [...c.replies, reply] } : c);
    saveComments(itemId, updated);
    setReplyingTo(null); setReplyContent(""); setReplyAuthor("");
  };

  const formatTime = (t: number) => new Date(t).toLocaleString();
  const categoryLabel = CATEGORIES.find(c => c.value === currentCategory)?.label || currentCategory;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#D96A32]"></div>
      </div>
    );
  }

  // Show placeholder page
  if (isPlaceholder && placeholderData) {
    return (
      <main className="min-h-screen bg-white">
        <div className="border-b border-t border-[#D96A32]">
          <div className="mx-auto max-w-4xl px-4 py-4">
            <Link href={`/interaction/${currentCategory}`} className="text-sm text-gray-500 hover:text-[#D96A32]">
              ← Back to {categoryLabel}
            </Link>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="mb-6">
            <span className="inline-block rounded bg-[#D96A32]/10 px-3 py-1 text-sm font-medium text-[#D96A32]">{categoryLabel}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{placeholderData.title}</h1>
          <p className="text-gray-600 mb-8">{placeholderData.description}</p>
          <div className="bg-gray-100 rounded-xl p-8">
            <div className="text-6xl mb-4">🚧</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Coming Soon</h2>
            <p className="text-gray-600">This article is being prepared. Check back later!</p>
          </div>
        </div>
      </main>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-20">
        <h1 className="text-2xl font-bold mb-4">Not Found</h1>
        <p className="text-gray-500 mb-4">The post you're looking for doesn't exist.</p>
        <Link href="/interaction" className="px-4 py-2 bg-[#D96A32] text-white rounded-md">Back to Interaction</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="border-b border-t border-[#D96A32]">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <Link href={`/interaction/${currentCategory}`} className="text-sm text-gray-500 hover:text-[#D96A32]">
            ← Back to {categoryLabel}
          </Link>
        </div>
      </div>
      <article className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-sm font-semibold text-red-600 uppercase tracking-wider mb-2">
          {CATEGORIES.find((c) => c.value === item.category)?.label || item.category}
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-4">{item.title}</h1>
        {item.author && <p className="text-gray-500 mb-6">by {item.author}</p>}
        {item.coverImage && (
          <img src={item.coverImage} alt={item.title} className="w-full aspect-[16/9] object-cover rounded-xl shadow-md mb-8" />
        )}
        {item.content && (
          <div className="prose lg:prose-lg text-gray-700 max-w-none space-y-6 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.content }} />
        )}
      </article>
      <div className="max-w-4xl mx-auto px-4 py-12 border-t border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Comments ({comments.length})</h2>
        <form onSubmit={handleSubmitComment} className="mb-10 bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Leave a Comment</h3>
          <div className="space-y-4">
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Your Name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#D96A32]"
              required
            />
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Your comment..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#D96A32] resize-none"
              required
            />
            <button type="submit" className="px-6 py-2 bg-[#D96A32] text-white font-medium rounded-lg hover:bg-[#c45a28]">
              Post Comment
            </button>
          </div>
        </form>
        <div className="space-y-6">
          {comments.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No comments yet.</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="border-b border-gray-100 pb-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-[#D96A32] rounded-full flex items-center justify-center text-white font-bold">
                    {comment.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{comment.authorName}</span>
                      <span className="text-sm text-gray-400">{formatTime(comment.createdAt)}</span>
                    </div>
                    <p className="text-gray-700 mb-2">{comment.content}</p>
                    <button
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      className="text-sm text-[#D96A32] font-medium"
                    >
                      Reply
                    </button>
                    {replyingTo === comment.id && (
                      <form onSubmit={(e) => handleSubmitReply(e, comment.id)} className="mt-4 bg-gray-50 rounded-lg p-4 space-y-3">
                        <input
                          type="text"
                          value={replyAuthor}
                          onChange={(e) => setReplyAuthor(e.target.value)}
                          placeholder="Your name"
                          className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#D96A32]"
                          required
                        />
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Your reply..."
                          rows={2}
                          className="w-full px-3 py-2 border rounded-lg text-sm outline-none resize-none focus:ring-2 focus:ring-[#D96A32]"
                          required
                        />
                        <div className="flex gap-2">
                          <button type="submit" className="px-4 py-1.5 bg-[#D96A32] text-white text-sm rounded-lg">Post</button>
                          <button
                            type="button"
                            onClick={() => { setReplyingTo(null); setReplyContent(""); setReplyAuthor(""); }}
                            className="px-4 py-1.5 bg-gray-200 text-sm rounded-lg"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                    {comment.replies.length > 0 && (
                      <div className="mt-4 space-y-4 pl-4 border-l-2 border-gray-200">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex gap-3">
                            <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {reply.authorName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-sm">{reply.authorName}</span>
                                <span className="text-xs text-gray-400">{formatTime(reply.createdAt)}</span>
                              </div>
                              <p className="text-sm text-gray-700">{reply.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
