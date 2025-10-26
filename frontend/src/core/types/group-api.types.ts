// ============================================
// GROUP API TYPES
// Correspondem aos DTOs do backend
// ============================================

// Request DTOs
export interface CreateGroupRequestDto {
  nome: string;
  descricao?: string;
  icone?: string;
  cor?: string;
}

export interface CreateGroupFromPresetRequestDto {
  presetId: string;
  nome?: string;
}

export interface UpdateGroupRequestDto {
  nome?: string;
  descricao?: string;
  icone?: string;
  cor?: string;
}

export interface ToggleGroupExpandedRequestDto {
  expandido: boolean;
}

export interface ToggleGroupFavoriteRequestDto {
  favorito: boolean;
}

export interface ReorderGroupsRequestDto {
  groupIds: string[];
}

// Response DTOs
export interface GroupDto {
  id: string;
  workspaceId: string;
  nome: string;
  descricao?: string;
  icone: string;
  cor: string;
  expandido: boolean;
  favorito: boolean;
  arquivado: boolean;
  posicao: number;
  criadoEm: string;
  atualizadoEm: string;
}

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

export interface GroupWithPagesDto {
  id: string;
  workspaceId: string;
  nome: string;
  descricao?: string;
  icone: string;
  cor: string;
  expandido: boolean;
  favorito: boolean;
  arquivado: boolean;
  posicao: number;
  pages: PageDto[];
  criadoEm: string;
  atualizadoEm: string;
}
