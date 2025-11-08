import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '../services/auth.service';
import { scheduleTokenRefresh, stopTokenRefresh } from '../utils/tokenRefresh';
import {
  User,
  LoginRequestDto,
  RegisterRequestDto,
  UpdateProfileRequestDto,
  UpdatePasswordRequestDto
} from '../types/auth.types';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginRequestDto) => Promise<void>;
  register: (data: RegisterRequestDto) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  initializeAuth: () => void;
  verifyAuth: () => Promise<boolean>;
  updateProfile: (data: UpdateProfileRequestDto) => Promise<void>;
  updatePassword: (data: UpdatePasswordRequestDto) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      /**
       * Initialize auth from localStorage and cookies
       */
      initializeAuth: () => {
        const token = authService.getToken();
        const user = authService.getUser();

        if (token && user) {
          set({
            token,
            user,
            isAuthenticated: true,
          });

          // Iniciar sistema de auto-refresh
          scheduleTokenRefresh();
        }
      },

      /**
       * Verify if current token is valid
       */
      verifyAuth: async () => {
        const token = get().token;
        if (!token) {
          get().logout();
          return false;
        }

        try {
          const isValid = await authService.verifyToken();
          if (!isValid) {
            get().logout();
            return false;
          }
          return true;
        } catch (error) {
          get().logout();
          return false;
        }
      },

      /**
       * Login user
       */
      login: async (credentials: LoginRequestDto) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authService.login(credentials);

          // Save to localStorage and cookies (remember me = true by default)
          const rememberMe = (credentials as any).rememberMe !== false;
          authService.saveAuthData(response, rememberMe);

          // Update store
          set({
            user: {
              userId: response.userId,
              nome: response.nome,
              sobrenome: response.sobrenome,
              email: response.email,
              bio: response.bio,
              icone: response.icone,
              profissao: response.profissao,
              comoConheceu: response.comoConheceu,
              isMaster: response.isMaster,
            },
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Iniciar sistema de auto-refresh
          scheduleTokenRefresh();
        } catch (error: any) {
          set({
            error: error.message || 'Erro ao fazer login',
            isLoading: false,
          });
          throw error;
        }
      },

      /**
       * Register new user
       */
      register: async (data: RegisterRequestDto) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authService.register(data);

          // Save to localStorage and cookies
          authService.saveAuthData(response, true);

          // Update store
          set({
            user: {
              userId: response.userId,
              nome: response.nome,
              sobrenome: response.sobrenome,
              email: response.email,
              bio: response.bio,
              icone: response.icone,
              profissao: response.profissao,
              comoConheceu: response.comoConheceu,
              isMaster: response.isMaster,
            },
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Iniciar sistema de auto-refresh
          scheduleTokenRefresh();
        } catch (error: any) {
          set({
            error: error.message || 'Erro ao registrar',
            isLoading: false,
          });
          throw error;
        }
      },

      /**
       * Update user profile
       */
      updateProfile: async (data: UpdateProfileRequestDto) => {
        set({ isLoading: true, error: null });

        try {
          const profile = await authService.updateProfile(data);

          // Update user in store
          set({
            user: {
              userId: profile.userId,
              nome: profile.nome,
              sobrenome: profile.sobrenome,
              email: profile.email,
              bio: profile.bio,
              icone: profile.icone,
              profissao: profile.profissao,
              comoConheceu: profile.comoConheceu,
              isMaster: profile.isMaster,
            },
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            error: error.message || 'Erro ao atualizar perfil',
            isLoading: false,
          });
          throw error;
        }
      },

      /**
       * Update user password
       */
      updatePassword: async (data: UpdatePasswordRequestDto) => {
        set({ isLoading: true, error: null });

        try {
          await authService.updatePassword(data);
          set({
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            error: error.message || 'Erro ao atualizar senha',
            isLoading: false,
          });
          throw error;
        }
      },

      /**
       * Refresh profile data from API
       */
      refreshProfile: async () => {
        try {
          const profile = await authService.getProfile();
          set({
            user: {
              userId: profile.userId,
              nome: profile.nome,
              sobrenome: profile.sobrenome,
              email: profile.email,
              bio: profile.bio,
              icone: profile.icone,
              profissao: profile.profissao,
              comoConheceu: profile.comoConheceu,
              isMaster: profile.isMaster,
            },
          });
        } catch (error: any) {
          set({ error: error.message });
        }
      },

      /**
       * Logout user
       */
      logout: () => {
        // Parar sistema de auto-refresh
        stopTokenRefresh();

        authService.logout();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      /**
       * Clear error message
       */
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
