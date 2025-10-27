import api from './api.service';

export interface UserGrowthDto {
  month: string;
  count: number;
}

export interface ProfessionDistributionDto {
  profissao: string;
  count: number;
}

export interface SourceDistributionDto {
  source: string;
  count: number;
}

export interface RecentUserDto {
  nome: string;
  sobrenome: string;
  email: string;
  profissao: string | null;
  comoConheceu: string | null;
  criadoEm: string;
}

export interface TemplateUsageDto {
  template: string;
  count: number;
  percentage: number;
}

export interface AnalyticsDto {
  totalUsers: number;
  activeUsers: number;
  totalWorkspaces: number;
  totalProjects: number;
  totalPages: number;
  userGrowth: UserGrowthDto[];
  professionDistribution: ProfessionDistributionDto[];
  sourceDistribution: SourceDistributionDto[];
  recentUsers: RecentUserDto[];
  templateUsage: TemplateUsageDto[];
}

class AnalyticsService {
  async getAnalytics(): Promise<AnalyticsDto> {
    const response = await api.get<AnalyticsDto>('/analytics');
    return response.data;
  }
}

export default new AnalyticsService();
