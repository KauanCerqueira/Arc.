import apiClient from './api.service';
import { cookieUtils } from '../utils/cookies';
import {
  LoginRequestDto,
  RegisterRequestDto,
  AuthResponseDto,
  UserProfileDto,
  UpdateProfileRequestDto,
  UpdatePasswordRequestDto
} from '../types/auth.types';

class AuthService {
  /**
   * Register a new user
   * POST /api/auth/register
   */
/**
 * Register a new user
 * POST /api/auth/register
 */
async register(data: RegisterRequestDto): Promise<AuthResponseDto> {
  try {
    // ✅ O backend espera os nomes em português
    const payload = {
      nome: data.nome,
      sobrenome: data.sobrenome,
      email: data.email,
      senha: data.senha,
      bio: data.bio || "",
      icone: data.icone || "",
      profissao: data.profissao || "",
      comoConheceu: data.comoConheceu || ""
    };

    const response = await apiClient.post<AuthResponseDto>('/auth/register', payload);
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Erro ao registrar usuário. Tente novamente.');
  }
}
  /**
   * Login user
   * POST /api/auth/login
   */
  async login(data: LoginRequestDto): Promise<AuthResponseDto> {
    try {
      const response = await apiClient.post<AuthResponseDto>('/auth/login', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Email ou senha inválidos.');
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Erro ao fazer login. Tente novamente.');
    }
  }

  /**
   * Verify current token
   * GET /api/auth/verify
   */
  async verifyToken(): Promise<boolean> {
    try {
      await apiClient.get('/auth/verify');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Logout - Clear local storage and cookies
   */
  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_refresh_token');

    // Remover cookies
    cookieUtils.remove('auth_token');
    cookieUtils.remove('auth_refresh_token');
    cookieUtils.remove('auth_user');
    cookieUtils.remove('remember_me');
  }

  /**
   * Refresh token
   * POST /api/auth/refresh
   */
  async refreshToken(): Promise<AuthResponseDto> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('Refresh token não encontrado');
      }

      const response = await apiClient.post<AuthResponseDto>('/auth/refresh', {
        refreshToken
      });

      // Atualizar tokens salvos
      await this.saveAuthData(response.data);

      return response.data;
    } catch (error: any) {
      // Se refresh falhar, fazer logout
      this.logout();
      throw new Error('Sessão expirada. Faça login novamente.');
    }
  }

  /**
   * Save auth data to local storage and cookies
   */
  async saveAuthData(authResponse: AuthResponseDto, rememberMe: boolean = true): Promise<void> {
    const userData = {
      userId: authResponse.userId,
      nome: authResponse.nome,
      sobrenome: authResponse.sobrenome,
      email: authResponse.email,
      bio: authResponse.bio,
      icone: authResponse.icone,
    };

    // Sempre salvar em localStorage (para sessão imediata)
    localStorage.setItem('auth_token', authResponse.token);
    localStorage.setItem('auth_user', JSON.stringify(userData));

    if (authResponse.refreshToken) {
      localStorage.setItem('auth_refresh_token', authResponse.refreshToken);
    }

    // Salvar cookies via API route server-side para garantir que o middleware os veja
    try {
      await fetch('/api/auth/set-cookie', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: authResponse.token,
          user: userData,
          refreshToken: authResponse.refreshToken,
          rememberMe,
        }),
      });
    } catch (error) {
      console.error('Failed to set server-side cookies:', error);
      // Fallback to client-side cookies
      cookieUtils.set('auth_token', authResponse.token, rememberMe ? 30 : 1);
      cookieUtils.set('auth_user', JSON.stringify(userData), rememberMe ? 30 : 1);
      if (rememberMe) {
        cookieUtils.set('remember_me', 'true', 30);
      }
      if (authResponse.refreshToken) {
        cookieUtils.set('auth_refresh_token', authResponse.refreshToken, rememberMe ? 30 : 1);
      }
    }
  }

  /**
   * Get saved token from cookies or local storage
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null;

    // Tentar pegar do localStorage primeiro
    let token = localStorage.getItem('auth_token');

    // Se não tiver no localStorage, tentar cookies
    if (!token) {
      token = cookieUtils.get('auth_token');

      // Se encontrou no cookie, restaurar para localStorage
      if (token) {
        localStorage.setItem('auth_token', token);
      }
    }

    return token;
  }

  /**
   * Get saved refresh token from cookies or local storage
   */
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;

    // Tentar pegar do localStorage primeiro
    let refreshToken = localStorage.getItem('auth_refresh_token');

    // Se não tiver no localStorage, tentar cookies
    if (!refreshToken) {
      refreshToken = cookieUtils.get('auth_refresh_token');

      // Se encontrou no cookie, restaurar para localStorage
      if (refreshToken) {
        localStorage.setItem('auth_refresh_token', refreshToken);
      }
    }

    return refreshToken;
  }

  /**
   * Get saved user from cookies or local storage
   */
  getUser(): any | null {
    if (typeof window === 'undefined') return null;

    // Tentar pegar do localStorage primeiro
    let userStr = localStorage.getItem('auth_user');

    // Se não tiver no localStorage, tentar cookies
    if (!userStr) {
      userStr = cookieUtils.get('auth_user');

      // Se encontrou no cookie, restaurar para localStorage
      if (userStr) {
        localStorage.setItem('auth_user', userStr);
      }
    }

    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Get user profile
   * GET /api/auth/profile
   */
  async getProfile(): Promise<UserProfileDto> {
    try {
      const response = await apiClient.get<UserProfileDto>('/auth/profile');
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Erro ao buscar perfil. Tente novamente.');
    }
  }

  /**
   * Update user profile
   * PUT /api/auth/profile
   */
  async updateProfile(data: UpdateProfileRequestDto): Promise<UserProfileDto> {
    try {
      const response = await apiClient.put<UserProfileDto>('/auth/profile', data);

      // Update local storage with new data
      const currentUser = this.getUser();
      if (currentUser) {
        localStorage.setItem('auth_user', JSON.stringify({
          ...currentUser,
          nome: response.data.nome,
          sobrenome: response.data.sobrenome,
          bio: response.data.bio,
          icone: response.data.icone,
        }));
      }

      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Erro ao atualizar perfil. Tente novamente.');
    }
  }

  /**
   * Update user password
   * PUT /api/auth/password
   */
  async updatePassword(data: UpdatePasswordRequestDto): Promise<void> {
    try {
      await apiClient.put('/auth/password', data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Senha atual incorreta.');
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Erro ao atualizar senha. Tente novamente.');
    }
  }
}

export default new AuthService();
