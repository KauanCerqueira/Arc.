"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/core/store/authStore';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, initializeAuth, verifyAuth } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      // Initialize auth from localStorage
      initializeAuth();

      // Verify token is still valid
      const isValid = await verifyAuth();

      if (!isValid) {
        // Save current path to redirect after login
        sessionStorage.setItem('redirectAfterLogin', pathname);
        router.replace('/login');
      }

      setIsChecking(false);
    };

    checkAuthentication();
  }, [pathname, router, initializeAuth, verifyAuth]);

  // Show loading while checking auth
  if (isChecking || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-blue-400 dark:border-r-blue-500 rounded-full animate-ping mx-auto opacity-20"></div>
          </div>
          <p className="text-gray-700 dark:text-gray-300 font-medium">Verificando autenticação...</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Por favor, aguarde</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
