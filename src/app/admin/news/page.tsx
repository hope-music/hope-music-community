"use client";

import { useState, useRef, useEffect } from "react";

// Rich text editor with proper line breaks
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
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      // Allow default behavior for Enter key (creates <br> or new block)
      // But we want to create proper line breaks
      if (e.shiftKey) {
        // Shift+Enter = line break
        e.preventDefault();
        document.execCommand("insertHTML", false, "<br>");
      }
      // For Enter alone, let it create paragraphs by default
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    // Handle pasted images
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
              if (editorRef.current) {
                onChange(editorRef.current.innerHTML);
              }
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
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const insertLink = () => {
    const url = window.prompt("Enter URL:");
    if (url) {
      execCommand("createLink", url);
    }
  };

  // Set initial content
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content;
    }
  }, []);

  return (
    <div className="overflow-hidden rounded-md border border-gray-300 bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-300 bg-gray-50 px-2 py-2">
        {/* Text Formatting */}
        <button
          type="button"
          onClick={() => execCommand("bold")}
          className="rounded px-2 py-1 text-sm font-bold text-gray-700 hover:bg-gray-200"
          title="Bold (Ctrl+B)"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => execCommand("italic")}
          className="rounded px-2 py-1 text-sm italic text-gray-700 hover:bg-gray-200"
          title="Italic (Ctrl+I)"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => execCommand("underline")}
          className="rounded px-2 py-1 text-sm underline text-gray-700 hover:bg-gray-200"
          title="Underline (Ctrl+U)"
        >
          U
        </button>
        <button
          type="button"
          onClick={() => execCommand("strikeThrough")}
          className="rounded px-2 py-1 text-sm line-through text-gray-700 hover:bg-gray-200"
          title="Strikethrough"
        >
          S
        </button>

        <div className="mx-1 h-5 w-px bg-gray-300" />

        {/* Headings */}
        <select
          onChange={(e) => {
            if (e.target.value) {
              execCommand("formatBlock", e.target.value);
            } else {
              execCommand("formatBlock", "p");
            }
          }}
          className="rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 hover:bg-gray-50"
          defaultValue=""
        >
          <option value="">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
        </select>

        <div className="mx-1 h-5 w-px bg-gray-300" />

        {/* Lists */}
        <button
          type="button"
          onClick={() => execCommand("insertUnorderedList")}
          className="rounded px-2 py-1 text-sm text-gray-700 hover:bg-gray-200"
          title="Bullet List"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => execCommand("insertOrderedList")}
          className="rounded px-2 py-1 text-sm text-gray-700 hover:bg-gray-200"
          title="Numbered List"
        >
          1. List
        </button>

        <div className="mx-1 h-5 w-px bg-gray-300" />

        {/* Alignment */}
        <button
          type="button"
          onClick={() => execCommand("justifyLeft")}
          className="rounded px-2 py-1 text-sm text-gray-700 hover:bg-gray-200"
          title="Align Left"
        >
          ⬅
        </button>
        <button
          type="button"
          onClick={() => execCommand("justifyCenter")}
          className="rounded px-2 py-1 text-sm text-gray-700 hover:bg-gray-200"
          title="Align Center"
        >
          ⬜
        </button>
        <button
          type="button"
          onClick={() => execCommand("justifyRight")}
          className="rounded px-2 py-1 text-sm text-gray-700 hover:bg-gray-200"
          title="Align Right"
        >
          ➡
        </button>

        <div className="mx-1 h-5 w-px bg-gray-300" />

        {/* Quote */}
        <button
          type="button"
          onClick={() => execCommand("formatBlock", "blockquote")}
          className="rounded px-2 py-1 text-sm text-gray-700 hover:bg-gray-200"
          title="Quote"
        >
          "
        </button>

        <div className="mx-1 h-5 w-px bg-gray-300" />

        {/* Media - File input for images */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded px-2 py-1 text-sm text-gray-700 hover:bg-gray-200"
          title="Insert Image"
        >
          🖼 Image
        </button>
        <button
          type="button"
          onClick={insertLink}
          className="rounded px-2 py-1 text-sm text-gray-700 hover:bg-gray-200"
          title="Insert Link"
        >
          🔗 Link
        </button>

        <div className="mx-1 h-5 w-px bg-gray-300" />

        {/* Undo/Redo */}
        <button
          type="button"
          onClick={() => execCommand("undo")}
          className="rounded px-2 py-1 text-sm text-gray-700 hover:bg-gray-200"
          title="Undo"
        >
          ↶
        </button>
        <button
          type="button"
          onClick={() => execCommand("redo")}
          className="rounded px-2 py-1 text-sm text-gray-700 hover:bg-gray-200"
          title="Redo"
        >
          ↷
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        className="min-h-[300px] max-h-[500px] overflow-y-auto px-4 py-4 focus:outline-none"
        style={{
          fontFamily: "Georgia, serif",
          fontSize: "16px",
          lineHeight: "1.8",
          whiteSpace: "pre-wrap",
        }}
      />
    </div>
  );
}

// News storage using localStorage
interface NewsArticle {
  id: string;
  title: string;
  coverImage: string; // base64 for local images
  content: string;
  excerpt: string;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: number;
  updatedAt: number;
}

