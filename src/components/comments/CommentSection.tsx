"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Comment {
  id: string;
  authorName: string;
  authorEmail: string;
  authorAvatar: string;
  content: string;
  createdAt: number;
  replies: Comment[];
}

interface CommentSectionProps {
  pageId: string;
  storageKey: string;
  bannedUsersKey?: string;
  defaultComments?: Comment[];
  title?: string;
}

// Generate default comments with current timestamps
function getDefaultComments(): Comment[] {
  const now = Date.now();
  return [
    {
      id: "placeholder_1",
      authorName: "Sarah Johnson",
      authorEmail: "sarah@example.com",
      authorAvatar: "avatar2",
      content: "This was absolutely amazing! The performances were top-notch and the atmosphere was electric. Highly recommend catching this show!",
      createdAt: now - 86400000 * 3,
      replies: [
        {
          id: "placeholder_1_reply",
          authorName: "Mike Chen",
          authorEmail: "mike@example.com",
          authorAvatar: "avatar4",
          content: "Totally agree! I was there opening night and it exceeded all expectations.",
          createdAt: now - 86400000 * 2,
          replies: [],
        },
      ],
    },
    {
      id: "placeholder_2",
      authorName: "Emily Davis",
      authorEmail: "emily@example.com",
      authorAvatar: "avatar5",
      content: "Brought my whole family and we all loved it. The production quality is outstanding!",
      createdAt: now - 86400000 * 5,
      replies: [],
    },
    {
      id: "placeholder_3",
      authorName: "Alex Thompson",
      authorEmail: "alex@example.com",
      authorAvatar: "avatar8",
      content: "The attention to detail in every aspect of this production is remarkable. A must-see!",
      createdAt: now - 86400000 * 7,
      replies: [],
    },
  ];
}

// Default placeholder comments (used as fallback)
const DEFAULT_COMMENTS = getDefaultComments();

interface UserData {
  id: string;
  username: string;
  email: string;
  avatar: string;
}

function formatTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

function getAvatarEmoji(avatarId: string): { emoji: string; color: string } {
  const avatars: Record<string, { emoji: string; color: string }> = {
    avatar1: { emoji: "😊", color: "#3B82F6" },
    avatar2: { emoji: "🎵", color: "#10B981" },
    avatar3: { emoji: "🎸", color: "#8B5CF6" },
    avatar4: { emoji: "🎤", color: "#F59E0B" },
    avatar5: { emoji: "🎹", color: "#EF4444" },
    avatar6: { emoji: "🎺", color: "#06B6D4" },
    avatar7: { emoji: "🎻", color: "#EC4899" },
    avatar8: { emoji: "🥁", color: "#84CC16" },
    avatar9: { emoji: "🎷", color: "#F97316" },
    avatar10: { emoji: "🎬", color: "#6366F1" },
    avatar11: { emoji: "🎧", color: "#14B8A6" },
    avatar12: { emoji: "🎚️", color: "#A855F7" },
    avatar13: { emoji: "🎛️", color: "#22C55E" },
    avatar14: { emoji: "🎵", color: "#EAB308" },
  };
  return avatars[avatarId] || { emoji: "👤", color: "#6B7280" };
}

