"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  Search, Home, Star, ChevronRight, ChevronDown, Plus, 
  Settings, Menu, X, Bell, User, LogOut, HelpCircle, 
  Folder, MoreVertical, Sparkles, Edit2, Trash2, GripVertical
} from 'lucide-react';
import ThemeToggle from '@/shared/components/ui/ThemeToggle';
import { useWorkspaceStore } from '@/core/store/workspaceStore';
import { TemplateType, GROUP_PRESETS, GroupPreset } from '@/core/types/workspace.types';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Componente de Página Arrastável
function SortablePage({ page, groupId, pathname }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id });

  const { renamePage, deletePage, togglePageFavorite } = useWorkspaceStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(page.name);
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleRename = () => {
    if (editName.trim() && editName !== page.name) {
      renamePage(groupId, page.id, editName);
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm(`Excluir "${page.name}"?`)) {
      deletePage(groupId, page.id);
      if (pathname.includes(page.id)) {
        router.push('/workspace');
      }
    }
    setShowMenu(false);
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group/page">
      {isEditing ? (
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={handleRename}
          onKeyPress={(e) => e.key === 'Enter' && handleRename()}
          autoFocus
          className="w-full px-3 py-1.5 text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      ) : (
        <Link
          href={`/workspace/group/${groupId}/page/${page.id}`}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition ${
            pathname.includes(page.id)
              ? 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-gray-100'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
          }`}
        >
          <div
            {...listeners}
            {...attributes}
            className="cursor-grab active:cursor-grabbing opacity-0 group-hover/page:opacity-100 transition"
          >
            <GripVertical className="w-3.5 h-3.5 text-gray-400" />
          </div>
          <span className="text-base flex-shrink-0">{page.icon}</span>
          <span className="truncate flex-1">{page.name}</span>
          
          <div className="flex items-center gap-0.5 opacity-0 group-hover/page:opacity-100 transition">
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowMenu(!showMenu);
              }}
              className="p-0.5 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
          </div>
        </Link>
      )}

      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}></div>
          <div className="absolute right-0 top-8 mt-1 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 py-1 z-50">
            <button
              onClick={() => {
                setIsEditing(true);
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Renomear</span>
            </button>
            <button
              onClick={() => {
                togglePageFavorite(groupId, page.id);
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
            >
              <Star className={`w-3.5 h-3.5 ${page.favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
              <span>{page.favorite ? 'Remover favorito' : 'Adicionar favorito'}</span>
            </button>
            <div className="border-t border-gray-200 dark:border-slate-700 my-1"></div>
            <button
              onClick={handleDelete}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Excluir</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  // Modals
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showPageModal, setShowPageModal] = useState<string | null>(null);
  
  // Group creation
  const [selectedPreset, setSelectedPreset] = useState<GroupPreset | null>(null);
  const [customGroupName, setCustomGroupName] = useState('');
  
  // Page creation
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [newPageName, setNewPageName] = useState('');

  // Drag and Drop
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editGroupName, setEditGroupName] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Store
  const { 
    workspace, 
    initializeWorkspace, 
    addGroup,
    addGroupFromPreset,
    addPage,
    renameGroup,
    deleteGroup,
    toggleGroupExpanded,
    reorderPages,
    getFavoritePages,
    searchPages
  } = useWorkspaceStore();

  useEffect(() => {
    if (!workspace) {
      initializeWorkspace('Meu Workspace', 'user_123');
    }
  }, [workspace, initializeWorkspace]);

  // Busca
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchPages(searchQuery);
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchQuery, searchPages]);

  const favoritePages = getFavoritePages();

  const pageTemplates = [
    { id: 'blank', name: 'Documento', description: 'Página em branco', icon: '📝', color: 'from-gray-50 to-slate-50 border-gray-200' },
    { id: 'tasks', name: 'Tarefas', description: 'Lista de tarefas', icon: '✅', color: 'from-blue-50 to-sky-50 border-blue-200' },
    { id: 'kanban', name: 'Quadro Kanban', description: 'Colunas visuais', icon: '📋', color: 'from-purple-50 to-violet-50 border-purple-200' },
    { id: 'table', name: 'Planilha', description: 'Tabela editável', icon: '📊', color: 'from-green-50 to-emerald-50 border-green-200' },
    { id: 'calendar', name: 'Calendário', description: 'Eventos e compromissos', icon: '📅', color: 'from-red-50 to-rose-50 border-red-200' },
    { id: 'projects', name: 'Projetos', description: 'Múltiplos projetos', icon: '🎯', color: 'from-orange-50 to-amber-50 border-orange-200' },
    { id: 'bugs', name: 'Rastreador de Bugs', description: 'Bugs e problemas', icon: '🐛', color: 'from-pink-50 to-rose-50 border-pink-200' },
    { id: 'study', name: 'Estudos', description: 'Materiais de estudo', icon: '📚', color: 'from-indigo-50 to-blue-50 border-indigo-200' },
    { id: 'budget', name: 'Orçamento', description: 'Receitas e despesas', icon: '💰', color: 'from-yellow-50 to-amber-50 border-yellow-200' },
    { id: 'sprint', name: 'Sprint Planning', description: 'Sprints ágeis', icon: '🏃', color: 'from-teal-50 to-cyan-50 border-teal-200' },
  ];

  const handleCreateGroup = () => {
    if (selectedPreset) {
      if (selectedPreset.id === 'blank') {
        if (!customGroupName.trim()) return;
        addGroup(customGroupName);
      } else {
        addGroupFromPreset(selectedPreset);
      }
    }
    
    setShowGroupModal(false);
    setSelectedPreset(null);
    setCustomGroupName('');
  };

  const handleSelectPreset = (preset: GroupPreset) => {
    setSelectedPreset(preset);
    if (preset.id !== 'blank') {
      setCustomGroupName(preset.name);
    }
  };

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handleCreatePage = () => {
    if (!showPageModal || !selectedTemplate || !newPageName.trim()) return;
    
    const pageId = addPage(showPageModal, newPageName, selectedTemplate as TemplateType);
    
    setNewPageName('');
    setSelectedTemplate(null);
    setShowPageModal(null);
    
    if (pageId) {
      router.push(`/workspace/group/${showPageModal}/page/${pageId}`);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activePageId = active.id as string;
      const overPageId = over.id as string;

      workspace?.groups.forEach((group) => {
        const activeIndex = group.pages.findIndex(p => p.id === activePageId);
        const overIndex = group.pages.findIndex(p => p.id === overPageId);

        if (activeIndex !== -1 && overIndex !== -1) {
          reorderPages(group.id, activeIndex, overIndex);
        }
      });
    }

    setActiveId(null);
  };

  const handleRenameGroup = (groupId: string) => {
    if (editGroupName.trim() && editGroupName !== workspace?.groups.find(g => g.id === groupId)?.name) {
      renameGroup(groupId, editGroupName);
    }
    setEditingGroupId(null);
  };

  const handleDeleteGroup = (groupId: string, groupName: string) => {
    if (confirm(`Excluir o grupo "${groupName}" e todas as suas páginas?`)) {
      deleteGroup(groupId);
    }
  };

  const closePageModal = () => {
    setShowPageModal(null);
    setSelectedTemplate(null);
    setNewPageName('');
  };

  const closeGroupModal = () => {
    setShowGroupModal(false);
    setSelectedPreset(null);
    setCustomGroupName('');
  };

  const selectedTemplateData = pageTemplates.find(t => t.id === selectedTemplate);

  const getPresetColor = (color: string) => {
    const colors: Record<string, string> = {
      gray: 'from-gray-50 to-slate-50 border-gray-200',
      blue: 'from-blue-50 to-sky-50 border-blue-200',
      purple: 'from-purple-50 to-violet-50 border-purple-200',
      green: 'from-green-50 to-emerald-50 border-green-200',
      indigo: 'from-indigo-50 to-blue-50 border-indigo-200',
      orange: 'from-orange-50 to-amber-50 border-orange-200',
      pink: 'from-pink-50 to-rose-50 border-pink-200',
      red: 'from-red-50 to-rose-50 border-red-200',
      yellow: 'from-yellow-50 to-amber-50 border-yellow-200',
    };
    return colors[color] || colors.gray;
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="min-h-screen bg-white dark:bg-slate-900 flex">
          {/* Sidebar */}
          <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex-shrink-0 transition-all duration-200 overflow-hidden flex flex-col`}>
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <Link href="/workspace" className="flex items-center gap-3 flex-1 group">
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-gray-700 dark:from-slate-700 dark:to-slate-600 rounded-lg flex items-center justify-center shadow-sm">
                    <Folder className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition">
                    {workspace?.name || 'Workspace'}
                  </span>
                </Link>
                <button 
                  onClick={() => setSidebarOpen(false)} 
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition lg:hidden"
                >
                  <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition"
                  >
                    <X className="w-3 h-3 text-gray-400" />
                  </button>
                )}

                {/* Search Results */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg max-h-64 overflow-y-auto z-50">
                    {searchResults.map(({ group, page }) => (
                      <Link
                        key={page.id}
                        href={`/workspace/group/${group.id}/page/${page.id}`}
                        onClick={() => {
                          setSearchQuery('');
                          setShowSearchResults(false);
                        }}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                      >
                        <span className="text-lg">{page.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {page.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {group.icon} {group.name}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {showSearchResults && searchResults.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg p-4 text-center text-sm text-gray-500 dark:text-gray-400 z-50">
                    Nenhuma página encontrada
                  </div>
                )}
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto p-3">
              {/* Home */}
              <Link 
                href="/workspace" 
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  pathname === '/workspace' 
                    ? 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-gray-100' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Início</span>
              </Link>

              {/* Favoritos */}
              {favoritePages.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <Star className="w-3.5 h-3.5" />
                    <span>Favoritos</span>
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {favoritePages.map(({ group, page }) => (
                      <Link 
                        key={page.id}
                        href={`/workspace/group/${group.id}/page/${page.id}`}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                          pathname.includes(page.id)
                            ? 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-gray-100' 
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="text-base">{page.icon}</span>
                        <span className="truncate flex-1">{page.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Grupos */}
              <div className="mt-6">
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Grupos
                  </span>
                  <button
                    onClick={() => setShowGroupModal(true)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition"
                    title="Novo grupo"
                  >
                    <Plus className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>

                <div className="mt-1 space-y-1">
                  {workspace?.groups.map((group) => (
                    <div key={group.id}>
                      {/* Group Header */}
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition group/item">
                        {editingGroupId === group.id ? (
                          <input
                            type="text"
                            value={editGroupName}
                            onChange={(e) => setEditGroupName(e.target.value)}
                            onBlur={() => handleRenameGroup(group.id)}
                            onKeyPress={(e) => e.key === 'Enter' && handleRenameGroup(group.id)}
                            autoFocus
                            className="flex-1 px-2 py-1 text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <>
                            <button
                              onClick={() => toggleGroupExpanded(group.id)}
                              className="flex items-center gap-2 flex-1 min-w-0 text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                              <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform ${group.expanded ? 'rotate-90' : ''}`} />
                              <span className="text-base flex-shrink-0">{group.icon}</span>
                              <span className="truncate">{group.name}</span>
                            </button>
                            
                            <div className="flex items-center gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
                              <button
                                onClick={() => setShowPageModal(group.id)}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition"
                                title="Nova página"
                              >
                                <Plus className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingGroupId(group.id);
                                  setEditGroupName(group.name);
                                }}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition"
                                title="Renomear"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                              </button>
                              <button
                                onClick={() => handleDeleteGroup(group.id, group.name)}
                                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition"
                                title="Excluir"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Group Pages */}
                      {group.expanded && (
                        <div className="ml-6 mt-0.5 space-y-0.5">
                          <SortableContext items={group.pages.map(p => p.id)} strategy={verticalListSortingStrategy}>
                            {group.pages.map((page) => (
                              <SortablePage
                                key={page.id}
                                page={page}
                                groupId={group.id}
                                pathname={pathname}
                              />
                            ))}
                          </SortableContext>
                          
                          {group.pages.length === 0 && (
                            <button
                              onClick={() => setShowPageModal(group.id)}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Adicionar página</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {workspace?.groups.length === 0 && (
                    <button
                      onClick={() => setShowGroupModal(true)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-6 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-slate-700 hover:text-gray-700 dark:hover:text-gray-300 transition"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Criar primeiro grupo</span>
                    </button>
                  )}
                </div>
              </div>
            </nav>

            {/* Sidebar Footer */}
            <div className="p-3 border-t border-gray-200 dark:border-slate-800">
              <Link 
                href="/workspace/settings" 
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
              >
                <Settings className="w-4 h-4" />
                <span>Configurações</span>
              </Link>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Top Bar */}
            <header className="h-14 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-6 bg-white dark:bg-slate-900 sticky top-0 z-40">
              <button 
                onClick={() => setSidebarOpen(true)} 
                className={`p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition ${sidebarOpen ? 'hidden' : 'block'}`}
              >
                <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>

              <div className="flex items-center gap-2 ml-auto">
                <ThemeToggle />
                
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition">
                  <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>

                <div className="h-5 w-px bg-gray-200 dark:bg-slate-800 mx-1"></div>

                <div className="relative">
                  <button 
                    onClick={() => setShowProfileMenu(!showProfileMenu)} 
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
                  >
                    <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                      U
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400 hidden sm:block" />
                  </button>

                  {showProfileMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)}></div>
                      <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-200 dark:border-slate-800 py-2 z-50">
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-800">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold">
                              U
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">Usuário</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 truncate">usuario@email.com</div>
                            </div>
                          </div>
                        </div>

                        <div className="py-2">
                          <Link 
                            href="/profile" 
                            onClick={() => setShowProfileMenu(false)} 
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                          >
                            <User className="w-4 h-4" />
                            <span>Perfil</span>
                          </Link>
                          <Link 
                            href="/workspace/settings" 
                            onClick={() => setShowProfileMenu(false)} 
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                          >
                            <Settings className="w-4 h-4" />
                            <span>Configurações</span>
                          </Link>
                          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                            <HelpCircle className="w-4 h-4" />
                            <span>Ajuda</span>
                          </button>
                        </div>

                        <div className="border-t border-gray-200 dark:border-slate-800 pt-2">
                          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                            <LogOut className="w-4 h-4" />
                            <span>Sair</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </header>

            <main className="flex-1 overflow-auto bg-gray-50 dark:bg-slate-950">
              {children}
            </main>
          </div>
        </div>

        <DragOverlay>
          {activeId ? (
            <div className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg shadow-lg">
              <span className="text-sm text-gray-900 dark:text-gray-100">Arrastando...</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Modal: Criar Grupo com Presets */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 dark:border-slate-800">
            <div className="p-6 border-b border-gray-200 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {!selectedPreset ? 'Criar Novo Grupo' : selectedPreset.id === 'blank' ? 'Grupo Personalizado' : selectedPreset.name}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {!selectedPreset 
                      ? 'Escolha um template ou crie do zero'
                      : selectedPreset.description
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {!selectedPreset ? (
                <div>
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
                      📚 Para Estudos
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {GROUP_PRESETS.filter(p => p.category === 'study').map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => handleSelectPreset(preset)}
                          className={`p-5 bg-gradient-to-br ${getPresetColor(preset.color)} border-2 rounded-xl hover:shadow-lg transition text-left`}
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <span className="text-3xl">{preset.icon}</span>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                {preset.name}
                              </h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                                {preset.description}
                              </p>
                            </div>
                          </div>
                          {preset.pages.length > 0 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {preset.pages.length} página{preset.pages.length !== 1 ? 's' : ''}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
                      💼 Para Trabalho
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {GROUP_PRESETS.filter(p => p.category === 'work').map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => handleSelectPreset(preset)}
                          className={`p-5 bg-gradient-to-br ${getPresetColor(preset.color)} border-2 rounded-xl hover:shadow-lg transition text-left`}
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <span className="text-3xl">{preset.icon}</span>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                {preset.name}
                              </h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                                {preset.description}
                              </p>
                            </div>
                          </div>
                          {preset.pages.length > 0 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {preset.pages.length} página{preset.pages.length !== 1 ? 's' : ''}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
                      🎯 Pessoal
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {GROUP_PRESETS.filter(p => p.category === 'personal').map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => handleSelectPreset(preset)}
                          className={`p-5 bg-gradient-to-br ${getPresetColor(preset.color)} border-2 rounded-xl hover:shadow-lg transition text-left`}
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <span className="text-3xl">{preset.icon}</span>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                {preset.name}
                              </h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                                {preset.description}
                              </p>
                            </div>
                          </div>
                          {preset.pages.length > 0 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {preset.pages.length} página{preset.pages.length !== 1 ? 's' : ''}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className={`p-6 bg-gradient-to-br ${getPresetColor(selectedPreset.color)} border-2 rounded-xl mb-6`}>
                    <div className="flex items-start gap-4">
                      <span className="text-5xl">{selectedPreset.icon}</span>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                          {selectedPreset.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          {selectedPreset.description}
                        </p>
                        {selectedPreset.pages.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {selectedPreset.pages.map((page, idx) => (
                              <div key={idx} className="px-3 py-1 bg-white/50 dark:bg-slate-900/50 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700">
                                {page.name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedPreset.id === 'blank' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nome do grupo
                      </label>
                      <input
                        type="text"
                        value={customGroupName}
                        onChange={(e) => setCustomGroupName(e.target.value)}
                        placeholder="Ex: Projeto Postora"
                        autoFocus
                        className="w-full px-4 py-3 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600 bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  )}

                  {selectedPreset.id !== 'blank' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nome do grupo (opcional)
                      </label>
                      <input
                        type="text"
                        value={customGroupName}
                        onChange={(e) => setCustomGroupName(e.target.value)}
                        placeholder={selectedPreset.name}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600 bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 pt-0 border-t border-gray-200 dark:border-slate-800 flex gap-3">
              {selectedPreset && (
                <button
                  onClick={() => setSelectedPreset(null)}
                  className="px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition font-medium"
                >
                  ← Voltar
                </button>
              )}
              
              <button
                onClick={closeGroupModal}
                className="flex-1 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition font-medium"
              >
                Cancelar
              </button>

              {selectedPreset && (
                <button
                  onClick={handleCreateGroup}
                  disabled={selectedPreset.id === 'blank' && !customGroupName.trim()}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-slate-700 dark:to-slate-600 text-white rounded-xl hover:from-gray-800 hover:to-gray-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  Criar Grupo
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Criar Página */}
      {showPageModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl border border-gray-200 dark:border-slate-800">
            <div className="p-6 border-b border-gray-200 dark:border-slate-800">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {!selectedTemplate ? 'Escolha um template' : 'Nomeie sua página'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {!selectedTemplate 
                  ? 'Selecione o tipo de página'
                  : `Template: ${selectedTemplateData?.name}`
                }
              </p>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)]">
              {!selectedTemplate ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {pageTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleSelectTemplate(template.id)}
                      className={`p-5 bg-gradient-to-br ${template.color} border-2 rounded-xl hover:shadow-md transition text-left`}
                    >
                      <div className="text-3xl mb-3">{template.icon}</div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-sm">
                        {template.name}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        {template.description}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div>
                  <div className={`p-6 bg-gradient-to-br ${selectedTemplateData?.color} border-2 rounded-xl mb-6`}>
                    <div className="flex items-start gap-4">
                      <div className="text-5xl">{selectedTemplateData?.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                          {selectedTemplateData?.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {selectedTemplateData?.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nome da página
                    </label>
                    <input
                      type="text"
                      value={newPageName}
                      onChange={(e) => setNewPageName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleCreatePage()}
                      placeholder="Ex: Orçamento Q1 2025"
                      autoFocus
                      className="w-full px-4 py-3 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600 bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 pt-0 border-t border-gray-200 dark:border-slate-800 flex gap-3">
              {selectedTemplate && (
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition font-medium"
                >
                  ← Voltar
                </button>
              )}
              
              <button
                onClick={closePageModal}
                className="flex-1 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition font-medium"
              >
                Cancelar
              </button>

              {selectedTemplate && (
                <button
                  onClick={handleCreatePage}
                  disabled={!newPageName.trim()}
                  className="flex-1 px-4 py-2.5 bg-gray-900 dark:bg-slate-700 text-white rounded-xl hover:bg-gray-800 dark:hover:bg-slate-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Criar Página
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}