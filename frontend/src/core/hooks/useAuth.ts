import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const { user, token, login, logout, register } = useAuthStore();

  return {
    user,
    token,
    isAuthenticated: !!token,
    login,
    logout,
    register,
  };
}
