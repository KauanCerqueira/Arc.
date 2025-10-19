"use client";

import { useState } from 'react';
import { Camera, Save, User, Mail, Lock, Bell, Globe, Trash2 } from 'lucide-react';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'account' | 'security' | 'notifications' | 'preferences'>('account');
  
  // Account info
  const [name, setName] = useState('Usuário');
  const [email, setEmail] = useState('usuario@email.com');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  
  // Security
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Notifications
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [taskReminders, setTaskReminders] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);
  const [projectUpdates, setProjectUpdates] = useState(true);
  
  // Preferences
  const [language, setLanguage] = useState('pt-BR');
  const [timezone, setTimezone] = useState('America/Sao_Paulo');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = () => {
    // Aqui você faria a chamada para a API
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const tabs = [
    { id: 'account', label: 'Conta', icon: User },
    { id: 'security', label: 'Segurança', icon: Lock },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'preferences', label: 'Preferências', icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meu Perfil</h1>
          <p className="text-gray-600">Gerencie suas informações pessoais e preferências</p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <Save className="w-3 h-3 text-white" />
            </div>
            <span className="text-green-800 font-medium">Alterações salvas com sucesso!</span>
          </div>
        )}

        <div className="flex gap-6">
          {/* Sidebar Tabs */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                      activeTab === tab.id
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              {/* Account Tab */}
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Informações da Conta</h2>
                  </div>

                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2">
                        <Camera className="w-4 h-4" />
                        Alterar foto
                      </button>
                      <p className="text-xs text-gray-500 mt-2">JPG, PNG ou GIF. Máx 2MB.</p>
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome completo
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(00) 00000-0000"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Conte um pouco sobre você..."
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">{bio.length}/500 caracteres</p>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end pt-4 border-t border-gray-200">
                    <button
                      onClick={handleSave}
                      className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Salvar alterações
                    </button>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">Segurança</h2>
                    <p className="text-sm text-gray-600">Gerencie sua senha e segurança da conta</p>
                  </div>

                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Senha atual
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nova senha
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                    <p className="text-xs text-gray-500 mt-1">Mínimo 8 caracteres</p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmar nova senha
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>

                  {/* Two Factor */}
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Autenticação em duas etapas</h3>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">Autenticação 2FA</div>
                        <div className="text-sm text-gray-600">Adicione uma camada extra de segurança</div>
                      </div>
                      <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition">
                        Ativar
                      </button>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end pt-4 border-t border-gray-200">
                    <button
                      onClick={handleSave}
                      className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Salvar alterações
                    </button>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">Notificações</h2>
                    <p className="text-sm text-gray-600">Configure como você quer ser notificado</p>
                  </div>

                  <div className="space-y-4">
                    {/* Email Notifications */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">Notificações por email</div>
                        <div className="text-sm text-gray-600">Receba atualizações importantes por email</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={emailNotifications}
                          onChange={(e) => setEmailNotifications(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                      </label>
                    </div>

                    {/* Task Reminders */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">Lembretes de tarefas</div>
                        <div className="text-sm text-gray-600">Receba lembretes de tarefas pendentes</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={taskReminders}
                          onChange={(e) => setTaskReminders(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                      </label>
                    </div>

                    {/* Weekly Report */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">Relatório semanal</div>
                        <div className="text-sm text-gray-600">Resumo semanal de suas atividades</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={weeklyReport}
                          onChange={(e) => setWeeklyReport(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                      </label>
                    </div>

                    {/* Project Updates */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">Atualizações de projetos</div>
                        <div className="text-sm text-gray-600">Notificações sobre mudanças em projetos</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={projectUpdates}
                          onChange={(e) => setProjectUpdates(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                      </label>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end pt-4 border-t border-gray-200">
                    <button
                      onClick={handleSave}
                      className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Salvar alterações
                    </button>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">Preferências</h2>
                    <p className="text-sm text-gray-600">Personalize sua experiência</p>
                  </div>

                  {/* Language */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Idioma
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    >
                      <option value="pt-BR">Português (Brasil)</option>
                      <option value="en-US">English (US)</option>
                      <option value="es-ES">Español</option>
                    </select>
                  </div>

                  {/* Timezone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fuso horário
                    </label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    >
                      <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                      <option value="America/New_York">Nova York (GMT-5)</option>
                      <option value="Europe/London">Londres (GMT+0)</option>
                      <option value="Asia/Tokyo">Tóquio (GMT+9)</option>
                    </select>
                  </div>

                  {/* Date Format */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Formato de data
                    </label>
                    <select
                      value={dateFormat}
                      onChange={(e) => setDateFormat(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>

                  {/* Danger Zone */}
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Zona de Perigo</h3>
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-medium text-red-900">Excluir conta</div>
                          <div className="text-sm text-red-700">Esta ação não pode ser desfeita</div>
                        </div>
                        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2">
                          <Trash2 className="w-4 h-4" />
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end pt-4 border-t border-gray-200">
                    <button
                      onClick={handleSave}
                      className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Salvar alterações
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}