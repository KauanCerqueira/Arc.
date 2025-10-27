import api from './api.service';

export interface UserDto {
  userId: string;
  nome: string;
  sobrenome: string;
  email: string;
  bio: string | null;
  icone: string | null;
  profissao: string | null;
  comoConheceu: string | null;
  isMaster: boolean;
  ativo: boolean;
  criadoEm: string;
}

export interface UpdateUserStatusDto {
  ativo: boolean;
}

export interface PromoteUserDto {
  isMaster: boolean;
}

class MasterService {
  /**
   * Busca todos os usuários
   */
  async getAllUsers(): Promise<UserDto[]> {
    const response = await api.get<UserDto[]>('/master/users');
    return response.data;
  }

  /**
   * Ativa ou desativa um usuário
   */
  async toggleUserStatus(userId: string, ativo: boolean): Promise<UserDto> {
    const response = await api.put<UserDto>(`/master/users/${userId}/status`, { ativo });
    return response.data;
  }

  /**
   * Promove ou remove privilégios master de um usuário
   */
  async toggleUserMaster(userId: string, isMaster: boolean): Promise<UserDto> {
    const response = await api.put<UserDto>(`/master/users/${userId}/master`, { isMaster });
    return response.data;
  }

  /**
   * Deleta um usuário (permanentemente)
   */
  async deleteUser(userId: string): Promise<void> {
    await api.delete(`/master/users/${userId}`);
  }
}

export default new MasterService();
