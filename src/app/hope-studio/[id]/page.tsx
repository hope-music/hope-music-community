"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

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

interface Comment {
  id: string;
  authorName: string;
  content: string;
  createdAt: number;
  replies: { id: string; authorName: string; content: string; createdAt: number }[];
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

export default function HopeStudioDetailPage() {
  const params = useParams();
  const [item, setItem] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [authorName, setAuthorName] = useState("");
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyAuthor, setReplyAuthor] = useState("");

  useEffect(() => {
    const id = params.id as string;
    const stored = localStorage.getItem("admin_hope_studio");
    if (stored) {
      const data = JSON.parse(stored);
      const found = data.find((i: Service) => i.id === id);
      setItem(found || null);
    }
    const commentsStored = localStorage.getItem("hope_studio_comments");
    if (commentsStored) {
      const all = JSON.parse(commentsStored);
      setComments(all[id] || []);
    }
    setLoading(false);
  }, [params.id]);

  const saveComments = (itemId: string, newComments: Comment[]) => {
    const stored = localStorage.getItem("hope_studio_comments");
    const all = stored ? JSON.parse(stored) : {};
    all[itemId] = newComments;
    localStorage.setItem("hope_studio_comments", JSON.stringify(all));
    setComments(newComments);
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !newComment.trim() || !item) return;
    const comment: Comment = { id: Date.now().toString(), authorName: authorName.trim(), content: newComment.trim(), createdAt: Date.now(), replies: [] };
    saveComments(item.id, [comment, ...comments]);
    setNewComment("");
  };

  const handleSubmitReply = (e: React.FormEvent, commentId: string) => {
    e.preventDefault();
    if (!replyAuthor.trim() || !replyContent.trim() || !item) return;
    const reply = { id: Date.now().toString(), authorName: replyAuthor.trim(), content: replyContent.trim(), createdAt: Date.now() };
    const updated = comments.map((c) => c.id === commentId ? { ...c, replies: [...c.replies, reply] } : c);
    saveComments(item.id, updated);
    setReplyingTo(null); setReplyContent(""); setReplyAuthor("");
  };

  const formatTime = (t: number) => new Date(t).toLocaleString();

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#D96A32]"></div></div>;
  if (!item) return <div className="min-h-screen flex flex-col items-center justify-center py-20"><h1 className="text-2xl font-bold mb-4">Not Found</h1><Link href="/hope-studio" className="px-4 py-2 bg-[#D96A32] text-white rounded-md">Back</Link></div>;

  return (
    <main className="min-h-screen bg-white">
      <div className="border-b border-t border-[#D96A32]"><div className="mx-auto max-w-4xl px-4 py-4"><Link href="/hope-studio" className="text-sm text-gray-500 hover:text-[#D96A32]">← Back to Hope Studio</Link></div></div>
      <article className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-sm font-semibold text-red-600 uppercase tracking-wider mb-2">{CATEGORIES.find((c) => c.value === item.category)?.label || item.category}</div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-4">{item.serviceName}</h1>
        <div className="flex flex-wrap gap-4 mb-6">
          {item.pricing && <span className="text-lg font-semibold text-green-600">{item.pricing}</span>}
          {item.availability && <span className="text-gray-600">{item.availability}</span>}
        </div>
        {item.coverImage && <img src={item.coverImage} alt={item.serviceName} className="w-full aspect-[16/9] object-cover rounded-xl shadow-md mb-8" />}
        {item.content && <div className="prose lg:prose-lg text-gray-700 max-w-none space-y-6 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.content }} />}
      </article>
      <div className="max-w-4xl mx-auto px-4 py-12 border-t border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Comments ({comments.length})</h2>
        <form onSubmit={handleSubmitComment} className="mb-10 bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Leave a Comment</h3>
          <div className="space-y-4">
            <input type="text" value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="Your Name" className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#D96A32]" required />
            <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Your comment..." rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#D96A32] resize-none" required />
            <button type="submit" className="px-6 py-2 bg-[#D96A32] text-white font-medium rounded-lg hover:bg-[#c45a28]">Post Comment</button>
          </div>
        </form>
        <div className="space-y-6">
          {comments.length === 0 ? <p className="text-center text-gray-500 py-8">No comments yet.</p> : comments.map((comment) => (
            <div key={comment.id} className="border-b border-gray-100 pb-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-[#D96A32] rounded-full flex items-center justify-center text-white font-bold">{comment.authorName.charAt(0).toUpperCase()}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1"><span className="font-semibold">{comment.authorName}</span><span className="text-sm text-gray-400">{formatTime(comment.createdAt)}</span></div>
                  <p className="text-gray-700 mb-2">{comment.content}</p>
                  <button onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)} className="text-sm text-[#D96A32] font-medium">Reply</button>
                  {replyingTo === comment.id && (
                    <form onSubmit={(e) => handleSubmitReply(e, comment.id)} className="mt-4 bg-gray-50 rounded-lg p-4 space-y-3">
                      <input type="text" value={replyAuthor} onChange={(e) => setReplyAuthor(e.target.value)} placeholder="Your name" className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#D96A32]" required />
                      <textarea value={replyContent} onChange={(e) => setReplyContent(e.target.value)} placeholder="Your reply..." rows={2} className="w-full px-3 py-2 border rounded-lg text-sm outline-none resize-none focus:ring-2 focus:ring-[#D96A32]" required />
                      <div className="flex gap-2"><button type="submit" className="px-4 py-1.5 bg-[#D96A32] text-white text-sm rounded-lg">Post</button><button type="button" onClick={() => { setReplyingTo(null); setReplyContent(""); setReplyAuthor(""); }} className="px-4 py-1.5 bg-gray-200 text-sm rounded-lg">Cancel</button></div>
                    </form>
                  )}
                  {comment.replies.length > 0 && (
                    <div className="mt-4 space-y-4 pl-4 border-l-2 border-gray-200">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex gap-3">
                          <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-sm">{reply.authorName.charAt(0).toUpperCase()}</div>
                          <div><div className="flex items-center gap-2 mb-1"><span className="font-semibold text-sm">{reply.authorName}</span><span className="text-xs text-gray-400">{formatTime(reply.createdAt)}</span></div><p className="text-sm text-gray-700">{reply.content}</p></div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
