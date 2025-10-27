"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/core/store/authStore"
import promoService, { type PromoCodeDto, type CreatePromoCodeDto } from "@/core/services/promo.service"
import {
  Ticket,
  Plus,
  Search,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  CheckCircle,
  XCircle,
  TrendingUp,
  Calendar,
  Percent,
  Users,
} from "lucide-react"

export default function PromoCodesPage() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [promoCodes, setPromoCodes] = useState<PromoCodeDto[]>([])
  const [filteredCodes, setFilteredCodes] = useState<PromoCodeDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Form states
  const [formData, setFormData] = useState<CreatePromoCodeDto>({
    code: "",
    description: "",
    discountPercentage: 10,
    maxUses: 100,
  })

  useEffect(() => {
    if (!isAuthenticated || !user?.isMaster) {
      router.push("/workspace")
      return
    }

    fetchPromoCodes()
  }, [isAuthenticated, user, router])

  useEffect(() => {
    filterCodes()
  }, [promoCodes, searchQuery])

  const fetchPromoCodes = async () => {
    try {
      setLoading(true)
      const data = await promoService.getAllPromoCodes()
      setPromoCodes(data)
      setFilteredCodes(data)
    } catch (err: any) {
      setError(err.message || "Erro ao carregar códigos promocionais")
    } finally {
      setLoading(false)
    }
  }

  const filterCodes = () => {
    if (!searchQuery) {
      setFilteredCodes(promoCodes)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = promoCodes.filter(
      (code) =>
        code.code.toLowerCase().includes(query) ||
        code.description.toLowerCase().includes(query)
    )
    setFilteredCodes(filtered)
  }

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.code || !formData.description) {
      alert("Preencha todos os campos obrigatórios!")
      return
    }

    try {
      await promoService.createPromoCode(formData)
      await fetchPromoCodes()
      setShowCreateModal(false)
      setFormData({
        code: "",
        description: "",
        discountPercentage: 10,
        maxUses: 100,
      })
    } catch (err: any) {
      alert(`Erro ao criar código: ${err.message}`)
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const action = currentStatus ? "desativar" : "ativar"
    if (!confirm(`Tem certeza que deseja ${action} este código?`)) return

    try {
      await promoService.togglePromoCode(id, !currentStatus)
      await fetchPromoCodes()
    } catch (err: any) {
      alert(`Erro ao ${action} código: ${err.message}`)
    }
  }

  const handleDeleteCode = async (id: string, code: string) => {
    if (!confirm(`Tem certeza que deseja deletar o código "${code}"?`)) return

    try {
      await promoService.deletePromoCode(id)
      await fetchPromoCodes()
    } catch (err: any) {
      alert(`Erro ao deletar código: ${err.message}`)
    }
  }

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const generateRandomCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    let code = ""
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData({ ...formData, code })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-600 dark:text-red-400">{error}</div>
      </div>
    )
  }

  const activeCodes = promoCodes.filter((c) => c.isActive).length
  const inactiveCodes = promoCodes.filter((c) => !c.isActive).length
  const totalUses = promoCodes.reduce((sum, c) => sum + c.currentUses, 0)
  const availableUses = promoCodes.reduce((sum, c) => sum + (c.maxUses - c.currentUses), 0)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
            <Ticket className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Códigos Promocionais</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">{filteredCodes.length} códigos</p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Código</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{promoCodes.length}</p>
            </div>
            <Ticket className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ativos</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{activeCodes}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total de Usos</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalUses}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Usos Disponíveis</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{availableUses}</p>
            </div>
            <Users className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por código ou descrição..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
      </div>

      {/* Promo Codes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCodes.map((code) => {
          const usagePercentage = (code.currentUses / code.maxUses) * 100
          const isExpired = code.expiresAt && new Date(code.expiresAt) < new Date()

          return (
            <div
              key={code.id}
              className={`bg-white dark:bg-slate-800 rounded-xl p-6 border-2 ${
                isExpired
                  ? "border-red-200 dark:border-red-900/30"
                  : code.isActive
                    ? "border-green-200 dark:border-green-900/30"
                    : "border-gray-200 dark:border-slate-700"
              } relative overflow-hidden`}
            >
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                {isExpired ? (
                  <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-medium">
                    Expirado
                  </span>
                ) : code.isActive ? (
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                    Ativo
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
                    Inativo
                  </span>
                )}
              </div>

              {/* Code */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={() => handleCopyCode(code.code, code.id)}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg font-mono font-bold text-lg hover:from-pink-600 hover:to-rose-600 transition-all"
                  >
                    {copiedId === code.id ? "✓ Copiado!" : code.code}
                  </button>
                  <button
                    onClick={() => handleCopyCode(code.code, code.id)}
                    className="p-3 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    <Copy className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{code.description}</p>
              </div>

              {/* Stats */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <Percent className="w-4 h-4" />
                    Desconto
                  </span>
                  <span className="font-bold text-pink-600 dark:text-pink-400">{code.discountPercentage}%</span>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Usos</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {code.currentUses} / {code.maxUses}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        usagePercentage >= 90
                          ? "bg-red-500"
                          : usagePercentage >= 70
                            ? "bg-yellow-500"
                            : "bg-green-500"
                      }`}
                      style={{ width: `${usagePercentage}%` }}
                    />
                  </div>
                </div>

                {code.expiresAt && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Expira em
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {new Date(code.expiresAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleActive(code.id, code.isActive)}
                  disabled={isExpired}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isExpired
                      ? "opacity-50 cursor-not-allowed"
                      : code.isActive
                        ? "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/30"
                        : "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/30"
                  }`}
                >
                  {code.isActive ? (
                    <>
                      <EyeOff className="w-4 h-4 inline mr-1" />
                      Desativar
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 inline mr-1" />
                      Ativar
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDeleteCode(code.id, code.code)}
                  className="px-3 py-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {filteredCodes.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-gray-200 dark:border-slate-700">
          <Ticket className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">Nenhum código promocional encontrado</p>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-slate-800">
            <div className="p-6 border-b border-gray-200 dark:border-slate-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Criar Código Promocional</h2>
            </div>

            <form onSubmit={handleCreateCode} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Código *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="Ex: DESCONTO20"
                    maxLength={20}
                    className="flex-1 px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={generateRandomCode}
                    className="px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Gerar
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descrição *
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ex: Desconto de lançamento"
                  className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Desconto (%) *
                </label>
                <input
                  type="number"
                  value={formData.discountPercentage}
                  onChange={(e) => setFormData({ ...formData, discountPercentage: Number(e.target.value) })}
                  min="1"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Máximo de Usos *
                </label>
                <input
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: Number(e.target.value) })}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data de Expiração (opcional)
                </label>
                <input
                  type="date"
                  value={formData.expiresAt || ""}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg"
                >
                  Criar Código
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
