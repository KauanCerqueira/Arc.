import apiClient from './api.service';
import {
  AutomationDto,
  CreateAutomationDto,
  UpdateAutomationDto,
  AutomationStatsDto,
  AutomationDefinitionDto,
  AutomationRunResultDto,
} from '../types/automation.types';

const AUTOMATION_API_BASE = '/automation';

export const automationService = {
  /**
   * Busca todas as automações disponíveis (catálogo)
   */
  async getAvailableAutomations(): Promise<AutomationDefinitionDto[]> {
    const response = await apiClient.get(`${AUTOMATION_API_BASE}/available`);
    return response.data;
  },

  /**
   * Lista as automações configuradas do usuário
   */
  async getUserAutomations(workspaceId?: string): Promise<AutomationDto[]> {
    const params = workspaceId ? { workspaceId } : {};
    const response = await apiClient.get(AUTOMATION_API_BASE, { params });
    return response.data;
  },

  /**
   * Retorna uma automação específica
   */
  async getAutomation(id: string): Promise<AutomationDto> {
    const response = await apiClient.get(`${AUTOMATION_API_BASE}/${id}`);
    return response.data;
  },

  /**
   * Cria uma nova automação
   */
  async createAutomation(data: CreateAutomationDto): Promise<AutomationDto> {
    const response = await apiClient.post(AUTOMATION_API_BASE, data);
    return response.data;
  },

  /**
   * Atualiza uma automação existente
   */
  async updateAutomation(id: string, data: UpdateAutomationDto): Promise<AutomationDto> {
    const response = await apiClient.put(`${AUTOMATION_API_BASE}/${id}`, data);
    return response.data;
  },

  /**
   * Deleta uma automação
   */
  async deleteAutomation(id: string): Promise<void> {
    await apiClient.delete(`${AUTOMATION_API_BASE}/${id}`);
  },

  /**
   * Ativa ou desativa uma automação
   */
  async toggleAutomation(id: string, isEnabled: boolean): Promise<AutomationDto> {
    const response = await apiClient.patch(`${AUTOMATION_API_BASE}/${id}/toggle`, isEnabled, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  /**
   * Executa uma automação manualmente
   */
  async runAutomation(id: string, dryRun = false): Promise<AutomationRunResultDto> {
    const response = await apiClient.post(`${AUTOMATION_API_BASE}/${id}/run`, null, {
      params: { dryRun },
    });
    return response.data;
  },

  /**
   * Retorna estatísticas das automações do usuário
   */
  async getStatistics(workspaceId?: string): Promise<AutomationStatsDto> {
    const params = workspaceId ? { workspaceId } : {};
    const response = await apiClient.get(`${AUTOMATION_API_BASE}/stats`, { params });
    return response.data;
  },
};

export default automationService;
