import apiClient from './api.service';
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
   * Logout - Clear local storage
   */
  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  /**
   * Save auth data to local storage
   */
  saveAuthData(authResponse: AuthResponseDto): void {
    localStorage.setItem('auth_token', authResponse.token);
    localStorage.setItem('auth_user', JSON.stringify({
      userId: authResponse.userId,
      nome: authResponse.nome,
      sobrenome: authResponse.sobrenome,
      email: authResponse.email,
      bio: authResponse.bio,
      icone: authResponse.icone,
    }));
  }

  /**
   * Get saved token from local storage
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  /**
   * Get saved user from local storage
   */
  getUser(): any | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('auth_user');
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
