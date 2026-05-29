"use client";

import { useState, useEffect, useRef } from "react";

interface ContentItem {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  content: string;
}

const CATEGORIES = [
  { value: "welcome", label: "Welcome Section" },
  { value: "studio", label: "Hope Studio Section" },
  { value: "jesse-liu", label: "Jesse Liu Section" },
  { value: "shangri-la", label: "Shangri-La Section" },
  { value: "works", label: "Works Section" },
  { value: "schedule", label: "Schedule Section" },
];

const DEFAULT_ITEMS: ContentItem[] = [
  { id: "welcome", title: "Welcome to Hope Music Community", category: "welcome", image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800", description: "Discover the vibrant world of Hope Music Community, where music lovers unite.", content: "<p>Welcome to the Hope Music Community!</p>" },
  { id: "studio", title: "Hope Studio", category: "studio", image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800", description: "Professional recording, mixing, and mastering services.", content: "<p>Hope Studio offers professional services.</p>" },
  { id: "jesse-liu", title: "Jesse Liu", category: "jesse-liu", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800", description: "Meet Jesse Liu, our founder.", content: "<p>Jesse Liu is the founder.</p>" },
  { id: "shangri-la", title: "Shangri-La", category: "shangri-la", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800", description: "An immersive musical experience.", content: "<p>Shangri-La experience.</p>" },
  { id: "works", title: "Works", category: "works", image: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800", description: "Explore our portfolio.", content: "<p>Our portfolio.</p>" },
  { id: "schedule", title: "Performance Schedule", category: "schedule", image: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800", description: "Upcoming performances and events.", content: "<p>Performance schedule.</p>" },
];

export default function AdminHopeStudioPage() {
  const [items, setItems] = useState<ContentItem[]>(DEFAULT_ITEMS);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ContentItem>(DEFAULT_ITEMS[0]);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const imageInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => { if (message) { const t = setTimeout(() => setMessage(null), 5000); return () => clearTimeout(t); } }, [message]);

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
    setEditForm(DEFAULT_ITEMS[0]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hope Studio</h1>
          <p className="mt-1 text-sm text-gray-500">Manage Hope Studio content sections</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Filter by Section</label>
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
            <div className="flex justify-end gap-3 border-t pt-4">
              <button onClick={handleCancel} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm">Cancel</button>
              <button onClick={handleSave} className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Section Accordion */}
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
                </div>
                <span className="text-xs text-gray-400">{categoryItems.length} item(s)</span>
              </button>

              {expandedCategory === cat.value && (
                <div className="divide-y divide-gray-100">
                  {categoryItems.length === 0 ? (
                    <div className="px-4 py-6 text-center text-gray-500 text-sm">
                      No content in this section
                    </div>
                  ) : (
                    categoryItems.map((item) => (
                      <div key={item.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {item.image && (
                            <img src={item.image} alt="" className="h-10 w-16 rounded object-cover shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-gray-900 truncate">{item.title}</span>
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
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
