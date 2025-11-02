// Tipos de planos disponíveis
export enum PlanType {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE'
}

// Status da assinatura
export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  CANCELED = 'CANCELED',
  PAST_DUE = 'PAST_DUE',
  TRIALING = 'TRIALING',
  INCOMPLETE = 'INCOMPLETE'
}

// Intervalo de pagamento
export enum BillingInterval {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY'
}

// Limites por plano
export interface PlanLimits {
  maxWorkspaces: number;
  maxProjects: number;
  maxTeamMembers: number;
  maxStorageMB: number;
  maxFileUploadMB: number;
  maxIntegrations: number;
  hasAdvancedAnalytics: boolean;
  hasCustomBranding: boolean;
  hasPrioritySupport: boolean;
  hasApiAccess: boolean;
  hasCustomDomain: boolean;
}

// Informações do plano
export interface Plan {
  type: PlanType;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  limits: PlanLimits;
  features: string[];
  popular?: boolean;
}

// Subscription do usuário
export interface Subscription {
  id: string;
  userId: string;
  planType: PlanType;
  status: SubscriptionStatus;
  billingInterval: BillingInterval;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Claims/Permissões do usuário
export interface UserClaims {
  userId: string;
  planType: PlanType;
  canCreateWorkspace: boolean;
  canInviteMembers: boolean;
  canAccessAnalytics: boolean;
  canExportData: boolean;
  canUseApi: boolean;
  canCustomizeBranding: boolean;
  maxWorkspaces: number;
  maxProjects: number;
  maxTeamMembers: number;
}

// Configuração dos planos
export const PLANS: Record<PlanType, Plan> = {
  [PlanType.FREE]: {
    type: PlanType.FREE,
    name: 'Gratuito',
    description: 'Perfeito para começar',
    monthlyPrice: 0,
    yearlyPrice: 0,
    limits: {
      maxWorkspaces: 1,
      maxProjects: 3,
      maxTeamMembers: 1,
      maxStorageMB: 100,
      maxFileUploadMB: 5,
      maxIntegrations: 0,
      hasAdvancedAnalytics: false,
      hasCustomBranding: false,
      hasPrioritySupport: false,
      hasApiAccess: false,
      hasCustomDomain: false,
    },
    features: [
      '1 workspace',
      'Até 3 projetos',
      'Templates básicos',
      '100MB de armazenamento',
      'Suporte por email'
    ]
  },
  [PlanType.BASIC]: {
    type: PlanType.BASIC,
    name: 'Básico',
    description: 'Para indivíduos produtivos',
    monthlyPrice: 5,
    yearlyPrice: 50,
    limits: {
      maxWorkspaces: 3,
      maxProjects: 20,
      maxTeamMembers: 3,
      maxStorageMB: 1000,
      maxFileUploadMB: 25,
      maxIntegrations: 3,
      hasAdvancedAnalytics: false,
      hasCustomBranding: false,
      hasPrioritySupport: false,
      hasApiAccess: false,
      hasCustomDomain: false,
    },
    features: [
      '3 workspaces',
      'Até 20 projetos',
      'Até 3 membros por time',
      '1GB de armazenamento',
      '3 integrações',
      'Todos os templates'
    ],
    popular: true
  },
  [PlanType.PRO]: {
    type: PlanType.PRO,
    name: 'Pro',
    description: 'Para times que crescem',
    monthlyPrice: 15,
    yearlyPrice: 150,
    limits: {
      maxWorkspaces: 10,
      maxProjects: 100,
      maxTeamMembers: 15,
      maxStorageMB: 10000,
      maxFileUploadMB: 100,
      maxIntegrations: 10,
      hasAdvancedAnalytics: true,
      hasCustomBranding: true,
      hasPrioritySupport: true,
      hasApiAccess: true,
      hasCustomDomain: false,
    },
    features: [
      '10 workspaces',
      'Até 100 projetos',
      'Até 15 membros por time',
      '10GB de armazenamento',
      '10 integrações',
      'Analytics avançado',
      'Branding customizado',
      'API access',
      'Suporte prioritário'
    ]
  },
  [PlanType.ENTERPRISE]: {
    type: PlanType.ENTERPRISE,
    name: 'Enterprise',
    description: 'Para grandes organizações',
    monthlyPrice: 50,
    yearlyPrice: 500,
    limits: {
      maxWorkspaces: -1, // ilimitado
      maxProjects: -1,
      maxTeamMembers: -1,
      maxStorageMB: 100000,
      maxFileUploadMB: 500,
      maxIntegrations: -1,
      hasAdvancedAnalytics: true,
      hasCustomBranding: true,
      hasPrioritySupport: true,
      hasApiAccess: true,
      hasCustomDomain: true,
    },
    features: [
      'Workspaces ilimitados',
      'Projetos ilimitados',
      'Membros ilimitados',
      '100GB de armazenamento',
      'Integrações ilimitadas',
      'Analytics avançado',
      'Branding customizado',
      'API completa',
      'Domínio customizado',
      'Suporte dedicado 24/7',
      'SLA garantido'
    ]
  }
};

// Helper para verificar limites
export function canPerformAction(
  subscription: Subscription | null,
  action: keyof PlanLimits
): boolean {
  const planType = subscription?.planType || PlanType.FREE;
  const plan = PLANS[planType];
  return plan.limits[action] as boolean;
}

// Helper para verificar se atingiu limite
export function hasReachedLimit(
  subscription: Subscription | null,
  limitType: 'maxWorkspaces' | 'maxProjects' | 'maxTeamMembers',
  currentCount: number
): boolean {
  const planType = subscription?.planType || PlanType.FREE;
  const plan = PLANS[planType];
  const limit = plan.limits[limitType];

  if (limit === -1) return false; // ilimitado
  return currentCount >= limit;
}
