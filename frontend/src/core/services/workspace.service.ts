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
   * Busca o workspace do usuário autenticado (primeiro workspace)
   */
  async getWorkspace(): Promise<WorkspaceDto> {
    const response = await api.get<WorkspaceDto>('/workspace');
    return response.data;
  }

  /**
   * Busca todos os workspaces do usuário
   */
  async getAllWorkspaces(): Promise<WorkspaceDto[]> {
    const response = await api.get<WorkspaceDto[]>('/workspace/all');
    return response.data;
  }

  /**
   * Busca um workspace específico por ID
   */
  async getWorkspaceById(workspaceId: string): Promise<WorkspaceDto> {
    const response = await api.get<WorkspaceDto>(`/workspace/${workspaceId}`);
    return response.data;
  }

  /**
   * Busca o workspace com todos os grupos e páginas
   */
  async getWorkspaceFull(workspaceId: string): Promise<WorkspaceWithGroupsDto> {
    const response = await api.get<WorkspaceWithGroupsDto>(`/workspace/${workspaceId}/full`);
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
  async updateWorkspace(workspaceId: string, data: UpdateWorkspaceRequestDto): Promise<WorkspaceDto> {
    const response = await api.put<WorkspaceDto>(`/workspace/${workspaceId}`, data);
    return response.data;
  }

  /**
   * Deleta um workspace
   */
  async deleteWorkspace(workspaceId: string): Promise<void> {
    await api.delete(`/workspace/${workspaceId}`);
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
