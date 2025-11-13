import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { automationService } from '../services/automation.service';
import {
  AutomationDto,
  CreateAutomationDto,
  UpdateAutomationDto,
  AutomationStatsDto,
  AutomationDefinitionDto,
  AutomationRunResultDto,
} from '../types/automation.types';
import { useWorkspaceStore } from '../store/workspaceStore';
import { toast } from '@/hooks/use-toast';

/**
 * Hook para buscar automações disponíveis (catálogo)
 */
export function useAvailableAutomations() {
  return useQuery<AutomationDefinitionDto[]>({
    queryKey: ['automations', 'available'],
    queryFn: () => automationService.getAvailableAutomations(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para buscar automações do usuário
 */
export function useUserAutomations(workspaceId?: string) {
  const currentWorkspace = useWorkspaceStore((state) => state.workspace);
  const finalWorkspaceId = workspaceId || currentWorkspace?.id;

  return useQuery<AutomationDto[]>({
    queryKey: ['automations', 'user', finalWorkspaceId],
    queryFn: () => automationService.getUserAutomations(finalWorkspaceId),
    enabled: !!finalWorkspaceId,
  });
}

/**
 * Hook para buscar uma automação específica
 */
export function useAutomation(id: string) {
  return useQuery<AutomationDto>({
    queryKey: ['automations', id],
    queryFn: () => automationService.getAutomation(id),
    enabled: !!id,
  });
}

/**
 * Hook para buscar estatísticas de automações
 */
export function useAutomationStats(workspaceId?: string) {
  const currentWorkspace = useWorkspaceStore((state) => state.workspace);
  const finalWorkspaceId = workspaceId || currentWorkspace?.id;

  return useQuery<AutomationStatsDto>({
    queryKey: ['automations', 'stats', finalWorkspaceId],
    queryFn: () => automationService.getStatistics(finalWorkspaceId),
    enabled: !!finalWorkspaceId,
  });
}

/**
 * Hook para criar uma automação
 */
export function useCreateAutomation() {
  const queryClient = useQueryClient();
  const currentWorkspace = useWorkspaceStore((state) => state.workspace);

  return useMutation({
    mutationFn: (data: CreateAutomationDto) => automationService.createAutomation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations', 'user'] });
      queryClient.invalidateQueries({ queryKey: ['automations', 'stats'] });
      toast({ title: 'Sucesso', description: 'Automação criada com sucesso!' });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error?.response?.data?.message || 'Erro ao criar automação',
        variant: 'destructive'
      });
    },
  });
}

/**
 * Hook para atualizar uma automação
 */
export function useUpdateAutomation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAutomationDto }) =>
      automationService.updateAutomation(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['automations', 'user'] });
      queryClient.invalidateQueries({ queryKey: ['automations', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['automations', 'stats'] });
      toast({ title: 'Sucesso', description: 'Automação atualizada com sucesso!' });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error?.response?.data?.message || 'Erro ao atualizar automação',
        variant: 'destructive'
      });
    },
  });
}

/**
 * Hook para deletar uma automação
 */
export function useDeleteAutomation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => automationService.deleteAutomation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations', 'user'] });
      queryClient.invalidateQueries({ queryKey: ['automations', 'stats'] });
      toast({ title: 'Sucesso', description: 'Automação removida com sucesso!' });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error?.response?.data?.message || 'Erro ao remover automação',
        variant: 'destructive'
      });
    },
  });
}

/**
 * Hook para ativar/desativar uma automação
 */
export function useToggleAutomation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isEnabled }: { id: string; isEnabled: boolean }) =>
      automationService.toggleAutomation(id, isEnabled),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['automations', 'user'] });
      queryClient.invalidateQueries({ queryKey: ['automations', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['automations', 'stats'] });
      toast({
        title: 'Sucesso',
        description: variables.isEnabled ? 'Automação ativada!' : 'Automação desativada!'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error?.response?.data?.message || 'Erro ao alternar automação',
        variant: 'destructive'
      });
    },
  });
}

/**
 * Hook para executar uma automação manualmente
 */
export function useRunAutomation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dryRun = false }: { id: string; dryRun?: boolean }) =>
      automationService.runAutomation(id, dryRun),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['automations', 'user'] });
      queryClient.invalidateQueries({ queryKey: ['automations', 'stats'] });

      if (result.success) {
        toast({
          title: 'Sucesso',
          description: `Automação executada! ${result.itemsProcessed} itens processados`
        });
      } else {
        toast({
          title: 'Erro',
          description: result.errorMessage || 'Erro desconhecido',
          variant: 'destructive'
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error?.response?.data?.message || 'Erro ao executar automação',
        variant: 'destructive'
      });
    },
  });
}
