"use client"

import { useState, useRef } from "react"
import { WorkspaceTemplateComponentProps } from "@/core/types/workspace.types"
import {
  Plus,
  Trash2,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Code,
  Palette,
  Clock,
  Users,
  Server,
  Zap,
  Calculator,
  Edit2,
  X,
  Download,
  Save,
  Copy,
  History,
  Settings,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

type CostItem = {
  id: string
  name: string
  hours: number
  hourlyRate: number
  quantity: number
  category: "development" | "design" | "infrastructure" | "team" | "other"
  notes?: string
}

type Project = {
  name: string
  client: string
  deadline: string
  margin: number
  items: CostItem[]
  clientBudget: number
  notes?: string
  version: number
}

const CATEGORIES = [
  { id: "development", name: "Desenvolvimento", icon: Code },
  { id: "design", name: "Design", icon: Palette },
  { id: "infrastructure", name: "Infraestrutura", icon: Server },
  { id: "team", name: "Equipe", icon: Users },
  { id: "other", name: "Outros", icon: Zap },
]

const DEFAULT_PROJECT: Project = {
  name: "Novo Projeto",
  client: "",
  deadline: "",
  margin: 30,
  items: [],
  clientBudget: 0,
  notes: "",
  version: 1,
}

export default function BudgetPage({ groupId, pageId }: WorkspaceTemplateComponentProps) {
  const [project, setProject] = useState<Project>(DEFAULT_PROJECT)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProject, setEditingProject] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["development", "design"]))
  const [showSettings, setShowSettings] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const [newItem, setNewItem] = useState({
    name: "",
    hours: "",
    hourlyRate: "",
    quantity: "1",
    category: "development" as CostItem["category"],
    notes: "",
  })

  const updateProject = (updater: (current: Project) => Project) => {
    setProject((current) => updater({ ...current }))
  }

  const addItem = () => {
    if (!newItem.name.trim()) return

    updateProject((current) => ({
      ...current,
      items: [
        ...current.items,
        {
          id: Date.now().toString(),
          name: newItem.name,
          hours: Number.parseFloat(newItem.hours) || 0,
          hourlyRate: Number.parseFloat(newItem.hourlyRate) || 0,
          quantity: Number.parseFloat(newItem.quantity) || 1,
          category: newItem.category,
          notes: newItem.notes,
        },
      ],
    }))

    setNewItem({ name: "", hours: "", hourlyRate: "", quantity: "1", category: "development", notes: "" })
    setShowAddForm(false)
  }

  const deleteItem = (id: string) => {
    if (confirm("Excluir este item?")) {
      updateProject((current) => ({
        ...current,
        items: current.items.filter((item) => item.id !== id),
      }))
    }
  }

  const duplicateItem = (item: CostItem) => {
    updateProject((current) => ({
      ...current,
      items: [...current.items, { ...item, id: Date.now().toString(), name: `${item.name} (cópia)` }],
    }))
  }

  const totalCost = project.items.reduce((sum, item) => {
    return sum + item.hours * item.hourlyRate * item.quantity
  }, 0)

  const totalHours = project.items.reduce((sum, item) => sum + item.hours * item.quantity, 0)
  const profitAmount = totalCost * (project.margin / 100)
  const finalPrice = totalCost + profitAmount
  const isViable = project.clientBudget > 0 && project.clientBudget >= finalPrice

  const groupedItems = project.items.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    },
    {} as Record<string, CostItem[]>,
  )

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }

  const exportToPDF = () => {
    if (printRef.current) {
      const content = printRef.current.innerHTML
      const win = window.open("", "_blank")
      if (win) {
        win.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${project.name} - Orçamento</title>
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  background: #ffffff;
                  color: #000000;
                  padding: 40px;
                  line-height: 1.6;
                }
                .header { 
                  border-bottom: 2px solid #000;
                  padding-bottom: 20px;
                  margin-bottom: 30px;
                }
                .header h1 { 
                  font-size: 32px;
                  font-weight: 700;
                  margin-bottom: 8px;
                }
                .header .meta { 
                  color: #666;
                  font-size: 14px;
                }
                .summary { 
                  display: grid;
                  grid-template-columns: repeat(4, 1fr);
                  gap: 20px;
                  margin-bottom: 30px;
                }
                .summary-card { 
                  border: 1px solid #e5e5e5;
                  padding: 16px;
                  border-radius: 8px;
                }
                .summary-card .label { 
                  font-size: 12px;
                  color: #666;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                  margin-bottom: 4px;
                }
                .summary-card .value { 
                  font-size: 24px;
                  font-weight: 700;
                }
                .section { 
                  margin-bottom: 30px;
                }
                .section-title { 
                  font-size: 18px;
                  font-weight: 600;
                  margin-bottom: 16px;
                  padding-bottom: 8px;
                  border-bottom: 1px solid #e5e5e5;
                }
                .item { 
                  display: flex;
                  justify-content: space-between;
                  padding: 12px 0;
                  border-bottom: 1px solid #f5f5f5;
                }
                .item:last-child { border-bottom: none; }
                .item-name { 
                  flex: 1;
                  font-weight: 500;
                }
                .item-details { 
                  color: #666;
                  font-size: 13px;
                  margin-left: 20px;
                }
                .item-total { 
                  font-weight: 600;
                  min-width: 120px;
                  text-align: right;
                }
                .total { 
                  background: #000;
                  color: #fff;
                  padding: 20px;
                  border-radius: 8px;
                  margin-top: 30px;
                }
                .total-row { 
                  display: flex;
                  justify-content: space-between;
                  padding: 8px 0;
                }
                .total-row.final { 
                  font-size: 24px;
                  font-weight: 700;
                  padding-top: 16px;
                  border-top: 1px solid rgba(255,255,255,0.2);
                  margin-top: 8px;
                }
                @media print {
                  body { padding: 20px; }
                  .no-print { display: none; }
                }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>${project.name}</h1>
                <div class="meta">
                  ${project.client ? `Cliente: ${project.client}` : ""}
                  ${project.deadline ? ` • Prazo: ${new Date(project.deadline).toLocaleDateString("pt-BR")}` : ""}
                  • Versão ${project.version}
                </div>
              </div>

              <div class="summary">
                <div class="summary-card">
                  <div class="label">Custo</div>
                  <div class="value">${formatCurrency(totalCost)}</div>
                </div>
                <div class="summary-card">
                  <div class="label">Lucro (${project.margin}%)</div>
                  <div class="value">${formatCurrency(profitAmount)}</div>
                </div>
                <div class="summary-card">
                  <div class="label">Total</div>
                  <div class="value">${formatCurrency(finalPrice)}</div>
                </div>
                <div class="summary-card">
                  <div class="label">Horas</div>
                  <div class="value">${totalHours}h</div>
                </div>
              </div>

              ${CATEGORIES.map((category) => {
                const categoryItems = groupedItems[category.id] || []
                if (categoryItems.length === 0) return ""

                const categoryTotal = categoryItems.reduce(
                  (sum, item) => sum + item.hours * item.hourlyRate * item.quantity,
                  0,
                )

                return `
                  <div class="section">
                    <h2 class="section-title">${category.name}</h2>
                    ${categoryItems
                      .map((item) => {
                        const itemTotal = item.hours * item.hourlyRate * item.quantity
                        return `
                        <div class="item">
                          <div class="item-name">${item.name}</div>
                          <div class="item-details">
                            ${item.hours}h × ${formatCurrency(item.hourlyRate)}/h × ${item.quantity}
                          </div>
                          <div class="item-total">${formatCurrency(itemTotal)}</div>
                        </div>
                      `
                      })
                      .join("")}
                  </div>
                `
              }).join("")}

              <div class="total">
                <div class="total-row">
                  <span>Custo de Produção</span>
                  <span>${formatCurrency(totalCost)}</span>
                </div>
                <div class="total-row">
                  <span>Margem de Lucro (${project.margin}%)</span>
                  <span>${formatCurrency(profitAmount)}</span>
                </div>
                <div class="total-row final">
                  <span>Valor Total</span>
                  <span>${formatCurrency(finalPrice)}</span>
                </div>
              </div>

              ${
                project.notes
                  ? `
                <div class="section">
                  <h2 class="section-title">Observações</h2>
                  <p>${project.notes}</p>
                </div>
              `
                  : ""
              }

              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e5e5; color: #999; font-size: 12px; text-align: center;">
                Gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}
              </div>
            </body>
          </html>
        `)
        win.document.close()
        setTimeout(() => win.print(), 250)
      }
    }
  }

  const exportToJSON = () => {
    const dataStr = JSON.stringify(project, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${project.name.toLowerCase().replace(/\s+/g, "-")}-orcamento.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-800 pb-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              {editingProject ? (
                <input
                  type="text"
                  value={project.name}
                  onChange={(e) => updateProject((current) => ({ ...current, name: e.target.value }))}
                  className="text-4xl font-bold bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 w-full"
                  placeholder="Nome do Projeto"
                />
              ) : (
                <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">{project.name}</h1>
              )}

              {editingProject ? (
                <div className="mt-3 space-y-2">
                  <input
                    type="text"
                    value={project.client}
                    onChange={(e) => updateProject((current) => ({ ...current, client: e.target.value }))}
                    placeholder="Nome do cliente"
                    className="text-sm text-gray-600 dark:text-gray-400 bg-transparent border-b border-gray-300 dark:border-gray-700 outline-none w-full py-1"
                  />
                  <input
                    type="date"
                    value={project.deadline}
                    onChange={(e) => updateProject((current) => ({ ...current, deadline: e.target.value }))}
                    className="text-sm text-gray-600 dark:text-gray-400 bg-transparent border-b border-gray-300 dark:border-gray-700 outline-none py-1"
                  />
                </div>
              ) : (
                <div className="mt-2 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  {project.client && <span>{project.client}</span>}
                  {project.deadline && (
                    <>
                      {project.client && <span>•</span>}
                      <span>{new Date(project.deadline).toLocaleDateString("pt-BR")}</span>
                    </>
                  )}
                  <span>•</span>
                  <span>Versão {project.version}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditingProject(!editingProject)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition"
              >
                {editingProject ? <X className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
              </button>
              <button
                onClick={exportToPDF}
                className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition font-medium"
              >
                <Download className="w-4 h-4" />
                Exportar PDF
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {showSettings && (
            <div className="mt-4 p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-950">
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={exportToJSON}
                  className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition"
                >
                  <Save className="w-4 h-4" />
                  Salvar JSON
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(project))
                    alert("Orçamento copiado!")
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition"
                >
                  <Copy className="w-4 h-4" />
                  Copiar
                </button>
                <button
                  onClick={() => updateProject((current) => ({ ...current, version: current.version + 1 }))}
                  className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition"
                >
                  <History className="w-4 h-4" />
                  Nova Versão
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Custo
              </span>
              <Calculator className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(totalCost)}</div>
          </div>

          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Lucro ({project.margin}%)
              </span>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(profitAmount)}</div>
          </div>

          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-black dark:bg-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-400 dark:text-gray-600 uppercase tracking-wider">
                Total
              </span>
              <DollarSign className="w-4 h-4 text-gray-400 dark:text-gray-600" />
            </div>
            <div className="text-2xl font-bold text-white dark:text-black">{formatCurrency(finalPrice)}</div>
          </div>

          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Horas
              </span>
              <Clock className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalHours}h</div>
          </div>
        </div>

        {/* Margin Control */}
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Margem de Lucro</span>
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{project.margin}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={project.margin}
            onChange={(e) => updateProject((current) => ({ ...current, margin: Number.parseInt(e.target.value) }))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white"
          />
          <div className="flex justify-between mt-2">
            {[10, 20, 30, 40, 50].map((margin) => (
              <button
                key={margin}
                onClick={() => updateProject((current) => ({ ...current, margin }))}
                className={`px-3 py-1 text-xs rounded border transition ${
                  project.margin === margin
                    ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                    : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
                }`}
              >
                {margin}%
              </button>
            ))}
          </div>
        </div>

        {/* Viability Check */}
        {project.clientBudget > 0 && (
          <div
            className={`border rounded-lg p-4 mb-6 ${
              isViable
                ? "border-gray-900 dark:border-gray-100 bg-gray-50 dark:bg-gray-950"
                : "border-gray-300 dark:border-gray-700"
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              {isViable ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <h3 className="font-semibold">{isViable ? "Projeto Viável" : "Orçamento Insuficiente"}</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Orçamento Cliente</span>
                <span className="font-semibold">{formatCurrency(project.clientBudget)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Seu Preço</span>
                <span className="font-semibold">{formatCurrency(finalPrice)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">Diferença</span>
                <span className="font-bold">{formatCurrency(Math.abs(project.clientBudget - finalPrice))}</span>
              </div>
            </div>
          </div>
        )}

        {/* Add Item Button */}
        <div className="mb-4">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-950 transition font-medium"
          >
            <Plus className="w-5 h-5" />
            Adicionar Item
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="mb-6 p-6 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-950">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Novo Item</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-900 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Descrição</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="Ex: Desenvolvimento Frontend React"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black outline-none focus:border-gray-900 dark:focus:border-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Categoria</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value as CostItem["category"] })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black outline-none focus:border-gray-900 dark:focus:border-gray-100"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Horas</label>
                  <input
                    type="number"
                    value={newItem.hours}
                    onChange={(e) => setNewItem({ ...newItem, hours: e.target.value })}
                    placeholder="0"
                    step="0.5"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black outline-none focus:border-gray-900 dark:focus:border-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">R$/Hora</label>
                  <input
                    type="number"
                    value={newItem.hourlyRate}
                    onChange={(e) => setNewItem({ ...newItem, hourlyRate: e.target.value })}
                    placeholder="0.00"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black outline-none focus:border-gray-900 dark:focus:border-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Quantidade</label>
                  <input
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                    placeholder="1"
                    step="1"
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black outline-none focus:border-gray-900 dark:focus:border-gray-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Observações (opcional)</label>
                <textarea
                  value={newItem.notes}
                  onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                  placeholder="Detalhes adicionais..."
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black outline-none focus:border-gray-900 dark:focus:border-gray-100 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={addItem}
                  disabled={!newItem.name.trim()}
                  className="flex-1 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Adicionar
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Items List by Category */}
        <div className="space-y-4">
          {CATEGORIES.map((category) => {
            const categoryItems = groupedItems[category.id] || []
            if (categoryItems.length === 0) return null

            const CategoryIcon = category.icon
            const categoryTotal = categoryItems.reduce(
              (sum, item) => sum + item.hours * item.hourlyRate * item.quantity,
              0,
            )
            const categoryHours = categoryItems.reduce((sum, item) => sum + item.hours * item.quantity, 0)
            const isExpanded = expandedCategories.has(category.id)

            return (
              <div key={category.id} className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-950 transition"
                >
                  <div className="flex items-center gap-3">
                    <CategoryIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{category.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {categoryItems.length} {categoryItems.length === 1 ? "item" : "itens"} • {categoryHours}h
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900 dark:text-gray-100">{formatCurrency(categoryTotal)}</span>
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
                    {categoryItems.map((item) => {
                      const itemTotal = item.hours * item.hourlyRate * item.quantity
                      return (
                        <div
                          key={item.id}
                          className="flex items-start justify-between p-4 border-b border-gray-200 dark:border-gray-800 last:border-b-0 hover:bg-white dark:hover:bg-black transition group"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">{item.name}</h4>
                            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                              <span>{item.hours}h</span>
                              <span>×</span>
                              <span>{formatCurrency(item.hourlyRate)}/h</span>
                              <span>×</span>
                              <span>{item.quantity}</span>
                            </div>
                            {item.notes && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">{item.notes}</p>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-bold text-lg text-gray-900 dark:text-gray-100">
                              {formatCurrency(itemTotal)}
                            </span>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                              <button
                                onClick={() => duplicateItem(item)}
                                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-900 rounded"
                                title="Duplicar"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteItem(item.id)}
                                className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded"
                                title="Excluir"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Project Notes */}
        <div className="mt-6 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <label className="block text-sm font-medium mb-2">Observações do Projeto</label>
          <textarea
            value={project.notes || ""}
            onChange={(e) => updateProject((current) => ({ ...current, notes: e.target.value }))}
            placeholder="Adicione observações, condições de pagamento, prazos específicos..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black outline-none focus:border-gray-900 dark:focus:border-gray-100 resize-none"
          />
        </div>

        {/* Total Summary */}
        <div className="mt-6 bg-black dark:bg-white rounded-lg p-6 text-white dark:text-black">
          <div className="flex items-center justify-between py-2 border-b border-white/20 dark:border-black/20">
            <span className="text-sm">Custo de Produção</span>
            <span className="font-semibold">{formatCurrency(totalCost)}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-white/20 dark:border-black/20">
            <span className="text-sm">Margem de Lucro ({project.margin}%)</span>
            <span className="font-semibold">{formatCurrency(profitAmount)}</span>
          </div>
          <div className="flex items-center justify-between pt-4 mt-2">
            <span className="text-xl font-bold">Valor Total</span>
            <span className="text-3xl font-bold">{formatCurrency(finalPrice)}</span>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20 dark:border-black/20 grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-white/60 dark:text-black/60 mb-1">Total de Horas</div>
              <div className="font-semibold">{totalHours}h</div>
            </div>
            <div>
              <div className="text-white/60 dark:text-black/60 mb-1">Valor Médio/Hora</div>
              <div className="font-semibold">
                {totalHours > 0 ? formatCurrency(finalPrice / totalHours) : "R$ 0,00"}/h
              </div>
            </div>
          </div>
        </div>

        {/* Hidden Print Content */}
        <div ref={printRef} style={{ display: "none" }}>
          {/* Content for PDF export - already handled in exportToPDF function */}
        </div>
      </div>
    </div>
  )
}
