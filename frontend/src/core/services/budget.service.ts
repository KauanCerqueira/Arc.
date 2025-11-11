import apiClient from "./api.service"
import type {
  Budget,
  CreateBudgetDto,
  UpdateBudgetDto,
  QuickCalculationDto,
  QuickCalculationResult,
  BudgetTemplate,
  BudgetAnalytics,
  GeneratePdfDto,
} from "@/core/types/budget.types"

export const budgetService = {
  // Create a new budget
  async create(data: CreateBudgetDto): Promise<Budget> {
    const res = await apiClient.post<Budget>("/budget", data)
    return res.data
  },

  // Get budget by ID
  async getById(id: string): Promise<Budget> {
    const res = await apiClient.get<Budget>(`/budget/${id}`)
    return res.data
  },

  // Get all budgets for a workspace
  async getByWorkspace(workspaceId: string): Promise<Budget[]> {
    const res = await apiClient.get<Budget[]>(`/budget/workspace/${workspaceId}`)
    return res.data
  },

  // Get all budgets for a page
  async getByPage(pageId: string): Promise<Budget[]> {
    const res = await apiClient.get<Budget[]>(`/budget/page/${pageId}`)
    return res.data
  },

  // Update budget
  async update(id: string, data: UpdateBudgetDto): Promise<Budget> {
    const res = await apiClient.put<Budget>(`/budget/${id}`, data)
    return res.data
  },

  // Delete budget
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/budget/${id}`)
  },

  // Send budget to client
  async send(id: string): Promise<Budget> {
    const res = await apiClient.post<Budget>(`/budget/${id}/send`)
    return res.data
  },

  // Approve budget
  async approve(id: string): Promise<Budget> {
    const res = await apiClient.post<Budget>(`/budget/${id}/approve`)
    return res.data
  },

  // Reject budget
  async reject(id: string): Promise<Budget> {
    const res = await apiClient.post<Budget>(`/budget/${id}/reject`)
    return res.data
  },

  // Quick calculation
  async quickCalculate(data: QuickCalculationDto): Promise<QuickCalculationResult> {
    const res = await apiClient.post<QuickCalculationResult>("/budget/quick-calculate", data)
    return res.data
  },

  // Recalculate budget
  async recalculate(id: string): Promise<Budget> {
    const res = await apiClient.post<Budget>(`/budget/${id}/recalculate`)
    return res.data
  },

  // Get templates
  async getTemplates(): Promise<BudgetTemplate[]> {
    const res = await apiClient.get<BudgetTemplate[]>("/budget/templates")
    return res.data
  },

  // Create from template
  async createFromTemplate(templateName: string, workspaceId: string, pageId: string): Promise<Budget> {
    const res = await apiClient.post<Budget>(
      `/budget/from-template`,
      null,
      { params: { templateName, workspaceId, pageId } }
    )
    return res.data
  },

  // Get analytics
  async getAnalytics(workspaceId: string): Promise<BudgetAnalytics> {
    const res = await apiClient.get<BudgetAnalytics>(`/budget/analytics/${workspaceId}`)
    return res.data
  },

  // Download PDF
  async downloadPdf(id: string, options?: GeneratePdfDto): Promise<Blob> {
    const defaultOptions: GeneratePdfDto = {
      includeLogo: true,
      includeItemDetails: true,
      includePhases: true,
      includeTerms: true,
      includePaymentSchedule: true,
      includeTaxBreakdown: true,
      language: "pt-BR",
      colorScheme: "professional",
      companyName: "Arc.",
    }

    const res = await apiClient.post(`/budget/${id}/generate-pdf`, { ...defaultOptions, ...options }, {
      responseType: "blob",
    })
    return res.data as unknown as Blob
  },
}
