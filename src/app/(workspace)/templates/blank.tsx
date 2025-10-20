"use client";

import { useState } from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, Code, Link2,
  List, ListOrdered, Quote, Image, AlignLeft, AlignCenter, 
  AlignRight, Maximize2, Minimize2, Type, Heading1, Heading2, 
  Heading3, Download, Copy, Check, MoreHorizontal, Palette
} from 'lucide-react';

export default function BlankTemplate() {
  const [content, setContent] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.8);
  const [copied, setCopied] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  const insertFormatting = (before: string, after: string = '') => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);
    setContent(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAsText = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'documento.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const wordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length;
  const charCount = content.length;
  const lineCount = content.split('\n').length;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-slate-950' : 'h-full'} flex flex-col`}>
      {/* Enhanced Toolbar */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-sm">
        <div className="px-6 py-3 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1 flex-wrap">
            {/* Text Formatting */}
            <div className="flex items-center gap-0.5 pr-2 border-r border-gray-200 dark:border-slate-700">
              <button
                onClick={() => insertFormatting('**', '**')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition group"
                title="Negrito (Ctrl+B)"
              >
                <Bold className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100" />
              </button>
              <button
                onClick={() => insertFormatting('*', '*')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition group"
                title="Itálico (Ctrl+I)"
              >
                <Italic className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100" />
              </button>
              <button
                onClick={() => insertFormatting('_', '_')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition group"
                title="Sublinhado"
              >
                <Underline className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100" />
              </button>
              <button
                onClick={() => insertFormatting('~~', '~~')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition group"
                title="Tachado"
              >
                <Strikethrough className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100" />
              </button>
              <button
                onClick={() => insertFormatting('`', '`')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition group"
                title="Código"
              >
                <Code className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100" />
              </button>
            </div>

            {/* Headings */}
            <div className="flex items-center gap-0.5 pr-2 border-r border-gray-200 dark:border-slate-700">
              <button
                onClick={() => insertFormatting('# ', '')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition group"
                title="Título 1"
              >
                <Heading1 className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100" />
              </button>
              <button
                onClick={() => insertFormatting('## ', '')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition group"
                title="Título 2"
              >
                <Heading2 className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100" />
              </button>
              <button
                onClick={() => insertFormatting('### ', '')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition group"
                title="Título 3"
              >
                <Heading3 className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100" />
              </button>
            </div>

            {/* Lists & Quotes */}
            <div className="flex items-center gap-0.5 pr-2 border-r border-gray-200 dark:border-slate-700">
              <button
                onClick={() => insertFormatting('- ', '')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition group"
                title="Lista"
              >
                <List className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100" />
              </button>
              <button
                onClick={() => insertFormatting('1. ', '')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition group"
                title="Lista numerada"
              >
                <ListOrdered className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100" />
              </button>
              <button
                onClick={() => insertFormatting('> ', '')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition group"
                title="Citação"
              >
                <Quote className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100" />
              </button>
            </div>

            {/* Insert */}
            <div className="flex items-center gap-0.5 pr-2 border-r border-gray-200 dark:border-slate-700">
              <button
                onClick={() => insertFormatting('[', '](url)')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition group"
                title="Link"
              >
                <Link2 className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100" />
              </button>
              <button
                onClick={() => insertFormatting('![alt](', ')')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition group"
                title="Imagem"
              >
                <Image className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100" />
              </button>
            </div>

            {/* Font Size */}
            <div className="flex items-center gap-2 px-2 border-r border-gray-200 dark:border-slate-700">
              <Type className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <select
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="px-2 py-1 text-sm bg-transparent border border-gray-200 dark:border-slate-800 rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
              >
                <option value={12}>Muito Pequeno</option>
                <option value={14}>Pequeno</option>
                <option value={16}>Normal</option>
                <option value={18}>Grande</option>
                <option value={20}>Muito Grande</option>
                <option value={24}>Enorme</option>
              </select>
            </div>

            {/* Line Height */}
            <div className="flex items-center gap-2 px-2">
              <select
                value={lineHeight}
                onChange={(e) => setLineHeight(Number(e.target.value))}
                className="px-2 py-1 text-sm bg-transparent border border-gray-200 dark:border-slate-800 rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
              >
                <option value={1.4}>Compacto</option>
                <option value={1.6}>Confortável</option>
                <option value={1.8}>Normal</option>
                <option value={2.0}>Espaçoso</option>
                <option value={2.4}>Muito Espaçoso</option>
              </select>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
              title="Copiar texto"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-green-600 font-medium">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">Copiar</span>
                </>
              )}
            </button>

            <button
              onClick={downloadAsText}
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
              title="Baixar como .txt"
            >
              <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400 hidden md:inline">Baixar</span>
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
              title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              ) : (
                <Maximize2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="px-6 py-2 border-t border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1.5">
                <span className="font-semibold text-gray-900 dark:text-gray-100">{wordCount}</span>
                <span>palavras</span>
              </span>
              <span className="text-gray-300 dark:text-slate-700">•</span>
              <span className="flex items-center gap-1.5">
                <span className="font-semibold text-gray-900 dark:text-gray-100">{charCount}</span>
                <span>caracteres</span>
              </span>
              <span className="text-gray-300 dark:text-slate-700">•</span>
              <span className="flex items-center gap-1.5">
                <span className="font-semibold text-gray-900 dark:text-gray-100">{lineCount}</span>
                <span>linhas</span>
              </span>
              <span className="text-gray-300 dark:text-slate-700">•</span>
              <span className="flex items-center gap-1.5">
                <span className="font-semibold text-gray-900 dark:text-gray-100">{readingTime}</span>
                <span>min de leitura</span>
              </span>
            </div>
            <div className="text-gray-500 dark:text-gray-400">
              Suporte a Markdown
            </div>
          </div>
        </div>
      </div>

      {/* Writing Area */}
      <div className="flex-1 overflow-hidden bg-white dark:bg-slate-950">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="# Comece a escrever...

Digite livremente ou use a barra de ferramentas acima para formatar seu texto.

**Dica:** Use Markdown para uma formatação rápida e eficiente."
          className="w-full h-full px-12 py-8 text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-950 border-none outline-none resize-none placeholder-gray-400 dark:placeholder-gray-600"
          style={{ 
            fontSize: `${fontSize}px`,
            lineHeight: `${lineHeight}`,
            fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif'
          }}
          spellCheck="true"
        />
      </div>
    </div>
  );
}