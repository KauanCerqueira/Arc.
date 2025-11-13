'use client';

import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import {
  AutomationDto,
  AutomationDefinitionDto,
  parseAutomationSettings,
  stringifyAutomationSettings,
  TasksToCalendarSettingsDto,
} from '@/core/types/automation.types';
import { useCreateAutomation, useUpdateAutomation } from '@/core/hooks/useAutomations';
import { useWorkspaceStore } from '@/core/store/workspaceStore';
import { useAuthStore } from '@/core/store/authStore';

interface AutomationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  definition: AutomationDefinitionDto;
  automation?: AutomationDto;
}

export default function AutomationSettingsModal({
  isOpen,
  onClose,
  definition,
  automation,
}: AutomationSettingsModalProps) {
  const workspace = useWorkspaceStore((state) => state.workspace);
  const user = useAuthStore((state) => state.user);
  const createAutomation = useCreateAutomation();
  const updateAutomation = useUpdateAutomation();

  // Estado para configurações
  const [settings, setSettings] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  // Inicializa configurações
  useEffect(() => {
    if (isOpen) {
      if (automation) {
        // Edição: carrega settings existentes
        const parsedSettings = parseAutomationSettings(automation);
        setSettings(parsedSettings || getDefaultSettings());
      } else {
        // Criação: usa defaults
        setSettings(getDefaultSettings());
      }
    }
  }, [isOpen, automation]);

  // Defaults baseados no schema
  const getDefaultSettings = () => {
    const defaults: any = {};
    definition.settingsSchema.forEach((setting) => {
      if (setting.defaultValue !== undefined) {
        defaults[setting.key] = setting.defaultValue;
      }
    });
    return defaults;
  };

  const handleSave = async () => {
    if (!user || !workspace) return;

    setIsLoading(true);
    try {
      const settingsJson = stringifyAutomationSettings(settings);

      if (automation) {
        // Atualizar automação existente
        await updateAutomation.mutateAsync({
          id: automation.id,
          data: {
            settings: settingsJson,
            isEnabled: automation.isEnabled,
          },
        });
      } else {
        // Criar nova automação
        await createAutomation.mutateAsync({
          userId: user.userId,
          workspaceId: workspace.id,
          automationType: definition.type,
          isEnabled: false, // Inicialmente desativada
          settings: settingsJson,
        });
      }

      onClose();
    } catch (error) {
      console.error('Erro ao salvar automação:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-arc-secondary rounded-2xl border border-arc max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-arc">
          <div>
            <h2 className="text-2xl font-bold text-arc">{definition.name}</h2>
            <p className="text-sm text-arc-muted mt-1">{definition.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-arc-primary rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-arc" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {definition.settingsSchema.map((setting) => (
              <div key={setting.key} className="space-y-2">
                <label className="block text-sm font-medium text-arc">
                  {setting.label}
                  {setting.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <p className="text-xs text-arc-muted">{setting.description}</p>

                {/* Renderiza campo baseado no tipo */}
                {setting.type === 'boolean' && (
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={settings[setting.key] || false}
                        onChange={(e) => handleSettingChange(setting.key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#6E62E5] peer-focus:ring-opacity-20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6E62E5]"></div>
                    </div>
                    <span className="text-sm text-arc">
                      {settings[setting.key] ? 'Sim' : 'Não'}
                    </span>
                  </label>
                )}

                {setting.type === 'string' && (
                  <input
                    type="text"
                    value={settings[setting.key] || ''}
                    onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                    className="w-full px-4 py-2 bg-arc-primary text-arc border border-arc rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6E62E5] focus:ring-opacity-50"
                    required={setting.required}
                  />
                )}

                {setting.type === 'number' && (
                  <input
                    type="number"
                    value={settings[setting.key] || ''}
                    onChange={(e) => handleSettingChange(setting.key, parseInt(e.target.value))}
                    className="w-full px-4 py-2 bg-arc-primary text-arc border border-arc rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6E62E5] focus:ring-opacity-50"
                    required={setting.required}
                  />
                )}

                {setting.type === 'select' && setting.options && (
                  <select
                    value={settings[setting.key] || ''}
                    onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                    className="w-full px-4 py-2 bg-arc-primary text-arc border border-arc rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6E62E5] focus:ring-opacity-50"
                    required={setting.required}
                  >
                    <option value="">Selecione...</option>
                    {setting.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}

                {setting.type === 'multiselect' && setting.options && (
                  <div className="space-y-2 p-4 bg-arc-primary border border-arc rounded-lg">
                    {setting.options.map((option) => (
                      <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={(settings[setting.key] || []).includes(option.value)}
                          onChange={(e) => {
                            const currentValues = settings[setting.key] || [];
                            const newValues = e.target.checked
                              ? [...currentValues, option.value]
                              : currentValues.filter((v: string) => v !== option.value);
                            handleSettingChange(setting.key, newValues);
                          }}
                          className="w-4 h-4 text-[#6E62E5] bg-arc-primary border-arc rounded focus:ring-[#6E62E5] focus:ring-2"
                        />
                        <span className="text-sm text-arc">{option.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-arc">
          <button
            onClick={onClose}
            className="px-4 py-2 text-arc hover:bg-arc-primary rounded-lg transition-colors"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2 bg-[#6E62E5] hover:bg-[#5E55D9] text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {automation ? 'Atualizar' : 'Criar Automação'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
