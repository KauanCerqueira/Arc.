"use client"

import { useState, useMemo } from "react"
import { usePageTemplateData } from "@/core/hooks/usePageTemplateData"
import { WorkspaceTemplateComponentProps } from "@/core/types/workspace.types"
import {
  Plus, Trash2, DollarSign, TrendingUp, TrendingDown, Building2, Users, Briefcase,
  ShoppingBag, Zap, Settings, X, Save, PieChart, BarChart3, LineChart, Target,
  Calendar, Filter, ChevronDown, ChevronUp, Edit2, Check, AlertCircle, ArrowUpCircle,
  ArrowDownCircle, Package, Cpu, Truck, FileText, CreditCard, Wallet, TrendingDown as Loss,
  Activity, Percent, DollarSign as Revenue, Receipt, Repeat, Download, Upload,
  Eye, EyeOff, CheckCircle, XCircle, Clock, Award, Star, Flame, Droplet, Info
} from "lucide-react"
import ExcelJS from "exceljs"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

// ==================== TYPES ====================

type Department = "sales" | "marketing" | "tech" | "operations" | "hr" | "finance" | "support" | "product"

type ExpenseItem = {
  id: string
  description: string
  amount: number
  department: Department
  category: string
  date: string
  recurring: boolean
  approved: boolean
  notes?: string
}

type RevenueStream = {
  id: string
  name: string
  amount: number
  department: Department
  type: "product" | "service" | "subscription" | "other"
  date: string
  recurring: boolean
}

type FinancialGoal = {
  id: string
  name: string
  type: "revenue" | "cost-reduction" | "profit" | "growth"
  targetAmount: number
  currentAmount: number
  deadline: string
  department: Department | "company"
  priority: "critical" | "high" | "medium" | "low"
  status: "on-track" | "at-risk" | "behind" | "completed"
}

type DepartmentBudget = {
  department: Department
  allocated: number
  spent: number
  remaining: number
  monthlyBurn: number
}

type CashFlowItem = {
  date: string
  inflow: number
  outflow: number
  balance: number
}

type BusinessBudgetData = {
  companyName: string
  fiscalYear: number
  currentMonth: string
  expenses: ExpenseItem[]
  revenues: RevenueStream[]
  goals: FinancialGoal[]
  departmentBudgets: DepartmentBudget[]
  cashFlow: CashFlowItem[]
  initialBalance: number
}

// ==================== CONSTANTS ====================

const DEPARTMENTS = [
  { id: "sales" as Department, name: "Vendas", icon: TrendingUp, color: "emerald" },
  { id: "marketing" as Department, name: "Marketing", icon: Briefcase, color: "purple" },
  { id: "tech" as Department, name: "Tecnologia", icon: Cpu, color: "blue" },
  { id: "operations" as Department, name: "Operações", icon: Settings, color: "orange" },
  { id: "hr" as Department, name: "RH", icon: Users, color: "pink" },
  { id: "finance" as Department, name: "Financeiro", icon: DollarSign, color: "green" },
  { id: "support" as Department, name: "Suporte", icon: ShoppingBag, color: "cyan" },
  { id: "product" as Department, name: "Produto", icon: Package, color: "violet" },
]

const EXPENSE_CATEGORIES = [
  "Salários e Benefícios",
  "Infraestrutura",
  "Marketing e Publicidade",
  "Software e Ferramentas",
  "Viagens e Eventos",
  "Treinamento",
  "Consultorias",
  "Impostos e Taxas",
  "Outros"
]

const DEFAULT_DATA: BusinessBudgetData = {
  companyName: "Minha Empresa",
  fiscalYear: new Date().getFullYear(),
  currentMonth: new Date().toISOString().slice(0, 7),
  expenses: [],
  revenues: [],
  goals: [],
  departmentBudgets: DEPARTMENTS.map(dept => ({
    department: dept.id,
    allocated: 100000,
    spent: 0,
    remaining: 100000,
    monthlyBurn: 0
  })),
  cashFlow: [],
  initialBalance: 500000
}

// ==================== MAIN COMPONENT ====================

