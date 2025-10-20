/**
 * Store Global do Workspace
 * Gerencia todos os grupos, páginas e operações
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  Workspace, 
  Group, 
  Page, 
  TemplateType,
  GroupPreset,
  createWorkspace,
  createGroup,
  createPage,
  createGroupFromPreset
} from '@/core/types/workspace.types';

// ============================================
// TIPO DA STORE
// ============================================
type WorkspaceStore = {
  // Estado
  workspace: Workspace | null;
  currentGroupId: string | null;
  currentPageId: string | null;
  
  // Ações - Workspace
  initializeWorkspace: (name: string, ownerId: string) => void;
  
  // Ações - Grupos
  addGroup: (name: string) => void;
  addGroupFromPreset: (preset: GroupPreset) => void;
  updateGroup: (groupId: string, updates: Partial<Group>) => void;
  renameGroup: (groupId: string, newName: string) => void;
  deleteGroup: (groupId: string) => void;
  toggleGroupExpanded: (groupId: string) => void;
  toggleGroupFavorite: (groupId: string) => void;
  reorderGroups: (startIndex: number, endIndex: number) => void;
  
  // Ações - Páginas
  addPage: (groupId: string, name: string, template: TemplateType) => string | undefined;
  updatePage: (groupId: string, pageId: string, updates: Partial<Page>) => void;
  renamePage: (groupId: string, pageId: string, newName: string) => void;
  deletePage: (groupId: string, pageId: string) => void;
  togglePageFavorite: (groupId: string, pageId: string) => void;
  updatePageData: (groupId: string, pageId: string, data: Record<string, unknown>) => void;
  movePage: (fromGroupId: string, toGroupId: string, pageId: string) => void;
  reorderPages: (groupId: string, startIndex: number, endIndex: number) => void;
  
  // Ações - Navegação
  setCurrentPage: (groupId: string, pageId: string) => void;
  
  // Helpers
  getGroup: (groupId: string) => Group | undefined;
  getPage: (groupId: string, pageId: string) => Page | undefined;
  getFavoritePages: () => { group: Group; page: Page }[];
  searchPages: (query: string) => { group: Group; page: Page }[];
};

// ============================================
// CRIAR A STORE
// ============================================
export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set, get) => ({
      // ============================================
      // ESTADO INICIAL
      // ============================================
      workspace: null,
      currentGroupId: null,
      currentPageId: null,

      // ============================================
      // INICIALIZAR WORKSPACE
      // ============================================
      initializeWorkspace: (name: string, ownerId: string) => {
        const workspace = createWorkspace(name, ownerId);
        set({ workspace });
      },

      // ============================================
      // GRUPOS - ADICIONAR VAZIO
      // ============================================
      addGroup: (name: string) => {
        const { workspace } = get();
        if (!workspace) return;

        const newGroup = createGroup(name);
        
        set({
          workspace: {
            ...workspace,
            groups: [...workspace.groups, newGroup],
          },
        });
      },

      // ============================================
      // GRUPOS - ADICIONAR DE PRESET
      // ============================================
      addGroupFromPreset: (preset: GroupPreset) => {
        const { workspace } = get();
        if (!workspace) return;

        const newGroup = createGroupFromPreset(preset);
        
        set({
          workspace: {
            ...workspace,
            groups: [...workspace.groups, newGroup],
          },
        });
      },

      // ============================================
      // GRUPOS - ATUALIZAR
      // ============================================
      updateGroup: (groupId: string, updates: Partial<Group>) => {
        const { workspace } = get();
        if (!workspace) return;

        set({
          workspace: {
            ...workspace,
            groups: workspace.groups.map((group: Group) =>
              group.id === groupId
                ? { ...group, ...updates, updatedAt: new Date() }
                : group
            ),
          },
        });
      },

      // ============================================
      // GRUPOS - RENOMEAR
      // ============================================
      renameGroup: (groupId: string, newName: string) => {
        const { workspace } = get();
        if (!workspace || !newName.trim()) return;

        set({
          workspace: {
            ...workspace,
            groups: workspace.groups.map((group: Group) =>
              group.id === groupId
                ? { ...group, name: newName, updatedAt: new Date() }
                : group
            ),
          },
        });
      },

      // ============================================
      // GRUPOS - DELETAR
      // ============================================
      deleteGroup: (groupId: string) => {
        const { workspace } = get();
        if (!workspace) return;

        set({
          workspace: {
            ...workspace,
            groups: workspace.groups.filter((group: Group) => group.id !== groupId),
          },
        });
      },

      // ============================================
      // GRUPOS - TOGGLE EXPANDED
      // ============================================
      toggleGroupExpanded: (groupId: string) => {
        const { workspace } = get();
        if (!workspace) return;

        set({
          workspace: {
            ...workspace,
            groups: workspace.groups.map((group: Group) =>
              group.id === groupId
                ? { ...group, expanded: !group.expanded }
                : group
            ),
          },
        });
      },

      // ============================================
      // GRUPOS - TOGGLE FAVORITE
      // ============================================
      toggleGroupFavorite: (groupId: string) => {
        const { workspace } = get();
        if (!workspace) return;

        set({
          workspace: {
            ...workspace,
            groups: workspace.groups.map((group: Group) =>
              group.id === groupId
                ? { ...group, favorite: !group.favorite }
                : group
            ),
          },
        });
      },

      // ============================================
      // GRUPOS - REORDENAR
      // ============================================
      reorderGroups: (startIndex: number, endIndex: number) => {
        const { workspace } = get();
        if (!workspace) return;

        const groups = Array.from(workspace.groups);
        const [removed] = groups.splice(startIndex, 1);
        groups.splice(endIndex, 0, removed);

        set({
          workspace: {
            ...workspace,
            groups,
          },
        });
      },

      // ============================================
      // PÁGINAS - ADICIONAR
      // ============================================
      addPage: (groupId: string, name: string, template: TemplateType) => {
        const { workspace } = get();
        if (!workspace) return;

        const group = workspace.groups.find((g: Group) => g.id === groupId);
        if (!group) return;

        const position = group.pages.length;
        const newPage = createPage(name, template, position);

        set({
          workspace: {
            ...workspace,
            groups: workspace.groups.map((g: Group) =>
              g.id === groupId
                ? { ...g, pages: [...g.pages, newPage] }
                : g
            ),
          },
        });

        return newPage.id;
      },

      // ============================================
      // PÁGINAS - ATUALIZAR
      // ============================================
      updatePage: (groupId: string, pageId: string, updates: Partial<Page>) => {
        const { workspace } = get();
        if (!workspace) return;

        set({
          workspace: {
            ...workspace,
            groups: workspace.groups.map((group: Group) =>
              group.id === groupId
                ? {
                    ...group,
                    pages: group.pages.map((page: Page) =>
                      page.id === pageId
                        ? { ...page, ...updates, updatedAt: new Date() }
                        : page
                    ),
                  }
                : group
            ),
          },
        });
      },

      // ============================================
      // PÁGINAS - RENOMEAR
      // ============================================
      renamePage: (groupId: string, pageId: string, newName: string) => {
        const { workspace } = get();
        if (!workspace || !newName.trim()) return;

        set({
          workspace: {
            ...workspace,
            groups: workspace.groups.map((group: Group) =>
              group.id === groupId
                ? {
                    ...group,
                    pages: group.pages.map((page: Page) =>
                      page.id === pageId
                        ? { ...page, name: newName, updatedAt: new Date() }
                        : page
                    ),
                  }
                : group
            ),
          },
        });
      },

      // ============================================
      // PÁGINAS - DELETAR
      // ============================================
      deletePage: (groupId: string, pageId: string) => {
        const { workspace } = get();
        if (!workspace) return;

        set({
          workspace: {
            ...workspace,
            groups: workspace.groups.map((group: Group) =>
              group.id === groupId
                ? {
                    ...group,
                    pages: group.pages.filter((page: Page) => page.id !== pageId),
                  }
                : group
            ),
          },
        });
      },

      // ============================================
      // PÁGINAS - TOGGLE FAVORITE
      // ============================================
      togglePageFavorite: (groupId: string, pageId: string) => {
        const { workspace } = get();
        if (!workspace) return;

        set({
          workspace: {
            ...workspace,
            groups: workspace.groups.map((group: Group) =>
              group.id === groupId
                ? {
                    ...group,
                    pages: group.pages.map((page: Page) =>
                      page.id === pageId
                        ? { ...page, favorite: !page.favorite }
                        : page
                    ),
                  }
                : group
            ),
          },
        });
      },

      // ============================================
      // PÁGINAS - ATUALIZAR DATA
      // ============================================
      updatePageData: (groupId: string, pageId: string, data: Record<string, unknown>) => {
        const { workspace } = get();
        if (!workspace) return;

        set({
          workspace: {
            ...workspace,
            groups: workspace.groups.map((group: Group) =>
              group.id === groupId
                ? {
                    ...group,
                    pages: group.pages.map((page: Page) =>
                      page.id === pageId
                        ? { ...page, data, updatedAt: new Date() }
                        : page
                    ),
                  }
                : group
            ),
          },
        });
      },

      // ============================================
      // PÁGINAS - MOVER ENTRE GRUPOS
      // ============================================
      movePage: (fromGroupId: string, toGroupId: string, pageId: string) => {
        const { workspace } = get();
        if (!workspace) return;

        const fromGroup = workspace.groups.find((g: Group) => g.id === fromGroupId);
        const page = fromGroup?.pages.find((p: Page) => p.id === pageId);
        
        if (!page) return;

        set({
          workspace: {
            ...workspace,
            groups: workspace.groups.map((group: Group) => {
              if (group.id === fromGroupId) {
                return {
                  ...group,
                  pages: group.pages.filter((p: Page) => p.id !== pageId),
                };
              }
              if (group.id === toGroupId) {
                return {
                  ...group,
                  pages: [...group.pages, { ...page, position: group.pages.length }],
                };
              }
              return group;
            }),
          },
        });
      },

      // ============================================
      // PÁGINAS - REORDENAR DENTRO DO GRUPO
      // ============================================
      reorderPages: (groupId: string, startIndex: number, endIndex: number) => {
        const { workspace } = get();
        if (!workspace) return;

        set({
          workspace: {
            ...workspace,
            groups: workspace.groups.map((group: Group) => {
              if (group.id === groupId) {
                const pages = Array.from(group.pages);
                const [removed] = pages.splice(startIndex, 1);
                pages.splice(endIndex, 0, removed);
                
                return {
                  ...group,
                  pages: pages.map((p, idx) => ({ ...p, position: idx })),
                };
              }
              return group;
            }),
          },
        });
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
        return workspace?.groups.find((g: Group) => g.id === groupId);
      },

      // ============================================
      // HELPERS - BUSCAR PÁGINA
      // ============================================
      getPage: (groupId: string, pageId: string) => {
        const group = get().getGroup(groupId);
        return group?.pages.find((p: Page) => p.id === pageId);
      },

      // ============================================
      // HELPERS - PÁGINAS FAVORITAS
      // ============================================
      getFavoritePages: () => {
        const { workspace } = get();
        if (!workspace) return [];

        const favorites: { group: Group; page: Page }[] = [];

        workspace.groups.forEach((group: Group) => {
          group.pages.forEach((page: Page) => {
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

        workspace.groups.forEach((group: Group) => {
          group.pages.forEach((page: Page) => {
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
    }),
    {
      name: 'projectly-workspace',
    }
  )
);