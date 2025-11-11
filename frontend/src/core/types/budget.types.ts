export type BudgetStatus = "Draft" | "Sent" | "Approved" | "Rejected" | "Expired"
export type CalculationType = "ByFeatures" | "ByHours" | "ByPackage" | "ByComplexity" | "Hybrid"
export type ProjectComplexity = "Low" | "Medium" | "High" | "VeryHigh"

export interface BudgetItem {
  id: string
  name: string
  description: string
  category: string
  quantity: number
  unitPrice: number
  totalPrice: number
  estimatedHours: number
  hourlyRate: number
  complexity: ProjectComplexity
  order: number
}

export interface BudgetPhase {
  id: string
  name: string
  description: string
  durationDays: number
  amount: number
  order: number
}

export interface BudgetSummary {
  totalItems: number
  totalHours: number
  averageHourlyRate: number
  totalDuration: number
  byCategory: Record<string, number>
  byComplexity: Record<string, number>
}

export interface Budget {
  id: string
  workspaceId: string
  pageId: string
  budgetNumber: string
  clientName: string
  clientEmail: string
  clientCompany: string
  clientDocument: string
  clientPhone: string
  clientAddress: string
  projectName: string
  projectDescription: string
  calculationType: CalculationType
  status: BudgetStatus

  // Financial Information
  totalAmount: number
  discountPercentage: number
  discountAmount: number
  subtotalAfterDiscount: number

  // Tax Information
  taxPercentage: number
  taxAmount: number
  issPercentage: number
  issAmount: number
  irpfPercentage: number
  irpfAmount: number
  pisPercentage: number
  pisAmount: number
  cofinsPercentage: number
  cofinsAmount: number

  finalAmount: number
  currency: string
  validityDays: number

  // Payment Information
  numberOfInstallments: number
  paymentMethod: string
  paymentTerms: string

  // Company Information
  companyName: string
  companyAddress: string
  companyPhone: string
  companyEmail: string
  companyWebsite: string
  companyCNPJ: string
  companyLogoUrl: string

  createdAt: string
  updatedAt: string
  sentAt?: string
  approvedAt?: string
  expiresAt?: string
  notes: string
  termsAndConditions: string
  items: BudgetItem[]
  phases: BudgetPhase[]
  paymentInstallments: PaymentInstallment[]
  summary: BudgetSummary
}

export interface CreateBudgetItemDto {
  name: string
  description: string
  category: string
  quantity: number
  unitPrice: number
  estimatedHours: number
  hourlyRate: number
  complexity: ProjectComplexity
}

export interface CreateBudgetPhaseDto {
  name: string
  description: string
  durationDays: number
  amount: number
}

export interface CreateBudgetDto {
  workspaceId: string
  pageId: string
  clientName: string
  clientEmail: string
  clientCompany: string
  projectName: string
  projectDescription: string
  calculationType: CalculationType
  currency?: string
  validityDays?: number
  discountPercentage?: number
  notes: string
  termsAndConditions: string
  items: CreateBudgetItemDto[]
  phases: CreateBudgetPhaseDto[]
}

export interface UpdateBudgetDto {
  clientName?: string
  clientEmail?: string
  clientCompany?: string
  projectName?: string
  projectDescription?: string
  status?: BudgetStatus
  discountPercentage?: number
  notes?: string
  termsAndConditions?: string
  items?: CreateBudgetItemDto[]
  phases?: CreateBudgetPhaseDto[]
}

export interface QuickFeatureDto {
  name: string
  complexity: ProjectComplexity
  estimatedHours: number
}

export interface QuickHoursDto {
  frontendHours: number
  backendHours: number
  designHours: number
  testingHours: number
  projectManagementHours: number
}

export interface QuickCalculationDto {
  calculationType: CalculationType
  features?: QuickFeatureDto[]
  hours?: QuickHoursDto
  packageType?: string
  hourlyRate: number
}

export interface QuickCalculationResult {
  totalAmount: number
  totalHours: number
  breakdown: Record<string, number>
  recommendations: string[]
}

export interface BudgetTemplate {
  name: string
  description: string
  calculationType: CalculationType
  defaultItems: CreateBudgetItemDto[]
  defaultPhases: CreateBudgetPhaseDto[]
  defaultTerms: string
}

export interface BudgetAnalytics {
  totalBudgets: number
  totalValue: number
  averageValue: number
  approvedCount: number
  rejectedCount: number
  pendingCount: number
  approvalRate: number
}

export interface PaymentInstallment {
  id: string
  budgetId: string
  installmentNumber: number
  amount: number
  percentage: number
  description: string
  daysFromStart: number
  dueDate: string
  isPaid: boolean
  paidAt?: string
  createdAt: string
}

export interface TaxConfiguration {
  issPercentage: number
  irpfPercentage: number
  csllPercentage: number
  pisPercentage: number
  cofinsPercentage: number
  totalTaxPercentage: number
}

export interface PaymentSchedule {
  numberOfInstallments: number
  installments: PaymentInstallmentDto[]
}

export interface PaymentInstallmentDto {
  installmentNumber: number
  amount: number
  percentage: number
  description: string
  daysFromStart: number
}

export interface GeneratePdfDto {
  includeLogo?: boolean
  includeItemDetails?: boolean
  includePhases?: boolean
  includeTerms?: boolean
  includePaymentSchedule?: boolean
  includeTaxBreakdown?: boolean
  language?: string
  colorScheme?: string
  companyName?: string
  companyAddress?: string
  companyPhone?: string
  companyEmail?: string
  companyWebsite?: string
  companyCNPJ?: string
  companyLogoUrl?: string
}

export interface ResourceCost {
  resourceType: string // Developer, Designer, etc.
  seniorityLevel: string // Junior, Pleno, Senior
  hourlyRate: number
  allocatedHours: number
  totalCost: number
}

export interface PackageOption {
  name: string
  description: string
  basePrice: number
  includedFeatures: string[]
  estimatedDays: number
}

export interface ComplexityMatrix {
  featureType: string
  lowComplexityHours: number
  mediumComplexityHours: number
  highComplexityHours: number
  veryHighComplexityHours: number
}
