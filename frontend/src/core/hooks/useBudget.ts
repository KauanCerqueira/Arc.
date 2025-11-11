import { useState, useCallback } from "react"
import { budgetService } from "@/core/services/budget.service"
import type {
  Budget,
  CreateBudgetDto,
  UpdateBudgetDto,
  QuickCalculationDto,
  QuickCalculationResult,
  BudgetTemplate,
  BudgetAnalytics,
} from "@/core/types/budget.types"

export function useBudget(pageId?: string) {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null)
  const [templates, setTemplates] = useState<BudgetTemplate[]>([])
  const [analytics, setAnalytics] = useState<BudgetAnalytics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load budgets for page
  const loadBudgets = useCallback(async (targetPageId?: string) => {
    if (!targetPageId && !pageId) return

    setLoading(true)
    setError(null)

    try {
      const data = await budgetService.getByPage(targetPageId || pageId!)
      setBudgets(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load budgets")
    } finally {
      setLoading(false)
    }
  }, [pageId])

  // Load single budget
  const loadBudget = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const data = await budgetService.getById(id)
      setCurrentBudget(data)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load budget")
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Create budget
  const createBudget = useCallback(async (data: CreateBudgetDto) => {
    setLoading(true)
    setError(null)

    try {
      const newBudget = await budgetService.create(data)
      setBudgets((prev) => [newBudget, ...prev])
      setCurrentBudget(newBudget)
      return newBudget
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create budget")
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Update budget
  const updateBudget = useCallback(async (id: string, data: UpdateBudgetDto) => {
    setLoading(true)
    setError(null)

    try {
      const updated = await budgetService.update(id, data)
      setBudgets((prev) => prev.map((b) => (b.id === id ? updated : b)))
      if (currentBudget?.id === id) {
        setCurrentBudget(updated)
      }
      return updated
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update budget")
      return null
    } finally {
      setLoading(false)
    }
  }, [currentBudget])

  // Delete budget
  const deleteBudget = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      await budgetService.delete(id)
      setBudgets((prev) => prev.filter((b) => b.id !== id))
      if (currentBudget?.id === id) {
        setCurrentBudget(null)
      }
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete budget")
      return false
    } finally {
      setLoading(false)
    }
  }, [currentBudget])

  // Send budget
  const sendBudget = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const sent = await budgetService.send(id)
      setBudgets((prev) => prev.map((b) => (b.id === id ? sent : b)))
      if (currentBudget?.id === id) {
        setCurrentBudget(sent)
      }
      return sent
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send budget")
      return null
    } finally {
      setLoading(false)
    }
  }, [currentBudget])

  // Approve budget
  const approveBudget = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const approved = await budgetService.approve(id)
      setBudgets((prev) => prev.map((b) => (b.id === id ? approved : b)))
      if (currentBudget?.id === id) {
        setCurrentBudget(approved)
      }
      return approved
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve budget")
      return null
    } finally {
      setLoading(false)
    }
  }, [currentBudget])

  // Reject budget
  const rejectBudget = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const rejected = await budgetService.reject(id)
      setBudgets((prev) => prev.map((b) => (b.id === id ? rejected : b)))
      if (currentBudget?.id === id) {
        setCurrentBudget(rejected)
      }
      return rejected
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject budget")
      return null
    } finally {
      setLoading(false)
    }
  }, [currentBudget])

  // Quick calculate
  const quickCalculate = useCallback(async (data: QuickCalculationDto): Promise<QuickCalculationResult | null> => {
    setLoading(true)
    setError(null)

    try {
      const result = await budgetService.quickCalculate(data)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to calculate")
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Recalculate budget
  const recalculateBudget = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const recalculated = await budgetService.recalculate(id)
      setBudgets((prev) => prev.map((b) => (b.id === id ? recalculated : b)))
      if (currentBudget?.id === id) {
        setCurrentBudget(recalculated)
      }
      return recalculated
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to recalculate budget")
      return null
    } finally {
      setLoading(false)
    }
  }, [currentBudget])

  // Load templates
  const loadTemplates = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await budgetService.getTemplates()
      setTemplates(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load templates")
    } finally {
      setLoading(false)
    }
  }, [])

  // Create from template
  const createFromTemplate = useCallback(async (templateName: string, workspaceId: string, targetPageId: string) => {
    setLoading(true)
    setError(null)

    try {
      const newBudget = await budgetService.createFromTemplate(templateName, workspaceId, targetPageId)
      setBudgets((prev) => [newBudget, ...prev])
      setCurrentBudget(newBudget)
      return newBudget
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create from template")
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Load analytics
  const loadAnalytics = useCallback(async (workspaceId: string) => {
    setLoading(true)
    setError(null)

    try {
      const data = await budgetService.getAnalytics(workspaceId)
      setAnalytics(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics")
    } finally {
      setLoading(false)
    }
  }, [])

  // Download PDF
  const downloadPdf = useCallback(async (id: string, filename?: string) => {
    setLoading(true)
    setError(null)

    try {
      const blob = await budgetService.downloadPdf(id)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename || `budget-${id}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to download PDF")
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    budgets,
    currentBudget,
    templates,
    analytics,
    loading,
    error,
    loadBudgets,
    loadBudget,
    createBudget,
    updateBudget,
    deleteBudget,
    sendBudget,
    approveBudget,
    rejectBudget,
    quickCalculate,
    recalculateBudget,
    loadTemplates,
    createFromTemplate,
    loadAnalytics,
    downloadPdf,
    setCurrentBudget,
  }
}
