/**
 * Store Global do Workspace - VERSÃO COM API
 * Gerencia todos os grupos, páginas e operações com sincronização no backend
 */

import { create } from 'zustand';
import {
  Workspace,
  Group,
  Page,
  TemplateType,
  GroupPreset,
  TEMPLATE_ICONS,
} from '@/core/types/workspace.types';
import workspaceService from '../services/workspace.service';
import groupService from '../services/group.service';
import pageService from '../services/page.service';

// ============================================
// TIPO DA STORE
// ============================================
type WorkspaceStore = {
  // Estado
  workspace: Workspace | null;
  workspaces: Workspace[];
  currentWorkspaceId: string | null;
  currentGroupId: string | null;
  currentPageId: string | null;
  isLoading: boolean;
  error: string | null;

  // Ações - Workspace
  initializeWorkspace: () => Promise<void>;
  loadWorkspace: (workspaceId?: string) => Promise<void>;
  loadAllWorkspaces: () => Promise<void>;
  switchWorkspace: (workspaceId: string) => Promise<void>;
  createWorkspace: (name: string) => Promise<string | undefined>;
  renameWorkspace: (workspaceId: string, newName: string) => Promise<void>;
  deleteWorkspace: (workspaceId: string) => Promise<void>;

  // Ações - Grupos
  addGroup: (name: string) => Promise<void>;
  addGroupFromPreset: (preset: GroupPreset) => Promise<void>;
  updateGroup: (groupId: string, updates: Partial<Group>) => Promise<void>;
  renameGroup: (groupId: string, newName: string) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
  toggleGroupExpanded: (groupId: string) => Promise<void>;
  toggleGroupFavorite: (groupId: string) => Promise<void>;
  reorderGroups: (startIndex: number, endIndex: number) => Promise<void>;

  // Ações - Páginas
  addPage: (groupId: string, name: string, template: TemplateType) => Promise<string | undefined>;
  updatePage: (groupId: string, pageId: string, updates: Partial<Page>) => Promise<void>;
  renamePage: (groupId: string, pageId: string, newName: string) => Promise<void>;
  deletePage: (groupId: string, pageId: string) => Promise<void>;
  togglePageFavorite: (groupId: string, pageId: string) => Promise<void>;
  updatePageData: (groupId: string, pageId: string, data: Record<string, unknown>) => Promise<void>;
  movePage: (fromGroupId: string, toGroupId: string, pageId: string) => Promise<void>;
  reorderPages: (groupId: string, startIndex: number, endIndex: number) => Promise<void>;

  // Ações - Navegação
  setCurrentPage: (groupId: string, pageId: string) => void;

  // Helpers
  getGroup: (groupId: string) => Group | undefined;
  getPage: (groupId: string, pageId: string) => Page | undefined;
  getFavoritePages: () => { group: Group; page: Page }[];
  searchPages: (query: string) => { group: Group; page: Page }[];

  // Clear error
  clearError: () => void;
};

// ============================================
// HELPERS
// ============================================

/**
 * Converte WorkspaceDto simples (sem grupos) para o formato local
 */
const convertSimpleApiToLocal = (apiWorkspace: any): Workspace => {
  return {
    id: apiWorkspace.id,
    name: apiWorkspace.nome,
    ownerId: apiWorkspace.userId,
    groups: [], // WorkspaceDto não inclui groups
    settings: {
      theme: apiWorkspace.settings.theme as 'light' | 'dark',
      language: apiWorkspace.settings.language,
      timezone: apiWorkspace.settings.timezone,
      dateFormat: apiWorkspace.settings.dateFormat,
    },
    createdAt: new Date(apiWorkspace.criadoEm),
    updatedAt: new Date(apiWorkspace.atualizadoEm),
  };
};

/**
 * Converte WorkspaceWithGroupsDto completo (com grupos e páginas) para o formato local
 */
const convertApiToLocal = (apiWorkspace: any): Workspace => {
  return {
    id: apiWorkspace.id,
    name: apiWorkspace.nome,
    ownerId: apiWorkspace.userId,
    groups: apiWorkspace.groups.map((g: any) => ({
      id: g.id,
      name: g.nome,
      description: g.descricao || '',
      icon: g.icone,
      color: g.cor,
      pages: g.pages.map((p: any) => ({
        id: p.id,
        name: p.nome,
        template: p.template as TemplateType,
        icon: p.icone || TEMPLATE_ICONS[p.template as TemplateType] || '📝',
        data: p.data || {},
        favorite: p.favorito,
        position: p.posicao,
        createdAt: new Date(p.criadoEm),
        updatedAt: new Date(p.atualizadoEm),
      })),
      expanded: g.expandido,
      favorite: g.favorito,
      archived: g.arquivado,
      createdAt: new Date(g.criadoEm),
      updatedAt: new Date(g.atualizadoEm),
    })),
    settings: {
      theme: apiWorkspace.settings.theme as 'light' | 'dark',
      language: apiWorkspace.settings.language,
      timezone: apiWorkspace.settings.timezone,
      dateFormat: apiWorkspace.settings.dateFormat,
    },
    createdAt: new Date(apiWorkspace.criadoEm),
    updatedAt: new Date(apiWorkspace.atualizadoEm),
  };
};

