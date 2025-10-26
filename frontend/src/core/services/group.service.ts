import api from './api.service';
import {
  GroupDto,
  GroupWithPagesDto,
  CreateGroupRequestDto,
  CreateGroupFromPresetRequestDto,
  UpdateGroupRequestDto,
  ToggleGroupExpandedRequestDto,
  ToggleGroupFavoriteRequestDto,
  ReorderGroupsRequestDto,
} from '../types/group-api.types';

class GroupService {
  /**
   * Busca todos os grupos do usuário
   */
  async getAllGroups(): Promise<GroupDto[]> {
    const response = await api.get<GroupDto[]>('/group');
    return response.data;
  }

  /**
   * Busca um grupo por ID
   */
  async getGroupById(id: string): Promise<GroupDto> {
    const response = await api.get<GroupDto>(`/group/${id}`);
    return response.data;
  }

  /**
   * Busca um grupo com suas páginas
   */
  async getGroupWithPages(id: string): Promise<GroupWithPagesDto> {
    const response = await api.get<GroupWithPagesDto>(`/group/${id}/with-pages`);
    return response.data;
  }

  /**
   * Cria um novo grupo
   */
  async createGroup(data: CreateGroupRequestDto): Promise<GroupDto> {
    const response = await api.post<GroupDto>('/group', data);
    return response.data;
  }

  /**
   * Cria um grupo a partir de um preset
   */
  async createGroupFromPreset(data: CreateGroupFromPresetRequestDto): Promise<GroupWithPagesDto> {
    const response = await api.post<GroupWithPagesDto>('/group/from-preset', data);
    return response.data;
  }

  /**
   * Atualiza um grupo
   */
  async updateGroup(id: string, data: UpdateGroupRequestDto): Promise<GroupDto> {
    const response = await api.put<GroupDto>(`/group/${id}`, data);
    return response.data;
  }

  /**
   * Toggle expandido do grupo
   */
  async toggleExpanded(id: string, expandido: boolean): Promise<GroupDto> {
    const response = await api.put<GroupDto>(`/group/${id}/expand`, { expandido });
    return response.data;
  }

  /**
   * Toggle favorito do grupo
   */
  async toggleFavorite(id: string, favorito: boolean): Promise<GroupDto> {
    const response = await api.put<GroupDto>(`/group/${id}/favorite`, { favorito });
    return response.data;
  }

  /**
   * Reordena os grupos
   */
  async reorderGroups(groupIds: string[]): Promise<void> {
    await api.put('/group/reorder', { groupIds });
  }

  /**
   * Deleta um grupo
   */
  async deleteGroup(id: string): Promise<void> {
    await api.delete(`/group/${id}`);
  }
}

export default new GroupService();
