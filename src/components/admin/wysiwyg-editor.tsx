"use client";

import { useId, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import { Markdown } from "tiptap-markdown";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  Quote,
  Terminal,
  Minus,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Undo,
  Redo,
  FileCode,
  Eye,
  Check,
} from "lucide-react";

/** Storage added to the editor by the tiptap-markdown extension. */
type MarkdownStorage = { markdown?: { getMarkdown: () => string } };

interface WysiwygEditorProps {
  name: string;
  defaultValue?: string;
  label?: string;
}

export function WysiwygEditor({ name, defaultValue = "", label = "Content" }: WysiwygEditorProps) {
  const id = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"wysiwyg" | "markdown">("wysiwyg");
  const [markdownValue, setMarkdownValue] = useState(defaultValue);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3, 4],
        },
        codeBlock: {
          HTMLAttributes: {
            class: "rounded-xl bg-slate-900 text-slate-100 p-4 font-mono text-sm my-4",
          },
        },
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-accent underline font-medium hover:text-accent-dark",
        },
      }),
      ImageExtension.configure({
        HTMLAttributes: {
          class: "rounded-xl border border-slate-200 max-w-full my-4 shadow-xs",
        },
      }),
      Markdown.configure({
        html: false,
        tightLists: true,
      }),
    ],
    content: defaultValue,
    editorProps: {
      attributes: {
        class:
          "prose prose-slate max-w-none px-6 py-5 min-h-[380px] focus:outline-none text-slate-800 leading-relaxed",
      },
    },
    onUpdate: ({ editor }) => {
      // Get markdown string from TipTap markdown storage
      const storage = editor.storage as unknown as MarkdownStorage;
      const md = storage.markdown ? storage.markdown.getMarkdown() : "";
      setMarkdownValue(md);
    },
  });

  // Handle switching between WYSIWYG and Raw Markdown
  const toggleMode = (newMode: "wysiwyg" | "markdown") => {
    if (newMode === mode) return;

    if (newMode === "wysiwyg" && editor) {
      // Sync raw markdown edits back into TipTap
      editor.commands.setContent(markdownValue);
    } else if (newMode === "markdown" && editor) {
      // Sync TipTap content into raw markdown
      const storage = editor.storage as unknown as MarkdownStorage;
      const md = storage.markdown ? storage.markdown.getMarkdown() : "";
      setMarkdownValue(md);
    }
    setMode(newMode);
  };

  // Image Upload handler
  const handleImageUpload = async (file: File) => {
    setUploadStatus("Uploading image…");
    const body = new FormData();
    body.append("file", file);

    try {
      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) throw new Error(data.error ?? "Upload failed.");

      if (editor) {
        editor.chain().focus().setImage({ src: data.url, alt: file.name }).run();
      }
      setUploadStatus("Image inserted successfully.");
      setTimeout(() => setUploadStatus(null), 3000);
    } catch (error) {
      setUploadStatus(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Link Prompt
  const setLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previousUrl);

    if (url === null) return; // cancelled
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const btnClass = (active: boolean) =>
    `flex size-8 cursor-pointer items-center justify-center rounded-md text-sm font-medium transition-colors ${
      active
        ? "bg-accent-soft text-accent font-semibold shadow-xs"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-ink">
          {label}
        </label>

        {/* View mode switcher */}
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => toggleMode("wysiwyg")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-all ${
              mode === "wysiwyg" ? "bg-white text-accent shadow-xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Eye className="size-3.5" /> Visual (WYSIWYG)
          </button>
          <button
            type="button"
            onClick={() => toggleMode("markdown")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-all ${
              mode === "markdown" ? "bg-white text-accent shadow-xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileCode className="size-3.5" /> Raw Markdown
          </button>
        </div>
      </div>

      {/* Editor Container */}
      <div className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-xs focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20">
        {mode === "wysiwyg" && editor && (
          <>
            {/* WYSIWYG Toolbar */}
            <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50/80 px-3 py-2">
              {/* Headings */}
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={btnClass(editor.isActive("heading", { level: 2 }))}
                title="Heading 2 (##)"
              >
                <Heading2 className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={btnClass(editor.isActive("heading", { level: 3 }))}
                title="Heading 3 (###)"
              >
                <Heading3 className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
                className={btnClass(editor.isActive("heading", { level: 4 }))}
                title="Heading 4 (####)"
              >
                <Heading4 className="size-4" />
              </button>

              <div className="mx-1 h-5 w-px bg-slate-200" />

              {/* Formatting */}
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={btnClass(editor.isActive("bold"))}
                title="Bold (Cmd+B)"
              >
                <Bold className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={btnClass(editor.isActive("italic"))}
                title="Italic (Cmd+I)"
              >
                <Italic className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={btnClass(editor.isActive("strike"))}
                title="Strikethrough"
              >
                <Strikethrough className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={btnClass(editor.isActive("code"))}
                title="Inline Code"
              >
                <Code className="size-4" />
              </button>

              <div className="mx-1 h-5 w-px bg-slate-200" />

              {/* Lists & Quotes */}
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={btnClass(editor.isActive("bulletList"))}
                title="Bullet List"
              >
                <List className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={btnClass(editor.isActive("orderedList"))}
                title="Numbered List"
              >
                <ListOrdered className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={btnClass(editor.isActive("blockquote"))}
                title="Quote Block"
              >
                <Quote className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={btnClass(editor.isActive("codeBlock"))}
                title="Code Block"
              >
                <Terminal className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                className={btnClass(false)}
                title="Horizontal Divider"
              >
                <Minus className="size-4" />
              </button>

              <div className="mx-1 h-5 w-px bg-slate-200" />

              {/* Links & Images */}
              <button
                type="button"
                onClick={setLink}
                className={btnClass(editor.isActive("link"))}
                title="Insert Link"
              >
                <LinkIcon className="size-4" />
              </button>
              {editor.isActive("link") && (
                <button
                  type="button"
                  onClick={() => editor.chain().focus().unsetLink().run()}
                  className={btnClass(false)}
                  title="Remove Link"
                >
                  <Unlink className="size-4 text-red-500" />
                </button>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200/70"
                title="Upload & Insert Image"
              >
                <ImageIcon className="size-4 text-accent" />
                <span>Add Image</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleImageUpload(f);
                }}
              />

              <div className="mx-1 h-5 w-px bg-slate-200" />

              {/* Undo / Redo */}
              <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                className={`${btnClass(false)} disabled:opacity-30 disabled:cursor-not-allowed`}
                title="Undo (Cmd+Z)"
              >
                <Undo className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                className={`${btnClass(false)} disabled:opacity-30 disabled:cursor-not-allowed`}
                title="Redo (Cmd+Shift+Z)"
              >
                <Redo className="size-4" />
              </button>
            </div>

            {/* TipTap WYSIWYG Content Area */}
            <EditorContent editor={editor} />
          </>
        )}

        {mode === "markdown" && (
          <textarea
            id={id}
            value={markdownValue}
            onChange={(e) => {
              setMarkdownValue(e.target.value);
            }}
            rows={18}
            className="w-full p-5 font-mono text-sm leading-relaxed text-slate-800 focus:outline-none"
            placeholder="Write your markdown content here..."
          />
        )}
      </div>

      {/* Hidden input to ensure FormData gets the markdown content on submit */}
      <input type="hidden" name={name} value={markdownValue} />

      {uploadStatus && (
        <p className="flex items-center gap-1.5 text-xs text-accent font-medium mt-1">
          <Check className="size-3.5" /> {uploadStatus}
        </p>
      )}

      <p className="text-xs text-slate-500">
        Rich WYSIWYG formatting is automatically serialized to clean Markdown on save.
      </p>
    </div>
  );
}
