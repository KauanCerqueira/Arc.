import api from './api.service';

export interface PromoCodeDto {
  id: string;
  code: string;
  description: string;
  discountPercentage: number;
  maxUses: number;
  currentUses: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CreatePromoCodeDto {
  code: string;
  description: string;
  discountPercentage: number;
  maxUses: number;
  expiresAt?: string;
}

export interface UpdatePromoCodeDto {
  description?: string;
  isActive?: boolean;
}

class PromoService {
  /**
   * Busca todos os códigos promocionais
   */
  async getAllPromoCodes(): Promise<PromoCodeDto[]> {
    const response = await api.get<PromoCodeDto[]>('/master/promo-codes');
    return response.data;
  }

  /**
   * Cria um novo código promocional
   */
  async createPromoCode(data: CreatePromoCodeDto): Promise<PromoCodeDto> {
    const response = await api.post<PromoCodeDto>('/master/promo-codes', data);
    return response.data;
  }

  /**
   * Atualiza um código promocional
   */
  async updatePromoCode(id: string, data: UpdatePromoCodeDto): Promise<PromoCodeDto> {
    const response = await api.put<PromoCodeDto>(`/master/promo-codes/${id}`, data);
    return response.data;
  }

  /**
   * Deleta um código promocional
   */
  async deletePromoCode(id: string): Promise<void> {
    await api.delete(`/master/promo-codes/${id}`);
  }

  /**
   * Ativa ou desativa um código
   */
  async togglePromoCode(id: string, isActive: boolean): Promise<PromoCodeDto> {
    return this.updatePromoCode(id, { isActive });
  }
}

export default new PromoService();
