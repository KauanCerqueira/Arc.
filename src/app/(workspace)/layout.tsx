"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { 
  Search, Home, Star, ChevronRight, ChevronDown, Plus, FileText,
  Settings, Menu, X, Bell, User, LogOut, HelpCircle
} from 'lucide-react';
import ThemeToggle from '@/shared/components/ui/ThemeToggle';

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [workspaceExpanded, setWorkspaceExpanded] = useState(true);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const favorites = [
    { id: 1, name: "Roadmap e Tarefas", href: "/workspace/page/1?template=kanban", icon: FileText },
  ];

  const pages = [
    { id: 1, name: "Roadmap e Tarefas", href: "/workspace/page/1?template=kanban", icon: FileText },
    { id: 2, name: "Planejamento Q1", href: "/workspace/page/2?template=calendar", icon: FileText },
    { id: 3, name: "Documentação", href: "/workspace/page/3?template=blank", icon: FileText },
  ];

  const templates = [
    { id: 'blank', name: 'Página vazia', description: 'Comece do zero', icon: '📄' },
    { id: 'tasks', name: 'Lista de Tarefas', description: 'Organize suas tarefas', icon: '✅' },
    { id: 'kanban', name: 'Kanban', description: 'Gerencie projetos', icon: '📋' },
    { id: 'table', name: 'Tabela', description: 'Formato de planilha', icon: '📊' },
    { id: 'calendar', name: 'Calendário', description: 'Organize eventos', icon: '📅' },
    { id: 'projects', name: 'Projetos', description: 'Múltiplos projetos', icon: '🎯' },
    { id: 'bugs', name: 'Bugs', description: 'Rastreie bugs', icon: '🐛' },
    { id: 'study', name: 'Estudos', description: 'Organize estudos', icon: '📚' },
  ];

  const handleTemplateSelect = (templateId: string) => {
    setShowTemplateModal(false);
    const newPageId = Date.now();
    router.push(`/workspace/page/${newPageId}?template=${templateId}`);
  };

  return (
    <>
      <div className="min-h-screen bg-white dark:bg-slate-900 flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-60' : 'w-0'} bg-gray-50 dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex-shrink-0 transition-all duration-200 overflow-hidden flex flex-col`}>
          <div className="p-3 border-b border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 flex-1">
                <div className="w-6 h-6 bg-gray-900 dark:bg-slate-700 rounded flex items-center justify-center">
                  <div className="w-3 h-3 bg-white dark:bg-slate-300 rounded-sm"></div>
                </div>
                <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">Meu Workspace</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition lg:hidden">
                <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <button className="w-full flex items-center gap-2 px-2 py-1.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-600 transition">
              <Search className="w-4 h-4" />
              <span>Buscar</span>
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-2">
            <Link href="/workspace" className={`flex items-center gap-2 px-2 py-1.5 rounded text-sm transition ${pathname === '/workspace' ? 'bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'}`}>
              <Home className="w-4 h-4" />
              <span>Página inicial</span>
            </Link>

            {favorites.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  <Star className="w-3 h-3" />
                  <span>Favoritos</span>
                </div>
                <div className="mt-1">
                  {favorites.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.id} href={item.href} className={`flex items-center gap-2 px-2 py-1.5 rounded text-sm transition ${pathname.includes(`/workspace/page/${item.id}`) ? 'bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'}`}>
                        <Icon className="w-4 h-4" />
                        <span className="truncate">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-4">
              <button onClick={() => setWorkspaceExpanded(!workspaceExpanded)} className="w-full flex items-center justify-between px-2 py-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                <span>Particular</span>
                {workspaceExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              </button>

              {workspaceExpanded && (
                <div className="mt-1">
                  {pages.map((page) => {
                    const Icon = page.icon;
                    return (
                      <Link key={page.id} href={page.href} className={`flex items-center gap-2 px-2 py-1.5 rounded text-sm transition ${pathname.includes(`/workspace/page/${page.id}`) ? 'bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'}`}>
                        <Icon className="w-4 h-4" />
                        <span className="truncate">{page.name}</span>
                      </Link>
                    );
                  })}
                  <button onClick={() => setShowTemplateModal(true)} className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition mt-1">
                    <Plus className="w-4 h-4" />
                    <span>Adicionar página</span>
                  </button>
                </div>
              )}
            </div>
          </nav>

          <div className="p-2 border-t border-gray-200 dark:border-slate-700">
            <Link href="/workspace/settings" className="flex items-center gap-2 px-2 py-1.5 rounded text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition">
              <Settings className="w-4 h-4" />
              <span>Configurações</span>
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between px-6 bg-white dark:bg-slate-800 sticky top-0 z-40">
            <button onClick={() => setSidebarOpen(true)} className={`p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition ${sidebarOpen ? 'hidden' : 'block'}`}>
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>

            <div className="flex items-center gap-3 ml-auto">
              <ThemeToggle />
              
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition">
                <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>

              <div className="relative">
                <button onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition relative">
                  <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></div>
                </button>
              </div>

              <div className="h-6 w-px bg-gray-300 dark:bg-slate-600"></div>

              <div className="relative">
                <button onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }} className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition">
                  <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center text-white font-semibold text-sm">U</div>
                  <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400 hidden sm:block" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center text-white font-semibold">U</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">Usuário</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate">usuario@email.com</div>
                        </div>
                      </div>
                    </div>

                    <div className="py-2">
                      <Link href="/profile" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition">
                        <User className="w-4 h-4" />
                        <span>Meu perfil</span>
                      </Link>
                      <Link href="/workspace/settings" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition">
                        <Settings className="w-4 h-4" />
                        <span>Configurações</span>
                      </Link>
                      <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition">
                        <HelpCircle className="w-4 h-4" />
                        <span>Ajuda e suporte</span>
                      </button>
                    </div>

                    <div className="border-t border-gray-200 dark:border-slate-700 pt-2">
                      <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                        <LogOut className="w-4 h-4" />
                        <span>Sair</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto bg-white dark:bg-slate-900">
            {children}
          </main>
        </div>
      </div>

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Selecione um template</h2>
                <button onClick={() => setShowTemplateModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition">
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Escolha como você quer estruturar sua nova página</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {templates.map((template) => (
                  <button key={template.id} onClick={() => handleTemplateSelect(template.id)} className="p-6 border-2 border-gray-200 dark:border-slate-600 rounded-lg hover:border-gray-400 dark:hover:border-slate-500 hover:shadow-sm transition text-center bg-white dark:bg-slate-700">
                    <div className="text-4xl mb-3">{template.icon}</div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-sm">{template.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{template.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}