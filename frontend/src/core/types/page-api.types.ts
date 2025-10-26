// ============================================
// PAGE API TYPES
// Correspondem aos DTOs do backend
// ============================================

// Request DTOs
export interface CreatePageRequestDto {
  nome: string;
  template: string;
  icone?: string;
}

export interface UpdatePageRequestDto {
  nome?: string;
  icone?: string;
}

export interface UpdatePageDataRequestDto {
  data: any;
}

export interface TogglePageFavoriteRequestDto {
  favorito: boolean;
}

export interface MovePageRequestDto {
  novoGroupId: string;
}

export interface ReorderPagesRequestDto {
  pageIds: string[];
}

// Response DTOs
export interface PageDto {
  id: string;
  groupId: string;
  nome: string;
  template: string;
  icone?: string;
  data: any;
  favorito: boolean;
  posicao: number;
  criadoEm: string;
  atualizadoEm: string;
}

export interface PageWithGroupDto {
  id: string;
  groupId: string;
  groupNome: string;
  groupIcone: string;
  nome: string;
  template: string;
  icone?: string;
  data: any;
  favorito: boolean;
  posicao: number;
  criadoEm: string;
  atualizadoEm: string;
}
