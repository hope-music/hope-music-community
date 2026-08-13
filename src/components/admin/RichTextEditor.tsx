"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/lib/convex";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  generateUploadUrl?: ReturnType<typeof useMutation<typeof api.admin.generateUploadUrl>>;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Write something...",
  generateUploadUrl,
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        code: false,
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 underline",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[200px] max-h-[400px] overflow-y-auto px-4 py-3 focus:outline-none prose prose-sm max-w-none",
      },
    },
  });

  const handleImageUpload = useCallback(async () => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editor || !generateUploadUrl) return;

      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      try {
        // Upload to Convex storage
        const uploadUrl = await generateUploadUrl();
        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = await response.json();

        // Insert image into editor
        const imageUrl = `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${storageId}`;
        editor.chain().focus().setImage({ src: imageUrl }).run();
      } catch (err) {
        alert("Failed to upload image");
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [editor, generateUploadUrl]
  );

  const handleAddLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Enter URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-md border border-gray-300 bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-300 bg-gray-50 px-2 py-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`rounded px-2 py-1 text-sm font-bold ${
            editor.isActive("bold")
              ? "bg-gray-300 text-gray-900"
              : "text-gray-600 hover:bg-gray-200"
          }`}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`rounded px-2 py-1 text-sm italic ${
            editor.isActive("italic")
              ? "bg-gray-300 text-gray-900"
              : "text-gray-600 hover:bg-gray-200"
          }`}
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`rounded px-2 py-1 text-sm line-through ${
            editor.isActive("strike")
              ? "bg-gray-300 text-gray-900"
              : "text-gray-600 hover:bg-gray-200"
          }`}
        >
          S
        </button>

        <div className="mx-2 h-5 w-px bg-gray-300" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`rounded px-2 py-1 text-sm ${
            editor.isActive("bulletList")
              ? "bg-gray-300 text-gray-900"
              : "text-gray-600 hover:bg-gray-200"
          }`}
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`rounded px-2 py-1 text-sm ${
            editor.isActive("orderedList")
              ? "bg-gray-300 text-gray-900"
              : "text-gray-600 hover:bg-gray-200"
          }`}
        >
          1. List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`rounded px-2 py-1 text-sm ${
            editor.isActive("blockquote")
              ? "bg-gray-300 text-gray-900"
              : "text-gray-600 hover:bg-gray-200"
          }`}
        >
          Quote
        </button>

        <div className="mx-2 h-5 w-px bg-gray-300" />

        <button
          type="button"
          onClick={handleAddLink}
          className={`rounded px-2 py-1 text-sm ${
            editor.isActive("link")
              ? "bg-gray-300 text-gray-900"
              : "text-gray-600 hover:bg-gray-200"
          }`}
        >
          Link
        </button>

        <button
          type="button"
          onClick={handleImageUpload}
          className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-200"
        >
          Image
        </button>

        <div className="mx-2 h-5 w-px bg-gray-300" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-200 disabled:opacity-50"
        >
          Undo
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-200 disabled:opacity-50"
        >
          Redo
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}
