"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@/lib/convex";
import { api } from "@/lib/convex";

// Rich text editor
function RichTextEditor({
  content,
  onChange,
}: {
  content: string;
  onChange: (content: string) => void;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const handleInput = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const base64 = event.target?.result as string;
              document.execCommand("insertImage", false, base64);
              if (editorRef.current) onChange(editorRef.current.innerHTML);
            };
            reader.readAsDataURL(file);
          }
        }
      }
    }
  };

  const insertImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      execCommand("insertImage", base64);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      insertImage(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML && content) {
      editorRef.current.innerHTML = content;
    }
  }, []);

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
      <div ref={editorRef} contentEditable onInput={handleInput} onPaste={handlePaste} className="min-h-[300px] max-h-[500px] overflow-y-auto px-4 py-4 focus:outline-none" style={{ fontFamily: "Georgia, serif", fontSize: "16px", lineHeight: "1.8" }} />
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
        setMessage({ type: "success", text: "Article updated successfully!" });
      } else {
        await createArticle({ title: title.trim(), content, coverImage, excerpt, isPublished, isFeatured });
        setMessage({ type: "success", text: "Article published successfully!" });
      }
      setShowForm(false);
      resetForm();
    } catch (err: any) {
      console.error("Save failed:", err);
      setMessage({ type: "error", text: err.message || "Failed to save" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this article permanently?")) return;
    try {
      await deleteArticle({ id: id as any });
      setMessage({ type: "success", text: "Article deleted" });
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

  const formatDate = (timestamp: number): string => new Date(timestamp).toLocaleDateString();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">News Center</h1>
          <p className="mt-1 text-sm text-gray-500">Create and manage news articles</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="rounded-md border border-gray-300 px-3 py-2 text-sm">
            <option value="all">All Articles</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
          <button onClick={handleNewArticle} className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">+ New Article</button>
        </div>
      </div>

      {message && (
        <div className={`rounded-lg p-4 text-sm ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {message.text}
        </div>
      )}

      {showForm && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">{editingId ? "Edit Article" : "New Article"}</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter article title..." className="w-full rounded-md border border-gray-300 px-4 py-2" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Cover Image</label>
              <input ref={coverFileInputRef} type="file" accept="image/*" onChange={handleCoverImageSelect} className="hidden" />
              <div className="flex items-start gap-4">
                <button type="button" onClick={() => coverFileInputRef.current?.click()} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm">Choose Cover Image</button>
                {imagePreview && (
                  <div className="relative">
                    <img src={imagePreview} alt="Cover preview" className="h-20 w-32 rounded-md object-cover" />
                    <button type="button" onClick={() => { setCoverImage(""); setImagePreview(null); }} className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600">×</button>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Content</label>
              <RichTextEditor content={content} onChange={setContent} />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="h-4 w-4" />
                <span className="text-sm">Published</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="h-4 w-4" />
                <span className="text-sm">Featured</span>
              </label>
            </div>
            <div className="flex items-center justify-end gap-3 border-t pt-4">
              <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="rounded-md border border-gray-300 bg-white px-4 py-2">Cancel</button>
              <button type="submit" disabled={loading} className="rounded-md bg-blue-600 px-6 py-2 text-white disabled:opacity-50">{loading ? "Saving..." : editingId ? "Update" : "Publish"}</button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Articles ({filteredArticles.length})</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {filteredArticles.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">No articles found. Click "New Article" to create one.</div>
          ) : (
            filteredArticles.map((article) => (
              <div key={article._id} className="flex items-start justify-between gap-4 px-6 py-4 hover:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    {article.coverImage && (
                      <img src={article.coverImage} alt={article.title} className="h-12 w-12 shrink-0 rounded-md object-cover" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900 truncate">{article.title || "Untitled"}</h3>
                        {article.isFeatured && <span className="shrink-0 rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-600">Featured</span>}
                        <span className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${article.isPublished ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                          {article.isPublished ? "Published" : "Draft"}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-400">{formatDate(article.createdAt)}</p>
                    </div>
                  </div>
                  {article.excerpt && <p className="mt-2 text-sm text-gray-500 line-clamp-2">{article.excerpt}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button onClick={() => handleEdit(article)} className="rounded-md bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-200">Edit</button>
                  <button onClick={() => handleDelete(article._id)} className="rounded-md bg-red-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-600">Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
