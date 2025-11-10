"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import { TextStyle } from "@tiptap/extension-text-style"
import Color from "@tiptap/extension-color"
import FontFamily from "@tiptap/extension-font-family"
import TextAlign from "@tiptap/extension-text-align"
import Placeholder from "@tiptap/extension-placeholder"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import Highlight from "@tiptap/extension-highlight"
import { Extension } from "@tiptap/core"
import { WorkspaceTemplateComponentProps } from "@/core/types/workspace.types"
import { usePageTemplateData } from "@/core/hooks/usePageTemplateData"


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
  IndentIncrease,
  IndentDecrease,
  Palette,
  Type,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

/**
 * Extensão FontSize: adiciona atributo `fontSize` ao mark `textStyle`
 * sem apagar outras propriedades (cor, família etc).
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
              if (!attributes.fontSize) return {}
              return { style: `font-size: ${attributes.fontSize}` }
            },
          },
        },
      },
    ]
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
    }
  },
})

type RichTextTemplateData = { content: string }
const DEFAULT_DATA: RichTextTemplateData = { content: "" }

interface BlankTemplateProps extends WorkspaceTemplateComponentProps {
  onContentChange?: (content: string) => void
  initialContent?: string
}

export default function BlankTemplate({ groupId, pageId, onContentChange, initialContent }: BlankTemplateProps) {
  const { data, setData } = usePageTemplateData<RichTextTemplateData>(groupId, pageId, DEFAULT_DATA)


  const [isClient, setIsClient] = useState(false)
  useEffect(() => setIsClient(true), [])

  const [toolbarCollapsed, setToolbarCollapsed] = useState(false)
  const storageKey = useMemo(() => `richtext-${groupId}-${pageId}`, [groupId, pageId])

  const pendingRef = useRef<RichTextTemplateData | null>(null)
  const lastSavedRef = useRef<string>("")

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
      Placeholder.configure({ placeholder: "Comece a escrever seu documento…" }),
      Link.configure({
        openOnClick: true,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer nofollow" },
      }),
      Image,
      Highlight.configure({ multicolor: true }),
      FontSize,
    ],
    content: initialContent ?? data.content ?? "",
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert max-w-none min-h-[calc(100vh-120px)] md:min-h-[85vh] p-3 md:p-6 outline-none bg-transparent text-gray-900 dark:text-gray-100",
      },
    },
    immediatelyRender: false,
    onUpdate({ editor }) {
      const html = editor.getHTML()
      pendingRef.current = { content: html }

      // Chamar onContentChange se fornecido (para integração com Wiki)
      if (onContentChange) {
        onContentChange(html)
      }

      try {
        localStorage.setItem(storageKey, html)
      } catch {}
    },
  })

  useEffect(() => {
    if (!editor) return

    // Se initialContent foi fornecido, usá-lo (modo Wiki)
    if (initialContent !== undefined) {
      if (initialContent !== editor.getHTML()) {
        editor.commands.setContent(initialContent)
      }
      return
    }

    // Caso contrário, usar localStorage ou data.content (modo normal)
    const local = typeof window !== "undefined" ? localStorage.getItem(storageKey) : null
    const finalContent = local || data.content || ""
    if (finalContent && finalContent !== editor.getHTML()) {
      editor.commands.setContent(finalContent)
    }
  }, [editor, data.content, storageKey, initialContent])

  const flushPending = useCallback(() => {
    // Se onContentChange está definido, não salvar no store (modo Wiki)
    if (onContentChange) return

    const payload = pendingRef.current
    if (!payload) return
    pendingRef.current = null

    const json = JSON.stringify(payload)
    if (json === lastSavedRef.current) return

    lastSavedRef.current = json
    setData(() => payload)
  }, [setData, onContentChange])

  useEffect(() => {
    const id = setInterval(flushPending, 3000)
    return () => {
      clearInterval(id)
      flushPending()
    }
  }, [flushPending])

  const applyColor = (color: string) => editor?.chain().focus().setColor(color).run()
  const applyHighlight = (color: string) => editor?.chain().focus().toggleHighlight({ color }).run()

  const setFontSize = (px: string) => editor?.chain().focus().setFontSize(px).run()
  const clearFontSize = () => editor?.chain().focus().unsetFontSize().run()

  const indent = () => {
    if (!editor) return
    if (editor.can().sinkListItem("listItem")) editor.chain().focus().sinkListItem("listItem").run()
  }
  const outdent = () => {
    if (!editor) return
    if (editor.can().liftListItem("listItem")) editor.chain().focus().liftListItem("listItem").run()
  }

  const askLink = () => {
    const previous = editor?.getAttributes("link")?.href as string | undefined
    const url = window.prompt("URL do link:", previous || "https://")
    if (url === null) return
    if (url === "") return editor?.chain().focus().unsetLink().run()
    editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }

  const askImage = () => {
    const url = window.prompt("URL da imagem (https://…):")
    if (!url) return
    editor?.chain().focus().setImage({ src: url }).run()
  }

  const fontSizes = useMemo(
    () => [
      { label: "12", value: "12px" },
      { label: "14", value: "14px" },
      { label: "16", value: "16px" },
      { label: "18", value: "18px" },
      { label: "20", value: "20px" },
      { label: "24", value: "24px" },
      { label: "32", value: "32px" },
    ],
    [],
  )

  if (!isClient || !editor) {
    return <div className="p-4 md:p-6 text-gray-500 dark:text-gray-400">Carregando editor…</div>
  }

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100">
      {/* TOOLBAR */}
      <div className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-50/80 dark:supports-[backdrop-filter]:bg-gray-900/80">
        {toolbarCollapsed ? (
          /* Toolbar Colapsada - Uma linha */
          <div className="flex items-center gap-2 p-2 md:p-3">
            <button
              onClick={() => setToolbarCollapsed(false)}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              title="Expandir toolbar"
            >
              <ChevronDown className="w-4 h-4" />
            </button>

            <div className="h-5 w-px bg-gray-300 dark:bg-gray-700" />

            {/* Botões essenciais */}
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors ${
                editor.isActive("bold") ? "bg-gray-300 dark:bg-gray-700" : ""
              }`}
              title="Negrito"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors ${
                editor.isActive("italic") ? "bg-gray-300 dark:bg-gray-700" : ""
              }`}
              title="Itálico"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors ${
                editor.isActive("underline") ? "bg-gray-300 dark:bg-gray-700" : ""
              }`}
              title="Sublinhado"
            >
              <UnderlineIcon className="w-4 h-4" />
            </button>

            <div className="h-5 w-px bg-gray-300 dark:bg-gray-700" />

            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors ${
                editor.isActive("bulletList") ? "bg-gray-300 dark:bg-gray-700" : ""
              }`}
              title="Lista"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors ${
                editor.isActive("orderedList") ? "bg-gray-300 dark:bg-gray-700" : ""
              }`}
              title="Lista numerada"
            >
              <ListOrdered className="w-4 h-4" />
            </button>

            <div className="h-5 w-px bg-gray-300 dark:bg-gray-700" />

            <button
              onClick={askLink}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors ${
                editor.isActive("link") ? "bg-gray-300 dark:bg-gray-700" : ""
              }`}
              title="Inserir link"
            >
              <Link2 className="w-4 h-4" />
            </button>
            <button
              onClick={askImage}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              title="Inserir imagem"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Toolbar Expandida - Completa */
          <div className="p-2 md:p-3">
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => setToolbarCollapsed(true)}
                className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                title="Minimizar toolbar"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <span className="text-xs text-gray-500 dark:text-gray-400">Ferramentas de formatação</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
            {/* Controles essenciais - sempre visíveis */}
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 md:p-2.5 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors ${
                editor.isActive("bold") ? "bg-gray-300 dark:bg-gray-700" : ""
              }`}
              title="Negrito"
            >
              <Bold className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 md:p-2.5 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors ${
                editor.isActive("italic") ? "bg-gray-300 dark:bg-gray-700" : ""
              }`}
              title="Itálico"
            >
              <Italic className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-2 md:p-2.5 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors ${
                editor.isActive("underline") ? "bg-gray-300 dark:bg-gray-700" : ""
              }`}
              title="Sublinhado"
            >
              <UnderlineIcon className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            <div className="h-5 md:h-6 w-px bg-gray-300 dark:bg-gray-700 mx-1" />

            {/* Alinhamento */}
            <button
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              className="p-2 md:p-2.5 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              title="Esquerda"
            >
              <AlignLeft className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
              className="p-2 md:p-2.5 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              title="Centro"
            >
              <AlignCenter className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              className="p-2 md:p-2.5 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              title="Direita"
            >
              <AlignRight className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            <div className="h-5 md:h-6 w-px bg-gray-300 dark:bg-gray-700 mx-1" />

            {/* Listas */}
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 md:p-2.5 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors ${
                editor.isActive("bulletList") ? "bg-gray-300 dark:bg-gray-700" : ""
              }`}
              title="Lista"
            >
              <List className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-2 md:p-2.5 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors ${
                editor.isActive("orderedList") ? "bg-gray-300 dark:bg-gray-700" : ""
              }`}
              title="Lista numerada"
            >
              <ListOrdered className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            <div className="h-5 md:h-6 w-px bg-gray-300 dark:bg-gray-700 mx-1" />

            {/* Link e Imagem */}
            <button
              onClick={askLink}
              className={`p-2 md:p-2.5 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors ${
                editor.isActive("link") ? "bg-gray-300 dark:bg-gray-700" : ""
              }`}
              title="Inserir/Editar link"
            >
              <Link2 className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button
              onClick={askImage}
              className="p-2 md:p-2.5 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              title="Inserir imagem"
            >
              <ImageIcon className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            <div className="h-5 md:h-6 w-px bg-gray-300 dark:bg-gray-700 mx-1" />

            {/* Formatação adicional */}
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`p-2 md:p-2.5 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors ${
                editor.isActive("strike") ? "bg-gray-300 dark:bg-gray-700" : ""
              }`}
              title="Tachado"
            >
              <Strikethrough className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            <div className="h-5 md:h-6 w-px bg-gray-300 dark:bg-gray-700 mx-1" />

            {/* Cores */}
            <label
              className="flex items-center gap-1 cursor-pointer p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              title="Cor do texto"
            >
              <Palette className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-300" />
              <input
                type="color"
                onChange={(e) => applyColor(e.target.value)}
                className="w-6 h-6 md:w-7 md:h-7 border border-gray-300 dark:border-gray-700 rounded bg-transparent cursor-pointer"
              />
            </label>

            <label
              className="flex items-center gap-1 cursor-pointer p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              title="Marca-texto"
            >
              <Type className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-300" />
              <input
                type="color"
                onChange={(e) => applyHighlight(e.target.value)}
                className="w-6 h-6 md:w-7 md:h-7 border border-gray-300 dark:border-gray-700 rounded bg-transparent cursor-pointer"
              />
            </label>

            <div className="h-5 md:h-6 w-px bg-gray-300 dark:bg-gray-700 mx-1" />

            {/* Fonte e tamanho */}
            <select
              onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
              defaultValue="system-ui, sans-serif"
              className="px-2 py-1.5 md:py-2 text-xs md:text-sm rounded bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 min-w-[80px]"
              title="Fonte"
            >
              <option value="system-ui, sans-serif">Sans</option>
              <option value="serif">Serif</option>
              <option value="monospace">Mono</option>
              <option value="cursive">Cursiva</option>
            </select>

            <select
              onChange={(e) => {
                const v = e.target.value
                if (v === "clear") clearFontSize()
                else setFontSize(v)
              }}
              defaultValue="16px"
              className="px-2 py-1.5 md:py-2 text-xs md:text-sm rounded bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 min-w-[70px]"
              title="Tamanho"
            >
              {fontSizes.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}px
                </option>
              ))}
              <option value="clear">Padrão</option>
            </select>

            {/* Títulos */}
            <select
              onChange={(e) => {
                const valNum = Number(e.target.value)
                if (valNum === 0) editor.chain().focus().setParagraph().run()
                else
                  editor
                    .chain()
                    .focus()
                    .toggleHeading({ level: valNum as 1 | 2 | 3 })
                    .run()
              }}
              defaultValue={0}
              className="px-2 py-1.5 md:py-2 text-xs md:text-sm rounded bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 min-w-[90px]"
              title="Títulos"
            >
              <option value={0}>Parágrafo</option>
              <option value={1}>Título 1</option>
              <option value={2}>Título 2</option>
              <option value={3}>Título 3</option>
            </select>

            <div className="h-5 md:h-6 w-px bg-gray-300 dark:bg-gray-700 mx-1" />

            {/* Indent */}
            <button
              onClick={indent}
              className="p-2 md:p-2.5 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              title="Aumentar recuo"
            >
              <IndentIncrease className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button
              onClick={outdent}
              className="p-2 md:p-2.5 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              title="Reduzir recuo"
            >
              <IndentDecrease className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            <div className="h-5 md:h-6 w-px bg-gray-300 dark:bg-gray-700 mx-1" />

            {/* Blocos */}
            <button
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`p-2 md:p-2.5 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors ${
                editor.isActive("blockquote") ? "bg-gray-300 dark:bg-gray-700" : ""
              }`}
              title="Citação"
            >
              <Quote className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={`p-2 md:p-2.5 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors ${
                editor.isActive("codeBlock") ? "bg-gray-300 dark:bg-gray-700" : ""
              }`}
              title="Bloco de código"
            >
              <Code className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              className="p-2 md:p-2.5 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              title="Linha horizontal"
            >
              <Minus className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            </div>
          </div>
        )}
      </div>

      {/* EDITOR */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
  
}
