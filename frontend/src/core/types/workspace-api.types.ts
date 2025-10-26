// ============================================
// WORKSPACE API TYPES
// Correspondem aos DTOs do backend
// ============================================

// Request DTOs
export interface CreateWorkspaceRequestDto {
  nome: string;
}

export interface UpdateWorkspaceRequestDto {
  nome?: string;
  theme?: string;
  language?: string;
  timezone?: string;
  dateFormat?: string;
}

export interface UpdateWorkspaceSettingsRequestDto {
  theme?: string;
  language?: string;
  timezone?: string;
  dateFormat?: string;
}

// Response DTOs
export interface WorkspaceSettingsDto {
  theme: string;
  language: string;
  timezone: string;
  dateFormat: string;
}

export interface WorkspaceDto {
  id: string;
  nome: string;
  userId: string;
  settings: WorkspaceSettingsDto;
  criadoEm: string;
  atualizadoEm: string;
}

export interface GroupDto {
  id: string;
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

export interface WorkspaceWithGroupsDto {
  id: string;
  nome: string;
  userId: string;
  settings: WorkspaceSettingsDto;
  groups: GroupDto[];
  criadoEm: string;
  atualizadoEm: string;
}
