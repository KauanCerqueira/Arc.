"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Star, MoreVertical, Trash2, Copy, Share2, ArrowLeft } from 'lucide-react';
import { useWorkspaceStore } from '@/core/store/workspaceStore';

// Importar todos os templates
import BlankTemplate from '@/app/(workspace)/templates/blank';
import TasksTemplate from '@/app/(workspace)/templates/tasks';
import KanbanTemplate from '@/app/(workspace)/templates/kanban';
import TableTemplate from '@/app/(workspace)/templates/table';
import CalendarTemplate from '@/app/(workspace)/templates/calendar';
import ProjectsTemplate from '@/app/(workspace)/templates/projects';
import BugsTemplate from '@/app/(workspace)/templates/bugs';
import StudyTemplate from '@/app/(workspace)/templates/study';
import BudgetTemplate from '@/app/(workspace)/templates/budget';
import SprintTemplate from '@/app/(workspace)/templates/sprint';

export default function PageView() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.groupId as string;
  const pageId = params.pageId as string;

  const { getGroup, getPage, togglePageFavorite, deletePage, updatePage } = useWorkspaceStore();
  
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [pageName, setPageName] = useState('');

  const group = getGroup(groupId);
  const page = getPage(groupId, pageId);

  useEffect(() => {
    if (page) {
      setPageName(page.name);
    }
  }, [page]);

  // Salvar nome ao sair da edição
  const handleSaveName = () => {
    if (page && pageName.trim() && pageName !== page.name) {
      updatePage(groupId, pageId, { name: pageName });
    }
    setIsEditing(false);
  };

  // Renderizar template baseado no tipo
  const renderTemplate = () => {
    if (!page) return null;

    switch (page.template) {
      case 'blank':
        return <BlankTemplate />;
      case 'tasks':
        return <TasksTemplate />;
      case 'kanban':
        return <KanbanTemplate />;
      case 'table':
        return <TableTemplate />;
      case 'calendar':
        return <CalendarTemplate />;
      case 'projects':
        return <ProjectsTemplate />;
      case 'bugs':
        return <BugsTemplate />;
      case 'study':
        return <StudyTemplate />;
      case 'budget':
        return <BudgetTemplate />;
      case 'sprint':
        return <SprintTemplate />;
      default:
        return <BlankTemplate />;
    }
  };

  const handleDeletePage = () => {
    if (confirm('Tem certeza que deseja excluir esta página?')) {
      deletePage(groupId, pageId);
      router.push('/workspace');
    }
  };

  const handleToggleFavorite = () => {
    togglePageFavorite(groupId, pageId);
  };

  // Se não encontrar a página
  if (!page || !group) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Página não encontrada
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Esta página não existe ou foi excluída.
          </p>
          <button
            onClick={() => router.push('/workspace')}
            className="px-6 py-3 bg-gray-900 dark:bg-slate-700 text-white rounded-xl hover:bg-gray-800 dark:hover:bg-slate-600 transition font-medium inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Workspace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Page Header - Fixo no topo */}
      <div className="sticky top-14 z-30 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-sm">
        <div className="px-8 py-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
            <button
              onClick={() => router.push('/workspace')}
              className="hover:text-gray-900 dark:hover:text-gray-100 transition"
            >
              Workspace
            </button>
            <span>/</span>
            <span className="flex items-center gap-1.5">
              <span>{group.icon}</span>
              <span>{group.name}</span>
            </span>
            <span>/</span>
            <span className="text-gray-900 dark:text-gray-100 font-medium">{page.name}</span>
          </div>

          <div className="flex items-center justify-between gap-4">
            {/* Page Title */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-2xl flex-shrink-0">{page.icon}</span>
              {isEditing ? (
                <input
                  type="text"
                  value={pageName}
                  onChange={(e) => setPageName(e.target.value)}
                  onBlur={handleSaveName}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveName();
                    }
                  }}
                  autoFocus
                  className="text-2xl font-bold text-gray-900 dark:text-gray-100 border-none outline-none bg-transparent w-full focus:ring-2 focus:ring-gray-300 dark:focus:ring-slate-700 rounded px-2 -mx-2"
                />
              ) : (
                <h1
                  onClick={() => setIsEditing(true)}
                  className="text-2xl font-bold text-gray-900 dark:text-gray-100 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition truncate px-2 -mx-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800"
                >
                  {page.name}
                </h1>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={handleToggleFavorite}
                className={`p-2 rounded-lg transition ${
                  page.favorite
                    ? 'text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
                title={page.favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              >
                <Star className={`w-5 h-5 ${page.favorite ? 'fill-current' : ''}`} />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>

                {showMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowMenu(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 py-2 z-50">
                      <button 
                        onClick={() => setShowMenu(false)}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                      >
                        <Copy className="w-4 h-4" />
                        <span>Duplicar</span>
                      </button>
                      <button 
                        onClick={() => setShowMenu(false)}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Compartilhar</span>
                      </button>
                      <div className="border-t border-gray-200 dark:border-slate-700 my-2"></div>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          handleDeletePage();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Excluir página</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Template Content */}
      <div className="p-8">
        {renderTemplate()}
      </div>
    </div>
  );
}