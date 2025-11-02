"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useEditor, EditorContent, Editor as TiptapEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Highlight from "@tiptap/extension-highlight";
import { Extension } from "@tiptap/core";
import {
  Bold,
  Italic,
  UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  Link2,
  ImageIcon,
  Palette,
  Type,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useIsMobile } from "@/core/hooks/useIsMobile";

/**
 * Extensão FontSize para Tiptap
 */
const FontSize = Extension.create({
  name: "fontSize",
  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }) =>
          chain().setMark("textStyle", { fontSize }).run(),
      unsetFontSize:
        () =>
        ({ chain }) =>
          chain().setMark("textStyle", { fontSize: null }).run(),
    };
  },
});

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  storageKey?: string;
  showToolbar?: boolean;
  className?: string;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Comece a escrever...",
  storageKey,
  showToolbar = true,
  className = "",
}: RichTextEditorProps) {
  const isMobile = useIsMobile();
  const [toolbarExpanded, setToolbarExpanded] = useState(false);
  const pendingRef = useRef<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextStyle,
      Color,
      FontFamily,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
      Link.configure({
        openOnClick: true,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer nofollow" },
      }),
      Image,
      Highlight.configure({ multicolor: true }),
      FontSize,
    ],
    content,
    editorProps: {
      attributes: {
        class: `prose dark:prose-invert max-w-none min-h-[calc(100vh-120px)] md:min-h-[85vh] p-3 md:p-6 outline-none bg-transparent text-gray-900 dark:text-gray-100 ${className}`,
      },
    },
    immediatelyRender: false,
    onUpdate({ editor }) {
      const html = editor.getHTML();
      pendingRef.current = html;
      onChange(html);

      // Salvar no localStorage se tiver storageKey
      if (storageKey) {
        try {
          localStorage.setItem(storageKey, html);
        } catch {}
      }
    },
  });

  // Carregar do localStorage na montagem
  useEffect(() => {
    if (!editor || !storageKey) return;
    const local = typeof window !== "undefined" ? localStorage.getItem(storageKey) : null;
    const finalContent = local || content || "";
    if (finalContent && finalContent !== editor.getHTML()) {
      editor.commands.setContent(finalContent);
    }
  }, [editor, content, storageKey]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900">
      {/* Toolbar */}
      {showToolbar && (
        <EditorToolbar
          editor={editor}
          expanded={toolbarExpanded}
          onToggleExpanded={() => setToolbarExpanded(!toolbarExpanded)}
          isMobile={isMobile}
        />
      )}

      {/* Editor */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

// Toolbar component
function EditorToolbar({
  editor,
  expanded,
  onToggleExpanded,
  isMobile,
}: {
  editor: TiptapEditor;
  expanded: boolean;
  onToggleExpanded: () => void;
  isMobile: boolean;
}) {
  const buttonClass =
    "p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition text-gray-700 dark:text-gray-300";
  const activeClass = "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400";

  return (
    <div className="flex-none border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
      <div className="p-2 md:p-3">
        {/* Mobile: Toggle button */}
        {isMobile && (
          <button
            onClick={onToggleExpanded}
            className="w-full flex items-center justify-between p-2 mb-2 bg-gray-50 dark:bg-slate-800 rounded-lg"
          >
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Ferramentas de Formatação
            </span>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}

        {/* Toolbar content */}
        <div
          className={`${
            isMobile && !expanded ? "hidden" : "flex flex-wrap gap-1 md:gap-2"
          }`}
        >
          {/* Text formatting */}
          <div className="flex gap-1 border-r border-gray-200 dark:border-slate-700 pr-2">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`${buttonClass} ${editor.isActive("bold") ? activeClass : ""}`}
              title="Negrito (Ctrl+B)"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`${buttonClass} ${editor.isActive("italic") ? activeClass : ""}`}
              title="Itálico (Ctrl+I)"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`${buttonClass} ${editor.isActive("underline") ? activeClass : ""}`}
              title="Sublinhado (Ctrl+U)"
            >
              <UnderlineIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`${buttonClass} ${editor.isActive("strike") ? activeClass : ""}`}
              title="Tachado"
            >
              <Strikethrough className="w-4 h-4" />
            </button>
          </div>

          {/* Headings - Hide on mobile by default */}
          {(!isMobile || expanded) && (
            <div className="flex gap-1 border-r border-gray-200 dark:border-slate-700 pr-2">
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`${buttonClass} ${
                  editor.isActive("heading", { level: 1 }) ? activeClass : ""
                }`}
                title="Título 1"
              >
                <Type className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`${buttonClass} ${
                  editor.isActive("heading", { level: 2 }) ? activeClass : ""
                }`}
                title="Título 2"
              >
                <Type className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Alignment */}
          <div className="flex gap-1 border-r border-gray-200 dark:border-slate-700 pr-2">
            <button
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              className={`${buttonClass} ${
                editor.isActive({ textAlign: "left" }) ? activeClass : ""
              }`}
              title="Alinhar à esquerda"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
              className={`${buttonClass} ${
                editor.isActive({ textAlign: "center" }) ? activeClass : ""
              }`}
              title="Centralizar"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              className={`${buttonClass} ${
                editor.isActive({ textAlign: "right" }) ? activeClass : ""
              }`}
              title="Alinhar à direita"
            >
              <AlignRight className="w-4 h-4" />
            </button>
          </div>

          {/* Lists */}
          <div className="flex gap-1 border-r border-gray-200 dark:border-slate-700 pr-2">
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`${buttonClass} ${editor.isActive("bulletList") ? activeClass : ""}`}
              title="Lista não ordenada"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`${buttonClass} ${editor.isActive("orderedList") ? activeClass : ""}`}
              title="Lista ordenada"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
          </div>

          {/* Additional - Hide on mobile by default */}
          {(!isMobile || expanded) && (
            <>
              <div className="flex gap-1 border-r border-gray-200 dark:border-slate-700 pr-2">
                <button
                  onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  className={`${buttonClass} ${editor.isActive("blockquote") ? activeClass : ""}`}
                  title="Citação"
                >
                  <Quote className="w-4 h-4" />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                  className={`${buttonClass} ${editor.isActive("codeBlock") ? activeClass : ""}`}
                  title="Bloco de código"
                >
                  <Code className="w-4 h-4" />
                </button>
                <button
                  onClick={() => editor.chain().focus().setHorizontalRule().run()}
                  className={buttonClass}
                  title="Linha horizontal"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-1">
                <button
                  onClick={() => {
                    const url = prompt("URL:");
                    if (url) {
                      editor.chain().focus().setLink({ href: url }).run();
                    }
                  }}
                  className={`${buttonClass} ${editor.isActive("link") ? activeClass : ""}`}
                  title="Inserir link"
                >
                  <Link2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    const url = prompt("URL da imagem:");
                    if (url) {
                      editor.chain().focus().setImage({ src: url }).run();
                    }
                  }}
                  className={buttonClass}
                  title="Inserir imagem"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Export também o useState para ser usado
import { useState } from "react";
