"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@/lib/convex";
import { api } from "@/lib/convex";

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

interface NewsArticle {
  _id: string;
  title: string;
  coverImage: string;
  content: string;
  excerpt: string;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: number;
  updatedAt?: number;
}

export default function NewsAdminPage() {
  const allArticles = useQuery(api.admin.listNews) as NewsArticle[] | undefined;
  const createArticle = useMutation(api.admin.createNewsArticle);
  const updateArticle = useMutation(api.admin.updateNewsArticle);
  const deleteArticle = useMutation(api.admin.deleteNewsArticle);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (message) { const t = setTimeout(() => setMessage(null), 5000); return () => clearTimeout(t); } }, [message]);

  const articles = allArticles || [];
  const filteredArticles = articles.filter((article) => {
    if (filter === "published") return article.isPublished;
    if (filter === "draft") return !article.isPublished;
    return true;
  });

  const publishedCount = articles.filter(a => a.isPublished).length;
  const draftCount = articles.filter(a => !a.isPublished).length;

  const handleCoverImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setCoverImage(base64);
        setImagePreview(base64);
      };
      reader.readAsDataURL(file);
    }
    if (coverFileInputRef.current) coverFileInputRef.current.value = "";
  };

  const handleNewArticle = () => {
    setEditingId(null);
    setTitle("");
    setContent("");
    setCoverImage("");
    setImagePreview(null);
    setIsPublished(true);
    setIsFeatured(false);
    setShowForm(true);
  };

  const handleEdit = (article: NewsArticle) => {
    setEditingId(article._id);
    setTitle(article.title);
    setContent(article.content);
    setCoverImage(article.coverImage);
    setImagePreview(article.coverImage || null);
    setIsPublished(article.isPublished);
    setIsFeatured(article.isFeatured);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setMessage({ type: "error", text: "Title is required" }); return; }
    const textContent = content.replace(/<[^>]*>/g, "").trim();
    if (!textContent) { setMessage({ type: "error", text: "Content is required" }); return; }

    setLoading(true);
    try {
      const excerpt = textContent.substring(0, 150);
      if (editingId) {
        await updateArticle({ id: editingId as any, title: title.trim(), content, coverImage, excerpt, isPublished, isFeatured });
        setMessage({ type: "success", text: "Updated successfully!" });
      } else {
        await createArticle({ title: title.trim(), content, coverImage, excerpt, isPublished, isFeatured });
        setMessage({ type: "success", text: "Created successfully!" });
      }
      setShowForm(false);
      resetForm();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to save" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this article permanently?")) return;
    try {
      await deleteArticle({ id: id as any });
      setMessage({ type: "success", text: "Deleted" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to delete" });
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setContent("");
    setCoverImage("");
    setImagePreview(null);
    setIsPublished(true);
    setIsFeatured(false);
  };

  const getStatusBadge = (isPub: boolean, isFeat: boolean) => (
    <div className="flex gap-1">
      {isFeat && <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-600">Featured</span>}
      <span className={`rounded px-2 py-0.5 text-xs font-medium ${isPub ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}>
        {isPub ? "Published" : "Draft"}
      </span>
    </div>
  );

  const formatDate = (timestamp: number): string => new Date(timestamp).toLocaleDateString();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">News</h1>
          <p className="mt-1 text-sm text-gray-500">Manage news articles</p>
        </div>
        <button onClick={handleNewArticle} className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
          + New Article
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Filter by Status</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="rounded-md border border-gray-300 px-3 py-2 text-sm">
            <option value="all">All Articles ({articles.length})</option>
            <option value="published">Published ({publishedCount})</option>
            <option value="draft">Drafts ({draftCount})</option>
          </select>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`rounded-lg p-4 text-sm ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {message.text}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">{editingId ? "Edit" : "New"} Article</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div><label className="mb-1 block text-sm font-medium text-gray-700">Title</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2" required /></div>
              <div><label className="mb-1 block text-sm font-medium text-gray-700">Cover Image</label><input ref={coverFileInputRef} type="file" accept="image/*" onChange={handleCoverImageSelect} className="hidden" /><button type="button" onClick={() => coverFileInputRef.current?.click()} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm">Choose Image</button>{imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 h-32 w-48 rounded-md object-cover" />}</div>
              <div><label className="mb-1 block text-sm font-medium text-gray-700">Options</label><div className="flex items-center gap-4"><label className="flex items-center gap-2"><input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="h-4 w-4" />Published</label><label className="flex items-center gap-2"><input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="h-4 w-4" />Featured</label></div></div>
            </div>
            <div><label className="mb-1 block text-sm font-medium text-gray-700">Content</label><RichTextEditor content={content} onChange={setContent} /></div>
            <div className="flex justify-end gap-3 border-t pt-4"><button type="button" onClick={() => setShowForm(false)} className="rounded-md border border-gray-300 bg-white px-4 py-2">Cancel</button><button type="submit" disabled={loading} className="rounded-md bg-blue-600 px-6 py-2 text-white disabled:opacity-50">{loading ? "Saving..." : editingId ? "Update" : "Create"}</button></div>
          </form>
        </div>
      )}

      {/* Cards Grid */}
      {allArticles === undefined ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse rounded-lg border border-gray-200 bg-white p-4">
              <div className="aspect-[4/3] rounded-md bg-gray-200" />
              <div className="mt-3 h-4 w-20 rounded bg-gray-200" />
              <div className="mt-2 h-5 w-full rounded bg-gray-200" />
            </div>
          ))}
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center text-gray-500">
          No articles found. Click "New Article" to create one.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredArticles.map((article) => (
            <div key={article._id} className="rounded-lg border border-gray-200 bg-white p-4">
              {article.coverImage && <img src={article.coverImage} alt={article.title} className="aspect-[4/3] w-full rounded-md object-cover" />}
              <div className="mt-3">{getStatusBadge(article.isPublished, article.isFeatured)}</div>
              <h3 className="mt-2 font-medium text-gray-900">{article.title || "Untitled"}</h3>
              <p className="mt-1 text-xs text-gray-400">{formatDate(article.createdAt)}</p>
              {article.excerpt && <p className="mt-2 line-clamp-2 text-sm text-gray-500">{article.excerpt}</p>}
              <div className="mt-4 flex gap-2 border-t pt-3">
                <button onClick={() => handleEdit(article)} className="flex-1 rounded bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-200">Edit</button>
                <button onClick={() => handleDelete(article._id)} className="flex-1 rounded bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
