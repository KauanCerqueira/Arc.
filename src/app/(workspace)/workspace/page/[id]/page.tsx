"use client";

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Star, MoreVertical, Trash2, Copy, Share2, FileText } from 'lucide-react';
import BlankTemplate from '../../../templates/blank';
import TasksTemplate from '../../../templates/tasks';
import KanbanTemplate from '../../../templates/kanban';
import TableTemplate from '../../../templates/table';
import CalendarTemplate from '../../../templates/calendar';
import ProjectsTemplate from '../../../templates/projects';
import BugsTemplate from '../../../templates/bugs';
import StudyTemplate from '../../../templates/study';

export default function PageView() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pageId = params.id as string;
  const templateType = searchParams.get('template');

  const [template, setTemplate] = useState(templateType || 'blank');
  const [pageName, setPageName] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  const templates = [
    { id: 'blank', name: 'Página vazia', icon: '📄' },
    { id: 'tasks', name: 'Lista de Tarefas', icon: '✅' },
    { id: 'kanban', name: 'Kanban', icon: '📋' },
    { id: 'table', name: 'Tabela', icon: '📊' },
    { id: 'calendar', name: 'Calendário', icon: '📅' },
    { id: 'projects', name: 'Projetos', icon: '🎯' },
    { id: 'bugs', name: 'Bugs', icon: '🐛' },
    { id: 'study', name: 'Estudos', icon: '📚' },
  ];

  // Mock data - substituir por dados reais da API
  useEffect(() => {
    if (templateType) {
      setTemplate(templateType);
    }

    // Se for uma página nova
    if (!pageId || pageId === 'new') {
      setPageName('Nova Página');
      setShowTemplateSelector(true);
    } else {
      // Buscar dados da página pelo ID
      const mockPages: Record<string, { name: string; template: string; favorite: boolean }> = {
        '1': { name: 'Roadmap e Tarefas', template: 'kanban', favorite: true },
        '2': { name: 'Bugs do Projeto', template: 'bugs', favorite: false },
        '3': { name: 'Clientes 2025', template: 'table', favorite: false },
        '4': { name: 'Minhas Tarefas', template: 'tasks', favorite: true },
      };

      const pageData = mockPages[pageId];
      if (pageData) {
        setPageName(pageData.name);
        if (!templateType) {
          setTemplate(pageData.template);
        }
        setIsFavorite(pageData.favorite);
      }
    }
  }, [pageId, templateType]);

  const handleTemplateSelect = (templateId: string) => {
    setTemplate(templateId);
    setShowTemplateSelector(false);
    
    // Atualizar URL com o template selecionado
    const currentPath = window.location.pathname;
    router.push(`${currentPath}?template=${templateId}`);
  };

  const renderTemplate = () => {
    switch (template) {
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
      default:
        return <BlankTemplate />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <div className="border-b border-gray-200 px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between gap-4 mb-3">
            <input
              type="text"
              value={pageName}
              onChange={(e) => setPageName(e.target.value)}
              className="text-3xl font-bold text-gray-900 border-none outline-none w-full bg-transparent hover:bg-gray-50 px-2 -mx-2 rounded transition"
              placeholder="Sem título"
            />

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Favorite */}
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-2 rounded transition ${
                  isFavorite ? 'text-yellow-500 hover:bg-yellow-50' : 'text-gray-400 hover:bg-gray-100'
                }`}
              >
                <Star className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>

              {/* More Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded transition"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <button
                      onClick={() => {
                        setShowTemplateSelector(true);
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Mudar template</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition">
                      <Copy className="w-4 h-4" />
                      <span>Duplicar</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition">
                      <Share2 className="w-4 h-4" />
                      <span>Compartilhar</span>
                    </button>
                    <div className="border-t border-gray-200 my-2"></div>
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition">
                      <Trash2 className="w-4 h-4" />
                      <span>Excluir página</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Template Indicator */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="text-lg">
              {templates.find(t => t.id === template)?.icon}
            </span>
            <span>{templates.find(t => t.id === template)?.name}</span>
          </div>
        </div>
      </div>

      {/* Template Content */}
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {renderTemplate()}
        </div>
      </div>

      {/* Template Selector Modal */}
      {showTemplateSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Selecione um template</h2>
              <p className="text-sm text-gray-600 mt-1">Escolha como você quer estruturar esta página</p>
            </div>

            {/* Template Grid */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleTemplateSelect(t.id)}
                    className={`p-6 border-2 rounded-lg hover:border-gray-400 transition text-center ${
                      template === t.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="text-4xl mb-3">{t.icon}</div>
                    <div className="font-medium text-gray-900 text-sm">{t.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowTemplateSelector(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}