"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/core/store/authStore"
import masterService, { type UserDto } from "@/core/services/master.service"
import {
  Users,
  Shield,
  Search,
  Filter,
  UserCheck,
  UserX,
  Crown,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react"

export default function ManageUsersPage() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [users, setUsers] = useState<UserDto[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all")
  const [filterMaster, setFilterMaster] = useState<"all" | "master" | "regular">("all")

  useEffect(() => {
    if (!isAuthenticated || !user?.isMaster) {
      router.push("/workspace")
      return
    }

    fetchUsers()
  }, [isAuthenticated, user, router])

  useEffect(() => {
    filterUsers()
  }, [users, searchQuery, filterStatus, filterMaster])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await masterService.getAllUsers()
      setUsers(data)
      setFilteredUsers(data)
    } catch (err: any) {
      setError(err.message || "Erro ao carregar usuários")
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = [...users]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (u) =>
          u.nome.toLowerCase().includes(query) ||
          u.sobrenome.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query) ||
          u.profissao?.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (filterStatus === "active") {
      filtered = filtered.filter((u) => u.ativo)
    } else if (filterStatus === "inactive") {
      filtered = filtered.filter((u) => !u.ativo)
    }

    // Master filter
    if (filterMaster === "master") {
      filtered = filtered.filter((u) => u.isMaster)
    } else if (filterMaster === "regular") {
      filtered = filtered.filter((u) => !u.isMaster)
    }

    setFilteredUsers(filtered)
  }

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    if (userId === user?.userId) {
      alert("Você não pode desativar sua própria conta!")
      return
    }

    const action = currentStatus ? "desativar" : "ativar"
    if (!confirm(`Tem certeza que deseja ${action} este usuário?`)) return

    try {
      await masterService.toggleUserStatus(userId, !currentStatus)
      await fetchUsers()
    } catch (err: any) {
      alert(`Erro ao ${action} usuário: ${err.message}`)
    }
  }

  const handleToggleMaster = async (userId: string, currentMaster: boolean) => {
    if (userId === user?.userId) {
      alert("Você não pode alterar seus próprios privilégios!")
      return
    }

    const action = currentMaster ? "remover privilégios master de" : "promover a master"
    if (!confirm(`Tem certeza que deseja ${action} este usuário?`)) return

    try {
      await masterService.toggleUserMaster(userId, !currentMaster)
      await fetchUsers()
    } catch (err: any) {
      alert(`Erro ao alterar privilégios: ${err.message}`)
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (userId === user?.userId) {
      alert("Você não pode deletar sua própria conta!")
      return
    }

    if (!confirm(`⚠️ ATENÇÃO: Tem certeza que deseja DELETAR PERMANENTEMENTE o usuário "${userName}"?\n\nEsta ação NÃO pode ser desfeita!`)) {
      return
    }

    if (!confirm(`Digite "DELETAR" para confirmar a exclusão permanente de ${userName}`)) {
      return
    }

    try {
      await masterService.deleteUser(userId)
      await fetchUsers()
    } catch (err: any) {
      alert(`Erro ao deletar usuário: ${err.message}`)
    }
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

  const activeUsers = users.filter((u) => u.ativo).length
  const inactiveUsers = users.filter((u) => !u.ativo).length
  const masterUsers = users.filter((u) => u.isMaster).length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
          <Users className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gerenciar Usuários</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {filteredUsers.length} de {users.length} usuários
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{users.length}</p>
            </div>
            <Users className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ativos</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{activeUsers}</p>
            </div>
            <UserCheck className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Inativos</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{inactiveUsers}</p>
            </div>
            <UserX className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Masters</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{masterUsers}</p>
            </div>
            <Crown className="w-8 h-8 text-amber-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome, email ou profissão..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os status</option>
            <option value="active">Apenas ativos</option>
            <option value="inactive">Apenas inativos</option>
          </select>

          {/* Master Filter */}
          <select
            value={filterMaster}
            onChange={(e) => setFilterMaster(e.target.value as any)}
            className="px-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os níveis</option>
            <option value="master">Apenas masters</option>
            <option value="regular">Apenas usuários</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Profissão
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Nível
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {filteredUsers.map((u) => (
                <tr key={u.userId} className="hover:bg-gray-50 dark:hover:bg-slate-900/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {u.icone ? (
                        <img src={u.icone} alt={u.nome} className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                          {u.nome[0]}
                          {u.sobrenome[0]}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {u.nome} {u.sobrenome}
                          {u.userId === user?.userId && (
                            <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">(você)</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Desde {new Date(u.criadoEm).toLocaleDateString("pt-BR")}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{u.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {u.profissao || <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {u.ativo ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                        <CheckCircle className="w-3 h-3" />
                        Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-medium">
                        <XCircle className="w-3 h-3" />
                        Inativo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {u.isMaster ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-medium">
                        <Crown className="w-3 h-3" />
                        Master
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
                        <Users className="w-3 h-3" />
                        Usuário
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleStatus(u.userId, u.ativo)}
                        disabled={u.userId === user?.userId}
                        className={`p-2 rounded-lg transition-colors ${
                          u.userId === user?.userId
                            ? "opacity-50 cursor-not-allowed"
                            : u.ativo
                              ? "hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                              : "hover:bg-green-100 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400"
                        }`}
                        title={u.ativo ? "Desativar" : "Ativar"}
                      >
                        {u.ativo ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => handleToggleMaster(u.userId, u.isMaster)}
                        disabled={u.userId === user?.userId}
                        className={`p-2 rounded-lg transition-colors ${
                          u.userId === user?.userId
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-amber-100 dark:hover:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                        }`}
                        title={u.isMaster ? "Remover master" : "Promover a master"}
                      >
                        <Shield className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteUser(u.userId, `${u.nome} ${u.sobrenome}`)}
                        disabled={u.userId === user?.userId}
                        className={`p-2 rounded-lg transition-colors ${
                          u.userId === user?.userId
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                        }`}
                        title="Deletar permanentemente"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">Nenhum usuário encontrado</p>
          </div>
        )}
      </div>
    </div>
  )
}
