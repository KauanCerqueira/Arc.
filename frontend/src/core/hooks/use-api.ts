import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import axios, { type AxiosRequestConfig, type AxiosError } from 'axios';

// API base URL - pode ser configurado via env
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Cliente Axios configurado com interceptors e tratamento de erros
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
apiClient.interceptors.request.use(
  (config) => {
    // Buscar token do localStorage ou cookie
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para tratamento de erros
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Log de erros em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
      });
    }

    // Redirecionar para login em caso de 401 (não autorizado)
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        // Limpar dados de autenticação
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth-storage');
        document.cookie = 'auth_token=; Max-Age=0; path=/';

        // Salvar URL atual para redirecionar após login
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/register') {
          sessionStorage.setItem('redirectAfterLogin', currentPath);
        }

        // Redirecionar para login
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Hook para fazer queries (GET) com TanStack Query
 *
 * @example
 * const { data, isLoading, error } = useApiQuery({
 *   key: ['workspaces'],
 *   url: '/api/workspaces'
 * });
 */
export function useApiQuery<TData = unknown>({
  key,
  url,
  config,
  ...queryOptions
}: {
  key: string[];
  url: string;
  config?: AxiosRequestConfig;
} & Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'>) {
  return useQuery<TData>({
    queryKey: key,
    queryFn: async () => {
      const { data } = await apiClient.get<TData>(url, config);
      return data;
    },
    ...queryOptions,
  });
}

/**
 * Hook para fazer mutations (POST, PUT, DELETE) com TanStack Query
 *
 * @example
 * const createWorkspace = useApiMutation({
 *   method: 'POST',
 *   url: '/api/workspaces',
 *   invalidateKeys: [['workspaces']]
 * });
 *
 * createWorkspace.mutate({ name: 'My Workspace' });
 */
export function useApiMutation<TData = unknown, TVariables = unknown>({
  method,
  url,
  invalidateKeys = [],
  ...mutationOptions
}: {
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string | ((variables: TVariables) => string);
  invalidateKeys?: string[][];
} & Omit<UseMutationOptions<TData, AxiosError, TVariables>, 'mutationFn'>) {
  const queryClient = useQueryClient();

  return useMutation<TData, AxiosError, TVariables>({
    ...mutationOptions,
    mutationFn: async (variables) => {
      const finalUrl = typeof url === 'function' ? url(variables) : url;

      const { data } = await apiClient.request<TData>({
        method,
        url: finalUrl,
        data: variables,
      });

      return data;
    },
    onSuccess: (...args: any[]) => {
      // Invalidar queries relacionadas
      invalidateKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });

      // Chamar onSuccess customizado se existir
      if (mutationOptions.onSuccess) {
        (mutationOptions.onSuccess as any)(...args);
      }
    },
  });
}

/**
 * Hook para invalidar queries manualmente
 */
export function useInvalidateQuery() {
  const queryClient = useQueryClient();

  return (keys: string[][]) => {
    keys.forEach((key) => {
      queryClient.invalidateQueries({ queryKey: key });
    });
  };
}

/**
 * Hook para fazer prefetch de dados (útil para hover states, etc)
 */
export function usePrefetchQuery() {
  const queryClient = useQueryClient();

  return async (key: string[], url: string) => {
    await queryClient.prefetchQuery({
      queryKey: key,
      queryFn: async () => {
        const { data } = await apiClient.get(url);
        return data;
      },
      staleTime: 1000 * 60, // 1 minute
    });
  };
}
