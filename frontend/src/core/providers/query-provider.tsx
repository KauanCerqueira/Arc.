'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';

/**
 * React Query Provider com configurações otimizadas para performance global
 *
 * Configurações:
 * - Cache automático de 5 minutos
 * - Stale time de 1 minuto (dados considerados "frescos")
 * - Retry automático 3x com backoff exponencial
 * - Refetch ao focar janela (melhor UX)
 * - Garbage collection após 10 minutos
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cache duration
            gcTime: 1000 * 60 * 10, // 10 minutes (old name: cacheTime)

            // Stale time - considera dados "frescos" por 1 minuto
            staleTime: 1000 * 60, // 1 minute

            // Retry automático
            retry: 3,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

            // Refetch behavior
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
            refetchOnMount: true,

            // Network mode
            networkMode: 'online',
          },
          mutations: {
            // Retry mutations only once
            retry: 1,
            retryDelay: 1000,
            networkMode: 'online',
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* React Query Devtools - apenas em desenvolvimento */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
          position="bottom"
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
}
