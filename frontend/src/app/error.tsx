'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log do erro para monitoramento
    console.error('Erro capturado:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-arc-primary px-4">
      <div className="w-full max-w-md">
        {/* Card de erro com design Arc. */}
        <div className="bg-arc-secondary rounded-2xl border border-arc p-8 shadow-lg animate-fade-in">
          {/* Ícone de erro */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              {/* Círculo de fundo pulsante */}
              <div className="absolute inset-0 bg-[#EB5757] opacity-10 rounded-full animate-pulse" />
              {/* Ícone */}
              <div className="relative bg-[#EB5757] bg-opacity-10 p-4 rounded-full">
                <AlertCircle className="w-12 h-12 text-[#EB5757]" strokeWidth={2} />
              </div>
            </div>
          </div>

          {/* Título */}
          <h1 className="text-2xl font-bold text-arc text-center mb-3">
            Algo deu errado
          </h1>

          {/* Descrição */}
          <p className="text-arc-muted text-center mb-6 text-sm leading-relaxed">
            Encontramos um problema inesperado. Você pode tentar novamente ou voltar para a página inicial.
          </p>

          {/* Detalhes do erro (ambiente de desenvolvimento) */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mb-6">
              <summary className="cursor-pointer text-xs text-arc-muted hover:text-arc transition-colors mb-2">
                Detalhes técnicos
              </summary>
              <div className="bg-arc-primary rounded-lg p-3 border border-arc">
                <p className="text-xs font-mono text-[#EB5757] break-all">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-xs text-arc-muted mt-2">
                    ID: {error.digest}
                  </p>
                )}
              </div>
            </details>
          )}

          {/* Botões de ação */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Botão de retry */}
            <button
              onClick={reset}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#6E62E5] hover:bg-[#5E55D9] text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
            >
              <RefreshCw className="w-4 h-4" />
              Tentar novamente
            </button>

            {/* Botão de home */}
            <Link
              href="/"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-arc-primary hover:bg-arc-tertiary text-arc border border-arc rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Home className="w-4 h-4" />
              Página inicial
            </Link>
          </div>
        </div>

        {/* Mensagem de suporte */}
        <p className="text-center text-xs text-arc-muted mt-6">
          Se o problema persistir, entre em contato com o suporte
        </p>
      </div>
    </div>
  );
}
