import api from './api.service';
import {
  PageDto,
  PageWithGroupDto,
  CreatePageRequestDto,
  UpdatePageRequestDto,
  UpdatePageDataRequestDto,
  TogglePageFavoriteRequestDto,
  MovePageRequestDto,
  ReorderPagesRequestDto,
} from '../types/page-api.types';

class PageService {
  /**
   * Busca uma página por ID
   */
  async getPageById(id: string): Promise<PageDto> {
    const response = await api.get<PageDto>(`/page/${id}`);
    return response.data;
  }

  /**
   * Busca todas as páginas de um grupo
   */
  async getPagesByGroupId(groupId: string): Promise<PageDto[]> {
    const response = await api.get<PageDto[]>(`/page/group/${groupId}`);
    return response.data;
  }

  /**
   * Busca todas as páginas favoritas
   */
  async getFavoritePages(): Promise<PageWithGroupDto[]> {
    const response = await api.get<PageWithGroupDto[]>('/page/favorites');
    return response.data;
  }

  /**
   * Busca páginas por query
   */
  async searchPages(query: string): Promise<PageWithGroupDto[]> {
    const response = await api.get<PageWithGroupDto[]>('/search', {
      params: { query },
    });
    return response.data;
  }

  /**
   * Cria uma nova página
   */
  async createPage(groupId: string, data: CreatePageRequestDto): Promise<PageDto> {
    const response = await api.post<PageDto>(`/page/group/${groupId}`, data);
    return response.data;
  }

  /**
   * Atualiza uma página
   */
  async updatePage(id: string, data: UpdatePageRequestDto): Promise<PageDto> {
    const response = await api.put<PageDto>(`/page/${id}`, data);
    return response.data;
  }

  /**
   * Atualiza os dados de uma página
   */
  async updatePageData(id: string, data: any): Promise<PageDto> {
    const response = await api.put<PageDto>(`/page/${id}/data`, { data });
    return response.data;
  }

  /**
   * Toggle favorito da página
   */
  async toggleFavorite(id: string, favorito: boolean): Promise<PageDto> {
    const response = await api.put<PageDto>(`/page/${id}/favorite`, { favorito });
    return response.data;
  }

  /**
   * Move uma página para outro grupo
   */
  async movePage(id: string, novoGroupId: string): Promise<PageDto> {
    const response = await api.put<PageDto>(`/page/${id}/move`, { novoGroupId });
    return response.data;
  }

  /**
   * Reordena as páginas de um grupo
   */
  async reorderPages(groupId: string, pageIds: string[]): Promise<void> {
    await api.put(`/page/group/${groupId}/reorder`, { pageIds });
  }

  /**
   * Deleta uma página
   */
  async deletePage(id: string): Promise<void> {
    await api.delete(`/page/${id}`);
  }
}

export default new PageService();
