import api from './api.service';
import {
  WorkspaceDto,
  WorkspaceWithGroupsDto,
  CreateWorkspaceRequestDto,
  UpdateWorkspaceRequestDto,
  UpdateWorkspaceSettingsRequestDto,
  WorkspaceSettingsDto,
} from '../types/workspace-api.types';

class WorkspaceService {
  /**
   * Busca o workspace do usuário autenticado
   */
  async getWorkspace(): Promise<WorkspaceDto> {
    const response = await api.get<WorkspaceDto>('/workspace');
    return response.data;
  }

  /**
   * Busca o workspace com todos os grupos e páginas
   */
  async getWorkspaceFull(): Promise<WorkspaceWithGroupsDto> {
    const response = await api.get<WorkspaceWithGroupsDto>('/workspace/full');
    return response.data;
  }

  /**
   * Cria um novo workspace
   */
  async createWorkspace(data: CreateWorkspaceRequestDto): Promise<WorkspaceDto> {
    const response = await api.post<WorkspaceDto>('/workspace', data);
    return response.data;
  }

  /**
   * Atualiza o workspace
   */
  async updateWorkspace(data: UpdateWorkspaceRequestDto): Promise<WorkspaceDto> {
    const response = await api.put<WorkspaceDto>('/workspace', data);
    return response.data;
  }

  /**
   * Atualiza as configurações do workspace
   */
  async updateSettings(data: UpdateWorkspaceSettingsRequestDto): Promise<WorkspaceSettingsDto> {
    const response = await api.put<WorkspaceSettingsDto>('/workspace/settings', data);
    return response.data;
  }
}

export default new WorkspaceService();
