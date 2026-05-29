"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convex";
import type { Id } from "@/types/convex";

function RichTextEditor({ content, onChange }: { content: string; onChange: (c: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const execCommand = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };
  const handleInput = () => { if (editorRef.current) onChange(editorRef.current.innerHTML); };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => { if (ev.target?.result) execCommand("insertImage", ev.target.result as string); };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => { if (editorRef.current && !editorRef.current.innerHTML) editorRef.current.innerHTML = content; }, []);

  return (
    <div className="overflow-hidden rounded-md border border-gray-300 bg-white">
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-300 bg-gray-50 px-2 py-2">
        <button type="button" onClick={() => execCommand("bold")} className="rounded px-2 py-1 text-sm font-bold hover:bg-gray-200">B</button>
        <button type="button" onClick={() => execCommand("italic")} className="rounded px-2 py-1 text-sm italic hover:bg-gray-200">I</button>
        <button type="button" onClick={() => execCommand("underline")} className="rounded px-2 py-1 text-sm underline hover:bg-gray-200">U</button>
        <div className="mx-1 h-5 w-px bg-gray-300" />
        <select onChange={(e) => { if (e.target.value) execCommand("formatBlock", e.target.value); }} className="rounded border border-gray-300 bg-white px-2 py-1 text-sm">
          <option value="">Paragraph</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>
        <div className="mx-1 h-5 w-px bg-gray-300" />
        <button type="button" onClick={() => execCommand("insertUnorderedList")} className="rounded px-2 py-1 text-sm hover:bg-gray-200">• List</button>
        <button type="button" onClick={() => execCommand("insertOrderedList")} className="rounded px-2 py-1 text-sm hover:bg-gray-200">1. List</button>
        <div className="mx-1 h-5 w-px bg-gray-300" />
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
        <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded px-2 py-1 text-sm hover:bg-gray-200">🖼 Image</button>
        <div className="mx-1 h-5 w-px bg-gray-300" />
        <button type="button" onClick={() => execCommand("undo")} className="rounded px-2 py-1 text-sm hover:bg-gray-200">↶</button>
        <button type="button" onClick={() => execCommand("redo")} className="rounded px-2 py-1 text-sm hover:bg-gray-200">↷</button>
      </div>
      <div ref={editorRef} contentEditable onInput={handleInput} className="min-h-[200px] max-h-[400px] overflow-y-auto px-4 py-3 focus:outline-none" style={{ fontFamily: "Georgia, serif", fontSize: "15px", lineHeight: "1.7" }} />
    </div>
  );
}

type User = {
  _id: Id<"users">;
  email: string;
  username: string;
  avatar: string;
  role: "user" | "admin";
  isBanned: boolean;
  createdAt: number;
};

interface Interaction {
  id: string;
  title: string;
  category: string;
  description: string;
  coverImage: string;
  content: string;
  author: string;
  createdAt: number;
  updatedAt: number;
}

interface Comment {
  id: string;
  authorName: string;
  authorEmail: string;
  authorAvatar: string;
  content: string;
  createdAt: number;
  replies: Comment[];
}

interface BanEntry {
  email: string;
  expiresAt: number | null;
}

// Default comments
const DEFAULT_COMMENTS: Comment[] = [
  {
    id: "placeholder_1",
    authorName: "Sarah Johnson",
    authorEmail: "sarah@example.com",
    authorAvatar: "avatar2",
    content: "Great discussion! Very informative.",
    createdAt: Date.now() - 86400000 * 3,
    replies: [
      {
        id: "placeholder_1_reply",
        authorName: "Mike Chen",
        authorEmail: "mike@example.com",
        authorAvatar: "avatar4",
        content: "I agree! Thanks for sharing.",
        createdAt: Date.now() - 86400000 * 2,
        replies: [],
      },
    ],
  },
  {
    id: "placeholder_2",
    authorName: "Emily Davis",
    authorEmail: "emily@example.com",
    authorAvatar: "avatar5",
    content: "This is exactly what I needed. Bookmarking for later!",
    createdAt: Date.now() - 86400000 * 5,
    replies: [],
  },
  {
    id: "placeholder_3",
    authorName: "Alex Thompson",
    authorEmail: "alex@example.com",
    authorAvatar: "avatar8",
    content: "Looking forward to more content like this.",
    createdAt: Date.now() - 86400000 * 7,
    replies: [],
  },
];

const COMMENTS_STORAGE_KEY = "interaction_comments";
const BANNED_USERS_KEY = "interaction_banned_users";

const CATEGORIES = [
  { value: "software", label: "Software" },
  { value: "hardware", label: "Hardware" },
  { value: "music", label: "Music" },
  { value: "production", label: "Production" },
  { value: "resources", label: "Resources" },
  { value: "other", label: "Other" },
];