export default function NewsAdminPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
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

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("admin_news");
    if (stored) {
      setArticles(JSON.parse(stored));
    }
  }, []);

  // Save to localStorage
  const saveToStorage = (data: NewsArticle[]) => {
    localStorage.setItem("admin_news", JSON.stringify(data));
    setArticles(data);
  };

  // Clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Filter articles
  const filteredArticles = articles.filter((article) => {
    if (filter === "published") return article.isPublished;
    if (filter === "draft") return !article.isPublished;
    return true;
  });

  // Handle cover image selection
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
    if (coverFileInputRef.current) {
      coverFileInputRef.current.value = "";
    }
  };

  // Open form for new article
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

  // Open form for editing
  const handleEdit = (article: NewsArticle) => {
    setEditingId(article.id);
    setTitle(article.title);
    setContent(article.content);
    setCoverImage(article.coverImage);
    setImagePreview(article.coverImage || null);
    setIsPublished(article.isPublished);
    setIsFeatured(article.isFeatured);
    setShowForm(true);
  };

  // Save article
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setMessage({ type: "error", text: "Title is required" });
      return;
    }

    // Check if content has actual text (not just HTML tags)
    const textContent = content.replace(/<[^>]*>/g, "").trim();
    if (!textContent) {
      setMessage({ type: "error", text: "Content is required" });
      return;
    }

    setLoading(true);

    try {
      // Strip HTML tags for excerpt
      const excerpt = textContent.substring(0, 150);
      const now = Date.now();

      if (editingId) {
        // Update existing
        const updated = articles.map((a) =>
          a.id === editingId
            ? { ...a, title: title.trim(), content, coverImage, excerpt, isPublished, isFeatured, updatedAt: now }
            : a
        );
        saveToStorage(updated);
        setMessage({ type: "success", text: "Article updated successfully!" });
      } else {
        // Create new
        const newArticle: NewsArticle = {
          id: now.toString(),
          title: title.trim(),
          content,
          coverImage,
          excerpt,
          isPublished,
          isFeatured,
          createdAt: now,
          updatedAt: now,
        };
        saveToStorage([newArticle, ...articles]);
        setMessage({ type: "success", text: "Article published successfully!" });
      }

      setShowForm(false);
      resetForm();
    } catch (err) {
      console.error("Save failed:", err);
      setMessage({ type: "error", text: "Failed to save article" });
    } finally {
      setLoading(false);
    }
  };

  // Delete article
  const handleDelete = (id: string) => {
    if (!confirm("Delete this article permanently?")) return;

    const updated = articles.filter((a) => a.id !== id);
    saveToStorage(updated);
    setMessage({ type: "success", text: "Article deleted" });
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

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">News Center</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage news articles with rich text editing
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="all">All Articles</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
          <button
            onClick={handleNewArticle}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            + New Article
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`rounded-lg p-4 text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Article Form */}
      {showForm && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            {editingId ? "Edit Article" : "New Article"}
          </h2>

          <form onSubmit={handleSave} className="space-y-4">
            {/* Title */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter article title..."
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            {/* Cover Image - File Selection */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Cover Image
              </label>
              <input
                ref={coverFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverImageSelect}
                className="hidden"
              />
              <div className="flex items-start gap-4">
                <button
                  type="button"
                  onClick={() => coverFileInputRef.current?.click()}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Choose Cover Image
                </button>
                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Cover preview"
                      className="h-20 w-32 rounded-md object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCoverImage("");
                        setImagePreview(null);
                      }}
                      className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Select a cover image from your device
              </p>
            </div>

            {/* Rich Text Content */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Content
              </label>
              <p className="mb-2 text-xs text-gray-500">
                Use the toolbar to format text. Press Enter for new paragraphs. Use Image button to add pictures.
              </p>
              <RichTextEditor
                content={content}
                onChange={setContent}
              />
            </div>

            {/* Options */}
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Published</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Featured</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Saving..." : editingId ? "Update" : "Publish"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Articles List */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Articles ({filteredArticles.length})
          </h2>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredArticles.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              No articles found. Click "New Article" to create one.
            </div>
          ) : (
            filteredArticles.map((article) => (
              <div
                key={article.id}
                className="flex items-start justify-between gap-4 px-6 py-4 hover:bg-gray-50"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    {article.coverImage && (
                      <img
                        src={article.coverImage}
                        alt={article.title}
                        className="h-12 w-12 shrink-0 rounded-md object-cover"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900 truncate">
                          {article.title || "Untitled"}
                        </h3>
                        {article.isFeatured && (
                          <span className="shrink-0 rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-600">
                            Featured
                          </span>
                        )}
                        <span
                          className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${
                            article.isPublished
                              ? "bg-green-100 text-green-600"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {article.isPublished ? "Published" : "Draft"}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-400">
                        {formatDate(article.createdAt)}
                      </p>
                    </div>
                  </div>
                  {article.excerpt && (
                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                      {article.excerpt}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => handleEdit(article)}
                    className="rounded-md bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-600 transition hover:bg-blue-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(article.id)}
                    className="rounded-md bg-red-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