export default function BusinessBudgetTemplate({ groupId, pageId }: WorkspaceTemplateComponentProps) {
  const { data, setData } = usePageTemplateData<BusinessBudgetData>(groupId, pageId, DEFAULT_DATA)

  const [activeTab, setActiveTab] = useState<"dashboard" | "expenses" | "revenue" | "goals" | "cash-flow" | "reports">("dashboard")
  const [selectedDepartment, setSelectedDepartment] = useState<Department | "all">("all")
  const [selectedPeriod, setSelectedPeriod] = useState<"month" | "quarter" | "year">("month")
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [showAddRevenue, setShowAddRevenue] = useState(false)
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<string | null>(null)

  // ==================== CALCULATIONS ====================

  const metrics = useMemo(() => {
    const expenses = data.expenses || []
    const revenues = data.revenues || []
    const departmentBudgets = data.departmentBudgets || []

    const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0)
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
    const netProfit = totalRevenue - totalExpenses
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

    const totalAllocated = departmentBudgets.reduce((sum, d) => sum + d.allocated, 0)
    const totalSpent = departmentBudgets.reduce((sum, d) => sum + d.spent, 0)
    const totalRemaining = totalAllocated - totalSpent
    const budgetUtilization = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0

    // EBITDA simplificado (aproximado)
    const ebitda = netProfit
    const ebitdaMargin = totalRevenue > 0 ? (ebitda / totalRevenue) * 100 : 0

    // Burn Rate (gasto mensal médio)
    const monthlyExpenses = expenses.filter(e => {
      const expenseDate = new Date(e.date)
      const currentDate = new Date()
      return expenseDate.getMonth() === currentDate.getMonth() &&
             expenseDate.getFullYear() === currentDate.getFullYear()
    })
    const burnRate = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0)

    // Runway (meses até acabar o dinheiro)
    const currentBalance = (data.initialBalance || 0) + netProfit
    const runway = burnRate > 0 ? currentBalance / burnRate : 999

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin,
      ebitda,
      ebitdaMargin,
      burnRate,
      runway,
      budgetUtilization,
      totalAllocated,
      totalSpent,
      totalRemaining,
      currentBalance
    }
  }, [data])

  // ==================== HANDLERS ====================

  const addExpense = (expense: Omit<ExpenseItem, "id">) => {
    const newExpense: ExpenseItem = { ...expense, id: Date.now().toString() }
    setData(prev => ({
      ...prev,
      expenses: [...(prev.expenses || []), newExpense],
      departmentBudgets: (prev.departmentBudgets || []).map(dept =>
        dept.department === expense.department
          ? { ...dept, spent: dept.spent + expense.amount, remaining: dept.remaining - expense.amount }
          : dept
      )
    }))
  }

  const deleteExpense = (id: string) => {
    const expense = data.expenses?.find(e => e.id === id)
    if (!expense) return

    setData(prev => ({
      ...prev,
      expenses: (prev.expenses || []).filter(e => e.id !== id),
      departmentBudgets: (prev.departmentBudgets || []).map(dept =>
        dept.department === expense.department
          ? { ...dept, spent: dept.spent - expense.amount, remaining: dept.remaining + expense.amount }
          : dept
      )
    }))
  }

  const addRevenue = (revenue: Omit<RevenueStream, "id">) => {
    const newRevenue: RevenueStream = { ...revenue, id: Date.now().toString() }
    setData(prev => ({
      ...prev,
      revenues: [...(prev.revenues || []), newRevenue]
    }))
  }

  const deleteRevenue = (id: string) => {
    setData(prev => ({
      ...prev,
      revenues: (prev.revenues || []).filter(r => r.id !== id)
    }))
  }

  const addGoal = (goal: Omit<FinancialGoal, "id" | "currentAmount" | "status">) => {
    const newGoal: FinancialGoal = {
      ...goal,
      id: Date.now().toString(),
      currentAmount: 0,
      status: "on-track"
    }
    setData(prev => ({
      ...prev,
      goals: [...(prev.goals || []), newGoal]
    }))
  }

  const updateGoalProgress = (id: string, currentAmount: number) => {
    setData(prev => ({
      ...prev,
      goals: (prev.goals || []).map(g => {
        if (g.id !== id) return g
        const progress = (currentAmount / g.targetAmount) * 100
        const deadline = new Date(g.deadline)
        const now = new Date()
        const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        let status: FinancialGoal["status"] = "on-track"
        if (progress >= 100) status = "completed"
        else if (progress < 50 && daysUntilDeadline < 30) status = "behind"
        else if (progress < 75 && daysUntilDeadline < 60) status = "at-risk"

        return { ...g, currentAmount, status }
      })
    }))
  }

  const deleteGoal = (id: string) => {
    setData(prev => ({
      ...prev,
      goals: (prev.goals || []).filter(g => g.id !== id)
    }))
  }

  const updateDepartmentBudget = (department: Department, allocated: number) => {
    setData(prev => ({
      ...prev,
      departmentBudgets: (prev.departmentBudgets || []).map(d =>
        d.department === department
          ? { ...d, allocated, remaining: allocated - d.spent }
          : d
      )
    }))
  }

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook()

    // Sheet 1: Dashboard
    const dashboardSheet = workbook.addWorksheet("Dashboard")
    dashboardSheet.addRow(["Orçamento Corporativo - Dashboard"])
    dashboardSheet.addRow([])
    dashboardSheet.addRow(["Métrica", "Valor"])
    dashboardSheet.addRow(["Receita Total", `R$ ${metrics.totalRevenue.toLocaleString()}`])
    dashboardSheet.addRow(["Despesas Totais", `R$ ${metrics.totalExpenses.toLocaleString()}`])
    dashboardSheet.addRow(["Lucro Líquido", `R$ ${metrics.netProfit.toLocaleString()}`])
    dashboardSheet.addRow(["Margem de Lucro", `${metrics.profitMargin.toFixed(1)}%`])
    dashboardSheet.addRow(["EBITDA", `R$ ${metrics.ebitda.toLocaleString()}`])
    dashboardSheet.addRow(["Burn Rate", `R$ ${metrics.burnRate.toLocaleString()}/mês`])
    dashboardSheet.addRow(["Runway", `${metrics.runway.toFixed(1)} meses`])

    // Sheet 2: Despesas
    const expensesSheet = workbook.addWorksheet("Despesas")
    expensesSheet.addRow(["Descrição", "Valor", "Departamento", "Categoria", "Data", "Recorrente", "Aprovado"])
    data.expenses?.forEach(e => {
      const dept = DEPARTMENTS.find(d => d.id === e.department)
      expensesSheet.addRow([
        e.description,
        e.amount,
        dept?.name || e.department,
        e.category,
        new Date(e.date).toLocaleDateString("pt-BR"),
        e.recurring ? "Sim" : "Não",
        e.approved ? "Sim" : "Não"
      ])
    })

    // Sheet 3: Receitas
    const revenuesSheet = workbook.addWorksheet("Receitas")
    revenuesSheet.addRow(["Nome", "Valor", "Departamento", "Tipo", "Data", "Recorrente"])
    data.revenues?.forEach(r => {
      const dept = DEPARTMENTS.find(d => d.id === r.department)
      revenuesSheet.addRow([
        r.name,
        r.amount,
        dept?.name || r.department,
        r.type,
        new Date(r.date).toLocaleDateString("pt-BR"),
        r.recurring ? "Sim" : "Não"
      ])
    })

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `orcamento-corporativo-${new Date().toISOString().slice(0, 10)}.xlsx`
    a.click()
  }

  const exportToPDF = () => {
    const doc = new jsPDF()

    // Title
    doc.setFontSize(18)
    doc.text("Orçamento Corporativo", 14, 20)
    doc.setFontSize(11)
    doc.text(`${data.companyName} - ${new Date().toLocaleDateString("pt-BR")}`, 14, 28)

    // Metrics
    doc.setFontSize(14)
    doc.text("Dashboard Executivo", 14, 40)

    autoTable(doc, {
      startY: 45,
      head: [["Métrica", "Valor"]],
      body: [
        ["Receita Total", `R$ ${metrics.totalRevenue.toLocaleString()}`],
        ["Despesas Totais", `R$ ${metrics.totalExpenses.toLocaleString()}`],
        ["Lucro Líquido", `R$ ${metrics.netProfit.toLocaleString()}`],
        ["Margem de Lucro", `${metrics.profitMargin.toFixed(1)}%`],
        ["EBITDA", `R$ ${metrics.ebitda.toLocaleString()}`],
        ["Burn Rate", `R$ ${metrics.burnRate.toLocaleString()}/mês`],
        ["Runway", `${metrics.runway.toFixed(1)} meses`],
      ]
    })

    doc.save(`orcamento-corporativo-${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  // ==================== RENDER ====================

  return (
    <div className="h-full flex flex-col bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
              <h1 className="text-base font-semibold text-neutral-900 dark:text-white">
                Orçamento Corporativo
              </h1>
            </div>
            <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700" />
            <span className="text-sm text-neutral-500 dark:text-neutral-400">{data.companyName}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportToExcel}
              className="px-2.5 py-1 text-xs flex items-center gap-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              <Download className="w-3 h-3" />
              Excel
            </button>
            <button
              onClick={exportToPDF}
              className="px-2.5 py-1 text-xs flex items-center gap-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              <Download className="w-3 h-3" />
              PDF
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4">
        <div className="flex gap-1">
          {[
            { id: "dashboard", label: "Dashboard", icon: BarChart3 },
            { id: "expenses", label: "Despesas", icon: TrendingDown },
            { id: "revenue", label: "Receitas", icon: TrendingUp },
            { id: "goals", label: "Metas", icon: Target },
            { id: "cash-flow", label: "Fluxo de Caixa", icon: Activity },
            { id: "reports", label: "Relatórios", icon: FileText },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 text-xs font-medium flex items-center gap-1.5 border-b-2 transition ${
                activeTab === tab.id
                  ? "border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-white"
                  : "border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === "dashboard" && (
          <DashboardTab
            metrics={metrics}
            data={data}
            departments={DEPARTMENTS}
            selectedPeriod={selectedPeriod}
            setSelectedPeriod={setSelectedPeriod}
          />
        )}

        {activeTab === "expenses" && (
          <ExpensesTab
            expenses={data.expenses || []}
            departments={DEPARTMENTS}
            categories={EXPENSE_CATEGORIES}
            selectedDepartment={selectedDepartment}
            setSelectedDepartment={setSelectedDepartment}
            addExpense={addExpense}
            deleteExpense={deleteExpense}
            showAddExpense={showAddExpense}
            setShowAddExpense={setShowAddExpense}
          />
        )}

        {activeTab === "revenue" && (
          <RevenueTab
            revenues={data.revenues || []}
            departments={DEPARTMENTS}
            selectedDepartment={selectedDepartment}
            setSelectedDepartment={setSelectedDepartment}
            addRevenue={addRevenue}
            deleteRevenue={deleteRevenue}
            showAddRevenue={showAddRevenue}
            setShowAddRevenue={setShowAddRevenue}
          />
        )}

        {activeTab === "goals" && (
          <GoalsTab
            goals={data.goals || []}
            departments={DEPARTMENTS}
            addGoal={addGoal}
            deleteGoal={deleteGoal}
            updateGoalProgress={updateGoalProgress}
            showAddGoal={showAddGoal}
            setShowAddGoal={setShowAddGoal}
            editingGoal={editingGoal}
            setEditingGoal={setEditingGoal}
          />
        )}

        {activeTab === "cash-flow" && (
          <CashFlowTab
            expenses={data.expenses || []}
            revenues={data.revenues || []}
            initialBalance={data.initialBalance || 0}
          />
        )}

        {activeTab === "reports" && (
          <ReportsTab
            data={data}
            metrics={metrics}
            departments={DEPARTMENTS}
          />
        )}
      </div>
    </div>
  )
}

// ==================== TAB COMPONENTS ====================

function DashboardTab({ metrics, data, departments, selectedPeriod, setSelectedPeriod }: any) {
  const profitTrend = metrics.netProfit >= 0 ? "up" : "down"
  const runwayStatus = metrics.runway < 3 ? "critical" : metrics.runway < 6 ? "warning" : "good"

  return (
    <div className="p-6 space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          label="Receita Total"
          value={`R$ ${metrics.totalRevenue.toLocaleString()}`}
          icon={TrendingUp}
          color="emerald"
          trend={{ value: "+12.5%", direction: "up" }}
        />
        <KPICard
          label="Despesas"
          value={`R$ ${metrics.totalExpenses.toLocaleString()}`}
          icon={TrendingDown}
          color="red"
          trend={{ value: "+5.2%", direction: "up" }}
        />
        <KPICard
          label="Lucro Líquido"
          value={`R$ ${metrics.netProfit.toLocaleString()}`}
          icon={profitTrend === "up" ? ArrowUpCircle : ArrowDownCircle}
          color={profitTrend === "up" ? "green" : "red"}
          trend={{ value: `${metrics.profitMargin.toFixed(1)}%`, direction: profitTrend }}
        />
        <KPICard
          label="EBITDA"
          value={`R$ ${metrics.ebitda.toLocaleString()}`}
          icon={Activity}
          color="blue"
          trend={{ value: `${metrics.ebitdaMargin.toFixed(1)}%`, direction: "up" }}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Burn Rate</span>
            <Flame className={`w-4 h-4 ${runwayStatus === "critical" ? "text-red-600" : "text-orange-600"}`} />
          </div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-white">
            R$ {metrics.burnRate.toLocaleString()}
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">por mês</div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Runway</span>
            <Clock className={`w-4 h-4 ${
              runwayStatus === "critical" ? "text-red-600" :
              runwayStatus === "warning" ? "text-amber-600" :
              "text-green-600"
            }`} />
          </div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-white">
            {metrics.runway.toFixed(1)} meses
          </div>
          <div className={`text-xs mt-1 ${
            runwayStatus === "critical" ? "text-red-600" :
            runwayStatus === "warning" ? "text-amber-600" :
            "text-green-600"
          }`}>
            {runwayStatus === "critical" && "Atenção crítica!"}
            {runwayStatus === "warning" && "Atenção necessária"}
            {runwayStatus === "good" && "Situação saudável"}
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Utilização Budget</span>
            <Percent className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-white">
            {metrics.budgetUtilization.toFixed(1)}%
          </div>
          <div className="mt-2">
            <div className="h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  metrics.budgetUtilization > 90 ? "bg-red-600" :
                  metrics.budgetUtilization > 75 ? "bg-amber-600" :
                  "bg-green-600"
                }`}
                style={{ width: `${Math.min(metrics.budgetUtilization, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Departamentos */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Budget por Departamento</h3>
        </div>
        <div className="p-4 space-y-3">
          {data.departmentBudgets?.map((dept: DepartmentBudget) => {
            const deptInfo = departments.find((d: any) => d.id === dept.department)
            const utilization = dept.allocated > 0 ? (dept.spent / dept.allocated) * 100 : 0
            const Icon = deptInfo?.icon || Building2

            return (
              <div key={dept.department} className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg bg-${deptInfo?.color}-100 dark:bg-${deptInfo?.color}-900/20 flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 text-${deptInfo?.color}-600 dark:text-${deptInfo?.color}-400`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-neutral-900 dark:text-white">
                      {deptInfo?.name}
                    </span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      R$ {dept.spent.toLocaleString()} / R$ {dept.allocated.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        utilization > 90 ? "bg-red-600" :
                        utilization > 75 ? "bg-amber-600" :
                        "bg-green-600"
                      }`}
                      style={{ width: `${Math.min(utilization, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-neutral-900 dark:text-white">
                    {utilization.toFixed(0)}%
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    R$ {dept.remaining.toLocaleString()}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function ExpensesTab({ expenses, departments, categories, selectedDepartment, setSelectedDepartment, addExpense, deleteExpense, showAddExpense, setShowAddExpense }: any) {
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    department: "sales" as Department,
    category: categories[0],
    date: new Date().toISOString().slice(0, 10),
    recurring: false,
    approved: true,
    notes: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.description || !formData.amount) return

    addExpense({
      ...formData,
      amount: parseFloat(formData.amount)
    })

    setFormData({
      description: "",
      amount: "",
      department: "sales" as Department,
      category: categories[0],
      date: new Date().toISOString().slice(0, 10),
      recurring: false,
      approved: true,
      notes: ""
    })
    setShowAddExpense(false)
  }

  const filteredExpenses = selectedDepartment === "all"
    ? expenses
    : expenses.filter((e: ExpenseItem) => e.department === selectedDepartment)

  const totalExpenses = filteredExpenses.reduce((sum: number, e: ExpenseItem) => sum + e.amount, 0)

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Despesas</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Total: R$ {totalExpenses.toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value as any)}
            className="px-3 py-1.5 text-sm bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-white"
          >
            <option value="all">Todos Departamentos</option>
            {departments.map((dept: any) => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
          <button
            onClick={() => setShowAddExpense(true)}
            className="px-3 py-1.5 text-sm bg-neutral-900 dark:bg-neutral-700 text-white rounded hover:bg-neutral-800 dark:hover:bg-neutral-600 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Nova Despesa
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showAddExpense && (
        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                  Valor
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                  Departamento
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value as Department })}
                  className="w-full px-3 py-1.5 text-sm bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-white"
                >
                  {departments.map((dept: any) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                  Categoria
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-white"
                >
                  {categories.map((cat: string) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                  Data
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-white"
                />
              </div>
              <div className="flex items-center gap-4 pt-6">
                <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                  <input
                    type="checkbox"
                    checked={formData.recurring}
                    onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
                    className="rounded"
                  />
                  Recorrente
                </label>
                <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                  <input
                    type="checkbox"
                    checked={formData.approved}
                    onChange={(e) => setFormData({ ...formData, approved: e.target.checked })}
                    className="rounded"
                  />
                  Aprovado
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddExpense(false)}
                className="px-3 py-1.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 text-sm bg-neutral-900 dark:bg-neutral-700 text-white rounded hover:bg-neutral-800 dark:hover:bg-neutral-600"
              >
                Adicionar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Expenses List */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-neutral-700 dark:text-neutral-300">Descrição</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-neutral-700 dark:text-neutral-300">Valor</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-neutral-700 dark:text-neutral-300">Departamento</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-neutral-700 dark:text-neutral-300">Categoria</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-neutral-700 dark:text-neutral-300">Data</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-neutral-700 dark:text-neutral-300">Status</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-neutral-700 dark:text-neutral-300">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
                    Nenhuma despesa registrada
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense: ExpenseItem) => {
                  const dept = departments.find((d: any) => d.id === expense.department)
                  return (
                    <tr key={expense.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                      <td className="px-4 py-3 text-sm text-neutral-900 dark:text-white">{expense.description}</td>
                      <td className="px-4 py-3 text-sm font-medium text-neutral-900 dark:text-white">
                        R$ {expense.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300">{dept?.name}</td>
                      <td className="px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300">{expense.category}</td>
                      <td className="px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300">
                        {new Date(expense.date).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {expense.recurring && (
                            <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                              Recorrente
                            </span>
                          )}
                          {expense.approved ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Clock className="w-4 h-4 text-amber-600" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => deleteExpense(expense.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function RevenueTab({ revenues, departments, selectedDepartment, setSelectedDepartment, addRevenue, deleteRevenue, showAddRevenue, setShowAddRevenue }: any) {
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    department: "sales" as Department,
    type: "product" as RevenueStream["type"],
    date: new Date().toISOString().slice(0, 10),
    recurring: false
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.amount) return

    addRevenue({
      ...formData,
      amount: parseFloat(formData.amount)
    })

    setFormData({
      name: "",
      amount: "",
      department: "sales" as Department,
      type: "product" as RevenueStream["type"],
      date: new Date().toISOString().slice(0, 10),
      recurring: false
    })
    setShowAddRevenue(false)
  }

  const filteredRevenues = selectedDepartment === "all"
    ? revenues
    : revenues.filter((r: RevenueStream) => r.department === selectedDepartment)

  const totalRevenue = filteredRevenues.reduce((sum: number, r: RevenueStream) => sum + r.amount, 0)

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Receitas</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Total: R$ {totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value as any)}
            className="px-3 py-1.5 text-sm bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-white"
          >
            <option value="all">Todos Departamentos</option>
            {departments.map((dept: any) => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
          <button
            onClick={() => setShowAddRevenue(true)}
            className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Nova Receita
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showAddRevenue && (
        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                  Valor
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                  Departamento
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value as Department })}
                  className="w-full px-3 py-1.5 text-sm bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-white"
                >
                  {departments.map((dept: any) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                  Tipo
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as RevenueStream["type"] })}
                  className="w-full px-3 py-1.5 text-sm bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-white"
                >
                  <option value="product">Produto</option>
                  <option value="service">Serviço</option>
                  <option value="subscription">Assinatura</option>
                  <option value="other">Outro</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                  Data
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-white"
                />
              </div>
              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                  <input
                    type="checkbox"
                    checked={formData.recurring}
                    onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
                    className="rounded"
                  />
                  Recorrente
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddRevenue(false)}
                className="px-3 py-1.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700"
              >
                Adicionar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Revenue List */}
      <div className="grid grid-cols-1 gap-3">
        {filteredRevenues.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-8 text-center">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Nenhuma receita registrada</p>
          </div>
        ) : (
          filteredRevenues.map((revenue: RevenueStream) => {
            const dept = departments.find((d: any) => d.id === revenue.department)
            const Icon = dept?.icon || Building2

            return (
              <div
                key={revenue.id}
                className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-lg bg-${dept?.color}-100 dark:bg-${dept?.color}-900/20 flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 text-${dept?.color}-600 dark:text-${dept?.color}-400`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">{revenue.name}</h4>
                        {revenue.recurring && (
                          <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                            Recorrente
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                        <span>{dept?.name}</span>
                        <span>•</span>
                        <span className="capitalize">{revenue.type}</span>
                        <span>•</span>
                        <span>{new Date(revenue.date).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        R$ {revenue.amount.toLocaleString()}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteRevenue(revenue.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

function GoalsTab({ goals, departments, addGoal, deleteGoal, updateGoalProgress, showAddGoal, setShowAddGoal, editingGoal, setEditingGoal }: any) {
  const [formData, setFormData] = useState({
    name: "",
    type: "revenue" as FinancialGoal["type"],
    targetAmount: "",
    deadline: "",
    department: "company" as Department | "company",
    priority: "medium" as FinancialGoal["priority"]
  })

  const [editAmount, setEditAmount] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.targetAmount || !formData.deadline) return

    addGoal({
      ...formData,
      targetAmount: parseFloat(formData.targetAmount)
    })

    setFormData({
      name: "",
      type: "revenue" as FinancialGoal["type"],
      targetAmount: "",
      deadline: "",
      department: "company" as Department | "company",
      priority: "medium" as FinancialGoal["priority"]
    })
    setShowAddGoal(false)
  }

  const handleUpdateProgress = (goalId: string) => {
    if (!editAmount) return
    updateGoalProgress(goalId, parseFloat(editAmount))
    setEditingGoal(null)
    setEditAmount("")
  }

  const getStatusColor = (status: FinancialGoal["status"]) => {
    switch (status) {
      case "completed": return "green"
      case "on-track": return "blue"
      case "at-risk": return "amber"
      case "behind": return "red"
      default: return "gray"
    }
  }

  const getStatusLabel = (status: FinancialGoal["status"]) => {
    switch (status) {
      case "completed": return "Concluída"
      case "on-track": return "No Prazo"
      case "at-risk": return "Em Risco"
      case "behind": return "Atrasada"
      default: return ""
    }
  }

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Metas Financeiras</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {goals.length} {goals.length === 1 ? "meta ativa" : "metas ativas"}
          </p>
        </div>
        <button
          onClick={() => setShowAddGoal(true)}
          className="px-3 py-1.5 text-sm bg-neutral-900 dark:bg-neutral-700 text-white rounded hover:bg-neutral-800 dark:hover:bg-neutral-600 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Nova Meta
        </button>
      </div>

      {/* Add Form */}
      {showAddGoal && (
        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                  Nome da Meta
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                  Tipo
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as FinancialGoal["type"] })}
                  className="w-full px-3 py-1.5 text-sm bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-white"
                >
                  <option value="revenue">Receita</option>
                  <option value="cost-reduction">Redução de Custos</option>
                  <option value="profit">Lucro</option>
                  <option value="growth">Crescimento</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                  Valor Alvo
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                  Prazo
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                  Departamento
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value as Department | "company" })}
                  className="w-full px-3 py-1.5 text-sm bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-white"
                >
                  <option value="company">Empresa Toda</option>
                  {departments.map((dept: any) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                  Prioridade
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as FinancialGoal["priority"] })}
                  className="w-full px-3 py-1.5 text-sm bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-white"
                >
                  <option value="critical">Crítica</option>
                  <option value="high">Alta</option>
                  <option value="medium">Média</option>
                  <option value="low">Baixa</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddGoal(false)}
                className="px-3 py-1.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 text-sm bg-neutral-900 dark:bg-neutral-700 text-white rounded hover:bg-neutral-800 dark:hover:bg-neutral-600"
              >
                Criar Meta
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goals Grid */}
      <div className="grid grid-cols-2 gap-4">
        {goals.length === 0 ? (
          <div className="col-span-2 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-8 text-center">
            <Target className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Nenhuma meta definida</p>
          </div>
        ) : (
          goals.map((goal: FinancialGoal) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100
            const statusColor = getStatusColor(goal.status)
            const daysUntilDeadline = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

            return (
              <div
                key={goal.id}
                className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">{goal.name}</h4>
                      {goal.priority === "critical" && <Flame className="w-4 h-4 text-red-600" />}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                      <span className="capitalize">{goal.type.replace("-", " ")}</span>
                      <span>•</span>
                      <span>{daysUntilDeadline > 0 ? `${daysUntilDeadline}d restantes` : "Vencida"}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-xs bg-${statusColor}-100 dark:bg-${statusColor}-900/30 text-${statusColor}-700 dark:text-${statusColor}-300 rounded`}>
                      {getStatusLabel(goal.status)}
                    </span>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-700 dark:text-neutral-300">Progresso</span>
                    <span className="font-semibold text-neutral-900 dark:text-white">
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-${statusColor}-600`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                    <span>R$ {goal.currentAmount.toLocaleString()}</span>
                    <span>R$ {goal.targetAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                  {editingGoal === goal.id ? (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.01"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        placeholder="Valor atual"
                        className="flex-1 px-2 py-1 text-xs bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-white"
                      />
                      <button
                        onClick={() => handleUpdateProgress(goal.id)}
                        className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingGoal(null)
                          setEditAmount("")
                        }}
                        className="px-2 py-1 text-xs bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded hover:bg-neutral-300 dark:hover:bg-neutral-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingGoal(goal.id)
                        setEditAmount(goal.currentAmount.toString())
                      }}
                      className="w-full px-2 py-1 text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 flex items-center justify-center gap-1.5"
                    >
                      <Edit2 className="w-3 h-3" />
                      Atualizar Progresso
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

function CashFlowTab({ expenses, revenues, initialBalance }: any) {
  // Calculate cash flow by month
  const cashFlowData = useMemo(() => {
    const monthlyData: { [key: string]: { inflow: number; outflow: number } } = {}

    // Process revenues
    revenues.forEach((r: RevenueStream) => {
      const month = r.date.slice(0, 7)
      if (!monthlyData[month]) monthlyData[month] = { inflow: 0, outflow: 0 }
      monthlyData[month].inflow += r.amount
    })

    // Process expenses
    expenses.forEach((e: ExpenseItem) => {
      const month = e.date.slice(0, 7)
      if (!monthlyData[month]) monthlyData[month] = { inflow: 0, outflow: 0 }
      monthlyData[month].outflow += e.amount
    })

    // Calculate cumulative balance
    const months = Object.keys(monthlyData).sort()
    let balance = initialBalance

    return months.map(month => {
      const data = monthlyData[month]
      balance += data.inflow - data.outflow
      return {
        month,
        inflow: data.inflow,
        outflow: data.outflow,
        net: data.inflow - data.outflow,
        balance
      }
    })
  }, [expenses, revenues, initialBalance])

  const totalInflow = cashFlowData.reduce((sum, m) => sum + m.inflow, 0)
  const totalOutflow = cashFlowData.reduce((sum, m) => sum + m.outflow, 0)
  const netCashFlow = totalInflow - totalOutflow

  return (
    <div className="p-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Saldo Inicial</span>
            <Wallet className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-neutral-900 dark:text-white">
            R$ {initialBalance.toLocaleString()}
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Entradas</span>
            <ArrowUpCircle className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-xl font-bold text-green-600">
            R$ {totalInflow.toLocaleString()}
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Saídas</span>
            <ArrowDownCircle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-xl font-bold text-red-600">
            R$ {totalOutflow.toLocaleString()}
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Saldo Atual</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div className={`text-xl font-bold ${netCashFlow >= 0 ? "text-green-600" : "text-red-600"}`}>
            R$ {(initialBalance + netCashFlow).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Cash Flow Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Fluxo de Caixa Mensal</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 dark:bg-neutral-800/50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-neutral-700 dark:text-neutral-300">Mês</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-neutral-700 dark:text-neutral-300">Entradas</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-neutral-700 dark:text-neutral-300">Saídas</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-neutral-700 dark:text-neutral-300">Fluxo Líquido</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-neutral-700 dark:text-neutral-300">Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {cashFlowData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
                    Nenhuma movimentação registrada
                  </td>
                </tr>
              ) : (
                cashFlowData.map((row) => (
                  <tr key={row.month} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <td className="px-4 py-3 text-sm text-neutral-900 dark:text-white">
                      {new Date(row.month + "-01").toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-green-600">
                      R$ {row.inflow.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-red-600">
                      R$ {row.outflow.toLocaleString()}
                    </td>
                    <td className={`px-4 py-3 text-sm text-right font-semibold ${row.net >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {row.net >= 0 ? "+" : ""}R$ {row.net.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-neutral-900 dark:text-white">
                      R$ {row.balance.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function ReportsTab({ data, metrics, departments }: any) {
  return (
    <div className="p-6 space-y-6">
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
          Demonstrativo de Resultados (P&L)
        </h3>

        <div className="space-y-3">
          {/* Revenue */}
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-semibold text-neutral-900 dark:text-white">Receita Total</span>
            <span className="text-sm font-bold text-green-600">
              R$ {metrics.totalRevenue.toLocaleString()}
            </span>
          </div>

          <div className="border-t border-neutral-200 dark:border-neutral-800 my-2" />

          {/* Expenses */}
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-semibold text-neutral-900 dark:text-white">Despesas Totais</span>
            <span className="text-sm font-bold text-red-600">
              R$ {metrics.totalExpenses.toLocaleString()}
            </span>
          </div>

          {/* Expenses by department */}
          {data.departmentBudgets?.map((dept: DepartmentBudget) => {
            const deptInfo = departments.find((d: any) => d.id === dept.department)
            if (dept.spent === 0) return null
            return (
              <div key={dept.department} className="flex items-center justify-between py-1 pl-4">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">{deptInfo?.name}</span>
                <span className="text-xs text-neutral-700 dark:text-neutral-300">
                  R$ {dept.spent.toLocaleString()}
                </span>
              </div>
            )
          })}

          <div className="border-t border-neutral-200 dark:border-neutral-800 my-2" />

          {/* EBITDA */}
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-semibold text-neutral-900 dark:text-white">EBITDA</span>
            <span className={`text-sm font-bold ${metrics.ebitda >= 0 ? "text-green-600" : "text-red-600"}`}>
              R$ {metrics.ebitda.toLocaleString()}
            </span>
          </div>

          <div className="border-t-2 border-neutral-300 dark:border-neutral-700 my-2" />

          {/* Net Profit */}
          <div className="flex items-center justify-between py-2 bg-neutral-50 dark:bg-neutral-800/50 px-3 rounded">
            <span className="text-sm font-bold text-neutral-900 dark:text-white">Lucro Líquido</span>
            <span className={`text-lg font-bold ${metrics.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
              R$ {metrics.netProfit.toLocaleString()}
            </span>
          </div>

          {/* Margin */}
          <div className="flex items-center justify-between py-2">
            <span className="text-xs text-neutral-600 dark:text-neutral-400">Margem de Lucro</span>
            <span className={`text-xs font-medium ${metrics.profitMargin >= 0 ? "text-green-600" : "text-red-600"}`}>
              {metrics.profitMargin.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Financial Health Indicators */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
          Indicadores de Saúde Financeira
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Margem EBITDA</span>
            </div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-white">
              {metrics.ebitdaMargin.toFixed(1)}%
            </div>
          </div>

          <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">ROI</span>
            </div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-white">
              {((metrics.netProfit / Math.max(metrics.totalExpenses, 1)) * 100).toFixed(1)}%
            </div>
          </div>

          <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Burn Rate</span>
            </div>
            <div className="text-xl font-bold text-neutral-900 dark:text-white">
              R$ {metrics.burnRate.toLocaleString()}/mês
            </div>
          </div>

          <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Runway</span>
            </div>
            <div className="text-xl font-bold text-neutral-900 dark:text-white">
              {metrics.runway.toFixed(1)} meses
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function KPICard({ label, value, icon: Icon, color, trend }: any) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">{label}</span>
        <div className={`w-8 h-8 rounded-lg bg-${color}-100 dark:bg-${color}-900/20 flex items-center justify-center`}>
          <Icon className={`w-4 h-4 text-${color}-600 dark:text-${color}-400`} />
        </div>
      </div>
      <div className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
        {value}
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs ${
          trend.direction === "up" ? "text-green-600" : "text-red-600"
        }`}>
          {trend.direction === "up" ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span>{trend.value}</span>
        </div>
      )}
    </div>
  )
}