export function CommentSection({ pageId, storageKey, bannedUsersKey, defaultComments, title }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const [banExpiry, setBanExpiry] = useState<string | null>(null);
  const router = useRouter();

  // Check if user is banned with expiry
  const checkBanStatus = (email: string, bannedData: any[]): boolean => {
    const now = Date.now();
    const ban = bannedData.find(b => b.email === email);
    if (!ban) return false;
    if (ban.expiresAt === null) return true; // Permanent ban
    if (ban.expiresAt > now) {
      // Still banned, calculate remaining time
      const remaining = ban.expiresAt - now;
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);
      if (days > 0) {
        setBanExpiry(`${days} day${days > 1 ? 's' : ''}`);
      } else {
        setBanExpiry(`${hours} hour${hours > 1 ? 's' : ''}`);
      }
      return true;
    }
    return false; // Ban expired
  };

  useEffect(() => {
    const userData = localStorage.getItem("hmc_current_user");
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUser(user);

      // Check if user is banned
      if (bannedUsersKey) {
        const banned = localStorage.getItem(bannedUsersKey);
        if (banned) {
          const bannedList = JSON.parse(banned);
          setIsBanned(checkBanStatus(user.email, bannedList));
        }
      }
    }

    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const allComments = JSON.parse(stored);
      const pageComments = allComments[pageId] || [];
      // Use defaultComments prop or fall back to built-in DEFAULT_COMMENTS
      const defaults = defaultComments || DEFAULT_COMMENTS;
      setComments(pageComments.length > 0 ? pageComments : defaults);
    } else {
      setComments(defaultComments || DEFAULT_COMMENTS);
    }
  }, [pageId, storageKey, bannedUsersKey]);

  const saveComments = (newComments: Comment[], isUserGenerated: boolean = false) => {
    const stored = localStorage.getItem(storageKey);
    const allComments = stored ? JSON.parse(stored) : {};
    allComments[pageId] = newComments;
    // Only save user-generated comments, not default placeholders
    if (isUserGenerated) {
      localStorage.setItem(storageKey, JSON.stringify(allComments));
    }
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (!currentUser) {
      router.push("/login");
      return;
    }

    if (isBanned) {
      alert("You have been banned from commenting.");
      return;
    }

    setSubmitting(true);

    const comment: Comment = {
      id: Date.now().toString(),
      authorName: currentUser.username,
      authorEmail: currentUser.email,
      authorAvatar: currentUser.avatar,
      content: newComment.trim(),
      createdAt: Date.now(),
      replies: [],
    };

    const updatedComments = [comment, ...comments];
    setComments(updatedComments);
    saveComments(updatedComments, true);
    setNewComment("");
    setSubmitting(false);
  };

  const handleSubmitReply = (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    if (!currentUser) {
      router.push("/login");
      return;
    }

    if (isBanned) {
      alert("You have been banned from commenting.");
      return;
    }

    setSubmitting(true);

    const reply: Comment = {
      id: Date.now().toString(),
      authorName: currentUser.username,
      authorEmail: currentUser.email,
      authorAvatar: currentUser.avatar,
      content: replyContent.trim(),
      createdAt: Date.now(),
      replies: [],
    };

    const updatedComments = comments.map((c) => {
      if (c.id === parentId) {
        return { ...c, replies: [...c.replies, reply] };
      }
      return c;
    });

    setComments(updatedComments);
    saveComments(updatedComments, true);
    setReplyContent("");
    setReplyingTo(null);
    setSubmitting(false);
  };

  const renderComment = (comment: Comment, isReply = false) => {
    const avatar = getAvatarEmoji(comment.authorAvatar);
    
    return (
      <div key={comment.id} className={`${isReply ? "ml-8 mt-3" : "border-b border-gray-100 pb-6"}`}>
        <div className="flex gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ backgroundColor: avatar.color }}
          >
            {avatar.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-gray-900 text-sm">{comment.authorName}</span>
              <span className="text-xs text-gray-400">{formatTime(comment.createdAt)}</span>
            </div>
            <p className="text-gray-700 text-sm mb-2">{comment.content}</p>
            {!isReply && (
              <button
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="text-xs text-[#D96A32] hover:text-[#c45a28] font-medium"
              >
                Reply
              </button>
            )}

            {replyingTo === comment.id && (
              <form onSubmit={(e) => handleSubmitReply(e, comment.id)} className="mt-3 bg-gray-50 rounded-lg p-3 space-y-2">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#D96A32] resize-none"
                  required
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !replyContent.trim()}
                    className="px-3 py-1 bg-[#D96A32] text-white text-xs font-medium rounded-full hover:bg-[#c45a28] disabled:opacity-50"
                  >
                    Reply
                  </button>
                </div>
              </form>
            )}

            {comment.replies.length > 0 && (
              <div className="mt-3 space-y-3">
                {comment.replies.map((reply) => renderComment(reply, true))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="border-t border-gray-200 pt-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Comments ({comments.length})
      </h2>

      {/* Comment Input - Always visible */}
      <form onSubmit={handleSubmitComment} className="mb-8 bg-gray-50 rounded-xl p-5">
        {isBanned ? (
          <div className="text-center py-4">
            <p className="text-red-600 font-medium">
              {banExpiry
                ? `You are banned from commenting (${banExpiry} remaining)`
                : "You have been permanently banned from commenting."}
            </p>
          </div>
        ) : currentUser ? (
          <div className="flex gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0"
              style={{ backgroundColor: getAvatarEmoji(currentUser.avatar).color }}
            >
              {getAvatarEmoji(currentUser.avatar).emoji}
            </div>
            <div className="flex-1 space-y-3">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#D96A32] resize-none"
                required
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="px-5 py-2 bg-[#D96A32] text-white text-sm font-medium rounded-full hover:bg-[#c45a28] disabled:opacity-50 transition-colors"
                >
                  Post Comment
                </button>
              </div>
            </div>
          </div>
        ) : (
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#D96A32] resize-none"
            required
          />
        )}
        {!currentUser && (
          <div className="flex justify-end mt-3">
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="px-5 py-2 bg-[#D96A32] text-white text-sm font-medium rounded-full hover:bg-[#c45a28] disabled:opacity-50 transition-colors"
            >
              Post Comment
            </button>
          </div>
        )}
      </form>

      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-center text-gray-500 py-8 text-sm">No comments yet. Be the first!</p>
        ) : (
          comments.map((comment) => renderComment(comment))
        )}
      </div>
    </div>
  );
}
