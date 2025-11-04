import api from './api.service';

export type MvpSeedResult = {
  workspaceId: string;
  groupId: string;
  kanbanPageId: string;
  tasksPageId: string;
  roadmapPageId: string;
  kanbanCards: number;
  tasksCount: number;
  roadmapItems: number;
};

export type UserDto = {
  userId: string;
  nome: string;
  sobrenome: string;
  email: string;
  bio?: string;
  icone?: string;
  profissao?: string;
  comoConheceu?: string;
  isMaster: boolean;
  ativo: boolean;
  criadoEm: string;
};

const masterService = {
  async seedMvpDec(): Promise<MvpSeedResult> {
    const res = await api.post<MvpSeedResult>('/master/seed-mvp-dec');
    return res.data;
  },

  async getAllUsers(): Promise<UserDto[]> {
    const res = await api.get<UserDto[]>('/master/users');
    return res.data;
  },

  async toggleUserStatus(userId: string, ativo: boolean): Promise<void> {
    await api.put(`/master/users/${userId}/status`, { ativo });
  },

  async toggleUserMaster(userId: string, isMaster: boolean): Promise<void> {
    await api.put(`/master/users/${userId}/master`, { isMaster });
  },

  async deleteUser(userId: string): Promise<void> {
    await api.delete(`/master/users/${userId}`);
  },
};

export default masterService;

