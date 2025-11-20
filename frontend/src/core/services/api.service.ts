import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : 'http://localhost:5001/api';

// Create Axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Flag para evitar múltiplas tentativas de refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request Interceptor - Add JWT token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - Handle errors and auto-refresh token
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response) {
      const status = error.response.status;

      // Se receber 401 e não for uma rota de auth
      if (status === 401 && originalRequest && !originalRequest.url?.includes('/auth/')) {

        // Se já tentou fazer refresh, fazer logout
        if (originalRequest._retry) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          localStorage.removeItem('auth_refresh_token');

          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }

        // Se já está fazendo refresh, adicionar à fila
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => {
              return apiClient(originalRequest);
            })
            .catch(err => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = localStorage.getItem('auth_refresh_token');

        if (!refreshToken) {
          // Sem refresh token, fazer logout
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');

          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }

        try {
          // Tentar renovar o token
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken
          });

          const { token, refreshToken: newRefreshToken } = response.data;

          // Salvar novos tokens
          localStorage.setItem('auth_token', token);
          if (newRefreshToken) {
            localStorage.setItem('auth_refresh_token', newRefreshToken);
          }

          // Atualizar header da requisição original
          originalRequest.headers.Authorization = `Bearer ${token}`;

          // Processar fila de requisições pendentes
          processQueue(null, token);

          isRefreshing = false;

          // Retry a requisição original
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh falhou, fazer logout
          processQueue(refreshError, null);
          isRefreshing = false;

          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          localStorage.removeItem('auth_refresh_token');

          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }

          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
