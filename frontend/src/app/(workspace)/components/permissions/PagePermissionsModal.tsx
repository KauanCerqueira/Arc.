'use client';

import { useState, useEffect } from 'react';
import { X, Shield, UserPlus, Trash2, Check } from 'lucide-react';
import teamService from '@/core/services/team.service';
import { useWorkspaceStore } from '@/core/store/workspaceStore';
import type { PagePermission, WorkspaceTeam, SetPagePermissionDto } from '@/core/types/team.types';

interface PagePermissionsModalProps {
  pageId: string;
  pageTitle: string;
  onClose: () => void;
}

export default function PagePermissionsModal({ pageId, pageTitle, onClose }: PagePermissionsModalProps) {
  const { workspace } = useWorkspaceStore();
  const [permissions, setPermissions] = useState<PagePermission[]>([]);
  const [team, setTeam] = useState<WorkspaceTeam | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [newPermission, setNewPermission] = useState({
    canView: true,
    canEdit: false,
    canComment: true,
    canDelete: false,
    canShare: false,
  });

  useEffect(() => {
    loadData();
  }, [pageId, workspace?.id]);

  const loadData = async () => {
    if (!workspace?.id) return;

    try {
      setLoading(true);
      const [perms, teamData] = await Promise.all([
        teamService.getPagePermissions(workspace.id, pageId),
        teamService.getTeam(workspace.id),
      ]);
      setPermissions(perms);
      setTeam(teamData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPermission = async () => {
    if (!workspace?.id || !selectedUserId) return;

    try {
      const dto: SetPagePermissionDto = {
        pageId,
        userId: selectedUserId,
        ...newPermission,
      };

      await teamService.setPagePermission(workspace.id, dto);
      setShowAddModal(false);
      setSelectedUserId('');
      setNewPermission({
        canView: true,
        canEdit: false,
        canComment: true,
        canDelete: false,
        canShare: false,
      });
      loadData();
    } catch (error) {
      console.error('Erro ao adicionar permissão:', error);
    }
  };

  const handleUpdatePermission = async (permission: PagePermission, field: keyof typeof newPermission) => {
    if (!workspace?.id) return;

    try {
      const dto: SetPagePermissionDto = {
        pageId,
        userId: permission.userId,
        canView: field === 'canView' ? !permission.canView : permission.canView,
        canEdit: field === 'canEdit' ? !permission.canEdit : permission.canEdit,
        canComment: field === 'canComment' ? !permission.canComment : permission.canComment,
        canDelete: field === 'canDelete' ? !permission.canDelete : permission.canDelete,
        canShare: field === 'canShare' ? !permission.canShare : permission.canShare,
      };

      await teamService.setPagePermission(workspace.id, dto);
      loadData();
    } catch (error) {
      console.error('Erro ao atualizar permissão:', error);
    }
  };

  const handleRemovePermission = async (permissionId: string) => {
    if (!workspace?.id) return;
    if (!confirm('Remover permissão deste usuário?')) return;

    try {
      await teamService.removePagePermission(workspace.id, permissionId);
      loadData();
    } catch (error) {
      console.error('Erro ao remover permissão:', error);
    }
  };

  const availableMembers = team?.members.filter(
    member => !permissions.some(p => p.userId === member.userId)
  ) || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Permissões da Página
            </h3>
            <p className="text-sm text-gray-500 mt-1">{pageTitle}</p>
          </div>
          <div className="flex items-center gap-2">
            {availableMembers.length > 0 && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Adicionar
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : permissions.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Nenhuma permissão específica configurada</p>
              <p className="text-sm text-gray-400 mt-1">
                Todos os membros do time têm acesso baseado em suas funções
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {permissions.map((permission) => (
                <div
                  key={permission.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {permission.userName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{permission.userName}</p>
                        <p className="text-sm text-gray-500">{permission.userEmail}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemovePermission(permission.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {[
                      { key: 'canView', label: 'Visualizar', value: permission.canView },
                      { key: 'canEdit', label: 'Editar', value: permission.canEdit },
                      { key: 'canComment', label: 'Comentar', value: permission.canComment },
                      { key: 'canDelete', label: 'Deletar', value: permission.canDelete },
                      { key: 'canShare', label: 'Compartilhar', value: permission.canShare },
                    ].map(({ key, label, value }) => (
                      <button
                        key={key}
                        onClick={() => handleUpdatePermission(permission, key as keyof typeof newPermission)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          value
                            ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          value ? 'bg-blue-600 border-blue-600' : 'border-gray-400'
                        }`}>
                          {value && <Check className="w-3 h-3 text-white" />}
                        </div>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Permission Modal */}
        {showAddModal && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center" onClick={() => setShowAddModal(false)}>
            <div
              className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900">Adicionar Permissão</h4>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Membro
                  </label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione um membro</option>
                    {availableMembers.map((member) => (
                      <option key={member.id} value={member.userId}>
                        {member.userName} ({member.userEmail})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-6 space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permissões
                  </label>
                  {[
                    { key: 'canView', label: 'Visualizar' },
                    { key: 'canEdit', label: 'Editar' },
                    { key: 'canComment', label: 'Comentar' },
                    { key: 'canDelete', label: 'Deletar' },
                    { key: 'canShare', label: 'Compartilhar' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newPermission[key as keyof typeof newPermission]}
                        onChange={(e) => setNewPermission({
                          ...newPermission,
                          [key]: e.target.checked,
                        })}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddPermission}
                    disabled={!selectedUserId}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
