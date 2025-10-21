"use client";

import { useState } from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, Code,
  Heading1, Heading2, Heading3, List, ListOrdered, Quote,
  Link2, Image, Download, Copy, Check, MoreVertical, X
} from 'lucide-react';

export default function BlankTemplate() {
  const [content, setContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.6);

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

  const toolbarButtons = [
    { icon: Bold, title: 'Negrito', action: () => insertFormatting('**', '**') },
    { icon: Italic, title: 'Itálico', action: () => insertFormatting('*', '*') },
    { icon: Underline, title: 'Sublinhado', action: () => insertFormatting('_', '_') },
    { icon: Strikethrough, title: 'Tachado', action: () => insertFormatting('~~', '~~') },
    { icon: Code, title: 'Código', action: () => insertFormatting('`', '`') },
    { icon: Heading1, title: 'H1', action: () => insertFormatting('# ', '') },
    { icon: Heading2, title: 'H2', action: () => insertFormatting('## ', '') },
    { icon: Heading3, title: 'H3', action: () => insertFormatting('### ', '') },
    { icon: List, title: 'Lista', action: () => insertFormatting('- ', '') },
    { icon: ListOrdered, title: 'Lista numerada', action: () => insertFormatting('1. ', '') },
    { icon: Quote, title: 'Citação', action: () => insertFormatting('> ', '') },
    { icon: Link2, title: 'Link', action: () => insertFormatting('[', '](url)') },
    { icon: Image, title: 'Imagem', action: () => insertFormatting('![alt](', ')') },
  ];

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-slate-900">
      {/* Toolbar */}
      {showToolbar && (
        <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shadow-sm">
          <div className="flex flex-col">
            {/* Main toolbar */}
            <div className="flex items-center gap-1 p-3 md:p-4 overflow-x-auto">
              {toolbarButtons.map((btn, i) => {
                const Icon = btn.icon;
                return (
                  <button
                    key={i}
                    onClick={btn.action}
                    className="p-2 md:p-2.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition flex-shrink-0 group"
                    title={btn.title}
                  >
                    <Icon className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100" />
                  </button>
                );
              })}
              
              <div className="w-px h-6 bg-gray-200 dark:bg-slate-700 mx-1 flex-shrink-0"></div>

              {/* Controls */}
              <button
                onClick={copyToClipboard}
                className="p-2 md:p-2.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition flex-shrink-0 group"
                title="Copiar"
              >
                {copied ? (
                  <Check className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100" />
                )}
              </button>

              <button
                onClick={downloadAsText}
                className="p-2 md:p-2.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition flex-shrink-0 group"
                title="Baixar"
              >
                <Download className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100" />
              </button>

              <div className="w-px h-6 bg-gray-200 dark:bg-slate-700 mx-1 flex-shrink-0"></div>

              {/* Settings - Desktop only */}
              <div className="hidden md:flex items-center gap-2 ml-auto pl-2">
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="px-2 py-1.5 text-sm bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={12}>12px</option>
                  <option value={14}>14px</option>
                  <option value={16}>16px</option>
                  <option value={18}>18px</option>
                  <option value={20}>20px</option>
                  <option value={24}>24px</option>
                </select>

                <select
                  value={lineHeight}
                  onChange={(e) => setLineHeight(Number(e.target.value))}
                  className="px-2 py-1.5 text-sm bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1.4}>Compacto</option>
                  <option value={1.6}>Normal</option>
                  <option value={1.8}>Confortável</option>
                  <option value={2.0}>Espaçoso</option>
                </select>
              </div>

              <button
                onClick={() => setShowToolbar(false)}
                className="p-2 md:p-2.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition flex-shrink-0 ml-auto md:ml-0"
                title="Ocultar toolbar"
              >
                <X className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Mobile controls */}
            <div className="md:hidden flex items-center justify-between px-3 py-2 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
              <select
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded text-gray-700 dark:text-gray-300 focus:outline-none"
              >
                <option value={12}>12px</option>
                <option value={14}>14px</option>
                <option value={16}>16px</option>
                <option value={18}>18px</option>
                <option value={20}>20px</option>
              </select>

              <select
                value={lineHeight}
                onChange={(e) => setLineHeight(Number(e.target.value))}
                className="px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded text-gray-700 dark:text-gray-300 focus:outline-none"
              >
                <option value={1.4}>Compacto</option>
                <option value={1.6}>Normal</option>
                <option value={1.8}>Confortável</option>
                <option value={2.0}>Espaçoso</option>
              </select>
            </div>

            {/* Stats */}
            <div className="px-3 md:px-4 py-2 bg-gray-50 dark:bg-slate-950 border-t border-gray-200 dark:border-slate-700 text-xs text-gray-600 dark:text-gray-400 flex items-center gap-4 overflow-x-auto">
              <span className="flex-shrink-0">
                <span className="font-semibold text-gray-900 dark:text-gray-100">{wordCount}</span>
                <span className="ml-1">palavras</span>
              </span>
              <span className="text-gray-300 dark:text-slate-700">•</span>
              <span className="flex-shrink-0">
                <span className="font-semibold text-gray-900 dark:text-gray-100">{charCount}</span>
                <span className="ml-1">caracteres</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Show toolbar button when hidden */}
      {!showToolbar && (
        <button
          onClick={() => setShowToolbar(true)}
          className="absolute top-4 left-4 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition z-20"
          title="Mostrar toolbar"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      )}

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Comece a escrever aqui...

Use a barra de ferramentas acima para formatar seu texto com Markdown. Você pode usar **negrito**, *itálico*, `código` e muito mais.

Pressione Ctrl+B para negrito, Ctrl+I para itálico ou use os botões acima!"
          className="w-full h-full p-6 md:p-8 lg:p-12 text-gray-900 dark:text-gray-50 bg-white dark:bg-slate-900 border-none outline-none resize-none placeholder-gray-400 dark:placeholder-gray-500 focus:ring-0"
          style={{ 
            fontSize: `${fontSize}px`,
            lineHeight: `${lineHeight}`,
            fontFamily: 'ui-monospace, "Monaco", "Menlo", "Ubuntu Mono", monospace'
          }}
          spellCheck="true"
        />
      </div>
    </div>
  );
}