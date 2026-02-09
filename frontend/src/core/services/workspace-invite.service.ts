import type { WorkspaceInvite, WorkspaceRole } from '@/core/types/workspace.types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : 'http://localhost:5001/api';

// ============================================
// TIPOS DE REQUEST/RESPONSE
// ============================================
export interface CreateInviteRequest {
  workspaceId: string;
  role: WorkspaceRole;
  expiresInDays?: number;
  maxUses?: number;
}

export interface CreateInviteResponse {
  invite: WorkspaceInvite;
  inviteUrl: string;
}

export interface ValidateInviteResponse {
  isValid: boolean;
  invite?: WorkspaceInvite;
  error?: string;
}

export interface AcceptInviteRequest {
  token: string;
}

export interface AcceptInviteResponse {
  success: boolean;
  workspaceId: string;
  workspaceName: string;
  message?: string;
}

// ============================================
// SERVIÇO DE CONVITES
// ============================================
const workspaceInviteService = {
  /**
   * Cria um novo convite para o workspace
   */
  async createInvite(request: CreateInviteRequest): Promise<CreateInviteResponse> {
    const token = localStorage.getItem('auth_token');

    const response = await fetch(`${API_BASE}/workspaces/${request.workspaceId}/invites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        role: request.role,
        expiresInDays: request.expiresInDays,
        maxUses: request.maxUses,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao criar convite');
    }

    return response.json();
  },

  /**
   * Lista todos os convites ativos do workspace
   */
  async listInvites(workspaceId: string): Promise<WorkspaceInvite[]> {
    const token = localStorage.getItem('auth_token');

    const response = await fetch(`${API_BASE}/workspaces/${workspaceId}/invites`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao listar convites');
    }

    return response.json();
  },

  /**
   * Valida um token de convite (sem autenticação)
   */
  async validateInvite(token: string): Promise<ValidateInviteResponse> {
    const response = await fetch(`${API_BASE}/invites/${token}/validate`, {
      method: 'GET',
    });

    if (!response.ok) {
      return {
        isValid: false,
        error: 'Convite inválido ou expirado',
      };
    }

    const invite = await response.json();
    return {
      isValid: true,
      invite,
    };
  },

  /**
   * Aceita um convite e adiciona o usuário ao workspace
   */
  async acceptInvite(request: AcceptInviteRequest): Promise<AcceptInviteResponse> {
    const token = localStorage.getItem('auth_token');

    const response = await fetch(`${API_BASE}/invites/${request.token}/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao aceitar convite');
    }

    return response.json();
  },

  /**
   * Revoga um convite (desativa)
   */
  async revokeInvite(workspaceId: string, inviteId: string): Promise<void> {
    const token = localStorage.getItem('auth_token');

    const response = await fetch(`${API_BASE}/workspaces/${workspaceId}/invites/${inviteId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao revogar convite');
    }
  },

  /**
   * Gera URL completa do convite
   */
  generateInviteUrl(token: string): string {
    const baseUrl = typeof window !== 'undefined'
      ? window.location.origin
      : 'http://localhost:3000';
    return `${baseUrl}/invite/${token}`;
  },
};

export default workspaceInviteService;