// Generate default posts with fixed timestamps
function getDefaultInteractionPosts(): Interaction[] {
  const now = Date.now();
  return [
    // Software (10)
    { id: "ph-soft-1", title: "ISAT Interaction 2023 v1.0.4 Released", author: "DevTeam", description: "Latest version announcement", coverImage: "", content: "<p>Release notes...</p>", category: "software", createdAt: now - 3600000 * 2, updatedAt: now - 3600000 * 2 },
    { id: "ph-soft-2", title: "How to optimize latent settings in DAW Soundworks", author: "AudioPro", description: "Latency optimization guide", coverImage: "", content: "<p>Guide content...</p>", category: "software", createdAt: now - 3600000 * 5, updatedAt: now - 3600000 * 5 },
    { id: "ph-soft-3", title: "MIDI controller mapping tutorial for live performance", author: "MIDI_Master", description: "MIDI mapping guide", coverImage: "", content: "<p>Tutorial content...</p>", category: "software", createdAt: now - 3600000 * 12, updatedAt: now - 3600000 * 12 },
    { id: "ph-soft-4", title: "Best free VST plugins for orchestral composition", author: "OrchestraFan", description: "Free VST plugins list", coverImage: "", content: "<p>List content...</p>", category: "software", createdAt: now - 3600000 * 24, updatedAt: now - 3600000 * 24 },
    { id: "ph-soft-5", title: "Audio interface latency troubleshooting guide", author: "StudioGuru", description: "Latency troubleshooting", coverImage: "", content: "<p>Guide content...</p>", category: "software", createdAt: now - 3600000 * 36, updatedAt: now - 3600000 * 36 },
    { id: "ph-soft-6", title: "Setting up multi-monitor workspace for mixing", author: "MixEngineer", description: "Multi-monitor setup", coverImage: "", content: "<p>Setup guide...</p>", category: "software", createdAt: now - 3600000 * 48, updatedAt: now - 3600000 * 48 },
    { id: "ph-soft-7", title: "Cloud collaboration tools for remote music production", author: "RemoteBeat", description: "Cloud collaboration tools", coverImage: "", content: "<p>Tools overview...</p>", category: "software", createdAt: now - 3600000 * 60, updatedAt: now - 3600000 * 60 },
    { id: "ph-soft-8", title: "Automating reverb sends with sidechain compression", author: "FXWizard", description: "Reverb automation techniques", coverImage: "", content: "<p>Techniques...</p>", category: "software", createdAt: now - 3600000 * 72, updatedAt: now - 3600000 * 72 },
    { id: "ph-soft-9", title: "Exporting stems correctly for film scoring projects", author: "FilmScore", description: "Stem export guide", coverImage: "", content: "<p>Guide content...</p>", category: "software", createdAt: now - 3600000 * 84, updatedAt: now - 3600000 * 84 },
    { id: "ph-soft-10", title: "Building a custom macro pad for live DJ sets", author: "DJLIVE", description: "Custom macro pad DIY", coverImage: "", content: "<p>DIY guide...</p>", category: "software", createdAt: now - 3600000 * 96, updatedAt: now - 3600000 * 96 },
    // Hardware (10)
    { id: "ph-hard-1", title: "Best audio interfaces of 2026 — comprehensive comparison", author: "GearReviewer", description: "Audio interface comparison", coverImage: "", content: "<p>Comparison content...</p>", category: "hardware", createdAt: now - 3600000 * 3, updatedAt: now - 3600000 * 3 },
    { id: "ph-hard-2", title: "Monitor speaker placement guide — acoustics for small rooms", author: "AcousticPro", description: "Speaker placement guide", coverImage: "", content: "<p>Guide content...</p>", category: "hardware", createdAt: now - 3600000 * 8, updatedAt: now - 3600000 * 8 },
    { id: "ph-hard-3", title: "Understanding microphone polar patterns", author: "MicExpert", description: "Mic polar patterns explained", coverImage: "", content: "<p>Explanation...</p>", category: "hardware", createdAt: now - 3600000 * 20, updatedAt: now - 3600000 * 20 },
    { id: "ph-hard-4", title: "DI box explained: active vs passive", author: "LiveSound", description: "DI box guide", coverImage: "", content: "<p>Guide content...</p>", category: "hardware", createdAt: now - 3600000 * 32, updatedAt: now - 3600000 * 32 },
    { id: "ph-hard-5", title: "Audio cabling basics — balanced vs unbalanced", author: "CableKing", description: "Cabling basics", coverImage: "", content: "<p>Basics...</p>", category: "hardware", createdAt: now - 3600000 * 44, updatedAt: now - 3600000 * 44 },
    { id: "ph-hard-6", title: "DIY acoustic treatment on a budget", author: "BudgetStudio", description: "Budget acoustic treatment", coverImage: "", content: "<p>DIY guide...</p>", category: "hardware", createdAt: now - 3600000 * 56, updatedAt: now - 3600000 * 56 },
    { id: "ph-hard-7", title: "Headphone amplifier pairing guide", author: "Audiophile", description: "Headphone amp pairing", coverImage: "", content: "<p>Guide content...</p>", category: "hardware", createdAt: now - 3600000 * 68, updatedAt: now - 3600000 * 68 },
    { id: "ph-hard-8", title: "How to choose the right MIDI keyboard", author: "KeysPlayer", description: "MIDI keyboard guide", coverImage: "", content: "<p>Guide content...</p>", category: "hardware", createdAt: now - 3600000 * 80, updatedAt: now - 3600000 * 80 },
    { id: "ph-hard-9", title: "Studio furniture and desk setup essentials", author: "StudioBuilder", description: "Studio desk setup", coverImage: "", content: "<p>Setup guide...</p>", category: "hardware", createdAt: now - 3600000 * 92, updatedAt: now - 3600000 * 92 },
    { id: "ph-hard-10", title: "Power conditioning and surge protection guide", author: "SafetyFirst", description: "Power protection guide", coverImage: "", content: "<p>Guide content...</p>", category: "hardware", createdAt: now - 3600000 * 104, updatedAt: now - 3600000 * 104 },
    // Music (10)
    { id: "ph-music-1", title: "Songwriting 101: Finding your unique melodic voice", author: "Songsmith", description: "Songwriting basics", coverImage: "", content: "<p>Basics...</p>", category: "music", createdAt: now - 3600000 * 4, updatedAt: now - 3600000 * 4 },
    { id: "ph-music-2", title: "Orchestral arrangement tips for small ensembles", author: "Arranger", description: "Orchestral arrangement tips", coverImage: "", content: "<p>Tips...</p>", category: "music", createdAt: now - 3600000 * 16, updatedAt: now - 3600000 * 16 },
    { id: "ph-music-3", title: "Understanding modal scales beyond major and minor", author: "TheoryNerd", description: "Modal scales guide", coverImage: "", content: "<p>Guide...</p>", category: "music", createdAt: now - 3600000 * 28, updatedAt: now - 3600000 * 28 },
    { id: "ph-music-4", title: "Music theory for producers", author: "BeatMaker", description: "Music theory basics", coverImage: "", content: "<p>Basics...</p>", category: "music", createdAt: now - 3600000 * 40, updatedAt: now - 3600000 * 40 },
    { id: "ph-music-5", title: "Creating emotional chord progressions", author: "Composer", description: "Chord progression guide", coverImage: "", content: "<p>Guide...</p>", category: "music", createdAt: now - 3600000 * 52, updatedAt: now - 3600000 * 52 },
    { id: "ph-music-6", title: "Rhythm and groove fundamentals", author: "Drummer", description: "Rhythm fundamentals", coverImage: "", content: "<p>Fundamentals...</p>", category: "music", createdAt: now - 3600000 * 64, updatedAt: now - 3600000 * 64 },
    { id: "ph-music-7", title: "Melody writing techniques", author: "Melodist", description: "Melody techniques", coverImage: "", content: "<p>Techniques...</p>", category: "music", createdAt: now - 3600000 * 76, updatedAt: now - 3600000 * 76 },
    { id: "ph-music-8", title: "Harmonic color — using extended chords", author: "JazzCat", description: "Extended chords guide", coverImage: "", content: "<p>Guide...</p>", category: "music", createdAt: now - 3600000 * 88, updatedAt: now - 3600000 * 88 },
    { id: "ph-music-9", title: "Arranging for different ensembles", author: "EnsembleLead", description: "Arranging guide", coverImage: "", content: "<p>Guide...</p>", category: "music", createdAt: now - 3600000 * 100, updatedAt: now - 3600000 * 100 },
    { id: "ph-music-10", title: "Music production workflow optimization", author: "ProducerX", description: "Workflow optimization", coverImage: "", content: "<p>Tips...</p>", category: "music", createdAt: now - 3600000 * 112, updatedAt: now - 3600000 * 112 },
    // Production (10)
    { id: "ph-prod-1", title: "Lighting design fundamentals for live stage", author: "LightMaster", description: "Lighting design basics", coverImage: "", content: "<p>Basics...</p>", category: "production", createdAt: now - 3600000 * 6, updatedAt: now - 3600000 * 6 },
    { id: "ph-prod-2", title: "Sound reinforcement setup for live theater", author: "SoundTech", description: "Sound setup guide", coverImage: "", content: "<p>Guide...</p>", category: "production", createdAt: now - 3600000 * 18, updatedAt: now - 3600000 * 18 },
    { id: "ph-prod-3", title: "Stage rigging safety standards", author: "SafetyOfficer", description: "Rigging safety", coverImage: "", content: "<p>Standards...</p>", category: "production", createdAt: now - 3600000 * 30, updatedAt: now - 3600000 * 30 },
    { id: "ph-prod-4", title: "Projection mapping techniques", author: "VisualArtist", description: "Projection mapping", coverImage: "", content: "<p>Techniques...</p>", category: "production", createdAt: now - 3600000 * 42, updatedAt: now - 3600000 * 42 },
    { id: "ph-prod-5", title: "Set design and construction on a budget", author: "SetBuilder", description: "Budget set design", coverImage: "", content: "<p>Guide...</p>", category: "production", createdAt: now - 3600000 * 54, updatedAt: now - 3600000 * 54 },
    { id: "ph-prod-6", title: "AV system integration for venues", author: "AVIntegrator", description: "AV integration guide", coverImage: "", content: "<p>Guide...</p>", category: "production", createdAt: now - 3600000 * 66, updatedAt: now - 3600000 * 66 },
    { id: "ph-prod-7", title: "Backstage communication protocols", author: "StageManager", description: "Communication protocols", coverImage: "", content: "<p>Protocols...</p>", category: "production", createdAt: now - 3600000 * 78, updatedAt: now - 3600000 * 78 },
    { id: "ph-prod-8", title: "Pyrotechnics and special effects safety", author: "FXTech", description: "FX safety guide", coverImage: "", content: "<p>Guide...</p>", category: "production", createdAt: now - 3600000 * 90, updatedAt: now - 3600000 * 90 },
    { id: "ph-prod-9", title: "Live mixing techniques for bands", author: "LiveMixer", description: "Live mixing tips", coverImage: "", content: "<p>Tips...</p>", category: "production", createdAt: now - 3600000 * 102, updatedAt: now - 3600000 * 102 },
    { id: "ph-prod-10", title: "Stage management best practices", author: "ProManager", description: "Stage management guide", coverImage: "", content: "<p>Guide...</p>", category: "production", createdAt: now - 3600000 * 114, updatedAt: now - 3600000 * 114 },
    // Resources (10)
    { id: "ph-res-1", title: "The rich history of musical theater", author: "TheaterBuff", description: "Musical theater history", coverImage: "", content: "<p>History...</p>", category: "resources", createdAt: now - 3600000 * 7, updatedAt: now - 3600000 * 7 },
    { id: "ph-res-2", title: "The evolution of recording technology", author: "HistoryNerd", description: "Recording tech history", coverImage: "", content: "<p>History...</p>", category: "resources", createdAt: now - 3600000 * 19, updatedAt: now - 3600000 * 19 },
    { id: "ph-res-3", title: "The 10 most influential composers of the 21st century", author: "MusicScholar", description: "Influential composers", coverImage: "", content: "<p>List...</p>", category: "resources", createdAt: now - 3600000 * 31, updatedAt: now - 3600000 * 31 },
    { id: "ph-res-4", title: "Psychoacoustics: how the brain processes music", author: "ScienceGuy", description: "Psychoacoustics guide", coverImage: "", content: "<p>Guide...</p>", category: "resources", createdAt: now - 3600000 * 43, updatedAt: now - 3600000 * 43 },
    { id: "ph-res-5", title: "Music therapy research — evidence-based practice", author: "Therapist", description: "Music therapy research", coverImage: "", content: "<p>Research...</p>", category: "resources", createdAt: now - 3600000 * 55, updatedAt: now - 3600000 * 55 },
    { id: "ph-res-6", title: "Copyright law for independent musicians", author: "LegalEagle", description: "Copyright guide", coverImage: "", content: "<p>Guide...</p>", category: "resources", createdAt: now - 3600000 * 67, updatedAt: now - 3600000 * 67 },
    { id: "ph-res-7", title: "The streaming era — understanding music economics", author: "EconMajor", description: "Music economics", coverImage: "", content: "<p>Analysis...</p>", category: "resources", createdAt: now - 3600000 * 79, updatedAt: now - 3600000 * 79 },
    { id: "ph-res-8", title: "AI in music composition", author: "AITech", description: "AI music tools", coverImage: "", content: "<p>Overview...</p>", category: "resources", createdAt: now - 3600000 * 91, updatedAt: now - 3600000 * 91 },
    { id: "ph-res-9", title: "The future of live music performances", author: "Futurist", description: "Future of live music", coverImage: "", content: "<p>Predictions...</p>", category: "resources", createdAt: now - 3600000 * 103, updatedAt: now - 3600000 * 103 },
    { id: "ph-res-10", title: "Music education trends and innovations", author: "EduExpert", description: "Music education trends", coverImage: "", content: "<p>Trends...</p>", category: "resources", createdAt: now - 3600000 * 115, updatedAt: now - 3600000 * 115 },
    // Others (10)
    { id: "ph-oth-1", title: "Community guidelines — keeping our forum respectful", author: "Admin", description: "Forum guidelines", coverImage: "", content: "<p>Guidelines...</p>", category: "other", createdAt: now - 3600000 * 168, updatedAt: now - 3600000 * 168 },
    { id: "ph-oth-2", title: "Community event calendar — upcoming meetups", author: "EventLead", description: "Event calendar", coverImage: "", content: "<p>Events...</p>", category: "other", createdAt: now - 3600000 * 72, updatedAt: now - 3600000 * 72 },
    { id: "ph-oth-3", title: "Weekly feedback thread — share your tracks", author: "WeeklyHost", description: "Weekly feedback thread", coverImage: "", content: "<p>Thread...</p>", category: "other", createdAt: now - 3600000 * 168, updatedAt: now - 3600000 * 168 },
    { id: "ph-oth-4", title: "Best resources for learning music theory from scratch", author: "TheoryNewbie", description: "Theory resources", coverImage: "", content: "<p>Resources...</p>", category: "other", createdAt: now - 3600000 * 96, updatedAt: now - 3600000 * 96 },
    { id: "ph-oth-5", title: "Recommended YouTube channels for audio engineering", author: "VideoFan", description: "YouTube recommendations", coverImage: "", content: "<p>Recommendations...</p>", category: "other", createdAt: now - 3600000 * 120, updatedAt: now - 3600000 * 120 },
    { id: "ph-oth-6", title: "Collaborative projects — find your bandmates here", author: "CollabKing", description: "Collaboration thread", coverImage: "", content: "<p>Thread...</p>", category: "other", createdAt: now - 3600000 * 144, updatedAt: now - 3600000 * 144 },
    { id: "ph-oth-7", title: "Monthly challenges — May 2026: Ambient Soundscapes", author: "ChallengeHost", description: "Monthly challenge", coverImage: "", content: "<p>Challenge...</p>", category: "other", createdAt: now - 3600000 * 96, updatedAt: now - 3600000 * 96 },
    { id: "ph-oth-8", title: "Show off your home studio setup!", author: "SetupShare", description: "Studio setup showcase", coverImage: "", content: "<p>Showcase...</p>", category: "other", createdAt: now - 3600000 * 168, updatedAt: now - 3600000 * 168 },
    { id: "ph-oth-9", title: "Tips for performing musicians on tour", author: "TourVet", description: "Touring tips", coverImage: "", content: "<p>Tips...</p>", category: "other", createdAt: now - 3600000 * 192, updatedAt: now - 3600000 * 192 },
    { id: "ph-oth-10", title: "How to deal with performance anxiety", author: "MindsetCoach", description: "Performance anxiety guide", coverImage: "", content: "<p>Guide...</p>", category: "other", createdAt: now - 3600000 * 216, updatedAt: now - 3600000 * 216 },
  ];
}

