"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/core/store/authStore';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, initializeAuth, verifyAuth } = useAuthStore();

  useEffect(() => {
    // Initialize auth from localStorage on mount
    initializeAuth();

    // Verify token is still valid
    const checkAuth = async () => {
      const isValid = await verifyAuth();

      if (!isValid) {
        router.push('/login');
      }
    };

    if (!isAuthenticated) {
      router.push('/login');
    } else {
      checkAuth();
    }
  }, []);

  // Show loading or nothing while checking auth
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
