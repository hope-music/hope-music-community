"use client";

import { useState, useEffect } from "react";

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

function RichTextEditor({ content, onChange }: { content: string; onChange: (c: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { useRef: useReactRef } = require("react");
  
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
      </div>
      <div ref={editorRef} contentEditable onInput={handleInput} className="min-h-[200px] max-h-[400px] overflow-y-auto px-4 py-3 focus:outline-none" style={{ fontFamily: "Georgia, serif", fontSize: "15px", lineHeight: "1.7" }} />
    </div>
  );
}

import { useRef } from "react";

export default function AdminStageProductionsPage() {
  const [items, setItems] = useState<StageProduction[]>([]);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past" | "draft">("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("sets");
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

  const filteredItems = items.filter((p) => filter === "all" || p.status === filter);

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => { const base64 = ev.target?.result as string; setCoverImage(base64); setCoverPreview(base64); };
      reader.readAsDataURL(file);
    }
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  const handleNew = () => { setEditingId(null); setTitle(""); setDescription(""); setContent(""); setCategory("stage"); setStatus("draft"); setEventDate(""); setCoverImage(""); setCoverPreview(null); setShowForm(true); };
  const handleEdit = (item: StageProduction) => { setEditingId(item.id); setTitle(item.title || ""); setDescription(item.description || ""); setContent(item.content || ""); setCategory(item.category || "sets"); setStatus(item.status || "draft"); setEventDate(item.eventDate || ""); setCoverImage(item.coverImage || ""); setCoverPreview(item.coverImage || null); setShowForm(true); };

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

  const getBadge = (s: string) => s === "upcoming" ? <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600">Upcoming</span> : s === "past" ? <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">Past</span> : <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-600">Draft</span>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Stage Production</h1><p className="mt-1 text-sm text-gray-500">Manage stage production records</p></div>
        <div className="flex items-center gap-3">
          <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="rounded-md border border-gray-300 px-3 py-2 text-sm"><option value="all">All</option><option value="upcoming">Upcoming</option><option value="past">Past</option><option value="draft">Drafts</option></select>
          <button onClick={handleNew} className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">+ New</button>
        </div>
      </div>
      {message && <div className={`rounded-lg p-4 text-sm ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{message.text}</div>}
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.length === 0 ? <div className="col-span-full rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">No items.</div> : filteredItems.map((item) => {
          const categoryLabel = CATEGORIES.find(c => c.value === item.category)?.label || item.category;
          return (
          <div key={item.id} className="rounded-lg border border-gray-200 bg-white p-4">
            {item.coverImage && <img src={item.coverImage} alt={item.title} className="h-32 w-full rounded-md object-cover" />}
            <div className="mt-2 flex items-center gap-2"><span className="rounded bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-600">{categoryLabel}</span>{getBadge(item.status)}</div>
            <h3 className="mt-2 font-medium">{item.title}</h3>
            <p className="mt-2 text-sm text-gray-500 line-clamp-2">{item.description?.replace(/<[^>]*>/g, "").substring(0, 100)}</p>
            <div className="mt-3 flex gap-2 border-t pt-3"><button onClick={() => handleEdit(item)} className="flex-1 rounded bg-gray-100 px-3 py-1.5 text-xs font-medium hover:bg-gray-200">Edit</button><button onClick={() => handleDelete(item.id)} className="flex-1 rounded bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600">Delete</button></div>
          </div>
        );})}
      </div>
    </div>
  );
}
