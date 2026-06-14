"use client";

import { useState, useEffect, useRef } from "react";

interface ContentItem {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  content: string;
  hidden?: boolean;
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

interface WelcomeData {
  heroTitle: string;
  heroSubtitle: string;
  introText1: string;
  introText2: string;
  songTitle: string;
  songLyricsText: string;
  image1: string;
  image2: string;
  image3: string;
  image4: string;
}

const DEFAULT_WELCOME_DATA: WelcomeData = {
  heroTitle: "Welcome home!",
  heroSubtitle: "The Hope Music Community website was designed and developed by Hope Studio, leveraging advanced AI-assisted development tools.",
  introText1: "Hope Music Community is home to music lovers from every corner of the world.",
  introText2: "You don't need to be a prodigy or pay for lessons. All you need is a dream — start here, where the music dreams of ordinary people come alive, simply because you love music.",
  songTitle: "(The Song)",
  songLyricsText: `Because you love music,
The world begins to sing.
Because you love music,
Every heart takes wing.

No need for fame, no need for gold,
Just a dream and a song to hold.

Because you love music,
We all belong.`,
  image1: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=800",
  image2: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
  image3: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800",
  image4: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800",
};

const WELCOME_STORAGE_KEY = "welcome_content";

// Studio Data
interface StudioData {
  subtitle: string;
  introText: string;
  musicalShowsTitle: string;
  musicalShowsContent: string;
  multimediaTitle: string;
  multimediaContent: string;
  image1: string;
  image2: string;
  image3: string;
}

const DEFAULT_STUDIO_DATA: StudioData = {
  subtitle: "Music dream we create!",
  introText: "Hope Studio is an entertainment studio specializing in musical performance, innovative tourism entertainment, and multimedia production — founded by Jesse Liu.",
  musicalShowsTitle: "Musical Shows",
  musicalShowsContent: "Shangri-La, an upcoming musical produced by Hope Studio, is set to be a landmark work in the genre. It features an immersive soundscape that seamlessly blends traditional orchestral music with modern electronic music, offering audiences a truly refreshing experience. Complementing the music, AI-powered VR visuals deliver a breathtaking feast for the eyes.",
  multimediaTitle: "Multimedia Production",
  multimediaContent: "Hope Studio pioneers innovative forms of tourism entertainment through immersive environments that integrate video, lighting, architecture, sound, and special effects to create remarkable visitor experiences.",
  image1: "/images/hope-studio/Hope Studio 1.png",
  image2: "/images/hope-studio/Hope Studio 2.png",
  image3: "/images/hope-studio/Hope Studio 3.jpg",
};

const STUDIO_STORAGE_KEY = "studio_content";

// Jesse Liu Data
interface Work {
  title: string;
  type: string;
  description: string;
}

interface JesseLiuData {
  subtitle: string;
  introText: string;
  quoteText: string;
  image1: string;
  image2: string;
  image3: string;
  image4: string;
  worksTitle: string;
  works: Work[];
}

const DEFAULT_JESSE_LIU_DATA: JesseLiuData = {
  subtitle: "Vocalist, Composer, Music Producer & AI Musician",
  introText: "As one of the most revered music artists of our time, Jesse Liu is a crossover musician reshaping the industry through his masterful fusion of symphonic grandeur and electronic fashion.",
  quoteText: "AI represents a landmark achievement in modern technology, bringing new possibilities to virtually every corner of the world — and the music industry is no exception. Jesse Liu harnesses AI as a creative tool, broadening his channels for musical inspiration and elevating the efficiency of his production process. It is this forward-thinking approach that has earned him widespread recognition across the industry as a pioneering AI musician.",
  image1: "/images/jesse-liu/Jesse Liu 1.jpg",
  image2: "/images/jesse-liu/Jesse Liu 2.jpg",
  image3: "/images/jesse-liu/Jesse Liu 3.jpg",
  image4: "/images/jesse-liu/Jesse Liu 4.jpg",
  worksTitle: "Works",
  works: [
    { title: "Shangri-La", type: "Musical", description: "An immersive musical experience blending symphonic grandeur with electronic fashion." },
    { title: "RESHAPE: Music Industry Needs", type: "Book", description: "A visionary perspective on the future of the music industry." },
  ],
};

const JESSE_LIU_STORAGE_KEY = "jesse_liu_content";

// Shangri-La Data
interface TeamMember {
  id: string;
  role: string;
  name: string;
  description?: string;
  image?: string;
}

interface ShangriLaData {
  introText1: string;
  introText2: string;
  coreTeamTitle: string;
  teamMembers: TeamMember[];
  image1: string;
  image2: string;
  image3: string;
  image4: string;
}

const DEFAULT_SHANGRI_LA_DATA: ShangriLaData = {
  introText1: "The musical Shangri-La is a proof of concept that people from various walks of life can come together to build meaningful friendships. The vision behind Cultural Fusion events has always centred on uniting people through the shared joy of song and dance.",
  introText2: "In the musical, audiences are treated not only to beautiful music and stunning visuals, but also to a profound exploration of love. It is a touching story that showcases love's remarkable power to transcend time and space.",
  coreTeamTitle: "Core creative team:",
  teamMembers: [
    {
      id: "jesse-liu",
      role: "Music and Lyrics by",
      name: "Jesse Liu",
    },
    {
      id: "daisy-li",
      role: "Book and Lyrics by",
      name: "Daisy Li",
      description: "Daisy Li is a masterful storyteller. She conceived the story within a fictional musical kingdom called Shangri-La, transporting its setting to the future to give full expression to the grandeur of its electronic soundscape. The result is an epic space journey to rescue the music kingdom — a narrative canvas that lets the electronic score truly soar.\n\nAt the heart of the story lies Daisy Li's inspired invention: the \"Music Seeds.\" Their transformation drives the entire arc of the plot, while simultaneously illuminating music as the living soul of the Kingdom of Shangri-La.",
      image: "/images/shangri-la/Li.jpg",
    },
  ],
  image1: "/images/shangri-la/Shangri-La 1.jpg",
  image2: "/images/shangri-la/Shangri-La 2.jpg",
  image3: "/images/shangri-la/Shangri-La 3.jpg",
  image4: "/images/shangri-la/Shangri-La 4.jpg",
};

const SHANGRI_LA_STORAGE_KEY = "shangri_la_content";

const CATEGORIES = [
  { value: "welcome", label: "Welcome to Hope Music Community" },
  { value: "studio", label: "Hope Studio" },
  { value: "jesse-liu", label: "Jesse Liu" },
  { value: "shangri-la", label: "Shangri-La" },
  { value: "works", label: "Cooperation" },
  { value: "schedule", label: "Performance Schedule" },
];

const DEFAULT_ITEMS: ContentItem[] = [
  { id: "welcome", title: "Welcome to Hope Music Community", category: "welcome", image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800", description: "Discover the vibrant world of Hope Music Community, where music lovers unite.", content: "<p>Welcome to the Hope Music Community!</p>" },
  { id: "studio", title: "Hope Studio", category: "studio", image: "/images/hope-studio/Hope Studio 1.png", description: "Professional recording, mixing, and mastering services.", content: "" },
  { id: "jesse-liu", title: "Jesse Liu", category: "jesse-liu", image: "/images/jesse-liu/Jesse Liu 1.jpg", description: "Meet Jesse Liu, our founder and creative director.", content: "" },
  { id: "shangri-la", title: "Shangri-La", category: "shangri-la", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800", description: "An immersive musical experience.", content: "<p>Shangri-La experience.</p>" },
  { id: "works", title: "Cooperation", category: "works", image: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800", description: "Explore our portfolio.", content: "<p>Our portfolio.</p>" },
  { id: "schedule", title: "Performance Schedule", category: "schedule", image: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800", description: "Upcoming performances and events.", content: "<p>Performance schedule.</p>", hidden: true },
];


const COMMENTS_STORAGE_KEY = "hope_studio_comments";
const BANNED_USERS_KEY = "hope_studio_banned_users";

export default function AdminHopeStudioPage() {
  const [items, setItems] = useState<ContentItem[]>(DEFAULT_ITEMS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ContentItem>(DEFAULT_ITEMS[0]);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Welcome data state
  const [welcomeData, setWelcomeData] = useState<WelcomeData>(DEFAULT_WELCOME_DATA);
  const [welcomeForm, setWelcomeForm] = useState<WelcomeData>(DEFAULT_WELCOME_DATA);

  // Studio data state
  const [studioData, setStudioData] = useState<StudioData>(DEFAULT_STUDIO_DATA);
  const [studioForm, setStudioForm] = useState<StudioData>(DEFAULT_STUDIO_DATA);

  // Jesse Liu data state
  const [jesseLiuData, setJesseLiuData] = useState<JesseLiuData>(DEFAULT_JESSE_LIU_DATA);
  const [jesseLiuForm, setJesseLiuForm] = useState<JesseLiuData>(DEFAULT_JESSE_LIU_DATA);

  // Shangri-La data state
  const [shangriLaData, setShangriLaData] = useState<ShangriLaData>(DEFAULT_SHANGRI_LA_DATA);
  const [shangriLaForm, setShangriLaForm] = useState<ShangriLaData>(DEFAULT_SHANGRI_LA_DATA);

  // Comment management state
  const [comments, setComments] = useState<Comment[]>([]);
  const [bannedUsers, setBannedUsers] = useState<BanEntry[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("hope_studio_content");
    if (stored) {
      setItems(JSON.parse(stored));
    }

    // Load welcome data
    const welcomeStored = localStorage.getItem(WELCOME_STORAGE_KEY);
    if (welcomeStored) {
      try {
        const parsed = JSON.parse(welcomeStored);
        setWelcomeData({ ...DEFAULT_WELCOME_DATA, ...parsed });
      } catch (e) {
        // Silent fail
      }
    }

    // Load studio data
    const studioStored = localStorage.getItem(STUDIO_STORAGE_KEY);
    if (studioStored) {
      try {
        const parsed = JSON.parse(studioStored);
        setStudioData({ ...DEFAULT_STUDIO_DATA, ...parsed });
      } catch (e) {
        // Silent fail
      }
    }

    // Load Jesse Liu data
    const jesseLiuStored = localStorage.getItem(JESSE_LIU_STORAGE_KEY);
    if (jesseLiuStored) {
      try {
        const parsed = JSON.parse(jesseLiuStored);
        setJesseLiuData({ ...DEFAULT_JESSE_LIU_DATA, ...parsed });
      } catch (e) {
        // Silent fail
      }
    }

    // Load Shangri-La data
    const shangriLaStored = localStorage.getItem(SHANGRI_LA_STORAGE_KEY);
    if (shangriLaStored) {
      try {
        const parsed = JSON.parse(shangriLaStored);
        setShangriLaData({ ...DEFAULT_SHANGRI_LA_DATA, ...parsed });
      } catch (e) {
        // Silent fail
      }
    }
  }, []);

  const saveToStorage = (data: ContentItem[]) => {
    localStorage.setItem("hope_studio_content", JSON.stringify(data));
    setItems(data);
  };

  useEffect(() => { if (message) { const t = setTimeout(() => setMessage(null), 5000); return () => clearTimeout(t); } }, [message]);

  // Comment management functions
  const loadComments = (itemId: string) => {
    const stored = localStorage.getItem(COMMENTS_STORAGE_KEY);
    if (stored) {
      const allComments = JSON.parse(stored);
      const pageComments = allComments[itemId] || [];
      setComments(pageComments);
    } else {
      setComments([]);
    }
    const banned = localStorage.getItem(BANNED_USERS_KEY);
    if (banned) {
      setBannedUsers(JSON.parse(banned));
    } else {
      setBannedUsers([]);
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
    return bannedUsers.some(b => b.email === email && (b.expiresAt === null || b.expiresAt > now));
  };

  const handleDeleteComment = (commentId: string) => {
    if (!confirm("Delete this comment and all its replies?")) return;
    const updated = comments.filter((c) => c.id !== commentId);
    if (editingId) {
      saveComments(`hope-studio-${editingId}`, updated);
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
      saveComments(`hope-studio-${editingId}`, updated);
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
    const newBanned = bannedUsers.filter(b => b.email !== email);
    newBanned.push({ email, expiresAt });
    setBannedUsers(newBanned);
    localStorage.setItem(BANNED_USERS_KEY, JSON.stringify(newBanned));
    if (editingId && deleteComments) {
      saveComments(`hope-studio-${editingId}`, updatedComments);
    }
    const durationText = duration === null ? "permanently" : `${duration / 86400000} day(s)`;
    setMessage({ type: "success", text: `User ${email} banned ${durationText}` });
  };

  const handleUnbanUser = (email: string) => {
    const newBanned = bannedUsers.filter(b => b.email !== email);
    setBannedUsers(newBanned);
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
    items: items.filter((item) => item.category === cat.value),
  }));

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditForm({ ...editForm, image: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleEdit = (item: ContentItem) => {
    setEditingId(item.id);
    setEditForm({ ...item });
    loadComments(`hope-studio-${item.id}`);

    // Load welcome data if editing welcome section
    if (item.id === "welcome") {
      const welcomeStored = localStorage.getItem(WELCOME_STORAGE_KEY);
      if (welcomeStored) {
        try {
          setWelcomeForm({ ...DEFAULT_WELCOME_DATA, ...JSON.parse(welcomeStored) });
        } catch (e) {
          setWelcomeForm(DEFAULT_WELCOME_DATA);
        }
      } else {
        setWelcomeForm(DEFAULT_WELCOME_DATA);
      }
    }

    // Load studio data if editing studio section
    if (item.id === "studio") {
      const studioStored = localStorage.getItem(STUDIO_STORAGE_KEY);
      if (studioStored) {
        try {
          setStudioForm({ ...DEFAULT_STUDIO_DATA, ...JSON.parse(studioStored) });
        } catch (e) {
          setStudioForm(DEFAULT_STUDIO_DATA);
        }
      } else {
        setStudioForm(DEFAULT_STUDIO_DATA);
      }
    }

    // Load Jesse Liu data if editing jesse-liu section
    if (item.id === "jesse-liu") {
      const jesseLiuStored = localStorage.getItem(JESSE_LIU_STORAGE_KEY);
      if (jesseLiuStored) {
        try {
          setJesseLiuForm({ ...DEFAULT_JESSE_LIU_DATA, ...JSON.parse(jesseLiuStored) });
        } catch (e) {
          setJesseLiuForm(DEFAULT_JESSE_LIU_DATA);
        }
      } else {
        setJesseLiuForm(DEFAULT_JESSE_LIU_DATA);
      }
    }

    // Load Shangri-La data if editing shangri-la section
    if (item.id === "shangri-la") {
      const shangriLaStored = localStorage.getItem(SHANGRI_LA_STORAGE_KEY);
      if (shangriLaStored) {
        try {
          setShangriLaForm({ ...DEFAULT_SHANGRI_LA_DATA, ...JSON.parse(shangriLaStored) });
        } catch (e) {
          setShangriLaForm(DEFAULT_SHANGRI_LA_DATA);
        }
      } else {
        setShangriLaForm(DEFAULT_SHANGRI_LA_DATA);
      }
    }
  };

  const handleSave = () => {
    if (!editForm.title.trim()) { setMessage({ type: "error", text: "Title is required" }); return; }
    const updated = items.map(item => item.id === editingId ? { ...editForm, title: editForm.title.trim() } : item);
    saveToStorage(updated);
    setEditingId(null);
    setEditForm(DEFAULT_ITEMS[0]);
    setMessage({ type: "success", text: "Updated successfully!" });
  };

  const handleWelcomeImageSelect = (key: keyof WelcomeData, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setWelcomeForm({ ...welcomeForm, [key]: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleWelcomeSave = () => {
    localStorage.setItem(WELCOME_STORAGE_KEY, JSON.stringify(welcomeForm));
    setWelcomeData(welcomeForm);
    setMessage({ type: "success", text: "Welcome content updated successfully!" });
  };

  const handleStudioImageSelect = (key: keyof StudioData, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setStudioForm({ ...studioForm, [key]: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleStudioSave = () => {
    localStorage.setItem(STUDIO_STORAGE_KEY, JSON.stringify(studioForm));
    setStudioData(studioForm);
    setMessage({ type: "success", text: "Hope Studio content updated successfully!" });
  };

  const handleJesseLiuImageSelect = (key: keyof JesseLiuData, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setJesseLiuForm({ ...jesseLiuForm, [key]: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleJesseLiuWorkAdd = () => {
    setJesseLiuForm({
      ...jesseLiuForm,
      works: [...jesseLiuForm.works, { title: "", type: "Musical", description: "" }],
    });
  };

  const handleJesseLiuWorkRemove = (index: number) => {
    setJesseLiuForm({
      ...jesseLiuForm,
      works: jesseLiuForm.works.filter((_, i) => i !== index),
    });
  };

  const handleJesseLiuWorkChange = (index: number, field: keyof Work, value: string) => {
    const newWorks = [...jesseLiuForm.works];
    newWorks[index] = { ...newWorks[index], [field]: value };
    setJesseLiuForm({ ...jesseLiuForm, works: newWorks });
  };

  const handleJesseLiuSave = () => {
    localStorage.setItem(JESSE_LIU_STORAGE_KEY, JSON.stringify(jesseLiuForm));
    setJesseLiuData(jesseLiuForm);
    setMessage({ type: "success", text: "Jesse Liu content updated successfully!" });
  };

  const handleShangriLaImageSelect = (key: keyof ShangriLaData, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setShangriLaForm({ ...shangriLaForm, [key]: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleShangriLaMemberAdd = () => {
    const newId = `member-${Date.now()}`;
    setShangriLaForm({
      ...shangriLaForm,
      teamMembers: [...shangriLaForm.teamMembers, { id: newId, role: "", name: "", description: "", image: "" }],
    });
  };

  const handleShangriLaMemberRemove = (index: number) => {
    setShangriLaForm({
      ...shangriLaForm,
      teamMembers: shangriLaForm.teamMembers.filter((_, i) => i !== index),
    });
  };

  const handleShangriLaMemberChange = (index: number, field: keyof TeamMember, value: string) => {
    const newMembers = [...shangriLaForm.teamMembers];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setShangriLaForm({ ...shangriLaForm, teamMembers: newMembers });
  };

  const handleShangriLaMemberImageSelect = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleShangriLaMemberChange(index, "image", event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleShangriLaSave = () => {
    localStorage.setItem(SHANGRI_LA_STORAGE_KEY, JSON.stringify(shangriLaForm));
    setShangriLaData(shangriLaForm);
    setMessage({ type: "success", text: "Shangri-La content updated successfully!" });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm(DEFAULT_ITEMS[0]);
    setComments([]);
    setWelcomeForm(DEFAULT_WELCOME_DATA);
    setStudioForm(DEFAULT_STUDIO_DATA);
    setJesseLiuForm(DEFAULT_JESSE_LIU_DATA);
    setShangriLaForm(DEFAULT_SHANGRI_LA_DATA);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hope Studio</h1>
          <p className="mt-1 text-sm text-gray-500">Manage Hope Studio content</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Section</label>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="rounded-md border border-gray-300 px-3 py-2 text-sm">
            <option value="all">All Sections</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`rounded-lg p-4 text-sm ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {message.text}
        </div>
      )}

      {/* Edit Form */}
      {editingId && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Edit: {CATEGORIES.find(c => c.value === editingId)?.label}</h2>

          {/* Welcome Section Editor */}
          {editingId === "welcome" ? (
            <div className="space-y-6">
              {/* Hero Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Hero Section</h3>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Hero Title</label>
                  <input
                    type="text"
                    value={welcomeForm.heroTitle}
                    onChange={(e) => setWelcomeForm({ ...welcomeForm, heroTitle: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Hero Subtitle</label>
                  <textarea
                    value={welcomeForm.heroSubtitle}
                    onChange={(e) => setWelcomeForm({ ...welcomeForm, heroSubtitle: e.target.value })}
                    rows={3}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>

              {/* Introduction Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Introduction</h3>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Introduction Text 1</label>
                  <textarea
                    value={welcomeForm.introText1}
                    onChange={(e) => setWelcomeForm({ ...welcomeForm, introText1: e.target.value })}
                    rows={2}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Introduction Text 2</label>
                  <textarea
                    value={welcomeForm.introText2}
                    onChange={(e) => setWelcomeForm({ ...welcomeForm, introText2: e.target.value })}
                    rows={3}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>

              {/* Song Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Song Section</h3>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Song Title</label>
                  <input
                    type="text"
                    value={welcomeForm.songTitle}
                    onChange={(e) => setWelcomeForm({ ...welcomeForm, songTitle: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Lyrics (use blank line for spacing)</label>
                  <textarea
                    value={welcomeForm.songLyricsText}
                    onChange={(e) => setWelcomeForm({ ...welcomeForm, songLyricsText: e.target.value })}
                    rows={12}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm"
                    placeholder="Enter lyrics, one line per row. Use blank line for spacing."
                  />
                </div>
              </div>

              {/* Images Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Images</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { key: "image1" as const, label: "Image 1 (top left)" },
                    { key: "image2" as const, label: "Image 2 (top right)" },
                    { key: "image3" as const, label: "Image 3 (bottom left)" },
                    { key: "image4" as const, label: "Image 4 (bottom right)" },
                  ].map(({ key, label }) => (
                    <div key={key} className="space-y-2">
                      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
                      <input
                        type="text"
                        value={welcomeForm[key]}
                        onChange={(e) => setWelcomeForm({ ...welcomeForm, [key]: e.target.value })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        placeholder="Image URL"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleWelcomeImageSelect(key, e)}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {welcomeForm[key] && (
                        <img src={welcomeForm[key]} alt={label} className="h-32 w-full rounded-md object-cover" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t pt-4">
                <button onClick={handleCancel} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm">Cancel</button>
                <button onClick={handleWelcomeSave} className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">Update</button>
              </div>
            </div>
          ) : editingId === "studio" ? (
            <div className="space-y-6">
              {/* Subtitle Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Subtitle</h3>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Subtitle</label>
                  <input
                    type="text"
                    value={studioForm.subtitle}
                    onChange={(e) => setStudioForm({ ...studioForm, subtitle: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>

              {/* Introduction Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Introduction</h3>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Introduction Text</label>
                  <textarea
                    value={studioForm.introText}
                    onChange={(e) => setStudioForm({ ...studioForm, introText: e.target.value })}
                    rows={3}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>

              {/* Musical Shows Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Musical Shows</h3>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Section Title</label>
                  <input
                    type="text"
                    value={studioForm.musicalShowsTitle}
                    onChange={(e) => setStudioForm({ ...studioForm, musicalShowsTitle: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Content</label>
                  <textarea
                    value={studioForm.musicalShowsContent}
                    onChange={(e) => setStudioForm({ ...studioForm, musicalShowsContent: e.target.value })}
                    rows={4}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>

              {/* Multimedia Production Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Multimedia Production</h3>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Section Title</label>
                  <input
                    type="text"
                    value={studioForm.multimediaTitle}
                    onChange={(e) => setStudioForm({ ...studioForm, multimediaTitle: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Content</label>
                  <textarea
                    value={studioForm.multimediaContent}
                    onChange={(e) => setStudioForm({ ...studioForm, multimediaContent: e.target.value })}
                    rows={3}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>

              {/* Images Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Images</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { key: "image1" as const, label: "Image 1 (top left)" },
                    { key: "image2" as const, label: "Image 2 (top right)" },
                  ].map(({ key, label }) => (
                    <div key={key} className="space-y-2">
                      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
                      <input
                        type="text"
                        value={studioForm[key]}
                        onChange={(e) => setStudioForm({ ...studioForm, [key]: e.target.value })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        placeholder="Image URL"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleStudioImageSelect(key, e)}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {studioForm[key] && (
                        <img src={studioForm[key]} alt={label} className="h-32 w-full rounded-md object-cover" />
                      )}
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">Image 3 (full width)</label>
                  <input
                    type="text"
                    value={studioForm.image3}
                    onChange={(e) => setStudioForm({ ...studioForm, image3: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    placeholder="Image URL"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleStudioImageSelect("image3", e)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {studioForm.image3 && (
                    <img src={studioForm.image3} alt="Image 3" className="h-32 w-full rounded-md object-cover" />
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t pt-4">
                <button onClick={handleCancel} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm">Cancel</button>
                <button onClick={handleStudioSave} className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">Update</button>
              </div>
            </div>
          ) : editingId === "jesse-liu" ? (
            <div className="space-y-6">
              {/* Subtitle Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Subtitle</h3>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Subtitle</label>
                  <input
                    type="text"
                    value={jesseLiuForm.subtitle}
                    onChange={(e) => setJesseLiuForm({ ...jesseLiuForm, subtitle: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>

              {/* Introduction Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Introduction</h3>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Introduction Text</label>
                  <textarea
                    value={jesseLiuForm.introText}
                    onChange={(e) => setJesseLiuForm({ ...jesseLiuForm, introText: e.target.value })}
                    rows={3}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>

              {/* Quote Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">AI Quote</h3>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Quote Text</label>
                  <textarea
                    value={jesseLiuForm.quoteText}
                    onChange={(e) => setJesseLiuForm({ ...jesseLiuForm, quoteText: e.target.value })}
                    rows={4}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>

              {/* Images Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Images</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { key: "image1" as const, label: "Image 1" },
                    { key: "image2" as const, label: "Image 2" },
                  ].map(({ key, label }) => (
                    <div key={key} className="space-y-2">
                      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
                      <input
                        type="text"
                        value={jesseLiuForm[key]}
                        onChange={(e) => setJesseLiuForm({ ...jesseLiuForm, [key]: e.target.value })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        placeholder="Image URL"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleJesseLiuImageSelect(key, e)}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {jesseLiuForm[key] && (
                        <img src={jesseLiuForm[key]} alt={label} className="h-32 w-full rounded-md object-contain bg-gray-100" />
                      )}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { key: "image3" as const, label: "Image 3" },
                    { key: "image4" as const, label: "Image 4" },
                  ].map(({ key, label }) => (
                    <div key={key} className="space-y-2">
                      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
                      <input
                        type="text"
                        value={jesseLiuForm[key]}
                        onChange={(e) => setJesseLiuForm({ ...jesseLiuForm, [key]: e.target.value })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        placeholder="Image URL"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleJesseLiuImageSelect(key, e)}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {jesseLiuForm[key] && (
                        <img src={jesseLiuForm[key]} alt={label} className="h-32 w-full rounded-md object-contain bg-gray-100" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Works Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="text-sm font-semibold text-gray-700">Works</h3>
                  <button
                    type="button"
                    onClick={handleJesseLiuWorkAdd}
                    className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50"
                  >
                    + Add Work
                  </button>
                </div>
                {jesseLiuForm.works.map((work, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Work {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleJesseLiuWorkRemove(index)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="mb-1 block text-xs text-gray-600">Title</label>
                        <input
                          type="text"
                          value={work.title}
                          onChange={(e) => handleJesseLiuWorkChange(index, "title", e.target.value)}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-gray-600">Type</label>
                        <select
                          value={work.type}
                          onChange={(e) => handleJesseLiuWorkChange(index, "type", e.target.value)}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        >
                          <option value="Musical">Musical</option>
                          <option value="Book">Book</option>
                          <option value="Album">Album</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-gray-600">Description</label>
                        <input
                          type="text"
                          value={work.description}
                          onChange={(e) => handleJesseLiuWorkChange(index, "description", e.target.value)}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 border-t pt-4">
                <button onClick={handleCancel} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm">Cancel</button>
                <button onClick={handleJesseLiuSave} className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">Update</button>
              </div>
            </div>
          ) : editingId === "shangri-la" ? (
            <div className="space-y-6">
              {/* Introduction Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Introduction</h3>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Introduction Text 1</label>
                  <textarea
                    value={shangriLaForm.introText1}
                    onChange={(e) => setShangriLaForm({ ...shangriLaForm, introText1: e.target.value })}
                    rows={3}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Introduction Text 2</label>
                  <textarea
                    value={shangriLaForm.introText2}
                    onChange={(e) => setShangriLaForm({ ...shangriLaForm, introText2: e.target.value })}
                    rows={3}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>

              {/* Images Section - Move to top */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Images (shown before Core Creative Team)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { key: "image1" as const, label: "Image 1" },
                    { key: "image2" as const, label: "Image 2" },
                    { key: "image3" as const, label: "Image 3" },
                    { key: "image4" as const, label: "Image 4" },
                  ].map(({ key, label }) => (
                    <div key={key} className="space-y-2">
                      <label className="mb-1 block text-xs font-medium text-gray-700">{label}</label>
                      <input
                        type="text"
                        value={shangriLaForm[key]}
                        onChange={(e) => setShangriLaForm({ ...shangriLaForm, [key]: e.target.value })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        placeholder="Image URL"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleShangriLaImageSelect(key, e)}
                        className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {shangriLaForm[key] && (
                        <img src={shangriLaForm[key]} alt={label} className="h-20 w-full rounded-md object-contain bg-gray-100" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Core Creative Team Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="text-sm font-semibold text-gray-700">Core Creative Team</h3>
                  <button
                    type="button"
                    onClick={handleShangriLaMemberAdd}
                    className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50"
                  >
                    + Add Member
                  </button>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Section Title</label>
                  <input
                    type="text"
                    value={shangriLaForm.coreTeamTitle}
                    onChange={(e) => setShangriLaForm({ ...shangriLaForm, coreTeamTitle: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                {shangriLaForm.teamMembers.map((member, index) => (
                  <div key={member.id || index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">
                        {member.name || `Member ${index + 1}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleShangriLaMemberRemove(index)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-xs text-gray-600">Role</label>
                        <input
                          type="text"
                          value={member.role}
                          onChange={(e) => handleShangriLaMemberChange(index, "role", e.target.value)}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                          placeholder="e.g. Music and Lyrics by"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-gray-600">Name</label>
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => handleShangriLaMemberChange(index, "name", e.target.value)}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-gray-600">Description</label>
                      <textarea
                        value={member.description || ""}
                        onChange={(e) => handleShangriLaMemberChange(index, "description", e.target.value)}
                        rows={4}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        placeholder="Member description..."
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-gray-600">Photo URL (optional)</label>
                      <input
                        type="text"
                        value={member.image || ""}
                        onChange={(e) => handleShangriLaMemberChange(index, "image", e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        placeholder="/images/shangri-la/Li.jpg"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleShangriLaMemberImageSelect(index, e)}
                        className="mt-1 block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {member.image && (
                        <img src={member.image} alt={member.name} className="mt-2 h-20 w-20 rounded-md object-cover" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 border-t pt-4">
                <button onClick={handleCancel} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm">Cancel</button>
                <button onClick={handleShangriLaSave} className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">Update</button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
                <input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Cover Image</label>
                <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                <button type="button" onClick={() => imageInputRef.current?.click()} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50">
                  Choose Image
                </button>
                {editForm.image && (
                  <div className="mt-3">
                    <img src={editForm.image} alt="Preview" className="h-40 w-auto rounded-md object-cover" />
                  </div>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Description (for listing page)</label>
                <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={2} className="w-full rounded-md border border-gray-300 px-3 py-2" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Content (for detail page - HTML supported)</label>
                <textarea value={editForm.content} onChange={(e) => setEditForm({ ...editForm, content: e.target.value })} rows={5} className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm" />
              </div>
              <div className="flex items-center gap-4 pt-2 border-t border-gray-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.hidden !== true}
                    onChange={(e) => setEditForm({ ...editForm, hidden: !e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Visible on website</span>
                </label>
                <span className="text-xs text-gray-400">(Uncheck to hide this section)</span>
              </div>
              <div className="flex justify-end gap-3 border-t pt-4">
                <button onClick={handleCancel} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm">Cancel</button>
                <button onClick={handleSave} className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">Update</button>
              </div>
            </div>
          )}

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

      {/* Section Items */}
      <div className="space-y-6">
        {itemsByCategory.map((cat) => {
          const categoryItems = filterCategory === "all" || filterCategory === cat.value ? cat.items : [];

          if (filterCategory !== "all" && filterCategory !== cat.value) return null;

          return (
            <div key={cat.value} className="rounded-lg border border-gray-200 bg-white overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-900">{cat.label}</span>
                </div>
                <span className="text-xs text-gray-400">{categoryItems.length} item(s)</span>
              </div>

              <div className="divide-y divide-gray-100">
                {categoryItems.length === 0 ? (
                  <div className="px-4 py-6 text-center text-gray-500 text-sm">
                    No items in this section
                  </div>
                ) : (
                  categoryItems.map((item) => (
                    <div key={item.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {item.image && (
                          <img src={item.image} alt="" className="h-10 w-16 rounded object-cover shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 truncate">{item.title}</span>
                            {item.hidden && (
                              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Hidden</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 truncate">{item.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button onClick={() => handleEdit(item)} className="px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded">Edit</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
