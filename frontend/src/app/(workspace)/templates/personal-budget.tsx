"use client"

import { useState, useEffect, useMemo } from "react"
import { usePageTemplateData } from "@/core/hooks/usePageTemplateData"
import { WorkspaceTemplateComponentProps } from "@/core/types/workspace.types"
import {
  Plus, Trash2, DollarSign, TrendingUp, TrendingDown, Wallet, ShoppingCart,
  Home, Car, Utensils, Heart, Plane, Smartphone, Edit2, X, Save, Calendar,
  CreditCard, Calculator, PieChart, BarChart3, LineChart, Target, AlertCircle,
  Download, Upload, Settings, Bell, ArrowUpCircle, ArrowDownCircle, CheckCircle,
  Clock, Repeat, Package, Coffee, Briefcase, Zap, Gift, FileText, Filter,
  ChevronDown, ChevronUp, Percent, Info, Star, Award, Menu
} from "lucide-react"
import ExcelJS from "exceljs"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

// ===== TYPES =====
type TransactionCategory = {
  id: string
  name: string
  icon: string
  color: string
  budget?: number
  type: "expense" | "income"
  subcategories?: string[]
}

type Transaction = {
  id: string
  description: string
  amount: number
  categoryId: string
  subcategory?: string
  type: "income" | "expense"
  date: string
  paid: boolean
  recurring?: "monthly" | "weekly" | "yearly" | "none"
  installments?: {
    current: number
    total: number
  }
  accountId?: string
  tags?: string[]
}

type FinancialGoal = {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string
  priority: "high" | "medium" | "low"
  category: string
}

type CreditCard = {
  id: string
  name: string
  limit: number
  closingDay: number
  dueDay: number
  currentBill: number
  color: string
}

type BankAccount = {
  id: string
  name: string
  balance: number
  type: "checking" | "savings" | "investment"
  color: string
}

type MonthlyData = {
  month: string
  transactions: Transaction[]
  totalIncome: number
  totalExpense: number
  balance: number
}

type BudgetData = {
  transactions: Transaction[]
  goals: FinancialGoal[]
  creditCards: CreditCard[]
  accounts: BankAccount[]
  categories: TransactionCategory[]
  monthlyHistory: MonthlyData[]
  currentMonth: string
}

// ===== DEFAULT DATA =====
const DEFAULT_DATA: BudgetData = {
  currentMonth: new Date().toISOString().slice(0, 7),
  transactions: [],
  goals: [],
  creditCards: [],
  accounts: [],
  categories: [],
  monthlyHistory: []
}

// ===== ICON MAP =====
const ICON_MAP: Record<string, any> = {
  Home, Car, Utensils, Heart, Plane, Smartphone, ShoppingCart, Package,
  Briefcase, TrendingUp, Coffee, Gift, Zap
}

