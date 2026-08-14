"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useInsightsList, createInsight, updateInsight, deleteInsight, uploadImageToStorage } from "@/lib/api";

interface Insight {
  _id: string;
  title: string;
  category: string;
  coverImage: string;
  content: string;
  excerpt: string;
  publishDate: number;
  eventDate?: number;
  authorName: string;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: number;
  updatedAt?: number;
}

// =====================
// Custom Rich Text Editor
// =====================
interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onImageUpload: (file: File) => Promise<string>;
}

function RichTextEditor({ content, onChange, onImageUpload }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  const execCommand = useCallback((cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleImageUpload = async () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    setUploading(true);
    try {
      const url = await onImageUpload(file);
      execCommand("insertImage", url);
    } catch (err) {
      console.error("Image upload failed:", err);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const ToolbarButton = ({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="rounded px-2 py-1.5 text-sm hover:bg-gray-200 active:bg-gray-300 transition-colors"
    >
      {children}
    </button>
  );

  return (
    <div className="overflow-hidden rounded-md border border-gray-300 bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-300 bg-gray-50 px-2 py-2">
        <ToolbarButton onClick={() => execCommand("bold")} title="Bold">
          <span className="font-bold">B</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand("italic")} title="Italic">
          <span className="italic">I</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand("underline")} title="Underline">
          <span className="underline">U</span>
        </ToolbarButton>

        <div className="mx-1 h-5 w-px bg-gray-300" />

        <select
          onChange={(e) => {
            if (e.target.value) execCommand("formatBlock", e.target.value);
            e.target.value = "";
          }}
          className="rounded border border-gray-300 bg-white px-2 py-1.5 text-sm"
        >
          <option value="">Paragraph</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>

        <div className="mx-1 h-5 w-px bg-gray-300" />

        <ToolbarButton onClick={() => execCommand("insertUnorderedList")} title="Bullet List">
          <span>• List</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand("insertOrderedList")} title="Numbered List">
          <span>1. List</span>
        </ToolbarButton>

        <div className="mx-1 h-5 w-px bg-gray-300" />

        <ToolbarButton onClick={() => execCommand("justifyLeft")} title="Align Left">
          ≡L
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand("justifyCenter")} title="Align Center">
          ≡C
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand("justifyRight")} title="Align Right">
          ≡R
        </ToolbarButton>

        <div className="mx-1 h-5 w-px bg-gray-300" />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={handleImageUpload}
          disabled={uploading}
          className="rounded px-2 py-1.5 text-sm hover:bg-gray-200 disabled:opacity-50 flex items-center gap-1"
        >
          {uploading ? "Uploading..." : "🖼 Insert Image"}
        </button>

        <div className="mx-1 h-5 w-px bg-gray-300" />

        <ToolbarButton onClick={() => execCommand("undo")} title="Undo">
          ↶
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand("redo")} title="Redo">
          ↷
        </ToolbarButton>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[300px] max-h-[500px] overflow-y-auto px-4 py-3 focus:outline-none focus:ring-2 focus:ring-hmc-orange/50"
        style={{
          fontFamily: "Georgia, serif",
          fontSize: "15px",
          lineHeight: "1.7"
        }}
      />

      {/* Image URL Input Modal */}
      <ImageUrlModal onInsert={(url) => execCommand("insertImage", url)} />
    </div>
  );
}

