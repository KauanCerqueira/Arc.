'use client';

import { useState } from 'react';
import {
  Calendar,
  Settings,
  Play,
  Check,
  AlertCircle,
  Loader2,
  Clock,
  Zap
} from 'lucide-react';
import { AutomationDto, AutomationDefinitionDto, AutomationStatus } from '@/core/types/automation.types';
import { useToggleAutomation, useRunAutomation } from '@/core/hooks/useAutomations';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AutomationCardProps {
  definition: AutomationDefinitionDto;
  automation?: AutomationDto;
  onConfigure: (definition: AutomationDefinitionDto, automation?: AutomationDto) => void;
}

// Mapeia tipos de automação para ícones
const getAutomationIcon = (type: string) => {
  switch (type) {
    case 'tasks-to-calendar':
      return Calendar;
    default:
      return Zap;
  }
};

// Mapeia status para cores
const getStatusColor = (status: AutomationStatus) => {
  switch (status) {
    case AutomationStatus.Success:
      return 'text-green-600 dark:text-green-400';
    case AutomationStatus.Failed:
      return 'text-red-600 dark:text-red-400';
    case AutomationStatus.Running:
      return 'text-blue-600 dark:text-blue-400';
    case AutomationStatus.Paused:
      return 'text-gray-600 dark:text-gray-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
};

// Mapeia status para texto
const getStatusText = (status: AutomationStatus) => {
  switch (status) {
    case AutomationStatus.Success:
      return 'Última execução bem-sucedida';
    case AutomationStatus.Failed:
      return 'Última execução falhou';
    case AutomationStatus.Running:
      return 'Em execução...';
    case AutomationStatus.Paused:
      return 'Pausada';
    default:
      return 'Ociosa';
  }
};

export default function AutomationCard({ definition, automation, onConfigure }: AutomationCardProps) {
  const Icon = getAutomationIcon(definition.type);
  const toggleAutomation = useToggleAutomation();
  const runAutomation = useRunAutomation();
  const [isToggling, setIsToggling] = useState(false);

  const isEnabled = automation?.isEnabled || false;
  const isConfigured = !!automation;
  const isAvailable = definition.isAvailable;

  const handleToggle = async () => {
    if (!automation) return;

    setIsToggling(true);
    try {
      await toggleAutomation.mutateAsync({
        id: automation.id,
        isEnabled: !isEnabled,
      });
    } finally {
      setIsToggling(false);
    }
  };

  const handleRun = async () => {
    if (!automation) return;

    await runAutomation.mutateAsync({
      id: automation.id,
      dryRun: false,
    });
  };

  const handleConfigure = () => {
    onConfigure(definition, automation);
  };

  return (
    <div className={`bg-arc-secondary border border-arc rounded-xl p-6 transition-all duration-200 hover:shadow-md ${
      !isAvailable ? 'opacity-60' : ''
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          {/* Ícone */}
          <div className={`p-3 rounded-lg ${
            isEnabled
              ? 'bg-[#6E62E5] bg-opacity-10 text-[#6E62E5]'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
          }`}>
            <Icon className="w-6 h-6" />
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-arc">{definition.name}</h3>
              {isConfigured && isEnabled && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900 dark:bg-opacity-30 rounded-full">
                  <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                  <span className="text-xs font-medium text-green-600 dark:text-green-400">Ativa</span>
                </div>
              )}
              {!isAvailable && (
                <div className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Em breve</span>
                </div>
              )}
            </div>
            <p className="text-sm text-arc-muted">{definition.description}</p>
          </div>
        </div>
      </div>

      {/* Status e estatísticas */}
      {isConfigured && automation && (
        <div className="mb-4 p-3 bg-arc-primary rounded-lg border border-arc">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                automation.status === AutomationStatus.Success
                  ? 'bg-green-500'
                  : automation.status === AutomationStatus.Failed
                  ? 'bg-red-500'
                  : automation.status === AutomationStatus.Running
                  ? 'bg-blue-500 animate-pulse'
                  : 'bg-gray-400'
              }`} />
              <span className={`text-xs font-medium ${getStatusColor(automation.status)}`}>
                {getStatusText(automation.status)}
              </span>
            </div>
            {automation.lastRunAt && (
              <div className="flex items-center gap-1 text-xs text-arc-muted">
                <Clock className="w-3 h-3" />
                {format(new Date(automation.lastRunAt), "dd/MM 'às' HH:mm", { locale: ptBR })}
              </div>
            )}
          </div>

          {automation.itemsProcessed > 0 && (
            <div className="text-xs text-arc-muted">
              {automation.itemsProcessed} {automation.itemsProcessed === 1 ? 'item processado' : 'itens processados'}
            </div>
          )}

          {automation.errorMessage && (
            <div className="mt-2 flex items-start gap-2 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>{automation.errorMessage}</span>
            </div>
          )}
        </div>
      )}

      {/* Categoria e requisitos */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="px-2 py-1 text-xs font-medium bg-arc-primary text-arc-muted rounded-md border border-arc capitalize">
          {definition.category}
        </span>
        {definition.requiresIntegration && definition.requiredIntegrations && (
          <span className="px-2 py-1 text-xs font-medium bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 text-blue-600 dark:text-blue-400 rounded-md">
            Requer: {definition.requiredIntegrations.join(', ')}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {isAvailable && (
          <>
            <button
              onClick={handleConfigure}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-arc-primary hover:bg-arc-tertiary text-arc border border-arc rounded-lg font-medium transition-all duration-200"
            >
              <Settings className="w-4 h-4" />
              {isConfigured ? 'Configurar' : 'Ativar'}
            </button>

            {isConfigured && automation && (
              <>
                <button
                  onClick={handleToggle}
                  disabled={isToggling}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isEnabled
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      : 'bg-[#6E62E5] hover:bg-[#5E55D9] text-white'
                  }`}
                >
                  {isToggling ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isEnabled ? (
                    'Desativar'
                  ) : (
                    'Ativar'
                  )}
                </button>

                {isEnabled && (
                  <button
                    onClick={handleRun}
                    disabled={runAutomation.isPending || automation.status === AutomationStatus.Running}
                    className="p-2 bg-green-100 dark:bg-green-900 dark:bg-opacity-30 hover:bg-green-200 dark:hover:bg-green-800 dark:hover:bg-opacity-40 text-green-600 dark:text-green-400 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Executar agora"
                  >
                    {runAutomation.isPending || automation.status === AutomationStatus.Running ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </button>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