// ===== COMPONENT =====
export default function PersonalBudgetTemplate({ groupId, pageId }: WorkspaceTemplateComponentProps) {
  const { data, setData } = usePageTemplateData<BudgetData>(groupId, pageId, DEFAULT_DATA)

  const [activeTab, setActiveTab] = useState<"dashboard" | "transactions" | "goals" | "cards" | "calculators" | "reports">("dashboard")
  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [showAddCard, setShowAddCard] = useState(false)
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [selectedMonth, setSelectedMonth] = useState(data.currentMonth || DEFAULT_DATA.currentMonth)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // New transaction form
  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    description: "",
    amount: 0,
    categoryId: "",
    type: "expense",
    date: new Date().toISOString().slice(0, 10),
    paid: false,
    recurring: "none",
    accountId: data.accounts[0]?.id || "1"
  })

  // New goal form
  const [newGoal, setNewGoal] = useState<Partial<FinancialGoal>>({
    name: "",
    targetAmount: 0,
    currentAmount: 0,
    deadline: "",
    priority: "medium",
    category: "savings"
  })

  // New card form
  const [newCard, setNewCard] = useState<Partial<CreditCard>>({
    name: "",
    limit: 0,
    closingDay: 10,
    dueDay: 17,
    currentBill: 0,
    color: "blue"
  })

  // Calculator states
  const [compoundInterest, setCompoundInterest] = useState({
    principal: 10000,
    monthlyContribution: 500,
    rate: 0.8,
    years: 10
  })

  // ===== COMPUTED VALUES =====
  const currentMonthTransactions = useMemo(() => {
    return data.transactions.filter(t => t.date.slice(0, 7) === selectedMonth)
  }, [data.transactions, selectedMonth])

  const filteredTransactions = useMemo(() => {
    return currentMonthTransactions.filter(t => {
      const typeMatch = filterType === "all" || t.type === filterType
      const categoryMatch = filterCategory === "all" || t.categoryId === filterCategory
      return typeMatch && categoryMatch
    })
  }, [currentMonthTransactions, filterType, filterCategory])

  const totalIncome = useMemo(() => {
    return currentMonthTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0)
  }, [currentMonthTransactions])

  const totalExpense = useMemo(() => {
    return currentMonthTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0)
  }, [currentMonthTransactions])

  const balance = totalIncome - totalExpense

  const expensesByCategory = useMemo(() => {
    const categories = data.categories.filter(c => c.type === "expense")
    return categories.map(cat => {
      const total = currentMonthTransactions
        .filter(t => t.type === "expense" && t.categoryId === cat.id)
        .reduce((sum, t) => sum + t.amount, 0)

      const budget = cat.budget || 0
      const percentage = budget > 0 ? (total / budget) * 100 : 0

      return {
        ...cat,
        total,
        budget,
        percentage,
        remaining: budget - total
      }
    }).filter(c => c.total > 0 || c.budget)
  }, [currentMonthTransactions, data.categories])

  const incomeByCategory = useMemo(() => {
    const categories = data.categories.filter(c => c.type === "income")
    return categories.map(cat => {
      const total = currentMonthTransactions
        .filter(t => t.type === "income" && t.categoryId === cat.id)
        .reduce((sum, t) => sum + t.amount, 0)

      return { ...cat, total }
    }).filter(c => c.total > 0)
  }, [currentMonthTransactions, data.categories])

  const totalCreditCardDebt = data.creditCards.reduce((sum, card) => sum + card.currentBill, 0)

  const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : "0"

  // ===== EXPORT FUNCTIONS =====
  const exportToPDF = async () => {
    const monthName = new Date(selectedMonth + "-01").toLocaleDateString("pt-BR", { month: "long", year: "numeric" })

    const doc = new jsPDF()

    // Cores do tema
    const primaryColor: [number, number, number] = [23, 23, 23] // neutral-900
    const secondaryColor: [number, number, number] = [115, 115, 115] // neutral-500
    const accentGreen: [number, number, number] = [34, 197, 94] // green-600
    const accentRed: [number, number, number] = [220, 38, 38] // red-600
    const accentBlue: [number, number, number] = [37, 99, 235] // blue-600
    const lightBg: [number, number, number] = [250, 250, 250] // neutral-50

    // Header
    doc.setFillColor(...primaryColor)
    doc.rect(0, 0, 210, 40, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('Relatório Financeiro', 105, 18, { align: 'center' })

    doc.setFontSize(14)
    doc.setFont('helvetica', 'normal')
    doc.text(monthName.charAt(0).toUpperCase() + monthName.slice(1), 105, 30, { align: 'center' })

    let yPos = 50

    // Resumo Geral
    doc.setTextColor(...primaryColor)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Resumo Geral', 14, yPos)
    yPos += 10

    // Cards de resumo
    const summaryData = [
      { label: 'Receitas', value: totalIncome, color: accentGreen },
      { label: 'Despesas', value: totalExpense, color: accentRed },
      { label: 'Saldo', value: balance, color: balance >= 0 ? accentBlue : accentRed },
      { label: 'Taxa de Poupança', value: savingsRate + '%', color: accentBlue, isPercentage: true }
    ]

    summaryData.forEach((item, index) => {
      const x = 14 + (index % 2) * 95
      const y = yPos + Math.floor(index / 2) * 25

      doc.setFillColor(...lightBg)
      doc.roundedRect(x, y, 90, 20, 3, 3, 'F')

      doc.setFontSize(10)
      doc.setTextColor(...secondaryColor)
      doc.text(item.label, x + 5, y + 8)

      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...item.color)
      const valueText = item.isPercentage ? item.value as string : `R$ ${(item.value as number).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      doc.text(valueText, x + 5, y + 16)
    })

    yPos += 60

    // Análise por Categoria
    doc.setTextColor(...primaryColor)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Análise por Categoria', 14, yPos)
    yPos += 5

    const categoryTableData = expensesByCategory.map(cat => [
      cat.name,
      cat.budget ? `R$ ${cat.budget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-',
      `R$ ${cat.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      cat.budget ? `R$ ${Math.abs(cat.remaining).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-',
      cat.budget ? `${cat.percentage.toFixed(0)}%` : '-'
    ])

    autoTable(doc, {
      startY: yPos,
      head: [['Categoria', 'Orçado', 'Gasto', 'Diferença', '% Usado']],
      body: categoryTableData,
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: primaryColor
      },
      alternateRowStyles: {
        fillColor: lightBg
      },
      columnStyles: {
        1: { halign: 'right' },
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'center' }
      }
    })

    yPos = (doc as any).lastAutoTable.finalY + 15

    // Nova página se necessário
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }

    // Transações
    doc.setTextColor(...primaryColor)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Transações do Mês', 14, yPos)
    yPos += 5

    const transactionsTableData = currentMonthTransactions.slice(0, 20).map(t => {
      const cat = data.categories.find(c => c.id === t.categoryId)
      return [
        new Date(t.date).toLocaleDateString('pt-BR'),
        t.description,
        t.type === 'income' ? 'Receita' : 'Despesa',
        cat?.name || 'Sem categoria',
        `R$ ${t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        t.paid ? 'Pago' : 'Pendente'
      ]
    })

    autoTable(doc, {
      startY: yPos,
      head: [['Data', 'Descrição', 'Tipo', 'Categoria', 'Valor', 'Status']],
      body: transactionsTableData,
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 8,
        textColor: primaryColor
      },
      alternateRowStyles: {
        fillColor: lightBg
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 50 },
        2: { cellWidth: 25 },
        3: { cellWidth: 35 },
        4: { halign: 'right', cellWidth: 30 },
        5: { halign: 'center', cellWidth: 25 }
      }
    })

    // Footer
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(...secondaryColor)
      doc.text(
        `Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
        105,
        290,
        { align: 'center' }
      )
      doc.text(`Página ${i} de ${pageCount}`, 190, 290, { align: 'right' })
    }

    doc.save(`relatorio-financeiro-${selectedMonth}.pdf`)
  }

  const exportToExcel = async () => {
    const monthName = new Date(selectedMonth + "-01").toLocaleDateString("pt-BR", { month: "long", year: "numeric" })

    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'Projectly - Orçamento Pessoal'
    workbook.created = new Date()

    const worksheet = workbook.addWorksheet('Relatório Financeiro', {
      properties: { tabColor: { argb: 'FF171717' } }
    })

    // Cores do tema
    const headerColor = '171717' // neutral-900
    const accentGreen = '22C55E' // green-600
    const accentRed = 'DC2626' // red-600
    const accentBlue = '2563EB' // blue-600
    const lightBg = 'FAFAFA' // neutral-50

    // Header
    worksheet.mergeCells('A1:F1')
    const titleCell = worksheet.getCell('A1')
    titleCell.value = 'RELATÓRIO FINANCEIRO'
    titleCell.font = { name: 'Calibri', size: 20, bold: true, color: { argb: 'FFFFFFFF' } }
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + headerColor } }
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' }
    worksheet.getRow(1).height = 35

    worksheet.mergeCells('A2:F2')
    const subtitleCell = worksheet.getCell('A2')
    subtitleCell.value = monthName.charAt(0).toUpperCase() + monthName.slice(1)
    subtitleCell.font = { name: 'Calibri', size: 14, color: { argb: 'FFFFFFFF' } }
    subtitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + headerColor } }
    subtitleCell.alignment = { vertical: 'middle', horizontal: 'center' }
    worksheet.getRow(2).height = 25

    // Resumo Geral
    let currentRow = 4
    worksheet.mergeCells(`A${currentRow}:F${currentRow}`)
    const summaryTitleCell = worksheet.getCell(`A${currentRow}`)
    summaryTitleCell.value = 'RESUMO GERAL'
    summaryTitleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FF' + headerColor } }
    summaryTitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + lightBg } }
    summaryTitleCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
    worksheet.getRow(currentRow).height = 25

    currentRow += 2

    // Cards de resumo
    const summaryData = [
      ['Receitas', totalIncome, accentGreen],
      ['Despesas', totalExpense, accentRed],
      ['Saldo', balance, balance >= 0 ? accentBlue : accentRed],
      ['Taxa de Poupança', savingsRate + '%', accentBlue]
    ]

    summaryData.forEach(([label, value, color]) => {
      const labelCell = worksheet.getCell(`A${currentRow}`)
      labelCell.value = label
      labelCell.font = { name: 'Calibri', size: 11, bold: true }
      labelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + lightBg } }
      labelCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }

      const valueCell = worksheet.getCell(`B${currentRow}`)
      valueCell.value = typeof value === 'string' ? value : value
      if (typeof value === 'number') {
        valueCell.numFmt = 'R$ #,##0.00'
      }
      valueCell.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FF' + color } }
      valueCell.alignment = { vertical: 'middle', horizontal: 'right' }

      worksheet.getRow(currentRow).height = 20
      currentRow++
    })

    currentRow += 2

    // Análise por Categoria
    worksheet.mergeCells(`A${currentRow}:F${currentRow}`)
    const categoryTitleCell = worksheet.getCell(`A${currentRow}`)
    categoryTitleCell.value = 'ANÁLISE POR CATEGORIA'
    categoryTitleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FF' + headerColor } }
    categoryTitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + lightBg } }
    categoryTitleCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
    worksheet.getRow(currentRow).height = 25

    currentRow += 2

    // Cabeçalho da tabela
    const headerRow = worksheet.getRow(currentRow)
    headerRow.values = ['Categoria', 'Orçado', 'Gasto', 'Diferença', '% Usado', 'Status']
    headerRow.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } }
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + headerColor } }
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' }
    headerRow.height = 20

    currentRow++

    // Dados das categorias
    expensesByCategory.forEach((cat, index) => {
      const row = worksheet.getRow(currentRow)
      row.values = [
        cat.name,
        cat.budget || 0,
        cat.total,
        cat.budget ? Math.abs(cat.remaining) : 0,
        cat.budget ? cat.percentage / 100 : 0,
        cat.percentage > 100 ? 'Excedido' : cat.percentage > 80 ? 'Atenção' : 'Normal'
      ]

      row.getCell(2).numFmt = 'R$ #,##0.00'
      row.getCell(3).numFmt = 'R$ #,##0.00'
      row.getCell(4).numFmt = 'R$ #,##0.00'
      row.getCell(5).numFmt = '0.0%'

      // Cor de fundo alternada
      if (index % 2 === 0) {
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + lightBg } }
      }

      // Cor do status
      const statusCell = row.getCell(6)
      if (cat.percentage > 100) {
        statusCell.font = { bold: true, color: { argb: 'FF' + accentRed } }
      } else if (cat.percentage > 80) {
        statusCell.font = { bold: true, color: { argb: 'FFFFA500' } }
      } else {
        statusCell.font = { bold: true, color: { argb: 'FF' + accentGreen } }
      }

      row.alignment = { vertical: 'middle', horizontal: 'left' }
      row.getCell(2).alignment = { vertical: 'middle', horizontal: 'right' }
      row.getCell(3).alignment = { vertical: 'middle', horizontal: 'right' }
      row.getCell(4).alignment = { vertical: 'middle', horizontal: 'right' }
      row.getCell(5).alignment = { vertical: 'middle', horizontal: 'center' }
      row.getCell(6).alignment = { vertical: 'middle', horizontal: 'center' }

      currentRow++
    })

    currentRow += 2

    // Transações
    worksheet.mergeCells(`A${currentRow}:F${currentRow}`)
    const transactionsTitleCell = worksheet.getCell(`A${currentRow}`)
    transactionsTitleCell.value = 'TRANSAÇÕES DO MÊS'
    transactionsTitleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FF' + headerColor } }
    transactionsTitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + lightBg } }
    transactionsTitleCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
    worksheet.getRow(currentRow).height = 25

    currentRow += 2

    // Cabeçalho transações
    const transHeaderRow = worksheet.getRow(currentRow)
    transHeaderRow.values = ['Data', 'Descrição', 'Tipo', 'Categoria', 'Valor', 'Status']
    transHeaderRow.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } }
    transHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + headerColor } }
    transHeaderRow.alignment = { vertical: 'middle', horizontal: 'center' }
    transHeaderRow.height = 20

    currentRow++

    // Dados das transações
    currentMonthTransactions.forEach((t, index) => {
      const cat = data.categories.find(c => c.id === t.categoryId)
      const row = worksheet.getRow(currentRow)
      row.values = [
        new Date(t.date).toLocaleDateString('pt-BR'),
        t.description,
        t.type === 'income' ? 'Receita' : 'Despesa',
        cat?.name || 'Sem categoria',
        t.amount,
        t.paid ? 'Pago' : 'Pendente'
      ]

      row.getCell(5).numFmt = 'R$ #,##0.00'

      // Cor de fundo alternada
      if (index % 2 === 0) {
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + lightBg } }
      }

      // Cor do tipo
      const typeCell = row.getCell(3)
      typeCell.font = {
        bold: true,
        color: { argb: t.type === 'income' ? 'FF' + accentGreen : 'FF' + accentRed }
      }

      // Cor do status
      const statusCell = row.getCell(6)
      statusCell.font = {
        bold: true,
        color: { argb: t.paid ? 'FF' + accentGreen : 'FFFFA500' }
      }

      row.alignment = { vertical: 'middle', horizontal: 'left' }
      row.getCell(5).alignment = { vertical: 'middle', horizontal: 'right' }
      row.getCell(3).alignment = { vertical: 'middle', horizontal: 'center' }
      row.getCell(6).alignment = { vertical: 'middle', horizontal: 'center' }

      currentRow++
    })

    // Largura das colunas
    worksheet.getColumn(1).width = 20
    worksheet.getColumn(2).width = 35
    worksheet.getColumn(3).width = 15
    worksheet.getColumn(4).width = 20
    worksheet.getColumn(5).width = 15
    worksheet.getColumn(6).width = 15

    // Bordas em toda a área de dados
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber >= 4) {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFD4D4D4' } },
            left: { style: 'thin', color: { argb: 'FFD4D4D4' } },
            bottom: { style: 'thin', color: { argb: 'FFD4D4D4' } },
            right: { style: 'thin', color: { argb: 'FFD4D4D4' } }
          }
        })
      }
    })

    // Salvar arquivo
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `relatorio-financeiro-${selectedMonth}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // ===== ACTIONS =====
  const addTransaction = () => {
    if (!newTransaction.description || !newTransaction.amount || !newTransaction.categoryId) return

    const transaction: Transaction = {
      id: Date.now().toString(),
      description: newTransaction.description,
      amount: newTransaction.amount,
      categoryId: newTransaction.categoryId,
      subcategory: newTransaction.subcategory,
      type: newTransaction.type || "expense",
      date: newTransaction.date || new Date().toISOString().slice(0, 10),
      paid: newTransaction.paid || false,
      recurring: newTransaction.recurring || "none",
      installments: newTransaction.installments,
      accountId: newTransaction.accountId,
      tags: newTransaction.tags || []
    }

    setData(prev => ({
      ...prev,
      transactions: [...prev.transactions, transaction]
    }))

    setNewTransaction({
      description: "",
      amount: 0,
      categoryId: "",
      type: "expense",
      date: new Date().toISOString().slice(0, 10),
      paid: false,
      recurring: "none",
      accountId: data.accounts[0]?.id || "1"
    })
    setShowAddTransaction(false)
  }

  const deleteTransaction = (id: string) => {
    setData(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id)
    }))
  }

  const togglePaid = (id: string) => {
    setData(prev => ({
      ...prev,
      transactions: prev.transactions.map(t =>
        t.id === id ? { ...t, paid: !t.paid } : t
      )
    }))
  }

  const addGoal = () => {
    if (!newGoal.name || !newGoal.targetAmount) return

    const goal: FinancialGoal = {
      id: Date.now().toString(),
      name: newGoal.name,
      targetAmount: newGoal.targetAmount,
      currentAmount: newGoal.currentAmount || 0,
      deadline: newGoal.deadline || "",
      priority: newGoal.priority || "medium",
      category: newGoal.category || "savings"
    }

    setData(prev => ({
      ...prev,
      goals: [...prev.goals, goal]
    }))

    setNewGoal({
      name: "",
      targetAmount: 0,
      currentAmount: 0,
      deadline: "",
      priority: "medium",
      category: "savings"
    })
    setShowAddGoal(false)
  }

  const deleteGoal = (id: string) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.filter(g => g.id !== id)
    }))
  }

  const updateGoalProgress = (id: string, amount: number) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.map(g =>
        g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g
      )
    }))
  }

  const addCreditCard = () => {
    if (!newCard.name || !newCard.limit) return

    const card: CreditCard = {
      id: Date.now().toString(),
      name: newCard.name,
      limit: newCard.limit,
      closingDay: newCard.closingDay || 10,
      dueDay: newCard.dueDay || 17,
      currentBill: newCard.currentBill || 0,
      color: newCard.color || "blue"
    }

    setData(prev => ({
      ...prev,
      creditCards: [...prev.creditCards, card]
    }))

    setNewCard({
      name: "",
      limit: 0,
      closingDay: 10,
      dueDay: 17,
      currentBill: 0,
      color: "blue"
    })
    setShowAddCard(false)
  }

  const deleteCreditCard = (id: string) => {
    setData(prev => ({
      ...prev,
      creditCards: prev.creditCards.filter(c => c.id !== id)
    }))
  }

  // Calculator: Compound Interest
  const calculateCompoundInterest = () => {
    const { principal, monthlyContribution, rate, years } = compoundInterest
    const monthlyRate = rate / 100
    const months = years * 12

    let total = principal
    const projections = []

    for (let i = 1; i <= months; i++) {
      total = (total + monthlyContribution) * (1 + monthlyRate)
      if (i % 12 === 0) {
        projections.push({
          year: i / 12,
          amount: total
        })
      }
    }

    const totalInvested = principal + (monthlyContribution * months)
    const totalInterest = total - totalInvested

    return {
      finalAmount: total,
      totalInvested,
      totalInterest,
      projections
    }
  }

  const compoundResult = calculateCompoundInterest()

  const getColorClass = (color: string, type: "bg" | "text" | "border" = "bg") => {
    const colors: Record<string, Record<string, string>> = {
      blue: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400", border: "border-blue-200 dark:border-blue-800" },
      emerald: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-800" },
      green: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-600 dark:text-green-400", border: "border-green-200 dark:border-green-800" },
      orange: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-600 dark:text-orange-400", border: "border-orange-200 dark:border-orange-800" },
      purple: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-600 dark:text-purple-400", border: "border-purple-200 dark:border-purple-800" },
      red: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-600 dark:text-red-400", border: "border-red-200 dark:border-red-800" },
      indigo: { bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-600 dark:text-indigo-400", border: "border-indigo-200 dark:border-indigo-800" },
      pink: { bg: "bg-pink-100 dark:bg-pink-900/30", text: "text-pink-600 dark:text-pink-400", border: "border-pink-200 dark:border-pink-800" },
      violet: { bg: "bg-violet-100 dark:bg-violet-900/30", text: "text-violet-600 dark:text-violet-400", border: "border-violet-200 dark:border-violet-800" },
      gray: { bg: "bg-gray-100 dark:bg-gray-900/30", text: "text-gray-600 dark:text-gray-400", border: "border-gray-200 dark:border-gray-800" }
    }
    return colors[color]?.[type] || colors.gray[type]
  }

  const getCategoryIcon = (iconName: string) => {
    const Icon = ICON_MAP[iconName] || Package
    return Icon
  }

  return (
    <div className="flex h-full flex-col bg-neutral-50 dark:bg-neutral-950">
      {/* Header - Mobile Optimized */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            {/* Left: Title */}
            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-xl font-semibold text-neutral-900 dark:text-white truncate">
                Orçamento Pessoal
              </h1>
              <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 hidden sm:block">
                Gestão financeira completa
              </p>
            </div>

            {/* Right: Actions */}
            <div className="flex gap-1.5 sm:gap-2 items-center flex-shrink-0">
              {/* Month Selector - Hidden on mobile, shown on tablet+ */}
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="hidden sm:block px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded border border-neutral-200 dark:border-neutral-700"
              >
                {Array.from({ length: 12 }, (_, i) => {
                  const date = new Date()
                  date.setMonth(date.getMonth() - i)
                  const value = date.toISOString().slice(0, 7)
                  const label = date.toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
                  return (
                    <option key={value} value={value}>
                      {label.charAt(0).toUpperCase() + label.slice(1)}
                    </option>
                  )
                })}
              </select>

              {/* Add Button */}
              <button
                onClick={() => setShowAddTransaction(true)}
                className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-neutral-900 dark:bg-neutral-700 text-white rounded hover:bg-neutral-800 dark:hover:bg-neutral-600 flex items-center gap-1 sm:gap-1.5 whitespace-nowrap"
              >
                <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">Nova</span>
              </button>
            </div>
          </div>

          {/* Month Selector Mobile - Shown only on mobile */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="sm:hidden mt-2 w-full px-2 py-1.5 text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded border border-neutral-200 dark:border-neutral-700"
          >
            {Array.from({ length: 12 }, (_, i) => {
              const date = new Date()
              date.setMonth(date.getMonth() - i)
              const value = date.toISOString().slice(0, 7)
              const label = date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
              return (
                <option key={value} value={value}>
                  {label.charAt(0).toUpperCase() + label.slice(1)}
                </option>
              )
            })}
          </select>
        </div>
      </div>

      {/* Tabs - Horizontal scroll on mobile */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="flex px-2 sm:px-4 overflow-x-auto scrollbar-hide">
          {[
            { id: "dashboard", label: "Dashboard", icon: PieChart, shortLabel: "Início" },
            { id: "transactions", label: "Transações", icon: FileText, shortLabel: "Transações" },
            { id: "goals", label: "Metas", icon: Target, shortLabel: "Metas" },
            { id: "cards", label: "Cartões", icon: CreditCard, shortLabel: "Cartões" },
            { id: "calculators", label: "Calculadoras", icon: Calculator, shortLabel: "Calc" },
            { id: "reports", label: "Relatórios", icon: BarChart3, shortLabel: "Relatórios" }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-2 sm:px-3 py-2 text-[10px] sm:text-xs font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1 sm:gap-1.5 ${
                  activeTab === tab.id
                    ? "border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100"
                    : "border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
                }`}
              >
                <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-2 sm:p-4">
        {/* DASHBOARD TAB */}
        {activeTab === "dashboard" && (
          <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4">
            {/* Summary Cards - Mobile optimized grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-[10px] sm:text-xs text-neutral-600 dark:text-neutral-400">Receitas</span>
                </div>
                <p className="text-sm sm:text-xl font-bold text-neutral-900 dark:text-white">
                  R$ {totalIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                    <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 dark:text-red-400" />
                  </div>
                  <span className="text-[10px] sm:text-xs text-neutral-600 dark:text-neutral-400">Despesas</span>
                </div>
                <p className="text-sm sm:text-xl font-bold text-neutral-900 dark:text-white">
                  R$ {totalExpense.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 ${balance >= 0 ? "bg-blue-100 dark:bg-blue-900/30" : "bg-red-100 dark:bg-red-900/30"} rounded-lg flex items-center justify-center`}>
                    <Wallet className={`w-3 h-3 sm:w-4 sm:h-4 ${balance >= 0 ? "text-blue-600 dark:text-blue-400" : "text-red-600 dark:text-red-400"}`} />
                  </div>
                  <span className="text-[10px] sm:text-xs text-neutral-600 dark:text-neutral-400">Saldo</span>
                </div>
                <p className={`text-sm sm:text-xl font-bold ${balance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  R$ {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <Percent className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-[10px] sm:text-xs text-neutral-600 dark:text-neutral-400">Taxa</span>
                </div>
                <p className="text-sm sm:text-xl font-bold text-neutral-900 dark:text-white">
                  {savingsRate}%
                </p>
              </div>
            </div>

            {/* Charts and Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              {/* Expenses by Category */}
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 sm:p-4">
                <h3 className="text-xs sm:text-sm font-medium text-neutral-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
                  <PieChart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Despesas por Categoria
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  {expensesByCategory.map((cat) => {
                    const Icon = getCategoryIcon(cat.icon)
                    const widthPercentage = totalExpense > 0 ? (cat.total / totalExpense) * 100 : 0

                    return (
                      <div key={cat.id} className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] sm:text-xs">
                          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                            <Icon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0 ${getColorClass(cat.color, "text")}`} />
                            <span className="text-neutral-700 dark:text-neutral-300 truncate">{cat.name}</span>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                            <span className="font-medium text-neutral-900 dark:text-white">
                              R$ {cat.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </span>
                            {cat.budget && (
                              <span className={`text-[9px] sm:text-[10px] ${cat.percentage > 100 ? "text-red-600 dark:text-red-400" : "text-neutral-500 dark:text-neutral-400"}`}>
                                {cat.percentage.toFixed(0)}%
                              </span>
                            )}
                          </div>
                        </div>
                        {cat.budget && (
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <div className="flex-1 bg-neutral-200 dark:bg-neutral-800 rounded-full h-1 sm:h-1.5">
                              <div
                                className={`h-1 sm:h-1.5 rounded-full transition-all ${
                                  cat.percentage > 100
                                    ? "bg-red-600 dark:bg-red-500"
                                    : cat.percentage > 80
                                    ? "bg-yellow-600 dark:bg-yellow-500"
                                    : "bg-green-600 dark:bg-green-500"
                                }`}
                                style={{ width: `${Math.min(widthPercentage, 100)}%` }}
                              />
                            </div>
                            <span className="text-[9px] sm:text-[10px] text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                              R$ {cat.budget.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {expensesByCategory.length === 0 && (
                    <div className="text-center py-6 sm:py-8 text-neutral-500 dark:text-neutral-400 text-[10px] sm:text-xs">
                      Nenhuma despesa registrada
                    </div>
                  )}
                </div>
              </div>

              {/* Income by Category */}
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 sm:p-4">
                <h3 className="text-xs sm:text-sm font-medium text-neutral-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
                  <ArrowUpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Receitas por Categoria
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  {incomeByCategory.map((cat) => {
                    const Icon = getCategoryIcon(cat.icon)
                    const widthPercentage = totalIncome > 0 ? (cat.total / totalIncome) * 100 : 0

                    return (
                      <div key={cat.id} className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] sm:text-xs">
                          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                            <Icon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0 ${getColorClass(cat.color, "text")}`} />
                            <span className="text-neutral-700 dark:text-neutral-300 truncate">{cat.name}</span>
                          </div>
                          <span className="font-medium text-neutral-900 dark:text-white flex-shrink-0">
                            R$ {cat.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <div className="flex-1 bg-neutral-200 dark:bg-neutral-800 rounded-full h-1 sm:h-1.5">
                            <div
                              className={`h-1 sm:h-1.5 rounded-full transition-all ${getColorClass(cat.color, "bg").replace("100", "600").replace("900/30", "500")}`}
                              style={{ width: `${widthPercentage}%` }}
                            />
                          </div>
                          <span className="text-[9px] sm:text-[10px] text-neutral-500 dark:text-neutral-400">
                            {widthPercentage.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    )
                  })}
                  {incomeByCategory.length === 0 && (
                    <div className="text-center py-6 sm:py-8 text-neutral-500 dark:text-neutral-400 text-[10px] sm:text-xs">
                      Nenhuma receita registrada
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Goals Progress */}
            {data.goals.length > 0 && (
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 sm:p-4">
                <h3 className="text-xs sm:text-sm font-medium text-neutral-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
                  <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Progresso das Metas
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                  {data.goals.slice(0, 6).map((goal) => {
                    const progress = (goal.currentAmount / goal.targetAmount) * 100
                    const daysRemaining = goal.deadline
                      ? Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                      : null

                    return (
                      <div key={goal.id} className="p-2.5 sm:p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[10px] sm:text-xs font-medium text-neutral-900 dark:text-white mb-1 truncate">
                              {goal.name}
                            </h4>
                            <p className="text-[9px] sm:text-[10px] text-neutral-500 dark:text-neutral-400">
                              R$ {goal.currentAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} / R$ {goal.targetAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          <span className={`text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded flex-shrink-0 ml-1 ${
                            goal.priority === "high" ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" :
                            goal.priority === "medium" ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400" :
                            "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                          }`}>
                            {goal.priority === "high" ? "Alta" : goal.priority === "medium" ? "Média" : "Baixa"}
                          </span>
                        </div>
                        <div className="mb-2">
                          <div className="bg-neutral-200 dark:bg-neutral-700 rounded-full h-1.5 sm:h-2 mb-1">
                            <div
                              className="bg-green-600 dark:bg-green-500 h-1.5 sm:h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[9px] sm:text-[10px] text-neutral-500 dark:text-neutral-400">
                            <span>{progress.toFixed(0)}%</span>
                            {daysRemaining !== null && (
                              <span>{daysRemaining > 0 ? `${daysRemaining}d` : "Vencido"}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Credit Cards Summary */}
            {data.creditCards.length > 0 && (
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 sm:p-4">
                <h3 className="text-xs sm:text-sm font-medium text-neutral-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Resumo Cartões
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                  {data.creditCards.map((card) => {
                    const usage = (card.currentBill / card.limit) * 100

                    return (
                      <div key={card.id} className={`p-2.5 sm:p-3 rounded-lg border ${getColorClass(card.color, "border")}`}>
                        <h4 className="text-[10px] sm:text-xs font-medium text-neutral-900 dark:text-white mb-1.5 sm:mb-2 truncate">
                          {card.name}
                        </h4>
                        <p className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white mb-1">
                          R$ {card.currentBill.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                        <div className="bg-neutral-200 dark:bg-neutral-700 rounded-full h-1 sm:h-1.5 mb-1">
                          <div
                            className={`h-1 sm:h-1.5 rounded-full ${
                              usage > 80
                                ? "bg-red-600 dark:bg-red-500"
                                : usage > 50
                                ? "bg-yellow-600 dark:bg-yellow-500"
                                : "bg-green-600 dark:bg-green-500"
                            }`}
                            style={{ width: `${Math.min(usage, 100)}%` }}
                          />
                        </div>
                        <p className="text-[9px] sm:text-[10px] text-neutral-500 dark:text-neutral-400">
                          {usage.toFixed(0)}% de R$ {card.limit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-[9px] sm:text-[10px] text-neutral-500 dark:text-neutral-400 mt-1">
                          Vence: dia {card.dueDay}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Alerts */}
            {expensesByCategory.some(c => c.percentage > 90) && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 sm:p-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[10px] sm:text-xs font-medium text-yellow-900 dark:text-yellow-200 mb-1">
                      Atenção: Orçamento Próximo do Limite
                    </h4>
                    <ul className="text-[10px] sm:text-xs text-yellow-800 dark:text-yellow-300 space-y-0.5">
                      {expensesByCategory.filter(c => c.percentage > 90).map(cat => (
                        <li key={cat.id}>
                          • {cat.name}: {cat.percentage.toFixed(0)}%
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TRANSACTIONS TAB */}
        {activeTab === "transactions" && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
                <h2 className="text-sm sm:text-base font-medium text-neutral-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Transações
                </h2>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 w-full sm:w-auto">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="flex-1 sm:flex-none px-2 py-1 sm:py-1.5 text-[10px] sm:text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded border border-neutral-200 dark:border-neutral-700"
                  >
                    <option value="all">Todos</option>
                    <option value="income">Receitas</option>
                    <option value="expense">Despesas</option>
                  </select>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="flex-1 sm:flex-none px-2 py-1 sm:py-1.5 text-[10px] sm:text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded border border-neutral-200 dark:border-neutral-700"
                  >
                    <option value="all">Categorias</option>
                    {data.categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => setShowAddTransaction(true)}
                    className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs bg-neutral-900 dark:bg-neutral-700 text-white rounded hover:bg-neutral-800 dark:hover:bg-neutral-600 flex items-center gap-1 whitespace-nowrap"
                  >
                    <Plus className="w-3 h-3" />
                    Adicionar
                  </button>
                </div>
              </div>

              {/* Add Transaction Form */}
              {showAddTransaction && (
                <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div>
                      <label className="block text-[9px] sm:text-[10px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Descrição
                      </label>
                      <input
                        type="text"
                        value={newTransaction.description}
                        onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                        placeholder="Ex: Salário, Aluguel..."
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] sm:text-[10px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Valor
                      </label>
                      <input
                        type="number"
                        value={newTransaction.amount || ""}
                        onChange={(e) => setNewTransaction({ ...newTransaction, amount: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] sm:text-[10px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Tipo
                      </label>
                      <select
                        value={newTransaction.type}
                        onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value as "income" | "expense" })}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                      >
                        <option value="expense">Despesa</option>
                        <option value="income">Receita</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] sm:text-[10px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Categoria
                      </label>
                      <select
                        value={newTransaction.categoryId}
                        onChange={(e) => setNewTransaction({ ...newTransaction, categoryId: e.target.value })}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                      >
                        <option value="">Selecione...</option>
                        {data.categories
                          .filter(c => c.type === newTransaction.type)
                          .map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] sm:text-[10px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Data
                      </label>
                      <input
                        type="date"
                        value={newTransaction.date}
                        onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] sm:text-[10px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Recorrência
                      </label>
                      <select
                        value={newTransaction.recurring}
                        onChange={(e) => setNewTransaction({ ...newTransaction, recurring: e.target.value as any })}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                      >
                        <option value="none">Única</option>
                        <option value="monthly">Mensal</option>
                        <option value="weekly">Semanal</option>
                        <option value="yearly">Anual</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center mb-2 sm:mb-3">
                    <input
                      type="checkbox"
                      id="paid"
                      checked={newTransaction.paid}
                      onChange={(e) => setNewTransaction({ ...newTransaction, paid: e.target.checked })}
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded"
                    />
                    <label htmlFor="paid" className="text-[10px] sm:text-xs text-neutral-700 dark:text-neutral-300">
                      Marcar como paga
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={addTransaction}
                      className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-neutral-900 dark:bg-neutral-700 text-white rounded hover:bg-neutral-800 dark:hover:bg-neutral-600 flex items-center justify-center gap-1 sm:gap-1.5"
                    >
                      <Save className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      Salvar
                    </button>
                    <button
                      onClick={() => setShowAddTransaction(false)}
                      className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700"
                    >
                      <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Transactions List */}
              <div className="space-y-1.5 sm:space-y-2 max-h-[500px] sm:max-h-[600px] overflow-y-auto">
                {filteredTransactions.length === 0 && (
                  <div className="text-center py-12 sm:py-16">
                    <FileText className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-neutral-300 dark:text-neutral-700 mb-2 sm:mb-3" />
                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                      Nenhuma transação encontrada
                    </p>
                  </div>
                )}
                {filteredTransactions.map((transaction) => {
                  const category = data.categories.find(c => c.id === transaction.categoryId)
                  const Icon = category ? getCategoryIcon(category.icon) : Package

                  return (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-2 sm:p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-750 transition-colors gap-2"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={transaction.paid}
                          onChange={() => togglePaid(transaction.id)}
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded flex-shrink-0"
                        />
                        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${category ? getColorClass(category.color, "bg") : "bg-gray-100 dark:bg-gray-900/30"}`}>
                          <Icon className={`w-3 h-3 sm:w-4 sm:h-4 ${category ? getColorClass(category.color, "text") : "text-gray-600 dark:text-gray-400"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <p className={`text-xs sm:text-sm font-medium text-neutral-900 dark:text-white truncate ${transaction.paid ? "line-through opacity-60" : ""}`}>
                              {transaction.description}
                            </p>
                            {transaction.recurring !== "none" && (
                              <Repeat className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-neutral-400 flex-shrink-0" />
                            )}
                            {transaction.installments && (
                              <span className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded whitespace-nowrap">
                                {transaction.installments.current}/{transaction.installments.total}x
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400">
                            <span className="truncate">{category?.name || "Sem categoria"}</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="hidden sm:inline whitespace-nowrap">{new Date(transaction.date).toLocaleDateString("pt-BR")}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        <span className={`text-xs sm:text-sm font-semibold whitespace-nowrap ${
                          transaction.type === "income"
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}>
                          {transaction.type === "income" ? "+" : "-"} R$ {transaction.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                        <button
                          onClick={() => deleteTransaction(transaction.id)}
                          className="p-1 sm:p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                        >
                          <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* GOALS TAB */}
        {activeTab === "goals" && (
          <div className="max-w-5xl mx-auto">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 sm:p-4">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-sm sm:text-base font-medium text-neutral-900 dark:text-white flex items-center gap-2">
                  <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Metas Financeiras
                </h2>
                <button
                  onClick={() => setShowAddGoal(true)}
                  className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs bg-neutral-900 dark:bg-neutral-700 text-white rounded hover:bg-neutral-800 dark:hover:bg-neutral-600 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Nova
                </button>
              </div>

              {/* Add Goal Form */}
              {showAddGoal && (
                <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div>
                      <label className="block text-[9px] sm:text-[10px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Nome da Meta
                      </label>
                      <input
                        type="text"
                        value={newGoal.name}
                        onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                        placeholder="Ex: Fundo de Emergência"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] sm:text-[10px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Valor Alvo
                      </label>
                      <input
                        type="number"
                        value={newGoal.targetAmount || ""}
                        onChange={(e) => setNewGoal({ ...newGoal, targetAmount: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] sm:text-[10px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Valor Atual
                      </label>
                      <input
                        type="number"
                        value={newGoal.currentAmount || ""}
                        onChange={(e) => setNewGoal({ ...newGoal, currentAmount: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] sm:text-[10px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Prazo
                      </label>
                      <input
                        type="date"
                        value={newGoal.deadline}
                        onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] sm:text-[10px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Prioridade
                      </label>
                      <select
                        value={newGoal.priority}
                        onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value as any })}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                      >
                        <option value="low">Baixa</option>
                        <option value="medium">Média</option>
                        <option value="high">Alta</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={addGoal}
                      className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-neutral-900 dark:bg-neutral-700 text-white rounded hover:bg-neutral-800 dark:hover:bg-neutral-600 flex items-center justify-center gap-1 sm:gap-1.5"
                    >
                      <Save className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      Salvar
                    </button>
                    <button
                      onClick={() => setShowAddGoal(false)}
                      className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700"
                    >
                      <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Goals List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {data.goals.length === 0 && (
                  <div className="col-span-full text-center py-12 sm:py-16">
                    <Target className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-neutral-300 dark:text-neutral-700 mb-2 sm:mb-3" />
                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                      Nenhuma meta financeira criada
                    </p>
                  </div>
                )}
                {data.goals.map((goal) => {
                  const progress = (goal.currentAmount / goal.targetAmount) * 100
                  const remaining = goal.targetAmount - goal.currentAmount
                  const daysRemaining = goal.deadline
                    ? Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                    : null

                  return (
                    <div key={goal.id} className="p-3 sm:p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                      <div className="flex items-start justify-between mb-2 sm:mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs sm:text-sm font-medium text-neutral-900 dark:text-white mb-1 truncate">
                            {goal.name}
                          </h3>
                          <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400">
                            R$ {goal.currentAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} / R$ {goal.targetAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                          <span className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded ${
                            goal.priority === "high" ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" :
                            goal.priority === "medium" ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400" :
                            "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                          }`}>
                            {goal.priority === "high" ? "Alta" : goal.priority === "medium" ? "Média" : "Baixa"}
                          </span>
                          <button
                            onClick={() => deleteGoal(goal.id)}
                            className="p-0.5 sm:p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                          >
                            <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-600 dark:text-red-400" />
                          </button>
                        </div>
                      </div>

                      <div className="mb-2 sm:mb-3">
                        <div className="bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 sm:h-3 mb-1.5 sm:mb-2">
                          <div
                            className={`h-2 sm:h-3 rounded-full transition-all ${
                              progress >= 100 ? "bg-green-600 dark:bg-green-500" :
                              progress >= 75 ? "bg-blue-600 dark:bg-blue-500" :
                              progress >= 50 ? "bg-yellow-600 dark:bg-yellow-500" :
                              "bg-orange-600 dark:bg-orange-500"
                            }`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] sm:text-xs">
                          <span className="text-neutral-600 dark:text-neutral-400">
                            {progress.toFixed(1)}% concluído
                          </span>
                          <span className="font-medium text-neutral-900 dark:text-white">
                            Faltam R$ {remaining.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      {daysRemaining !== null && (
                        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400 mb-2 sm:mb-3">
                          <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          <span>
                            {daysRemaining > 0
                              ? `${daysRemaining} dias restantes`
                              : daysRemaining === 0
                              ? "Vence hoje"
                              : `Venceu há ${Math.abs(daysRemaining)} dias`}
                          </span>
                        </div>
                      )}

                      <div className="flex gap-1.5 sm:gap-2">
                        <input
                          type="number"
                          placeholder="Adicionar valor"
                          className="flex-1 px-2 py-1 sm:py-1.5 text-[10px] sm:text-xs border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const input = e.target as HTMLInputElement
                              const value = parseFloat(input.value)
                              if (value > 0) {
                                updateGoalProgress(goal.id, value)
                                input.value = ""
                              }
                            }
                          }}
                        />
                        <button
                          onClick={(e) => {
                            const input = e.currentTarget.previousElementSibling as HTMLInputElement
                            const value = parseFloat(input.value)
                            if (value > 0) {
                              updateGoalProgress(goal.id, value)
                              input.value = ""
                            }
                          }}
                          className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* CARDS TAB */}
        {activeTab === "cards" && (
          <div className="max-w-5xl mx-auto">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 sm:p-4">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-sm sm:text-base font-medium text-neutral-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Cartões de Crédito
                </h2>
                <button
                  onClick={() => setShowAddCard(true)}
                  className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs bg-neutral-900 dark:bg-neutral-700 text-white rounded hover:bg-neutral-800 dark:hover:bg-neutral-600 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Novo
                </button>
              </div>

              {/* Add Card Form */}
              {showAddCard && (
                <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div>
                      <label className="block text-[9px] sm:text-[10px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Nome do Cartão
                      </label>
                      <input
                        type="text"
                        value={newCard.name}
                        onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                        placeholder="Ex: Nubank Platinum"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] sm:text-[10px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Limite
                      </label>
                      <input
                        type="number"
                        value={newCard.limit || ""}
                        onChange={(e) => setNewCard({ ...newCard, limit: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] sm:text-[10px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Dia de Fechamento
                      </label>
                      <input
                        type="number"
                        value={newCard.closingDay}
                        onChange={(e) => setNewCard({ ...newCard, closingDay: parseInt(e.target.value) || 1 })}
                        min="1"
                        max="31"
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] sm:text-[10px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Dia de Vencimento
                      </label>
                      <input
                        type="number"
                        value={newCard.dueDay}
                        onChange={(e) => setNewCard({ ...newCard, dueDay: parseInt(e.target.value) || 1 })}
                        min="1"
                        max="31"
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] sm:text-[10px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Fatura Atual
                      </label>
                      <input
                        type="number"
                        value={newCard.currentBill || ""}
                        onChange={(e) => setNewCard({ ...newCard, currentBill: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] sm:text-[10px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Cor
                      </label>
                      <select
                        value={newCard.color}
                        onChange={(e) => setNewCard({ ...newCard, color: e.target.value })}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                      >
                        <option value="blue">Azul</option>
                        <option value="purple">Roxo</option>
                        <option value="green">Verde</option>
                        <option value="red">Vermelho</option>
                        <option value="orange">Laranja</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={addCreditCard}
                      className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-neutral-900 dark:bg-neutral-700 text-white rounded hover:bg-neutral-800 dark:hover:bg-neutral-600 flex items-center justify-center gap-1 sm:gap-1.5"
                    >
                      <Save className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      Salvar
                    </button>
                    <button
                      onClick={() => setShowAddCard(false)}
                      className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700"
                    >
                      <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Cards List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {data.creditCards.length === 0 && (
                  <div className="col-span-full text-center py-12 sm:py-16">
                    <CreditCard className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-neutral-300 dark:text-neutral-700 mb-2 sm:mb-3" />
                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                      Nenhum cartão cadastrado
                    </p>
                  </div>
                )}
                {data.creditCards.map((card) => {
                  const usage = (card.currentBill / card.limit) * 100
                  const available = card.limit - card.currentBill

                  return (
                    <div
                      key={card.id}
                      className={`relative p-4 sm:p-6 rounded-xl border-2 ${getColorClass(card.color, "border")} bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-800`}
                    >
                      <button
                        onClick={() => deleteCreditCard(card.id)}
                        className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1 sm:p-1.5 hover:bg-white/50 dark:hover:bg-black/20 rounded transition-colors"
                      >
                        <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-neutral-600 dark:text-neutral-400" />
                      </button>

                      <div className="mb-3 sm:mb-4">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 ${getColorClass(card.color, "bg")} rounded-lg flex items-center justify-center mb-1.5 sm:mb-2`}>
                          <CreditCard className={`w-4 h-4 sm:w-5 sm:h-5 ${getColorClass(card.color, "text")}`} />
                        </div>
                        <h3 className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-white truncate">
                          {card.name}
                        </h3>
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <div>
                          <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400 mb-1">Fatura Atual</p>
                          <p className="text-lg sm:text-2xl font-bold text-neutral-900 dark:text-white">
                            R$ {card.currentBill.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </p>
                        </div>

                        <div>
                          <div className="flex justify-between text-[10px] sm:text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                            <span>Limite utilizado</span>
                            <span>{usage.toFixed(0)}%</span>
                          </div>
                          <div className="bg-neutral-200 dark:bg-neutral-700 rounded-full h-1.5 sm:h-2">
                            <div
                              className={`h-1.5 sm:h-2 rounded-full transition-all ${
                                usage > 80
                                  ? "bg-red-600 dark:bg-red-500"
                                  : usage > 50
                                  ? "bg-yellow-600 dark:bg-yellow-500"
                                  : "bg-green-600 dark:bg-green-500"
                              }`}
                              style={{ width: `${Math.min(usage, 100)}%` }}
                            />
                          </div>
                        </div>

                        <div className="pt-2 sm:pt-3 border-t border-neutral-200 dark:border-neutral-700">
                          <div className="flex justify-between text-[10px] sm:text-xs">
                            <div>
                              <p className="text-neutral-500 dark:text-neutral-400 mb-1">Disponível</p>
                              <p className="font-semibold text-neutral-900 dark:text-white">
                                R$ {available.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-neutral-500 dark:text-neutral-400 mb-1">Vencimento</p>
                              <p className="font-semibold text-neutral-900 dark:text-white">
                                Dia {card.dueDay}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* CALCULATORS TAB */}
        {activeTab === "calculators" && (
          <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
            {/* Compound Interest Calculator */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 sm:p-4">
              <h2 className="text-sm sm:text-base font-medium text-neutral-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
                <Calculator className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Calculadora de Juros Compostos
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div>
                  <label className="block text-[10px] sm:text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1 sm:mb-1.5">
                    Investimento Inicial (R$)
                  </label>
                  <input
                    type="number"
                    value={compoundInterest.principal}
                    onChange={(e) => setCompoundInterest({ ...compoundInterest, principal: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                    step="100"
                  />
                </div>
                <div>
                  <label className="block text-[10px] sm:text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1 sm:mb-1.5">
                    Aporte Mensal (R$)
                  </label>
                  <input
                    type="number"
                    value={compoundInterest.monthlyContribution}
                    onChange={(e) => setCompoundInterest({ ...compoundInterest, monthlyContribution: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                    step="50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] sm:text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1 sm:mb-1.5">
                    Taxa de Juros Mensal (%)
                  </label>
                  <input
                    type="number"
                    value={compoundInterest.rate}
                    onChange={(e) => setCompoundInterest({ ...compoundInterest, rate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-[10px] sm:text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1 sm:mb-1.5">
                    Período (anos)
                  </label>
                  <input
                    type="number"
                    value={compoundInterest.years}
                    onChange={(e) => setCompoundInterest({ ...compoundInterest, years: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                    min="1"
                    max="50"
                  />
                </div>
              </div>

              {/* Results */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 p-3 sm:p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <div>
                  <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400 mb-1">Total Investido</p>
                  <p className="text-sm sm:text-lg font-bold text-neutral-900 dark:text-white">
                    R$ {compoundResult.totalInvested.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400 mb-1">Juros Ganhos</p>
                  <p className="text-sm sm:text-lg font-bold text-green-600 dark:text-green-400">
                    R$ {compoundResult.totalInterest.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400 mb-1">Montante Final</p>
                  <p className="text-sm sm:text-lg font-bold text-blue-600 dark:text-blue-400">
                    R$ {compoundResult.finalAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {/* Projections */}
              <div className="mt-3 sm:mt-4">
                <h3 className="text-[10px] sm:text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2 sm:mb-3">
                  Projeção Anual
                </h3>
                <div className="space-y-1.5 sm:space-y-2">
                  {compoundResult.projections.map((proj) => (
                    <div key={proj.year} className="flex items-center gap-2 sm:gap-3">
                      <span className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400 w-12 sm:w-16">
                        Ano {proj.year}
                      </span>
                      <div className="flex-1 bg-neutral-200 dark:bg-neutral-700 rounded-full h-1.5 sm:h-2">
                        <div
                          className="bg-blue-600 dark:bg-blue-500 h-1.5 sm:h-2 rounded-full transition-all"
                          style={{
                            width: `${(proj.amount / compoundResult.finalAmount) * 100}%`
                          }}
                        />
                      </div>
                      <span className="text-[10px] sm:text-xs font-medium text-neutral-900 dark:text-white w-24 sm:w-32 text-right">
                        R$ {proj.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Calculators Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-[10px] sm:text-xs font-medium text-blue-900 dark:text-blue-200 mb-1">
                    Dica de Investimento
                  </h4>
                  <p className="text-[10px] sm:text-xs text-blue-800 dark:text-blue-300">
                    Investimentos com aportes regulares e juros compostos podem gerar patrimônio significativo.
                    Consulte um especialista financeiro.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REPORTS TAB */}
        {activeTab === "reports" && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 sm:p-4">
              <h2 className="text-sm sm:text-base font-medium text-neutral-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
                <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Relatórios e Análises
              </h2>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
                <div className="p-3 sm:p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400 mb-1">Total de Transações</p>
                  <p className="text-lg sm:text-2xl font-bold text-neutral-900 dark:text-white">
                    {currentMonthTransactions.length}
                  </p>
                </div>
                <div className="p-3 sm:p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400 mb-1">Ticket Médio</p>
                  <p className="text-lg sm:text-2xl font-bold text-neutral-900 dark:text-white">
                    R$ {currentMonthTransactions.filter(t => t.type === "expense").length > 0
                      ? (totalExpense / currentMonthTransactions.filter(t => t.type === "expense").length).toLocaleString("pt-BR", { minimumFractionDigits: 2 })
                      : "0.00"}
                  </p>
                </div>
                <div className="p-3 sm:p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400 mb-1">Contas Pagas</p>
                  <p className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">
                    {currentMonthTransactions.filter(t => t.paid).length}
                  </p>
                </div>
                <div className="p-3 sm:p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400 mb-1">Pendentes</p>
                  <p className="text-lg sm:text-2xl font-bold text-red-600 dark:text-red-400">
                    {currentMonthTransactions.filter(t => !t.paid).length}
                  </p>
                </div>
              </div>

              {/* Category Analysis */}
              <div className="mb-4 sm:mb-6">
                <h3 className="text-xs sm:text-sm font-medium text-neutral-900 dark:text-white mb-2 sm:mb-3">
                  Análise por Categoria
                </h3>
                <div className="overflow-x-auto -mx-3 sm:mx-0">
                  <div className="inline-block min-w-full px-3 sm:px-0">
                    <table className="w-full text-[10px] sm:text-xs">
                      <thead>
                        <tr className="border-b border-neutral-200 dark:border-neutral-800">
                          <th className="text-left py-1.5 sm:py-2 px-2 sm:px-3 font-medium text-neutral-700 dark:text-neutral-300">Categoria</th>
                          <th className="text-right py-1.5 sm:py-2 px-2 sm:px-3 font-medium text-neutral-700 dark:text-neutral-300">Orçado</th>
                          <th className="text-right py-1.5 sm:py-2 px-2 sm:px-3 font-medium text-neutral-700 dark:text-neutral-300">Gasto</th>
                          <th className="text-right py-1.5 sm:py-2 px-2 sm:px-3 font-medium text-neutral-700 dark:text-neutral-300 hidden sm:table-cell">Diferença</th>
                          <th className="text-right py-1.5 sm:py-2 px-2 sm:px-3 font-medium text-neutral-700 dark:text-neutral-300">% Usado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {expensesByCategory.map((cat) => (
                          <tr key={cat.id} className="border-b border-neutral-100 dark:border-neutral-800/50">
                            <td className="py-1.5 sm:py-2 px-2 sm:px-3">
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                {(() => {
                                  const Icon = getCategoryIcon(cat.icon)
                                  return <Icon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0 ${getColorClass(cat.color, "text")}`} />
                                })()}
                                <span className="text-neutral-900 dark:text-white truncate">{cat.name}</span>
                              </div>
                            </td>
                            <td className="text-right py-1.5 sm:py-2 px-2 sm:px-3 text-neutral-600 dark:text-neutral-400">
                              R$ {cat.budget?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) || "—"}
                            </td>
                            <td className="text-right py-1.5 sm:py-2 px-2 sm:px-3 text-neutral-900 dark:text-white font-medium">
                              R$ {cat.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </td>
                            <td className={`text-right py-1.5 sm:py-2 px-2 sm:px-3 font-medium hidden sm:table-cell ${
                              cat.remaining >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                            }`}>
                              {cat.budget ? `R$ ${Math.abs(cat.remaining).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"}
                            </td>
                            <td className={`text-right py-1.5 sm:py-2 px-2 sm:px-3 font-medium ${
                              cat.percentage > 100 ? "text-red-600 dark:text-red-400" :
                              cat.percentage > 80 ? "text-yellow-600 dark:text-yellow-400" :
                              "text-green-600 dark:text-green-400"
                            }`}>
                              {cat.budget ? `${cat.percentage.toFixed(0)}%` : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Export Options - FUNCTIONAL BUTTONS */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={exportToPDF}
                  className="flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm bg-red-600 text-white rounded hover:bg-red-700 flex items-center justify-center gap-1.5 sm:gap-2 transition-colors shadow-sm"
                >
                  <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span className="hidden sm:inline">Exportar PDF Formatado</span>
                  <span className="sm:hidden">PDF</span>
                </button>
                <button
                  onClick={exportToExcel}
                  className="flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center gap-1.5 sm:gap-2 transition-colors shadow-sm"
                >
                  <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span className="hidden sm:inline">Exportar Excel XLSX</span>
                  <span className="sm:hidden">Excel</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
