"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Star, MoreVertical, Trash2, Copy, Share2, ArrowLeft, ChevronLeft } from 'lucide-react';
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
import FocusTemplate from '@/app/(workspace)/templates/focus';
import FlowchartTemplate from '@/app/(workspace)/templates/flowchart';
import RoadmapTemplate from '@/app/(workspace)/templates/roadmap';
import DocumentsTemplate from '@/app/(workspace)/templates/documents';

export default function PageView() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.groupId as string;
  const pageId = params.pageId as string;

  const { getGroup, getPage, togglePageFavorite, deletePage, updatePage, updatePageData } = useWorkspaceStore();
  
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

  const handleSaveName = () => {
    if (page && pageName.trim() && pageName !== page.name) {
      updatePage(groupId, pageId, { name: pageName });
    }
    setIsEditing(false);
  };

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
      case 'focus':
        return <FocusTemplate />;
      case 'flowchart':
        return <FlowchartTemplate data={page.data} onDataChange={handleDataChange} />;
      case 'roadmap':
        return <RoadmapTemplate />;
      case 'documents':
        return <DocumentsTemplate />;
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

  const handleDataChange = (data: any) => {
    updatePageData(groupId, pageId, data);
  };

  if (!page || !group) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 md:p-8">
        <div className="text-center max-w-md">
          <div className="text-5xl md:text-6xl mb-4">🔍</div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Página não encontrada
          </h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-6">
            Esta página não existe ou foi excluída.
          </p>
          <button
            onClick={() => router.push('/workspace')}
            className="px-4 md:px-6 py-2 md:py-3 bg-gray-900 dark:bg-slate-700 text-white rounded-xl hover:bg-gray-800 dark:hover:bg-slate-600 transition font-medium inline-flex items-center gap-2 text-sm md:text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Workspace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900">
      {/* Template Content - Tela Cheia */}
      <div className="flex-1 overflow-y-auto">
        {renderTemplate()}
      </div>
    </div>
  );
}