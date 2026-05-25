"use client";

import { useState, useRef, useEffect } from "react";

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

interface StageProduction {
  id: string;
  title: string;
  category: string;
  description: string;
  coverImage: string;
  content: string;
  status: "upcoming" | "past" | "draft";
  eventDate?: string;
  createdAt: number;
  updatedAt: number;
}

const CATEGORIES = [
  { value: "stage", label: "Stage" },
  { value: "video", label: "Video" },
  { value: "lighting", label: "Lighting" },
  { value: "audio", label: "Audio" },
  { value: "effects", label: "Effects" },
  { value: "costumes", label: "Costumes" },
  { value: "props", label: "Props" },
  { value: "makeup", label: "Makeup" },
  { value: "others", label: "Others" },
];

export default function AdminStageProductionsPage() {
  const [items, setItems] = useState<StageProduction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("stage");
  const [status, setStatus] = useState<"upcoming" | "past" | "draft">("draft");
  const [eventDate, setEventDate] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("admin_stage_production");
    if (stored) setItems(JSON.parse(stored));
  }, []);

  const saveToStorage = (data: StageProduction[]) => {
    localStorage.setItem("admin_stage_production", JSON.stringify(data));
    setItems(data);
  };

  useEffect(() => { if (message) { const t = setTimeout(() => setMessage(null), 5000); return () => clearTimeout(t); } }, [message]);

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => { const base64 = ev.target?.result as string; setCoverImage(base64); setCoverPreview(base64); };
      reader.readAsDataURL(file);
    }
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  const handleNew = () => { setEditingId(null); setTitle(""); setDescription(""); setContent(""); setCategory(expandedCategory || "stage"); setStatus("draft"); setEventDate(""); setCoverImage(""); setCoverPreview(null); setShowForm(true); };
  const handleEdit = (item: StageProduction) => { setEditingId(item.id); setTitle(item.title || ""); setDescription(item.description || ""); setContent(item.content || ""); setCategory(item.category || "stage"); setStatus(item.status || "draft"); setEventDate(item.eventDate || ""); setCoverImage(item.coverImage || ""); setCoverPreview(item.coverImage || null); setShowForm(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setMessage({ type: "error", text: "Title required" }); return; }
    setLoading(true);
    try {
      const now = Date.now();
      if (editingId) {
        const updated = items.map((item) => item.id === editingId ? { ...item, title: title.trim(), description, content, category, status, eventDate, coverImage, updatedAt: now } : item);
        saveToStorage(updated);
      } else {
        const newItem: StageProduction = { id: now.toString(), title: title.trim(), category, description, content, coverImage, status, eventDate, createdAt: now, updatedAt: now };
        saveToStorage([newItem, ...items]);
      }
      setMessage({ type: "success", text: editingId ? "Updated!" : "Created!" });
      setShowForm(false);
    } catch { setMessage({ type: "error", text: "Failed" }); } finally { setLoading(false); }
  };

  const handleDelete = (id: string) => { if (confirm("Delete?")) { saveToStorage(items.filter((item) => item.id !== id)); setMessage({ type: "success", text: "Deleted" }); } };

  const getStatusBadge = (s: string) => s === "upcoming" ? <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600">Upcoming</span> : s === "past" ? <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">Past</span> : <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-600">Draft</span>;

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString() : "";

  // Group items by category
  const itemsByCategory = CATEGORIES.map((cat) => ({
    ...cat,
    items: items.filter((item) => item.category === cat.value),
  }));

  const totalCount = items.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stage Production</h1>
          <p className="mt-1 text-sm text-gray-500">Manage stage production records ({totalCount} items)</p>
        </div>
        <button onClick={handleNew} className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
          + New Item
        </button>
      </div>

      {message && <div className={`rounded-lg p-4 text-sm ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{message.text}</div>}

      {/* Form */}
      {showForm && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">{editingId ? "Edit" : "New"} Stage Production</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div><label className="mb-1 block text-sm font-medium text-gray-700">Title</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2" required /></div>
              <div><label className="mb-1 block text-sm font-medium text-gray-700">Category</label><select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2">{CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
              <div><label className="mb-1 block text-sm font-medium text-gray-700">Status</label><select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-full rounded-md border border-gray-300 px-3 py-2"><option value="draft">Draft</option><option value="upcoming">Upcoming</option><option value="past">Past</option></select></div>
              <div><label className="mb-1 block text-sm font-medium text-gray-700">Event Date</label><input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2" /></div>
              <div className="md:col-span-2"><label className="mb-1 block text-sm font-medium text-gray-700">Cover Image</label><input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverSelect} className="hidden" /><button type="button" onClick={() => coverInputRef.current?.click()} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm">Choose Image</button>{coverPreview && <img src={coverPreview} alt="Preview" className="mt-2 h-32 w-48 rounded-md object-cover" />}</div>
              <div className="md:col-span-2"><label className="mb-1 block text-sm font-medium text-gray-700">Summary</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full rounded-md border border-gray-300 px-3 py-2" /></div>
              <div className="md:col-span-2"><label className="mb-1 block text-sm font-medium text-gray-700">Full Content</label><RichTextEditor content={content} onChange={setContent} /></div>
            </div>
            <div className="flex justify-end gap-3 border-t pt-4"><button type="button" onClick={() => setShowForm(false)} className="rounded-md border border-gray-300 bg-white px-4 py-2">Cancel</button><button type="submit" disabled={loading} className="rounded-md bg-blue-600 px-6 py-2 text-white disabled:opacity-50">{loading ? "Saving..." : editingId ? "Update" : "Create"}</button></div>
          </form>
        </div>
      )}

      {/* Category Accordion */}
      <div className="space-y-2">
        {itemsByCategory.map((cat) => {
          const isExpanded = expandedCategory === cat.value;
          return (
            <div key={cat.value} className="rounded-lg border border-gray-200 bg-white">
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : cat.value)}
                className="flex w-full items-center justify-between px-4 py-3 hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{cat.label}</span>
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{cat.items.length}</span>
                </div>
                <span className={`transform transition-transform ${isExpanded ? "rotate-180" : ""}`}>▼</span>
              </button>
              {isExpanded && (
                <div className="border-t border-gray-100 p-4">
                  {cat.items.length === 0 ? (
                    <p className="text-sm text-gray-400">No items in this category</p>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {cat.items.map((item) => (
                        <div key={item.id} className="rounded-lg border border-gray-200 p-3">
                          {item.coverImage && <img src={item.coverImage} alt={item.title} className="h-24 w-full rounded-md object-cover" />}
                          <div className="mt-2 flex items-center gap-2">{getStatusBadge(item.status)}</div>
                          <h4 className="mt-1 font-medium text-gray-900">{item.title}</h4>
                          {item.eventDate && <p className="mt-1 text-xs text-gray-400">{formatDate(item.eventDate)}</p>}
                          <p className="mt-1 line-clamp-2 text-xs text-gray-500">{item.description?.replace(/<[^>]*>/g, "").substring(0, 80)}</p>
                          <div className="mt-3 flex gap-2 border-t pt-2">
                            <button onClick={() => handleEdit(item)} className="flex-1 rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-200">Edit</button>
                            <button onClick={() => handleDelete(item.id)} className="flex-1 rounded bg-red-500 px-2 py-1 text-xs font-medium text-white hover:bg-red-600">Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
