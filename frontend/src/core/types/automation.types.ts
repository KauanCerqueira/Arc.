/**
 * Tipos para o sistema de automações
 */

export enum AutomationStatus {
  Idle = 0,
  Running = 1,
  Success = 2,
  Failed = 3,
  Paused = 4,
}

export interface AutomationDto {
  id: string;
  userId: string;
  workspaceId?: string;
  automationType: string;
  isEnabled: boolean;
  settings?: string;
  lastRunAt?: string;
  nextRunAt?: string;
  itemsProcessed: number;
  errorMessage?: string;
  status: AutomationStatus;
  metadata?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAutomationDto {
  userId: string;
  workspaceId?: string;
  automationType: string;
  isEnabled: boolean;
  settings?: string;
}

export interface UpdateAutomationDto {
  isEnabled?: boolean;
  settings?: string;
}

export interface AutomationStatsDto {
  totalAutomations: number;
  enabledAutomations: number;
  runningAutomations: number;
  failedAutomations: number;
  totalItemsProcessed: number;
  lastSuccessfulRun?: string;
  byType: AutomationTypeStatsDto[];
}

export interface AutomationTypeStatsDto {
  automationType: string;
  count: number;
  enabledCount: number;
  totalItemsProcessed: number;
}

export interface AutomationDefinitionDto {
  type: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requiresIntegration: boolean;
  requiredIntegrations?: string[];
  settingsSchema: AutomationSettingDefinitionDto[];
  isAvailable: boolean;
}

export interface AutomationSettingDefinitionDto {
  key: string;
  label: string;
  description: string;
  type: 'boolean' | 'string' | 'number' | 'select' | 'multiselect';
  required: boolean;
  defaultValue?: any;
  options?: AutomationSettingOptionDto[];
}

export interface AutomationSettingOptionDto {
  value: string;
  label: string;
}

export interface TasksToCalendarSettingsDto {
  includePageIds?: string[];
  taskStatuses: string[];
  priorities?: string[];
  syncMode: 'realtime' | 'scheduled';
  syncIntervalMinutes?: number;
  addAsAllDayEvents: boolean;
  defaultCategory: string;
}

export interface AutomationRunResultDto {
  automationId: string;
  success: boolean;
  errorMessage?: string;
  itemsProcessed: number;
  startedAt: string;
  completedAt: string;
  duration: string;
  logs: string[];
}

// Helper para parsear settings
export function parseAutomationSettings<T>(automation: AutomationDto): T | null {
  if (!automation.settings) return null;
  try {
    return JSON.parse(automation.settings) as T;
  } catch {
    return null;
  }
}

// Helper para criar settings
export function stringifyAutomationSettings(settings: any): string {
  return JSON.stringify(settings);
}
