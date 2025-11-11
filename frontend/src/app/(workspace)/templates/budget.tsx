"use client"

import { useState, useEffect } from "react"
import { Plus, Calculator, FileText, Download, Send, Check, X, Trash2, Edit, DollarSign, Percent, Calendar, Users, Package, TrendingUp, MoreVertical } from "lucide-react"
import { budgetService } from "@/core/services/budget.service"
import type { Budget, CreateBudgetDto, CreateBudgetItemDto, CreateBudgetPhaseDto, QuickCalculationDto, QuickCalculationResult, CalculationType, ProjectComplexity } from "@/core/types/budget.types"
import { useParams } from "next/navigation"
import { useWorkspaceStore } from "@/core/store/workspaceStore"

export default function BudgetTemplate() {
  const params = useParams()
  const pageId = params?.pageId as string
  const { workspace, currentWorkspaceId } = useWorkspaceStore()
  const workspaceId = (currentWorkspaceId || workspace?.id || "") as string

  const [budgets, setBudgets] = useState<Budget[]>([])
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"list" | "create" | "calculator">("list")
  const [calculatorMode, setCalculatorMode] = useState<"features" | "hours" | "resources">("features")

  // Form states
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [clientCompany, setClientCompany] = useState("")
  const [clientDocument, setClientDocument] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [projectName, setProjectName] = useState("")
  const [projectDescription, setProjectDescription] = useState("")
  const [calculationType, setCalculationType] = useState<CalculationType>("ByFeatures")
  const [currency, setCurrency] = useState("BRL")
  const [validityDays, setValidityDays] = useState(30)
  const [discountPercentage, setDiscountPercentage] = useState(0)
  const [notes, setNotes] = useState("")
  const [termsAndConditions, setTermsAndConditions] = useState("")

  // Tax configuration
  const [issPercentage, setIssPercentage] = useState(0)
  const [pisPercentage, setPisPercentage] = useState(0.65)
  const [cofinsPercentage, setCofinsPercentage] = useState(3)
  const [irpfPercentage, setIrpfPercentage] = useState(0)

  // Payment configuration
  const [numberOfInstallments, setNumberOfInstallments] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState("")
  const [paymentTerms, setPaymentTerms] = useState("")

  // Items and Phases
  const [items, setItems] = useState<CreateBudgetItemDto[]>([])
  const [phases, setPhases] = useState<CreateBudgetPhaseDto[]>([])

  // Quick calculator state
  const [hourlyRate, setHourlyRate] = useState(150)
  const [quickFeatures, setQuickFeatures] = useState<{ name: string; hours: number; complexity: ProjectComplexity }[]>([])
  const [quickHours, setQuickHours] = useState({
    frontendHours: 0,
    backendHours: 0,
    designHours: 0,
    testingHours: 0,
    projectManagementHours: 0,
  })
  const [quickResult, setQuickResult] = useState<QuickCalculationResult | null>(null)

  // Load budgets
  useEffect(() => {
    if (pageId) {
      loadBudgets()
    }
  }, [pageId])

  const loadBudgets = async () => {
    try {
      const data = await budgetService.getByPage(pageId)
      setBudgets(data)
    } catch (error) {
      console.error("Error loading budgets:", error)
      // Don't throw error, just set empty array
      setBudgets([])
    }
  }

  const handleQuickCalculate = async () => {
    try {
      const dto: QuickCalculationDto = {
        calculationType: calculatorMode === "features" ? "ByFeatures" : "ByHours",
        hourlyRate,
        features: calculatorMode === "features" ? quickFeatures.map(f => ({
          name: f.name,
          complexity: f.complexity,
          estimatedHours: f.hours,
        })) : undefined,
        hours: calculatorMode === "hours" ? quickHours : undefined,
      }

      const result = await budgetService.quickCalculate(dto)
      setQuickResult(result)
    } catch (error) {
      console.error("Error calculating:", error)
    }
  }

  const addItem = () => {
    setItems([
      ...items,
      {
        name: "",
        description: "",
        category: "development",
        quantity: 1,
        unitPrice: 0,
        estimatedHours: 0,
        hourlyRate: 150,
        complexity: "Medium",
      },
    ])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof CreateBudgetItemDto, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }

    // Auto-calculate unit price from hours and hourly rate
    if (field === "estimatedHours" || field === "hourlyRate") {
      newItems[index].unitPrice = newItems[index].estimatedHours * newItems[index].hourlyRate
    }

    setItems(newItems)
  }

  const addPhase = () => {
    setPhases([
      ...phases,
      {
        name: "",
        description: "",
        durationDays: 0,
        amount: 0,
      },
    ])
  }

  const removePhase = (index: number) => {
    setPhases(phases.filter((_, i) => i !== index))
  }

  const updatePhase = (index: number, field: keyof CreateBudgetPhaseDto, value: any) => {
    const newPhases = [...phases]
    newPhases[index] = { ...newPhases[index], [field]: value }
    setPhases(newPhases)
  }

  const calculateTotals = () => {
    const totalAmount = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
    const discountAmount = totalAmount * (discountPercentage / 100)
    const subtotalAfterDiscount = totalAmount - discountAmount

    const issAmount = subtotalAfterDiscount * (issPercentage / 100)
    const pisAmount = subtotalAfterDiscount * (pisPercentage / 100)
    const cofinsAmount = subtotalAfterDiscount * (cofinsPercentage / 100)
    const irpfAmount = subtotalAfterDiscount * (irpfPercentage / 100)

    const taxAmount = issAmount + pisAmount + cofinsAmount + irpfAmount
    const finalAmount = subtotalAfterDiscount + taxAmount

    return {
      totalAmount,
      discountAmount,
      subtotalAfterDiscount,
      taxAmount,
      finalAmount,
      totalHours: items.reduce((sum, item) => sum + item.estimatedHours * item.quantity, 0),
    }
  }

  const handleCreateBudget = async () => {
    try {
      if (!workspaceId) {
        console.error("WorkspaceId não encontrado para criar orçamento")
        return
      }
      if (isEditing && selectedBudget) {
        await budgetService.update(selectedBudget.id, {
          clientName,
          clientEmail,
          clientCompany,
          projectName,
          projectDescription,
          discountPercentage,
          notes,
          termsAndConditions,
          items,
          phases,
        })
      } else {
        const dto: CreateBudgetDto = {
          workspaceId,
          pageId,
          clientName,
          clientEmail,
          clientCompany,
          projectName,
          projectDescription,
          calculationType,
          currency,
          validityDays,
          discountPercentage,
          notes,
          termsAndConditions,
          items,
          phases,
        }
        await budgetService.create(dto)
      }
      await loadBudgets()
      setActiveTab("list")
      resetForm()
      setSelectedBudget(null)
      setIsEditing(false)
    } catch (error) {
      console.error("Error creating budget:", error)
    }
  }

  const startEditBudget = (budget: Budget) => {
    setSelectedBudget(budget)
    setIsEditing(true)
    setClientName(budget.clientName || "")
    setClientEmail(budget.clientEmail || "")
    setClientCompany(budget.clientCompany || "")
    setClientDocument(budget.clientDocument || "")
    setClientPhone(budget.clientPhone || "")
    setProjectName(budget.projectName || "")
    setProjectDescription(budget.projectDescription || "")
    setCalculationType(budget.calculationType || "ByFeatures")
    setCurrency(budget.currency || "BRL")
    setValidityDays(budget.validityDays || 30)
    setDiscountPercentage(budget.discountPercentage || 0)
    setNotes(budget.notes || "")
    setTermsAndConditions(budget.termsAndConditions || "")
    setItems((budget.items || []).map(i => ({
      name: i.name,
      description: i.description,
      category: i.category,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      estimatedHours: i.estimatedHours,
      hourlyRate: i.hourlyRate,
      complexity: i.complexity,
    })))
    setPhases((budget.phases || []).map(p => ({
      name: p.name,
      description: p.description,
      durationDays: p.durationDays,
      amount: p.amount,
    })))
    setActiveTab("create")
  }

  const handleDeleteBudget = async (id: string) => {
    try {
      if (!confirm("Deseja excluir este orçamento?")) return
      await budgetService.delete(id)
      await loadBudgets()
    } catch (error) {
      console.error("Error deleting budget:", error)
    } finally {
      setMenuOpenId(null)
    }
  }

  const handleDownloadPdf = async (budgetId: string) => {
    try {
      const logoPath = typeof window !== 'undefined' ? `${window.location.origin}/icon/arclogo.svg` : undefined

      const toPngDataUrl = async (svgUrl: string): Promise<string | undefined> => {
        try {
          const res = await fetch(svgUrl)
          const svgText = await res.text()
          const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' })
          const url = URL.createObjectURL(blob)
          const img = new Image()
          const dataUrl: string = await new Promise((resolve, reject) => {
            img.onload = () => {
              const canvas = document.createElement('canvas')
              canvas.width = img.width
              canvas.height = img.height
              const ctx = canvas.getContext('2d')!
              ctx.clearRect(0, 0, canvas.width, canvas.height)
              ctx.drawImage(img, 0, 0)
              const result = canvas.toDataURL('image/png')
              URL.revokeObjectURL(url)
              resolve(result)
            }
            img.onerror = reject
            img.src = url
          })
          return dataUrl
        } catch {
          return undefined
        }
      }

      const logoDataUrl = logoPath ? await toPngDataUrl(logoPath) : undefined
      const blob = await budgetService.downloadPdf(budgetId, {
        includeLogo: true,
        includeItemDetails: true,
        includePhases: true,
        includeTerms: true,
        includePaymentSchedule: true,
        includeTaxBreakdown: true,
        companyName: "Arc.",
        colorScheme: "monochrome",
        companyLogoUrl: logoDataUrl,
      })

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `orcamento-${budgetId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error downloading PDF:", error)
    }
  }

  const resetForm = () => {
    setClientName("")
    setClientEmail("")
    setClientCompany("")
    setClientDocument("")
    setClientPhone("")
    setProjectName("")
    setProjectDescription("")
    setItems([])
    setPhases([])
    setDiscountPercentage(0)
    setNotes("")
    setTermsAndConditions("")
  }

  const totals = calculateTotals()

  return (
    <div className="flex h-full flex-col bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">Orçamentos</h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Geração de orçamentos profissionais com PDF
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("calculator")}
              className="px-3 py-1.5 text-sm bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 flex items-center gap-1.5"
            >
              <Calculator className="w-3.5 h-3.5" />
              Calculadora
            </button>
            <button
              onClick={() => setActiveTab("create")}
              className="px-3 py-1.5 text-sm bg-neutral-900 dark:bg-neutral-700 text-white rounded hover:bg-neutral-800 dark:hover:bg-neutral-600 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Novo
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="flex px-4">
          <button
            onClick={() => setActiveTab("list")}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "list"
                ? "border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100"
                : "border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
            }`}
          >
            <FileText className="w-3.5 h-3.5 inline mr-1.5" />
            Lista
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "create"
                ? "border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100"
                : "border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
            }`}
          >
            <Plus className="w-3.5 h-3.5 inline mr-1.5" />
            Criar
          </button>
          <button
            onClick={() => setActiveTab("calculator")}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "calculator"
                ? "border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100"
                : "border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
            }`}
          >
            <Calculator className="w-3.5 h-3.5 inline mr-1.5" />
            Calculadora
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === "list" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {budgets.map((budget) => (
              <div
                key={budget.id}
                className="relative border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors bg-white dark:bg-neutral-900"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-900 dark:text-white">{budget.projectName}</h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">#{budget.budgetNumber}</p>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                    budget.status === "Approved" ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300" :
                    budget.status === "Sent" ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300" :
                    budget.status === "Rejected" ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400" :
                    "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                  }`}>
                    {budget.status}
                  </span>
                </div>

                {/* Menu 3 pontos */}
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => setMenuOpenId(menuOpenId === budget.id ? null : budget.id)}
                    className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                    aria-label="Mais ações"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {menuOpenId === budget.id && (
                    <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-lg z-10">
                      <button
                        onClick={() => { startEditBudget(budget); setMenuOpenId(null) }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2"
                      >
                        <Edit className="w-3.5 h-3.5" /> Editar
                      </button>
                      <button
                        onClick={() => handleDeleteBudget(budget.id)}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 text-red-600 flex items-center gap-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Excluir
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 mb-3">
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    <Users className="w-3 h-3 inline mr-1" />
                    {budget.clientName}
                  </p>
                  <p className="text-base font-semibold text-neutral-900 dark:text-white">
                    {budget.currency === "BRL" ? "R$" : "$"} {budget.finalAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[10px] text-neutral-500">
                    {budget.summary.totalHours}h • {budget.summary.totalItems} itens
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownloadPdf(budget.id)}
                    className="flex-1 px-2 py-1.5 bg-neutral-900 dark:bg-neutral-700 text-white rounded hover:bg-neutral-800 dark:hover:bg-neutral-600 text-xs flex items-center justify-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    PDF
                  </button>
                  {budget.status === "Draft" && (
                    <button
                      onClick={async () => {
                        await budgetService.send(budget.id)
                        loadBudgets()
                      }}
                      className="flex-1 px-2 py-1.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs flex items-center justify-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      Enviar
                    </button>
                  )}
                </div>
              </div>
            ))}

            {budgets.length === 0 && (
              <div className="col-span-full text-center py-16">
                <FileText className="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-700 mb-3" />
                <h3 className="text-sm font-medium text-neutral-900 dark:text-white mb-1">
                  Nenhum orçamento
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                  Crie seu primeiro orçamento
                </p>
                <button
                  onClick={() => setActiveTab("create")}
                  className="px-3 py-1.5 text-xs bg-neutral-900 dark:bg-neutral-700 text-white rounded hover:bg-neutral-800 dark:hover:bg-neutral-600"
                >
                  Criar Orçamento
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "calculator" && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
              <h2 className="text-base font-medium text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Calculadora Rápida
              </h2>

              {/* Calculator Mode Selection */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setCalculatorMode("features")}
                  className={`flex-1 px-3 py-2 text-xs rounded transition-colors ${
                    calculatorMode === "features"
                      ? "bg-neutral-900 dark:bg-neutral-700 text-white"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                  }`}
                >
                  Por Features
                </button>
                <button
                  onClick={() => setCalculatorMode("hours")}
                  className={`flex-1 px-3 py-2 text-xs rounded transition-colors ${
                    calculatorMode === "hours"
                      ? "bg-neutral-900 dark:bg-neutral-700 text-white"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                  }`}
                >
                  Por Horas
                </button>
              </div>

              {/* Hourly Rate */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  <DollarSign className="w-3 h-3 inline mr-1" />
                  Valor da Hora (R$)
                </label>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                />
              </div>

              {calculatorMode === "features" && (
                <div className="space-y-3 mb-4">
                  {quickFeatures.map((f, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-6 gap-2">
                      <input
                        type="text"
                        placeholder="Nome da feature"
                        value={f.name}
                        onChange={(e) => {
                          const next = [...quickFeatures];
                          next[idx].name = e.target.value;
                          setQuickFeatures(next);
                        }}
                        className="sm:col-span-3 px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                      />
                      <select
                        value={f.complexity}
                        onChange={(e) => {
                          const next = [...quickFeatures];
                          next[idx].complexity = e.target.value as ProjectComplexity;
                          setQuickFeatures(next);
                        }}
                        className="sm:col-span-2 px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                      >
                        <option value="Low">Baixa</option>
                        <option value="Medium">Média</option>
                        <option value="High">Alta</option>
                        <option value="VeryHigh">Muito Alta</option>
                      </select>
                      <div className="flex gap-2 sm:col-span-1">
                        <input
                          type="number"
                          min={0}
                          placeholder="Horas"
                          value={f.hours}
                          onChange={(e) => {
                            const next = [...quickFeatures];
                            next[idx].hours = Number(e.target.value);
                            setQuickFeatures(next);
                          }}
                          className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => setQuickFeatures(quickFeatures.filter((_, i) => i !== idx))}
                          className="px-2 py-2 text-xs bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded hover:bg-neutral-300 dark:hover:bg-neutral-700"
                          title="Remover"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setQuickFeatures([...quickFeatures, { name: "", hours: 0, complexity: "Medium" }])}
                    className="px-3 py-2 text-xs bg-neutral-900 dark:bg-neutral-700 text-white rounded hover:bg-neutral-800 dark:hover:bg-neutral-600 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Adicionar Feature
                  </button>
                </div>
              )}

              {calculatorMode === "hours" && (
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Horas de Frontend
                    </label>
                    <input
                      type="number"
                      value={quickHours.frontendHours}
                      onChange={(e) => setQuickHours({ ...quickHours, frontendHours: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Horas de Backend
                    </label>
                    <input
                      type="number"
                      value={quickHours.backendHours}
                      onChange={(e) => setQuickHours({ ...quickHours, backendHours: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Horas de Design
                    </label>
                    <input
                      type="number"
                      value={quickHours.designHours}
                      onChange={(e) => setQuickHours({ ...quickHours, designHours: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Horas de Testes
                    </label>
                    <input
                      type="number"
                      value={quickHours.testingHours}
                      onChange={(e) => setQuickHours({ ...quickHours, testingHours: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Horas de Gerenciamento
                    </label>
                    <input
                      type="number"
                      value={quickHours.projectManagementHours}
                      onChange={(e) => setQuickHours({ ...quickHours, projectManagementHours: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleQuickCalculate}
                className="w-full px-3 py-2 text-sm bg-neutral-900 dark:bg-neutral-700 text-white rounded hover:bg-neutral-800 dark:hover:bg-neutral-600 flex items-center justify-center gap-2"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Calcular
              </button>

              {quickResult && (
                <div className="mt-4 p-3 bg-neutral-50 dark:bg-neutral-900 rounded border border-neutral-200 dark:border-neutral-800">
                  <h3 className="text-xs font-medium text-neutral-900 dark:text-white mb-3 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400" />
                    Resultado
                  </h3>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-neutral-600 dark:text-neutral-400">Total de Horas:</span>
                      <span className="font-medium text-neutral-900 dark:text-white">{quickResult.totalHours}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-neutral-600 dark:text-neutral-400">Valor Total:</span>
                      <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                        R$ {quickResult.totalAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {Object.keys(quickResult.breakdown).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                      <h4 className="text-[10px] font-medium text-neutral-900 dark:text-white mb-2">Detalhamento:</h4>
                      <div className="space-y-1">
                        {Object.entries(quickResult.breakdown).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-xs">
                            <span className="text-neutral-500 dark:text-neutral-400">{key}:</span>
                            <span className="text-neutral-700 dark:text-neutral-300">R$ {value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {quickResult.recommendations.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                      <h4 className="text-[10px] font-medium text-neutral-900 dark:text-white mb-2">Recomendações:</h4>
                      <ul className="space-y-1">
                        {quickResult.recommendations.map((rec, i) => (
                          <li key={i} className="text-xs text-neutral-500 dark:text-neutral-400">• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "create" && (
          <div className="max-w-5xl mx-auto">
            <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
              <h2 className="text-base font-medium text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Criar Orçamento
              </h2>

              {/* Client Information */}
              <div className="mb-6">
                <h3 className="text-xs font-medium text-neutral-900 dark:text-white mb-3 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  Cliente
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                      Nome *
                    </label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                      placeholder="João Silva"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                      placeholder="joao@empresa.com"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                      Empresa
                    </label>
                    <input
                      type="text"
                      value={clientCompany}
                      onChange={(e) => setClientCompany(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                      placeholder="Empresa LTDA"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
              </div>

              {/* Project Information */}
              <div className="mb-6">
                <h3 className="text-xs font-medium text-neutral-900 dark:text-white mb-3 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" />
                  Informações do Projeto
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                      Nome do Projeto *
                    </label>
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                      placeholder="Sistema de Gestão Empresarial"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                      Descrição
                    </label>
                    <textarea
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                      placeholder="Descrição detalhada do projeto..."
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Tipo de Cálculo
                      </label>
                      <select
                        value={calculationType}
                        onChange={(e) => setCalculationType(e.target.value as CalculationType)}
                        className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                      >
                        <option value="ByFeatures">Por Features</option>
                        <option value="ByHours">Por Horas</option>
                        <option value="ByPackage">Por Pacote</option>
                        <option value="ByComplexity">Por Complexidade</option>
                        <option value="Hybrid">Híbrido</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Moeda
                      </label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                      >
                        <option value="BRL">BRL (R$)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        Validade (dias)
                      </label>
                      <input
                        type="number"
                        value={validityDays}
                        onChange={(e) => setValidityDays(Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xs font-medium text-neutral-900 dark:text-white flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    Itens
                  </h3>
                  <button
                    onClick={addItem}
                    className="px-2 py-1 text-xs bg-neutral-900 dark:bg-neutral-700 text-white rounded hover:bg-neutral-800 dark:hover:bg-neutral-600 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Adicionar
                  </button>
                </div>

                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={index} className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-900">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="lg:col-span-2">
                          <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            Nome do Item
                          </label>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => updateItem(index, "name", e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                            placeholder="Ex: Desenvolvimento de Dashboard"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            Categoria
                          </label>
                          <select
                            value={item.category}
                            onChange={(e) => updateItem(index, "category", e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                          >
                            <option value="development">Desenvolvimento</option>
                            <option value="design">Design</option>
                            <option value="testing">Testes</option>
                            <option value="management">Gerenciamento</option>
                            <option value="other">Outros</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            Complexidade
                          </label>
                          <select
                            value={item.complexity}
                            onChange={(e) => updateItem(index, "complexity", e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                          >
                            <option value="Low">Baixa</option>
                            <option value="Medium">Média</option>
                            <option value="High">Alta</option>
                            <option value="VeryHigh">Muito Alta</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                        <div>
                          <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            Horas
                          </label>
                          <input
                            type="number"
                            value={item.estimatedHours}
                            onChange={(e) => updateItem(index, "estimatedHours", Number(e.target.value))}
                            className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            Valor/Hora (R$)
                          </label>
                          <input
                            type="number"
                            value={item.hourlyRate}
                            onChange={(e) => updateItem(index, "hourlyRate", Number(e.target.value))}
                            className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            Quantidade
                          </label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                            className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            Valor Unit. (R$)
                          </label>
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(index, "unitPrice", Number(e.target.value))}
                            className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            Total (R$)
                          </label>
                          <div className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-white font-semibold">
                            {(item.unitPrice * item.quantity).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          Descrição
                        </label>
                        <textarea
                          value={item.description}
                          onChange={(e) => updateItem(index, "description", e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                          placeholder="Descrição detalhada do item..."
                        />
                      </div>

                      <button
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remover Item
                      </button>
                    </div>
                  ))}

                  {items.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg">
                      <FileText className="w-12 h-12 mx-auto text-neutral-400 mb-2" />
                      <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                        Nenhum item adicionado. Clique em "Adicionar Item" para começar.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Phases */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xs font-medium text-neutral-900 dark:text-white flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Fases (Opcional)
                  </h3>
                  <button
                    onClick={addPhase}
                    className="px-2 py-1 text-xs bg-neutral-900 dark:bg-neutral-700 text-white rounded hover:bg-neutral-800 dark:hover:bg-neutral-600 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Adicionar
                  </button>
                </div>

                <div className="space-y-4">
                  {phases.map((phase, index) => (
                    <div key={index} className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-900">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            Nome da Fase
                          </label>
                          <input
                            type="text"
                            value={phase.name}
                            onChange={(e) => updatePhase(index, "name", e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                            placeholder="Ex: Discovery e Planejamento"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            Duração (dias)
                          </label>
                          <input
                            type="number"
                            value={phase.durationDays}
                            onChange={(e) => updatePhase(index, "durationDays", Number(e.target.value))}
                            className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            Descrição
                          </label>
                          <textarea
                            value={phase.description}
                            onChange={(e) => updatePhase(index, "description", e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                            placeholder="Descrição da fase..."
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            Valor (R$)
                          </label>
                          <input
                            type="number"
                            value={phase.amount}
                            onChange={(e) => updatePhase(index, "amount", Number(e.target.value))}
                            className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => removePhase(index)}
                        className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remover Fase
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tax Configuration */}
              <div className="mb-6">
                <h3 className="text-xs font-medium text-neutral-900 dark:text-white mb-3 flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5" />
                  Impostos e Descontos
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-[10px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                      Desconto (%)
                    </label>
                    <input
                      type="number"
                      value={discountPercentage}
                      onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                      className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      ISS (%)
                    </label>
                    <input
                      type="number"
                      value={issPercentage}
                      onChange={(e) => setIssPercentage(Number(e.target.value))}
                      className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      PIS (%)
                    </label>
                    <input
                      type="number"
                      value={pisPercentage}
                      onChange={(e) => setPisPercentage(Number(e.target.value))}
                      className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      COFINS (%)
                    </label>
                    <input
                      type="number"
                      value={cofinsPercentage}
                      onChange={(e) => setCofinsPercentage(Number(e.target.value))}
                      className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      IRPF (%)
                    </label>
                    <input
                      type="number"
                      value={irpfPercentage}
                      onChange={(e) => setIrpfPercentage(Number(e.target.value))}
                      className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              {items.length > 0 && (
                <div className="mb-6 p-4 bg-neutral-50 dark:bg-neutral-900 rounded border border-neutral-200 dark:border-neutral-800">
                  <h3 className="text-xs font-medium text-neutral-900 dark:text-white mb-3 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" />
                    Resumo
                  </h3>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-neutral-600 dark:text-neutral-400">Total de Horas:</span>
                      <span className="font-medium text-neutral-900 dark:text-white">{totals.totalHours}h</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-neutral-600 dark:text-neutral-400">Valor Total:</span>
                      <span className="font-medium text-neutral-900 dark:text-white">
                        R$ {totals.totalAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    {discountPercentage > 0 && (
                      <>
                        <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400">
                          <span>Desconto ({discountPercentage}%):</span>
                          <span>- R$ {totals.discountAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-neutral-600 dark:text-neutral-400">Subtotal:</span>
                          <span className="font-medium text-neutral-900 dark:text-white">
                            R$ {totals.subtotalAfterDiscount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between text-xs">
                      <span className="text-neutral-500 dark:text-neutral-400">Impostos:</span>
                      <span className="text-neutral-700 dark:text-neutral-300">
                        + R$ {totals.taxAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="pt-2 mt-2 border-t border-neutral-200 dark:border-neutral-800 flex justify-between">
                      <span className="text-sm font-semibold text-neutral-900 dark:text-white">TOTAL:</span>
                      <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                        R$ {totals.finalAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes and Terms */}
              <div className="mb-6 space-y-3">
                <div>
                  <label className="block text-[10px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                    Observações
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                    placeholder="Observações adicionais..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                    Termos e Condições
                  </label>
                  <textarea
                    value={termsAndConditions}
                    onChange={(e) => setTermsAndConditions(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                    placeholder="Ex: Pagamento em 3 parcelas..."
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleCreateBudget}
                  disabled={!clientName || !clientEmail || !projectName || items.length === 0}
                  className="flex-1 px-4 py-2 text-sm bg-neutral-900 dark:bg-neutral-700 text-white rounded hover:bg-neutral-800 dark:hover:bg-neutral-600 disabled:bg-neutral-300 dark:disabled:bg-neutral-800 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  Criar Orçamento
                </button>
                <button
                  onClick={() => {
                    setActiveTab("list")
                    resetForm()
                  }}
                  className="px-4 py-2 text-sm bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
