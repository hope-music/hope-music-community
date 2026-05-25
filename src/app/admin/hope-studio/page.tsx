"use client";

import { useState, useEffect } from "react";

interface ContentItem {
  id: string;
  title: string;
  image: string;
  description: string;
  content: string;
}

const DEFAULT_ITEMS: ContentItem[] = [
  { id: "welcome", title: "Welcome to Hope Music Community", image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800", description: "Discover the vibrant world of Hope Music Community, where music lovers unite.", content: "<p>Welcome to the Hope Music Community! We are dedicated to creating a vibrant space where music lovers, artists, and professionals come together.</p>" },
  { id: "studio", title: "Hope Studio", image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800", description: "Professional recording, mixing, and mastering services in our state-of-the-art facility.", content: "<p>Hope Studio offers professional recording, mixing, and mastering services in our state-of-the-art facility.</p>" },
  { id: "jesse-liu", title: "Jesse Liu", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800", description: "Meet Jesse Liu, our founder and creative director.", content: "<p>Jesse Liu is the founder and creative director of Hope Music Community.</p>" },
  { id: "shangri-la", title: "Shangri-La", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800", description: "An immersive musical experience that transports you to another world.", content: "<p>Shangri-La is an immersive musical experience designed to transport you to another world.</p>" },
  { id: "works", title: "Works", image: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800", description: "Explore our portfolio of completed projects and collaborations.", content: "<p>Explore our portfolio of completed projects and collaborations.</p>" },
  { id: "schedule", title: "Performance Schedule", image: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800", description: "Stay updated with our upcoming performances and events.", content: "<p>Stay updated with our upcoming performances and events.</p>" },
];

export default function AdminHopeStudioPage() {
  const [items, setItems] = useState<ContentItem[]>(DEFAULT_ITEMS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ContentItem>(DEFAULT_ITEMS[0]);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("hope_studio_content");
    if (stored) {
      setItems(JSON.parse(stored));
    }
  }, []);

  const saveToStorage = (data: ContentItem[]) => {
    localStorage.setItem("hope_studio_content", JSON.stringify(data));
    setItems(data);
  };

  useEffect(() => { if (message) { const t = setTimeout(() => setMessage(null), 3000); return () => clearTimeout(t); } }, [message]);

  const handleEdit = (item: ContentItem) => {
    setEditingId(item.id);
    setEditForm({ ...item });
  };

  const handleSave = () => {
    if (!editForm.title.trim()) { setMessage({ type: "error", text: "Title is required" }); return; }
    const updated = items.map(item => item.id === editingId ? { ...editForm, title: editForm.title.trim() } : item);
    saveToStorage(updated);
    setEditingId(null);
    setMessage({ type: "success", text: "Updated successfully!" });
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hope Studio</h1>
          <p className="mt-1 text-sm text-gray-500">Manage Hope Studio content pages</p>
        </div>
      </div>

      {message && (
        <div className={`rounded-lg p-4 text-sm ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {message.text}
        </div>
      )}

      {/* Edit Form */}
      {editingId && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Edit: {editForm.title}</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
              <input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Image URL</label>
              <input type="text" value={editForm.image} onChange={(e) => setEditForm({ ...editForm, image: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Preview</label>
              <img src={editForm.image} alt={editForm.title} className="h-32 w-48 rounded-md object-cover" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Description (for listing page)</label>
              <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={2} className="w-full rounded-md border border-gray-300 px-3 py-2" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Content (for detail page)</label>
              <textarea value={editForm.content} onChange={(e) => setEditForm({ ...editForm, content: e.target.value })} rows={5} className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm" />
            </div>
            <div className="flex justify-end gap-3 border-t pt-4">
              <button onClick={handleCancel} className="rounded-md border border-gray-300 bg-white px-4 py-2">Cancel</button>
              <button onClick={handleSave} className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border border-gray-200 bg-white p-4">
            <img src={item.image} alt={item.title} className="h-32 w-full rounded-md object-cover" />
            <h3 className="mt-3 text-center font-medium text-gray-900">{item.title}</h3>
            <p className="mt-1 text-center text-xs text-gray-500 line-clamp-2">{item.description}</p>
            <div className="mt-3 flex justify-center border-t pt-3">
              <button
                onClick={() => handleEdit(item)}
                className="rounded bg-blue-100 px-4 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-200"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
