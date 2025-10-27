"use client";

import { useState } from 'react';
import React from "react";
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  X,
  Save,
  FileText,
  Tag,
  User,
  ChevronRight,
  List,
  Heading,
  Code,
  CheckSquare,
  Link as LinkIcon,
  Bold,
  Italic
} from 'lucide-react';

type WikiPage = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  author: string;
  createdAt: Date;
  updatedAt: Date;
  published: boolean;
};

export default function Wiki() {
  const [pages, setPages] = useState<WikiPage[]>([
    {
      id: '1',
      title: 'Bem-vindo ao Arc.',
      content: `# Bem-vindo ao Arc.

Arc. é uma plataforma de gerenciamento de projetos moderna e flexível.

## Recursos Principais

- **Templates Variados**: Escolha entre diversos templates
- **Analytics**: Acompanhe métricas importantes
- **Workspaces**: Organize seus projetos
- **Colaboração**: Trabalhe em equipe

## Como Começar

1. Crie um novo workspace
2. Escolha um template
3. Comece a organizar suas tarefas

Para mais informações, consulte as outras páginas da Wiki.`,
      tags: ['introdução', 'guia'],
      author: 'Admin',
      createdAt: new Date(2025, 0, 1),
      updatedAt: new Date(2025, 0, 15),
      published: true,
    },
    {
      id: '2',
      title: 'Guia de Templates',
      content: `# Guia de Templates

## Templates Disponíveis

### Kanban Board
Organize tarefas em colunas (To Do, In Progress, Done)

### Sprint Board
Gerencie sprints ágeis com métricas e burndown

### Calendar
Visualize eventos e prazos em calendário

### Mind Map
Crie mapas mentais para brainstorming

### Wiki
Documente seu projeto (você está aqui!)

Cada template pode ser customizado conforme suas necessidades.`,
      tags: ['templates', 'guia'],
      author: 'Admin',
      createdAt: new Date(2025, 0, 5),
      updatedAt: new Date(2025, 0, 10),
      published: true,
    },
  ]);

  const [selectedPage, setSelectedPage] = useState<WikiPage | null>(pages[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPage, setEditingPage] = useState<WikiPage | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    published: true,
  });

  const allTags = Array.from(new Set(pages.flatMap(p => p.tags)));

  const filteredPages = pages.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         page.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = filterTag === 'all' || page.tags.includes(filterTag);
    return matchesSearch && matchesTag;
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  // Renderizar markdown
  const renderMarkdown = (content: string) => {
    const lines = content.split('\n');
   const elements: React.ReactElement[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let inList = false;
    let listItems: string[] = [];

    lines.forEach((line, i) => {
      // Code blocks
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre key={`code-${i}`} className="bg-gray-100 dark:bg-slate-800 p-4 rounded-lg overflow-x-auto my-4">
              <code className="text-sm text-gray-800 dark:text-gray-200">
                {codeBlockContent.join('\n')}
              </code>
            </pre>
          );
          codeBlockContent = [];
        }
        inCodeBlock = !inCodeBlock;
        return;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        return;
      }

      // Lists
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        if (!inList) {
          inList = true;
          listItems = [];
        }
        listItems.push(line.trim().substring(2));
        return;
      } else if (inList) {
        elements.push(
          <ul key={`list-${i}`} className="list-disc list-inside space-y-1 my-4">
            {listItems.map((item, idx) => (
              <li key={idx} className="text-gray-700 dark:text-gray-300">
                {renderInlineMarkdown(item)}
              </li>
            ))}
          </ul>
        );
        inList = false;
        listItems = [];
      }

      // Headings
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={i} className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4 border-b-2 border-gray-200 dark:border-slate-700 pb-2">
            {line.substring(2)}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={i} className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-6 mb-3">
            {line.substring(3)}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={i} className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-5 mb-2">
            {line.substring(4)}
          </h3>
        );
      } else if (line.trim() === '') {
        elements.push(<div key={i} className="h-4"></div>);
      } else if (!inList) {
        elements.push(
          <p key={i} className="text-gray-700 dark:text-gray-300 leading-relaxed my-2">
            {renderInlineMarkdown(line)}
          </p>
        );
      }
    });

    // Flush remaining list items
    if (inList) {
      elements.push(
        <ul key={`list-final`} className="list-disc list-inside space-y-1 my-4">
          {listItems.map((item, idx) => (
            <li key={idx} className="text-gray-700 dark:text-gray-300">
              {renderInlineMarkdown(item)}
            </li>
          ))}
        </ul>
      );
    }

    return elements;
  };

  // Inline markdown (bold, italic, code)
  const renderInlineMarkdown = (text: string) => {
    const parts = [];
    let currentText = text;
    let key = 0;

    // Bold
    const boldRegex = /\*\*(.*?)\*\*/g;
    let match;
    let lastIndex = 0;

    while ((match = boldRegex.exec(currentText)) !== null) {
      if (match.index > lastIndex) {
        parts.push(currentText.substring(lastIndex, match.index));
      }
      parts.push(<strong key={`bold-${key++}`} className="font-bold text-gray-900 dark:text-gray-100">{match[1]}</strong>);
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < currentText.length) {
      parts.push(currentText.substring(lastIndex));
    }

    if (parts.length === 0) {
      return text;
    }

    return <>{parts}</>;
  };

  // Modal functions
  const openModal = (page?: WikiPage) => {
    if (page) {
      setEditingPage(page);
      setFormData({
        title: page.title,
        content: page.content,
        tags: page.tags.join(', '),
        published: page.published,
      });
    } else {
      setEditingPage(null);
      setFormData({
        title: '',
        content: '',
        tags: '',
        published: true,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPage(null);
  };

  const savePage = () => {
    if (!formData.title.trim()) return;

    const pageData: WikiPage = {
      id: editingPage?.id || `${Date.now()}`,
      title: formData.title,
      content: formData.content,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
      author: editingPage?.author || 'Você',
      createdAt: editingPage?.createdAt || new Date(),
      updatedAt: new Date(),
      published: formData.published,
    };

    if (editingPage) {
      setPages(pages.map(p => p.id === editingPage.id ? pageData : p));
      if (selectedPage?.id === editingPage.id) {
        setSelectedPage(pageData);
      }
    } else {
      setPages([...pages, pageData]);
      setSelectedPage(pageData);
    }

    closeModal();
  };

  const deletePage = (id: string) => {
    if (confirm('Deletar esta página da wiki?')) {
      setPages(pages.filter(p => p.id !== id));
      if (selectedPage?.id === id) {
        setSelectedPage(pages.find(p => p.id !== id) || null);
      }
    }
  };

  const togglePublished = (id: string) => {
    setPages(pages.map(p =>
      p.id === id ? { ...p, published: !p.published, updatedAt: new Date() } : p
    ));
    if (selectedPage?.id === id) {
      setSelectedPage({ ...selectedPage, published: !selectedPage.published });
    }
  };

  // Insert markdown helper
  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = document.getElementById('wiki-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end);
    const newText = formData.content.substring(0, start) + before + selectedText + after + formData.content.substring(end);

    setFormData({ ...formData, content: newText });
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-slate-950 overflow-hidden flex">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="text-blue-600 dark:text-blue-400" size={24} />
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Wiki do Projeto</h2>
          </div>

          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar páginas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas as tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-auto p-2">
          {filteredPages.length === 0 ? (
            <div className="text-center py-8 px-4">
              <FileText className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {searchQuery || filterTag !== 'all' ? 'Nenhuma página encontrada' : 'Nenhuma página ainda'}
              </p>
            </div>
          ) : (
            filteredPages.map(page => (
              <button
                key={page.id}
                onClick={() => setSelectedPage(page)}
                className={`w-full text-left p-3 rounded-lg mb-2 transition-all group ${
                  selectedPage?.id === page.id
                    ? 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-500'
                    : 'bg-gray-50 dark:bg-slate-800 border-2 border-transparent hover:border-gray-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm flex-1">
                    {page.title}
                  </h3>
                  <div className="flex items-center gap-1">
                    {!page.published ? (
                      <EyeOff size={14} className="text-gray-400" />
                    ) : (
                      <Eye size={14} className="text-green-500" />
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Clock size={12} />
                  <span>{formatDate(page.updatedAt)}</span>
                </div>
                {page.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {page.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                    {page.tags.length > 3 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        +{page.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </button>
            ))
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-slate-800">
          <button
            onClick={() => openModal()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition font-medium"
          >
            <Plus size={18} />
            Nova Página
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {selectedPage ? (
          <div className="max-w-4xl mx-auto p-6 md:p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {selectedPage.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <User size={14} />
                    <span>{selectedPage.author}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} />
                    <span>Atualizado em {formatDate(selectedPage.updatedAt)}</span>
                  </div>
                  <span>•</span>
                  {selectedPage.published ? (
                    <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                      <Eye size={14} />
                      Publicado
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-yellow-600 dark:text-yellow-400">
                      <EyeOff size={14} />
                      Rascunho
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePublished(selectedPage.id)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
                  title={selectedPage.published ? 'Tornar rascunho' : 'Publicar'}
                >
                  {selectedPage.published ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <button
                  onClick={() => openModal(selectedPage)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
                  title="Editar"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => deletePage(selectedPage.id)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                  title="Deletar"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {selectedPage.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6 pb-6 border-b border-gray-200 dark:border-slate-800">
                {selectedPage.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
                  >
                    <Tag size={12} />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="prose prose-gray dark:prose-invert max-w-none">
              {renderMarkdown(selectedPage.content)}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Selecione uma página
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Escolha uma página na barra lateral ou crie uma nova
            </p>
          </div>
        )}
      </div>

      {/* Modal Editor */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-800 w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {editingPage ? 'Editar Página' : 'Nova Página'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Título da página"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Conteúdo (Markdown)
                    </label>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => insertMarkdown('**', '**')}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition"
                        title="Negrito"
                      >
                        <Bold size={16} className="text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={() => insertMarkdown('*', '*')}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition"
                        title="Itálico"
                      >
                        <Italic size={16} className="text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={() => insertMarkdown('## ', '')}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition"
                        title="Título"
                      >
                        <Heading size={16} className="text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={() => insertMarkdown('- ', '')}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition"
                        title="Lista"
                      >
                        <List size={16} className="text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={() => insertMarkdown('```\n', '\n```')}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition"
                        title="Código"
                      >
                        <Code size={16} className="text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                  </div>
                  <textarea
                    id="wiki-editor"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={15}
                    placeholder="Digite o conteúdo da página usando Markdown..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Suporta Markdown: **negrito**, *itálico*, ## títulos, - listas, ```código```
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tags
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="tag1, tag2, tag3"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Separe as tags com vírgula
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <label className="flex items-center gap-3 px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.published}
                        onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Publicar página
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={savePage}
                disabled={!formData.title.trim()}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save size={18} />
                {editingPage ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
