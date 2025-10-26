'use client'

import { useState } from 'react'
import { Plus, Trash2, Calendar, CheckCircle2, Circle, Clock } from 'lucide-react'

type RoadmapItem = {
  id: string
  title: string
  description: string
  status: 'planned' | 'in-progress' | 'completed'
  quarter: string
  priority: 'low' | 'medium' | 'high'
}

export default function RoadmapTemplate() {
  const [items, setItems] = useState<RoadmapItem[]>([
    {
      id: '1',
      title: 'Lançamento da versão 1.0',
      description: 'Primeira versão estável do produto',
      status: 'completed',
      quarter: 'Q1 2025',
      priority: 'high',
    },
    {
      id: '2',
      title: 'Implementar autenticação social',
      description: 'Login com Google, GitHub e Microsoft',
      status: 'in-progress',
      quarter: 'Q2 2025',
      priority: 'high',
    },
    {
      id: '3',
      title: 'Dashboard de analytics',
      description: 'Painel com métricas e gráficos',
      status: 'planned',
      quarter: 'Q2 2025',
      priority: 'medium',
    },
  ])

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'planned' as RoadmapItem['status'],
    quarter: '',
    priority: 'medium' as RoadmapItem['priority'],
  })

  const quarters = ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026', 'Q2 2026']

  const handleSubmit = () => {
    if (!formData.title.trim()) return

    if (editingId) {
      setItems(items.map(item =>
        item.id === editingId
          ? { ...item, ...formData }
          : item
      ))
    } else {
      const newItem: RoadmapItem = {
        id: Date.now().toString(),
        ...formData,
      }
      setItems([...items, newItem])
    }

    setShowModal(false)
    setEditingId(null)
    setFormData({
      title: '',
      description: '',
      status: 'planned',
      quarter: '',
      priority: 'medium',
    })
  }

  const handleEdit = (item: RoadmapItem) => {
    setEditingId(item.id)
    setFormData({
      title: item.title,
      description: item.description,
      status: item.status,
      quarter: item.quarter,
      priority: item.priority,
    })
    setShowModal(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Excluir este item do roadmap?')) {
      setItems(items.filter(item => item.id !== id))
    }
  }

  const getStatusIcon = (status: RoadmapItem['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case 'in-progress':
        return <Clock className="w-5 h-5 text-blue-600" />
      case 'planned':
        return <Circle className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: RoadmapItem['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800'
      case 'in-progress':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800'
      case 'planned':
        return 'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-slate-700'
    }
  }

  const getPriorityColor = (priority: RoadmapItem['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
      case 'low':
        return 'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-300'
    }
  }

  const groupedItems = quarters.reduce((acc, quarter) => {
    acc[quarter] = items.filter(item => item.quarter === quarter)
    return acc
  }, {} as Record<string, RoadmapItem[]>)

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="flex-none border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Roadmap do Projeto</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Planeje e acompanhe o desenvolvimento
            </p>
          </div>
          <button
            onClick={() => {
              setEditingId(null)
              setFormData({
                title: '',
                description: '',
                status: 'planned',
                quarter: quarters[0],
                priority: 'medium',
              })
              setShowModal(true)
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium"
          >
            <Plus className="w-4 h-4" />
            Novo Item
          </button>
        </div>
      </div>

      {/* Roadmap Timeline */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {quarters.map(quarter => {
            const quarterItems = groupedItems[quarter] || []
            if (quarterItems.length === 0) return null

            return (
              <div key={quarter} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{quarter}</h2>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-slate-800"></div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {quarterItems.map(item => (
                    <div
                      key={item.id}
                      className={`rounded-xl border-2 p-4 hover:shadow-lg transition-all cursor-pointer group ${getStatusColor(item.status)}`}
                      onClick={() => handleEdit(item)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        {getStatusIcon(item.status)}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(item.id)
                          }}
                          className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>

                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {item.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(item.priority)}`}>
                          {item.priority === 'high' ? 'Alta' : item.priority === 'medium' ? 'Média' : 'Baixa'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {item.status === 'completed' ? 'Completo' : item.status === 'in-progress' ? 'Em andamento' : 'Planejado'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          {items.length === 0 && (
            <div className="text-center py-16">
              <Calendar className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Nenhum item no roadmap
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Comece adicionando os próximos marcos do seu projeto
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Adicionar Primeiro Item
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-200 dark:border-slate-800">
            <div className="p-6 border-b border-gray-200 dark:border-slate-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {editingId ? 'Editar Item' : 'Novo Item do Roadmap'}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Título
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Lançamento da versão 2.0"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva o que será feito..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Trimestre
                  </label>
                  <select
                    value={formData.quarter}
                    onChange={(e) => setFormData({ ...formData, quarter: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                  >
                    {quarters.map(q => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prioridade
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="planned">Planejado</option>
                  <option value="in-progress">Em andamento</option>
                  <option value="completed">Completo</option>
                </select>
              </div>
            </div>

            <div className="p-6 pt-4 border-t border-gray-200 dark:border-slate-800 flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingId(null)
                }}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formData.title.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingId ? 'Salvar' : 'Adicionar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