export default function AdminInteractionPage() {
  const [activeTab, setActiveTab] = useState<"items" | "users">("items");
  const [items, setItems] = useState<Interaction[]>(getDefaultInteractionPosts());
  const [isInitialized, setIsInitialized] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("software");
  const [author, setAuthor] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Comment management state
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentBannedUsers, setCommentBannedUsers] = useState<BanEntry[]>([]);

  // User management state
  const [userFilter, setUserFilter] = useState<"all" | "active" | "banned" | "admins">("all");
  const [userActionLoading, setUserActionLoading] = useState(false);
  const [expandedUserCategory, setExpandedUserCategory] = useState<string | null>(null);

  // Convex queries and mutations for users
  const adminEmail = typeof window !== "undefined" ? localStorage.getItem("user_email") || "" : "";
  const allUsers = useQuery(api.admin.listAllUsers, { callerEmail: adminEmail }) ?? [];
  const updateRole = useMutation(api.admin.updateUserRole);
  const banUser = useMutation(api.admin.banUser);
  const unbanUser = useMutation(api.admin.unbanUser);

  // Load data - always use default posts, ignore old localStorage data
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Always use default posts for consistency with frontend
      const defaultPosts = getDefaultInteractionPosts();
      setItems(defaultPosts);
      setIsInitialized(true);
    }
  }, []);

  const saveToStorage = (data: Interaction[]) => {
    localStorage.setItem("admin_interaction", JSON.stringify(data));
    setItems(data);
  };

  useEffect(() => { if (message) { const t = setTimeout(() => setMessage(null), 5000); return () => clearTimeout(t); } }, [message]);

  // Comment management functions
  const loadComments = (itemId: string) => {
    const stored = localStorage.getItem(COMMENTS_STORAGE_KEY);
    if (stored) {
      const allComments = JSON.parse(stored);
      const pageComments = allComments[itemId] || [];
      setComments(pageComments.length > 0 ? pageComments : DEFAULT_COMMENTS);
    } else {
      setComments(DEFAULT_COMMENTS);
    }
    const banned = localStorage.getItem(BANNED_USERS_KEY);
    if (banned) {
      setCommentBannedUsers(JSON.parse(banned));
    } else {
      setCommentBannedUsers([]);
    }
  };

  const saveComments = (itemId: string, newComments: Comment[]) => {
    const stored = localStorage.getItem(COMMENTS_STORAGE_KEY);
    const allComments = stored ? JSON.parse(stored) : {};
    allComments[itemId] = newComments;
    localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(allComments));
    setComments(newComments);
  };

  const isUserBanned = (email: string): boolean => {
    const now = Date.now();
    return commentBannedUsers.some(b => b.email === email && (b.expiresAt === null || b.expiresAt > now));
  };

  const handleDeleteComment = (commentId: string) => {
    if (!confirm("Delete this comment and all its replies?")) return;
    const updated = comments.filter((c) => c.id !== commentId);
    if (editingId) {
      saveComments(editingId, updated);
    }
    setMessage({ type: "success", text: "Comment and replies deleted" });
  };

  const handleDeleteReply = (parentId: string, replyId: string) => {
    if (!confirm("Delete this reply?")) return;
    const updated = comments.map((c) => {
      if (c.id === parentId) {
        return { ...c, replies: c.replies.filter((r) => r.id !== replyId) };
      }
      return c;
    });
    if (editingId) {
      saveComments(editingId, updated);
    }
    setMessage({ type: "success", text: "Reply deleted" });
  };

  const handleBanUser = (email: string, duration: number | null, deleteComments: boolean = false) => {
    const expiresAt = duration === null ? null : Date.now() + duration;
    let updatedComments = comments;
    if (deleteComments) {
      updatedComments = comments
        .filter((c) => c.authorEmail !== email)
        .map((c) => ({
          ...c,
          replies: c.replies.filter((r) => r.authorEmail !== email),
        }));
    }
    const newBanned = commentBannedUsers.filter(b => b.email !== email);
    newBanned.push({ email, expiresAt });
    setCommentBannedUsers(newBanned);
    localStorage.setItem(BANNED_USERS_KEY, JSON.stringify(newBanned));
    if (editingId && deleteComments) {
      saveComments(editingId, updatedComments);
    }
    const durationText = duration === null ? "permanently" : `${duration / 86400000} day(s)`;
    setMessage({ type: "success", text: `User ${email} banned ${durationText}` });
  };

  const handleUnbanUser = (email: string) => {
    const newBanned = commentBannedUsers.filter(b => b.email !== email);
    setCommentBannedUsers(newBanned);
    localStorage.setItem(BANNED_USERS_KEY, JSON.stringify(newBanned));
    setMessage({ type: "success", text: `User ${email} unbanned` });
  };

  const formatTime = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const getCommentAuthors = () => {
    const authors = new Map<string, { email: string; avatar: string; count: number }>();
    comments.forEach((c) => {
      const existing = authors.get(c.authorEmail);
      authors.set(c.authorEmail, { email: c.authorEmail, avatar: c.authorAvatar, count: existing ? existing.count + 1 : 1 });
      c.replies.forEach((r) => {
        const replyExisting = authors.get(r.authorEmail);
        authors.set(r.authorEmail, { email: r.authorEmail, avatar: r.authorAvatar, count: replyExisting ? replyExisting.count + 1 : 1 });
      });
    });
    return Array.from(authors.values());
  };

  // Group items by category
  const itemsByCategory = CATEGORIES.map((cat) => ({
    ...cat,
    items: items.filter((p) => p.category === cat.value),
  }));

  const filteredItems = items.filter((p) => {
    if (filterCategory !== "all" && p.category !== filterCategory) return false;
    return true;
  });

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => { const base64 = ev.target?.result as string; setCoverImage(base64); setCoverPreview(base64); };
      reader.readAsDataURL(file);
    }
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  const handleNew = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setContent("");
    setCategory(filterCategory !== "all" ? filterCategory : "software");
    setAuthor("");
    setCoverImage("");
    setCoverPreview(null);
    setShowForm(true);
  };

  const handleEdit = (item: Interaction) => {
    setEditingId(item.id);
    setTitle(item.title || "");
    setDescription(item.description || "");
    setContent(item.content || "");
    setCategory(item.category || "software");
    setAuthor(item.author || "");
    setCoverImage(item.coverImage || "");
    setCoverPreview(item.coverImage || null);
    loadComments(item.id);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setMessage({ type: "error", text: "Title is required" }); return; }
    setLoading(true);
    try {
      const now = Date.now();
      if (editingId) {
        const updated = items.map((item) => item.id === editingId ? { ...item, title: title.trim(), description, content, category, author, coverImage, updatedAt: now } : item);
        saveToStorage(updated);
        setMessage({ type: "success", text: "Updated successfully!" });
      } else {
        const newItem: Interaction = { id: now.toString(), title: title.trim(), category, description, content, author, coverImage, createdAt: now, updatedAt: now };
        saveToStorage([newItem, ...items]);
        setMessage({ type: "success", text: "Created successfully!" });
      }
      setShowForm(false);
    } catch { setMessage({ type: "error", text: "Failed" }); } finally { setLoading(false); }
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this item?")) return;
    saveToStorage(items.filter((item) => item.id !== id));
    setMessage({ type: "success", text: "Deleted" });
  };

  const formatDate = (timestamp: number) => new Date(timestamp).toLocaleDateString();

  // User management functions
  const filteredUsers = allUsers.filter((u: User) => {
    if (userFilter === "active") return !u.isBanned;
    if (userFilter === "banned") return u.isBanned;
    if (userFilter === "admins") return u.role === "admin";
    return true;
  });

  const handleUserRoleChange = async (userId: Id<"users">, newRole: "user" | "admin") => {
    setUserActionLoading(true);
    try {
      await updateRole({ userId, newRole });
      setMessage({ type: "success", text: `User role updated to ${newRole}` });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update role" });
    } finally {
      setUserActionLoading(false);
    }
  };

  const handleUserBan = async (userId: Id<"users">) => {
    if (!confirm("Ban this user? They will not be able to log in.")) return;
    setUserActionLoading(true);
    try {
      await banUser({ callerEmail: adminEmail, userId });
      setMessage({ type: "success", text: "User banned" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to ban user" });
    } finally {
      setUserActionLoading(false);
    }
  };

  const handleUserUnban = async (userId: Id<"users">) => {
    setUserActionLoading(true);
    try {
      await unbanUser({ callerEmail: adminEmail, userId });
      setMessage({ type: "success", text: "User unbanned" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to unban user" });
    } finally {
      setUserActionLoading(false);
    }
  };

  const totalUsers = allUsers.length;
  const activeUsers = allUsers.filter((u: User) => !u.isBanned).length;
  const bannedUsersCount = allUsers.filter((u: User) => u.isBanned).length;
  const adminCount = allUsers.filter((u: User) => u.role === "admin").length;

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Interaction</h1><p className="mt-1 text-sm text-gray-500">Manage resources and users</p></div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-gray-200">
        <button
          onClick={() => setActiveTab("items")}
          className={`border-b-2 px-4 py-3 text-sm font-medium ${
            activeTab === "items"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Resources ({items.length})
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`border-b-2 px-4 py-3 text-sm font-medium ${
            activeTab === "users"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Users ({totalUsers})
        </button>
      </div>

      {message && <div className={`rounded-lg p-4 text-sm ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{message.text}</div>}

      {/* Resources Tab */}
      {activeTab === "items" && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Filter by Category</label>
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="rounded-md border border-gray-300 px-3 py-2 text-sm">
                <option value="all">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label} ({itemsByCategory.find(c => c.value === cat.value)?.items.length || 0})</option>
                ))}
              </select>
            </div>
            <div className="ml-auto">
              <button onClick={handleNew} className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">+ New Resource</button>
            </div>
          </div>

          {/* Form */}
          {showForm && (
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold">{editingId ? "Edit" : "New"} Resource</h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div><label className="mb-1 block text-sm font-medium text-gray-700">Title</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2" required /></div>
                  <div><label className="mb-1 block text-sm font-medium text-gray-700">Category</label><select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2">{CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
                  <div><label className="mb-1 block text-sm font-medium text-gray-700">Author</label><input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author name" className="w-full rounded-md border border-gray-300 px-3 py-2" /></div>
                  <div className="md:col-span-2"><label className="mb-1 block text-sm font-medium text-gray-700">Cover Image</label><input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverSelect} className="hidden" /><button type="button" onClick={() => coverInputRef.current?.click()} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm">Choose Image</button>{coverPreview && <div className="mt-2 flex items-center gap-4"><img src={coverPreview} alt="Preview" className="h-20 w-32 rounded-md object-cover" /><button type="button" onClick={() => { setCoverImage(""); setCoverPreview(null); }} className="text-sm text-red-500 hover:text-red-700">Remove</button></div>}</div>
                  <div className="md:col-span-2"><label className="mb-1 block text-sm font-medium text-gray-700">Summary (for list display)</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full rounded-md border border-gray-300 px-3 py-2" /></div>
                </div>
                <div className="flex justify-end gap-3 border-t pt-4"><button type="button" onClick={() => setShowForm(false)} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm">Cancel</button><button type="submit" disabled={loading} className="rounded-md bg-blue-600 px-6 py-2 text-white disabled:opacity-50">{loading ? "Saving..." : editingId ? "Update" : "Create"}</button></div>
              </form>

              {/* Comment Management Section */}
              <div className="mt-8 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Comments ({comments.length})</h3>

                {/* Authors Summary */}
                {getCommentAuthors().length > 0 && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Authors</h4>
                    <div className="flex flex-wrap gap-2">
                      {getCommentAuthors().map((author) => {
                        const isBanned = isUserBanned(author.email);
                        return (
                          <div key={author.email} className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-gray-200">
                            <span className="text-sm">{author.avatar}</span>
                            <span className="text-sm text-gray-700">{author.email}</span>
                            <span className="text-xs text-gray-400">({author.count})</span>
                            {isBanned ? (
                              <div className="flex items-center gap-1">
                                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">Banned</span>
                                <button onClick={() => handleUnbanUser(author.email)} className="text-xs text-green-600 hover:text-green-700 font-medium">Unban</button>
                              </div>
                            ) : (
                              <div className="relative group">
                                <button className="text-xs text-red-600 hover:text-red-700 font-medium">Ban ▾</button>
                                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 min-w-[180px]">
                                  <button onClick={() => handleBanUser(author.email, 86400000, false)} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 rounded-t-lg">Ban for 1 day</button>
                                  <button onClick={() => handleBanUser(author.email, 604800000, false)} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50">Ban for 7 days</button>
                                  <button onClick={() => handleBanUser(author.email, 2592000000, false)} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50">Ban for 30 days</button>
                                  <button onClick={() => handleBanUser(author.email, null, false)} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 rounded-b-lg">Ban permanently</button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Comments List */}
                {comments.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No comments yet.</p>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {comments.map((comment) => {
                      const isBanned = isUserBanned(comment.authorEmail);
                      return (
                        <div key={comment.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <span className="text-2xl">{comment.authorAvatar}</span>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900">{comment.authorName}</span>
                                  <span className="text-xs text-gray-400">{comment.authorEmail}</span>
                                  {isBanned && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">Banned</span>}
                                </div>
                                <span className="text-xs text-gray-400">{formatTime(comment.createdAt)}</span>
                                <p className="mt-2 text-gray-700 text-sm">{comment.content}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => handleDeleteComment(comment.id)} className="text-xs text-red-600 hover:text-red-700 font-medium">Delete</button>
                              {!isBanned && (
                                <div className="relative group">
                                  <button className="text-xs text-orange-600 hover:text-orange-700 font-medium">Ban ▾</button>
                                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 min-w-[200px]">
                                    <button onClick={() => handleBanUser(comment.authorEmail, 86400000, true)} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 rounded-t-lg">Ban 1 day + Delete comments</button>
                                    <button onClick={() => handleBanUser(comment.authorEmail, 604800000, true)} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50">Ban 7 days + Delete comments</button>
                                    <button onClick={() => handleBanUser(comment.authorEmail, 2592000000, true)} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50">Ban 30 days + Delete comments</button>
                                    <button onClick={() => handleBanUser(comment.authorEmail, null, true)} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 rounded-b-lg">Ban permanently + Delete comments</button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          {comment.replies.length > 0 && (
                            <div className="ml-12 mt-3 space-y-3 border-t border-gray-100 pt-3">
                              {comment.replies.map((reply) => (
                                <div key={reply.id} className="flex items-start justify-between">
                                  <div className="flex items-start gap-2">
                                    <span className="text-lg">{reply.authorAvatar}</span>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-900 text-sm">{reply.authorName}</span>
                                        {isUserBanned(reply.authorEmail) && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">Banned</span>}
                                      </div>
                                      <span className="text-xs text-gray-400">{formatTime(reply.createdAt)}</span>
                                      <p className="mt-1 text-gray-700 text-sm">{reply.content}</p>
                                    </div>
                                  </div>
                                  <button onClick={() => handleDeleteReply(comment.id, reply.id)} className="text-xs text-red-600 hover:text-red-700 font-medium">Delete</button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Category Accordion */}
          <div className="space-y-6">
            {itemsByCategory.map((cat) => {
              const categoryItems = filterCategory === "all" || filterCategory === cat.value ? cat.items : [];

              if (filterCategory !== "all" && filterCategory !== cat.value) return null;

              return (
                <div key={cat.value} className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                  <button
                    onClick={() => setExpandedCategory(expandedCategory === cat.value ? null : cat.value)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{expandedCategory === cat.value ? "▼" : "▶"}</span>
                      <span className="font-medium text-gray-900">{cat.label}</span>
                      <span className="text-sm text-gray-500">({categoryItems.length})</span>
                    </div>
                  </button>

                  {expandedCategory === cat.value && (
                    <div className="divide-y divide-gray-100">
                      {categoryItems.length === 0 ? (
                        <div className="px-4 py-6 text-center text-gray-500 text-sm">
                          No items in this category
                        </div>
                      ) : (
                        categoryItems.map((item) => (
                          <div key={item.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {item.coverImage && (
                                <img src={item.coverImage} alt="" className="h-10 w-16 rounded object-cover shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900 truncate">{item.title}</span>
                                  {item.author && <span className="text-xs text-gray-400">by {item.author}</span>}
                                </div>
                                <span className="text-xs text-gray-400 truncate">{formatDate(item.createdAt)}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <button onClick={() => handleEdit(item)} className="px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded">Edit</button>
                              <button onClick={() => handleDelete(item.id)} className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded">Delete</button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="text-2xl font-bold text-gray-900">{totalUsers}</div>
              <div className="text-sm text-gray-500">Total Users</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="text-2xl font-bold text-green-600">{activeUsers}</div>
              <div className="text-sm text-gray-500">Active</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="text-2xl font-bold text-red-600">{bannedUsersCount}</div>
              <div className="text-sm text-gray-500">Banned</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="text-2xl font-bold text-blue-600">{adminCount}</div>
              <div className="text-sm text-gray-500">Admins</div>
            </div>
          </div>

          {/* Filter */}
          <div className="flex items-center justify-end">
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value as any)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="all">All Users</option>
              <option value="active">Active Only</option>
              <option value="banned">Banned Only</option>
              <option value="admins">Admins Only</option>
            </select>
          </div>

          {/* Users Table */}
          <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No users found.</td>
                  </tr>
                ) : (
                  filteredUsers.map((user: User) => (
                    <tr key={user._id} className={user.isBanned ? "bg-red-50" : ""}>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{user.avatar}</span>
                          <span className="font-medium text-gray-900">{user.username}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{user.email}</td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <select
                          value={user.role}
                          onChange={(e) => handleUserRoleChange(user._id, e.target.value as "user" | "admin")}
                          disabled={userActionLoading}
                          className="rounded border border-gray-300 px-2 py-1 text-sm disabled:opacity-50"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {user.isBanned ? (
                          <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-600">Banned</span>
                        ) : (
                          <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-600">Active</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{formatDate(user.createdAt)}</td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {user.isBanned ? (
                          <button onClick={() => handleUserUnban(user._id)} disabled={userActionLoading} className="rounded bg-green-500 px-3 py-1 text-xs font-medium text-white hover:bg-green-600 disabled:opacity-50">Unban</button>
                        ) : (
                          <button onClick={() => handleUserBan(user._id)} disabled={userActionLoading} className="rounded bg-red-500 px-3 py-1 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-50">Ban</button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