// ============================================
// CRIAR A STORE
// ============================================
export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  // ============================================
  // ESTADO INICIAL
  // ============================================
  workspace: null,
  workspaces: [],
  currentWorkspaceId: null,
  currentGroupId: null,
  currentPageId: null,
  isLoading: false,
  error: null,

  // ============================================
  // INICIALIZAR WORKSPACE
  // ============================================
  initializeWorkspace: async () => {
    set({ isLoading: true, error: null });
    try {
      // Carrega todos os workspaces do usuário
      const apiWorkspaces = await workspaceService.getAllWorkspaces();

      if (apiWorkspaces.length === 0) {
        // Se não tiver nenhum, cria o primeiro
        const newWorkspace = await workspaceService.createWorkspace({
          nome: 'Meu Workspace',
        });
        const apiWorkspaceFull = await workspaceService.getWorkspaceFull(newWorkspace.id);
        const workspace = convertApiToLocal(apiWorkspaceFull);
        set({
          workspace,
          workspaces: [workspace],
          currentWorkspaceId: workspace.id,
          isLoading: false
        });
      } else {
        // Pega o último workspace acessado do localStorage ou o primeiro
        const lastWorkspaceId = localStorage.getItem('lastWorkspaceId');
        const workspaceId = lastWorkspaceId && apiWorkspaces.find(w => w.id === lastWorkspaceId)
          ? lastWorkspaceId
          : apiWorkspaces[0].id;

        const apiWorkspaceFull = await workspaceService.getWorkspaceFull(workspaceId);
        const workspace = convertApiToLocal(apiWorkspaceFull);
        const workspaces = apiWorkspaces.map(convertSimpleApiToLocal); // Usa convertSimpleApiToLocal para lista

        set({
          workspace,
          workspaces,
          currentWorkspaceId: workspace.id,
          isLoading: false
        });

        localStorage.setItem('lastWorkspaceId', workspace.id);
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  loadWorkspace: async (workspaceId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const id = workspaceId || get().currentWorkspaceId;
      if (!id) {
        throw new Error('Nenhum workspace selecionado');
      }

      const apiWorkspace = await workspaceService.getWorkspaceFull(id);
      const workspace = convertApiToLocal(apiWorkspace);
      set({ workspace, currentWorkspaceId: workspace.id, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  loadAllWorkspaces: async () => {
    set({ isLoading: true, error: null });
    try {
      const apiWorkspaces = await workspaceService.getAllWorkspaces();
      const workspaces = apiWorkspaces.map(convertSimpleApiToLocal); // Usa convertSimpleApiToLocal para WorkspaceDto
      console.log('📋 Workspaces carregados:', workspaces); // Debug
      set({ workspaces, isLoading: false });
    } catch (error: any) {
      console.error('❌ Erro ao carregar workspaces:', error); // Debug
      set({ error: error.message, isLoading: false });
    }
  },

  switchWorkspace: async (workspaceId: string) => {
    set({ isLoading: true, error: null });
    try {
      const apiWorkspace = await workspaceService.getWorkspaceFull(workspaceId);
      const workspace = convertApiToLocal(apiWorkspace);
      set({
        workspace,
        currentWorkspaceId: workspace.id,
        currentGroupId: null,
        currentPageId: null,
        isLoading: false
      });

      localStorage.setItem('lastWorkspaceId', workspace.id);
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createWorkspace: async (name: string) => {
    set({ isLoading: true, error: null });
    try {
      const newWorkspace = await workspaceService.createWorkspace({ nome: name });
      await get().loadAllWorkspaces();
      await get().switchWorkspace(newWorkspace.id);
      return newWorkspace.id;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return undefined;
    }
  },

  renameWorkspace: async (workspaceId: string, newName: string) => {
    set({ isLoading: true, error: null });
    try {
      await workspaceService.updateWorkspace(workspaceId, { nome: newName });
      await get().loadAllWorkspaces();
      if (get().currentWorkspaceId === workspaceId) {
        await get().loadWorkspace(workspaceId);
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  deleteWorkspace: async (workspaceId: string) => {
    set({ isLoading: true, error: null });
    try {
      await workspaceService.deleteWorkspace(workspaceId);
      const { workspaces, currentWorkspaceId } = get();

      // Se deletou o workspace atual, muda para outro
      if (currentWorkspaceId === workspaceId) {
        const remainingWorkspaces = workspaces.filter(w => w.id !== workspaceId);
        if (remainingWorkspaces.length > 0) {
          await get().switchWorkspace(remainingWorkspaces[0].id);
        } else {
          // Se não tiver mais workspaces, cria um novo
          await get().createWorkspace('Meu Workspace');
        }
      } else {
        await get().loadAllWorkspaces();
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  // ============================================
  // GRUPOS - ADICIONAR VAZIO
  // ============================================
  addGroup: async (name: string) => {
    set({ isLoading: true, error: null });
    try {
      await groupService.createGroup({
        nome: name,
        icone: '📁',
        cor: 'gray',
      });
      await get().loadWorkspace();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  // ============================================
  // GRUPOS - ADICIONAR DE PRESET
  // ============================================
  addGroupFromPreset: async (preset: GroupPreset) => {
    set({ isLoading: true, error: null });
    try {
      await groupService.createGroupFromPreset({
        presetId: preset.id,
        nome: preset.name,
      });
      await get().loadWorkspace();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  // ============================================
  // GRUPOS - ATUALIZAR
  // ============================================
  updateGroup: async (groupId: string, updates: Partial<Group>) => {
    set({ isLoading: true, error: null });
    try {
      await groupService.updateGroup(groupId, {
        nome: updates.name,
        descricao: updates.description,
        icone: updates.icon,
        cor: updates.color,
      });
      await get().loadWorkspace();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  // ============================================
  // GRUPOS - RENOMEAR
  // ============================================
  renameGroup: async (groupId: string, newName: string) => {
    set({ isLoading: true, error: null });
    try {
      await groupService.updateGroup(groupId, { nome: newName });
      await get().loadWorkspace();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  // ============================================
  // GRUPOS - DELETAR
  // ============================================
  deleteGroup: async (groupId: string) => {
    set({ isLoading: true, error: null });
    try {
      await groupService.deleteGroup(groupId);
      await get().loadWorkspace();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  // ============================================
  // GRUPOS - TOGGLE EXPANDED
  // ============================================
  toggleGroupExpanded: async (groupId: string) => {
    const { workspace } = get();
    if (!workspace) return;

    const group = workspace.groups.find((g) => g.id === groupId);
    if (!group) return;

    set({ isLoading: true, error: null });
    try {
      await groupService.toggleExpanded(groupId, !group.expanded);
      await get().loadWorkspace();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  // ============================================
  // GRUPOS - TOGGLE FAVORITE
  // ============================================
  toggleGroupFavorite: async (groupId: string) => {
    const { workspace } = get();
    if (!workspace) return;

    const group = workspace.groups.find((g) => g.id === groupId);
    if (!group) return;

    set({ isLoading: true, error: null });
    try {
      await groupService.toggleFavorite(groupId, !group.favorite);
      await get().loadWorkspace();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  // ============================================
  // GRUPOS - REORDENAR
  // ============================================
  reorderGroups: async (startIndex: number, endIndex: number) => {
    const { workspace } = get();
    if (!workspace) return;

    const groups = Array.from(workspace.groups);
    const [removed] = groups.splice(startIndex, 1);
    groups.splice(endIndex, 0, removed);

    const groupIds = groups.map((g) => g.id);

    set({ isLoading: true, error: null });
    try {
      await groupService.reorderGroups(groupIds);
      await get().loadWorkspace();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  // ============================================
  // PÁGINAS - ADICIONAR
  // ============================================
  addPage: async (groupId: string, name: string, template: TemplateType) => {
    set({ isLoading: true, error: null });
    try {
      const page = await pageService.createPage(groupId, {
        nome: name,
        template: template,
        icone: TEMPLATE_ICONS[template], // Adiciona o ícone baseado no template
      });
      await get().loadWorkspace();
      set({ isLoading: false });
      return page.id;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return undefined;
    }
  },

  // ============================================
  // PÁGINAS - ATUALIZAR
  // ============================================
  updatePage: async (groupId: string, pageId: string, updates: Partial<Page>) => {
    set({ isLoading: true, error: null });
    try {
      await pageService.updatePage(pageId, {
        nome: updates.name,
        icone: updates.icon,
      });
      await get().loadWorkspace();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  // ============================================
  // PÁGINAS - RENOMEAR
  // ============================================
  renamePage: async (groupId: string, pageId: string, newName: string) => {
    set({ isLoading: true, error: null });
    try {
      await pageService.updatePage(pageId, { nome: newName });
      await get().loadWorkspace();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  // ============================================
  // PÁGINAS - DELETAR
  // ============================================
  deletePage: async (groupId: string, pageId: string) => {
    set({ isLoading: true, error: null });
    try {
      await pageService.deletePage(pageId);
      await get().loadWorkspace();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  // ============================================
  // PÁGINAS - TOGGLE FAVORITE
  // ============================================
  togglePageFavorite: async (groupId: string, pageId: string) => {
    const { workspace } = get();
    if (!workspace) return;

    const group = workspace.groups.find((g) => g.id === groupId);
    const page = group?.pages.find((p) => p.id === pageId);
    if (!page) return;

    set({ isLoading: true, error: null });
    try {
      await pageService.toggleFavorite(pageId, !page.favorite);
      await get().loadWorkspace();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  // ============================================
  // PÁGINAS - ATUALIZAR DATA
  // ============================================
  updatePageData: async (groupId: string, pageId: string, data: Record<string, unknown>) => {
    set({ error: null });
    try {
      await pageService.updatePageData(pageId, data);

      set((state) => {
        if (!state.workspace) {
          return state;
        }

        const updatedWorkspace = {
          ...state.workspace,
          updatedAt: new Date(),
          groups: state.workspace.groups.map((group) => {
            if (group.id !== groupId) {
              return group;
            }

            return {
              ...group,
              updatedAt: new Date(),
              pages: group.pages.map((page) => {
                if (page.id !== pageId) {
                  return page;
                }

                return {
                  ...page,
                  data,
                  updatedAt: new Date(),
                };
              }),
            };
          }),
        };

        return {
          ...state,
          workspace: updatedWorkspace,
          isLoading: false,
        };
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // ============================================
  // PÁGINAS - MOVER ENTRE GRUPOS
  // ============================================
  movePage: async (fromGroupId: string, toGroupId: string, pageId: string) => {
    set({ isLoading: true, error: null });
    try {
      await pageService.movePage(pageId, toGroupId);
      await get().loadWorkspace();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  // ============================================
  // PÁGINAS - REORDENAR DENTRO DO GRUPO
  // ============================================
  reorderPages: async (groupId: string, startIndex: number, endIndex: number) => {
    const { workspace } = get();
    if (!workspace) return;

    const group = workspace.groups.find((g) => g.id === groupId);
    if (!group) return;

    const pages = Array.from(group.pages);
    const [removed] = pages.splice(startIndex, 1);
    pages.splice(endIndex, 0, removed);

    const pageIds = pages.map((p) => p.id);

    set({ isLoading: true, error: null });
    try {
      await pageService.reorderPages(groupId, pageIds);
      await get().loadWorkspace();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  // ============================================
  // NAVEGAÇÃO - DEFINIR PÁGINA ATUAL
  // ============================================
  setCurrentPage: (groupId: string, pageId: string) => {
    set({ currentGroupId: groupId, currentPageId: pageId });
  },

  // ============================================
  // HELPERS - BUSCAR GRUPO
  // ============================================
  getGroup: (groupId: string) => {
    const { workspace } = get();
    return workspace?.groups.find((g) => g.id === groupId);
  },

  // ============================================
  // HELPERS - BUSCAR PÁGINA
  // ============================================
  getPage: (groupId: string, pageId: string) => {
    const group = get().getGroup(groupId);
    return group?.pages.find((p) => p.id === pageId);
  },

  // ============================================
  // HELPERS - PÁGINAS FAVORITAS
  // ============================================
  getFavoritePages: () => {
    const { workspace } = get();
    if (!workspace) return [];

    const favorites: { group: Group; page: Page }[] = [];

    workspace.groups.forEach((group) => {
      group.pages.forEach((page) => {
        if (page.favorite) {
          favorites.push({ group, page });
        }
      });
    });

    return favorites;
  },

  // ============================================
  // HELPERS - BUSCAR PÁGINAS
  // ============================================
  searchPages: (query: string) => {
    const { workspace } = get();
    if (!workspace || !query.trim()) return [];

    const results: { group: Group; page: Page }[] = [];
    const lowerQuery = query.toLowerCase();

    workspace.groups.forEach((group) => {
      group.pages.forEach((page) => {
        if (
          page.name.toLowerCase().includes(lowerQuery) ||
          group.name.toLowerCase().includes(lowerQuery)
        ) {
          results.push({ group, page });
        }
      });
    });

    return results;
  },

  // ============================================
  // CLEAR ERROR
  // ============================================
  clearError: () => {
    set({ error: null });
  },
}));