// Image URL Modal Component
function ImageUrlModal({ onInsert }: { onInsert: (url: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen && dialogRef.current) {
      dialogRef.current.showModal();
    } else if (dialogRef.current) {
      dialogRef.current.close();
    }
  }, [isOpen]);

  const handleInsert = () => {
    if (url.trim()) {
      onInsert(url.trim());
      setUrl("");
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded px-2 py-1.5 text-sm hover:bg-gray-200"
        title="Insert Image from URL"
      >
        🔗 Image URL
      </button>

      <dialog
        ref={dialogRef}
        className="rounded-lg p-0 backdrop:bg-black/50"
        onClose={() => setIsOpen(false)}
      >
        <div className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Insert Image from URL</h3>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-80 rounded-md border border-gray-300 px-3 py-2 mb-4"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleInsert}
              className="rounded-md bg-hmc-orange px-4 py-2 text-sm text-white hover:bg-hmc-orange/90"
            >
              Insert
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

// =====================
// Main Admin Page
// =====================
export default function AdminInsightsPage() {
  const { data: insights, loading, refetch } = useInsightsList();

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [publishDate, setPublishDate] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [loading2, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(t);
    }
  }, [message]);

  const insightsList = insights || [];

  // Upload image to Supabase Storage
  const uploadImage = async (file: File): Promise<string> => {
    return await uploadImageToStorage(file);
  };

  // Handle cover image selection
  const handleCoverImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      try {
        const url = await uploadImage(file);
        setCoverImage(url);
        setImagePreview(url);
      } catch (err) {
        console.error("Cover image upload failed:", err);
        alert("Failed to upload cover image");
      }
    }
    if (coverFileInputRef.current) coverFileInputRef.current.value = "";
  };

  // Handle new insight
  const handleNewInsight = () => {
    setEditingId(null);
    setTitle("");
    setAuthorName("");
    setContent("");
    setCoverImage("");
    setPublishDate(new Date().toISOString().split("T")[0]);
    setIsPublished(true);
    setIsFeatured(false);
    setImagePreview(null);
    setShowForm(true);
  };

  // Handle edit
  const handleEdit = (insight: Insight) => {
    setEditingId(insight._id);
    setTitle(insight.title);
    setAuthorName(insight.authorName || "");
    setContent(insight.content || "");
    setCoverImage(insight.coverImage || "");
    setImagePreview(insight.coverImage || null);
    setPublishDate(
      insight.publishDate
        ? new Date(insight.publishDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0]
    );
    setIsPublished(insight.isPublished ?? true);
    setIsFeatured(insight.isFeatured ?? false);
    setShowForm(true);
  };

  // Handle save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setMessage({ type: "error", text: "Title is required" });
      return;
    }

    const textContent = content.replace(/<[^>]*>/g, "").trim();
    if (!textContent) {
      setMessage({ type: "error", text: "Content is required" });
      return;
    }

    setLoading(true);
    try {
      const excerpt = textContent.substring(0, 150);

      if (editingId) {
        await updateInsight(editingId, {
          title: title.trim(),
          authorName: authorName.trim() || undefined,
          content,
          coverImage: coverImage || undefined,
          excerpt,
          isPublished,
          isFeatured,
          publishDate,
        });
        setMessage({ type: "success", text: "Insight updated successfully!" });
      } else {
        await createInsight({
          title: title.trim(),
          authorName: authorName.trim() || undefined,
          content,
          coverImage: coverImage || undefined,
          excerpt,
          isPublished,
          isFeatured,
          publishDate,
        });
        setMessage({ type: "success", text: "Insight created successfully!" });
      }
      setShowForm(false);
      resetForm();
      refetch();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to save" });
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this insight permanently?")) return;
    try {
      await deleteInsight(id);
      setMessage({ type: "success", text: "Insight deleted" });
      refetch();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to delete" });
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setAuthorName("");
    setContent("");
    setCoverImage("");
    setPublishDate("");
    setIsPublished(true);
    setIsFeatured(false);
    setImagePreview(null);
  };

  const getStatusBadge = (insight: Insight) => (
    <div className="flex gap-1">
      <span className={`rounded px-2 py-0.5 text-xs font-medium ${insight.isPublished ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}>
        {insight.isPublished ? "Published" : "Draft"}
      </span>
      {insight.isFeatured && (
        <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-600">
          Featured
        </span>
      )}
    </div>
  );

  const formatDate = (timestamp: number): string => new Date(timestamp).toLocaleDateString();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Insights</h1>
          <p className="mt-1 text-sm text-gray-500">Manage insights ({insightsList.length} total)</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Refresh
          </button>
          <button
            onClick={handleNewInsight}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            + New Insight
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`rounded-lg p-4 text-sm ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {message.text}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg border border-gray-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingId ? "Edit Insight" : "New Insight"}
              </h2>
              <button
                onClick={() => { setShowForm(false); resetForm(); }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              {/* Title */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-4 py-2.5 focus:border-hmc-orange focus:outline-none focus:ring-2 focus:ring-hmc-orange/20"
                  placeholder="Enter insight title"
                  required
                />
              </div>

              {/* Author & Date */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Author</label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-4 py-2.5 focus:border-hmc-orange focus:outline-none focus:ring-2 focus:ring-hmc-orange/20"
                    placeholder="Author name"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Publish Date</label>
                  <input
                    type="date"
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-4 py-2.5 focus:border-hmc-orange focus:outline-none focus:ring-2 focus:ring-hmc-orange/20"
                  />
                </div>
              </div>

              {/* Cover Image */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Cover Image</label>
                <input
                  ref={coverFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => coverFileInputRef.current?.click()}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm hover:bg-gray-50"
                >
                  Choose Cover Image
                </button>
                {imagePreview && (
                  <div className="mt-4 flex items-center gap-4">
                    <img
                      src={imagePreview}
                      alt="Cover preview"
                      className="h-32 w-48 rounded-md object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => { setCoverImage(""); setImagePreview(null); }}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Content */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Content <span className="text-red-500">*</span>
                </label>
                <RichTextEditor
                  content={content}
                  onChange={setContent}
                  onImageUpload={uploadImage}
                />
              </div>

              {/* Options */}
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-hmc-orange focus:ring-hmc-orange"
                  />
                  <span className="text-sm text-gray-700">Published</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                  />
                  <span className="text-sm text-gray-700">Featured</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 border-t pt-6">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); resetForm(); }}
                  className="rounded-md border border-gray-300 bg-white px-6 py-2.5 text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading2}
                  className="rounded-md bg-hmc-orange px-6 py-2.5 text-sm font-medium text-white hover:bg-hmc-orange/90 disabled:opacity-50"
                >
                  {loading2 ? "Saving..." : editingId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Insights Grid */}
      {loading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
          Loading insights...
        </div>
      ) : insightsList.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center text-gray-500">
          No insights yet. Click "New Insight" to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {insightsList.map((insight) => (
            <div
              key={insight._id}
              className="rounded-lg border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-shadow"
            >
              {insight.coverImage && (
                <img
                  src={insight.coverImage}
                  alt={insight.title}
                  className="w-full h-40 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  {getStatusBadge(insight)}
                </div>
                <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                  {insight.title}
                </h3>
                {insight.authorName && (
                  <p className="text-xs text-gray-500 mb-1">by {insight.authorName}</p>
                )}
                {insight.eventDate && (
                  <p className="text-xs text-gray-500 mb-1">
                    {new Date(insight.eventDate).toLocaleDateString()}
                  </p>
                )}
                <p className="text-xs text-gray-400 mb-3">
                  {insight.publishDate ? formatDate(insight.publishDate) : formatDate(insight.createdAt)}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(insight)}
                    className="flex-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(insight._id)}
                    className="flex-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
