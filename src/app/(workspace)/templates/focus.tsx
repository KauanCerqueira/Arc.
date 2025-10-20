"use client";

import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Plus, Check, X, Settings, TrendingUp, Clock, Target, Zap } from 'lucide-react';

type TimerMode = 'work' | 'shortBreak' | 'longBreak';
type TimerStatus = 'idle' | 'running' | 'paused';

type Task = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
};

type Session = {
  id: string;
  type: TimerMode;
  completedAt: Date;
};

type Settings = {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
};

const DEFAULT_SETTINGS: Settings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsUntilLongBreak: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
};

export default function FocusTemplate() {
  // Timer State
  const [mode, setMode] = useState<TimerMode>('work');
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.workDuration * 60);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);

  // Tasks State (GTD)
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');

  // Stats State
  const [sessions, setSessions] = useState<Session[]>([]);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  // Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (status === 'running' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && status === 'running') {
      handleTimerComplete();
    }

    return () => clearInterval(interval);
  }, [status, timeLeft]);

  const handleTimerComplete = () => {
    // Registrar sessão
    const newSession: Session = {
      id: `session_${Date.now()}`,
      type: mode,
      completedAt: new Date(),
    };
    setSessions((prev) => [...prev, newSession]);

    if (mode === 'work') {
      setCompletedPomodoros((prev) => prev + 1);
    }

    // Notificação
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Pomodoro Concluído!', {
        body: mode === 'work' ? 'Hora de fazer uma pausa!' : 'Hora de focar!',
        icon: '⏰',
      });
    }

    // Auto-start próxima sessão
    const shouldAutoStart = mode === 'work' ? settings.autoStartBreaks : settings.autoStartPomodoros;
    
    if (shouldAutoStart) {
      switchMode(getNextMode());
      setStatus('running');
    } else {
      switchMode(getNextMode());
      setStatus('idle');
    }
  };

  const getNextMode = (): TimerMode => {
    if (mode === 'work') {
      const workSessionsCompleted = sessions.filter(s => s.type === 'work').length + 1;
      return workSessionsCompleted % settings.sessionsUntilLongBreak === 0 ? 'longBreak' : 'shortBreak';
    }
    return 'work';
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    const duration = {
      work: settings.workDuration,
      shortBreak: settings.shortBreakDuration,
      longBreak: settings.longBreakDuration,
    }[newMode];
    setTimeLeft(duration * 60);
  };

  const toggleTimer = () => {
    if (status === 'idle' || status === 'paused') {
      setStatus('running');
      // Pedir permissão para notificações
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    } else {
      setStatus('paused');
    }
  };

  const resetTimer = () => {
    setStatus('idle');
    const duration = {
      work: settings.workDuration,
      shortBreak: settings.shortBreakDuration,
      longBreak: settings.longBreakDuration,
    }[mode];
    setTimeLeft(duration * 60);
  };

  // Tasks Logic (GTD)
  const addTask = () => {
    if (!newTaskText.trim()) return;

    const newTask: Task = {
      id: `task_${Date.now()}`,
      text: newTaskText,
      completed: false,
      createdAt: new Date(),
    };

    setTasks((prev) => [...prev, newTask]);
    setNewTaskText('');
  };

  const toggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  // Formatação do tempo
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Stats de hoje
  const todaySessions = sessions.filter((s) => {
    const today = new Date();
    const sessionDate = new Date(s.completedAt);
    return sessionDate.toDateString() === today.toDateString();
  });

  const todayPomodoros = todaySessions.filter((s) => s.type === 'work').length;
  const todayMinutes = todayPomodoros * settings.workDuration;

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      
      if (e.code === 'Space') {
        e.preventDefault();
        toggleTimer();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        resetTimer();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [status]);

  const getModeLabel = (m: TimerMode): string => {
    return {
      work: 'Foco',
      shortBreak: 'Pausa Curta',
      longBreak: 'Pausa Longa',
    }[m];
  };

  const getModeColor = (m: TimerMode): string => {
    return {
      work: 'from-red-500 to-orange-500',
      shortBreak: 'from-green-500 to-emerald-500',
      longBreak: 'from-blue-500 to-cyan-500',
    }[m];
  };

  const progressPercentage = (() => {
    const totalDuration = {
      work: settings.workDuration,
      shortBreak: settings.shortBreakDuration,
      longBreak: settings.longBreakDuration,
    }[mode] * 60;
    return ((totalDuration - timeLeft) / totalDuration) * 100;
  })();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timer Principal */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
            {/* Mode Selector */}
            <div className="flex items-center justify-center gap-3 mb-8">
              {(['work', 'shortBreak', 'longBreak'] as TimerMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    if (status === 'idle') {
                      switchMode(m);
                    }
                  }}
                  disabled={status !== 'idle'}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    mode === m
                      ? 'bg-gray-900 dark:bg-slate-700 text-white'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700'
                  } ${status !== 'idle' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {getModeLabel(m)}
                </button>
              ))}
            </div>

            {/* Timer Display */}
            <div className="relative mb-8">
              <div className="w-full aspect-square max-w-md mx-auto relative">
                {/* Progress Ring */}
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-gray-100 dark:text-slate-800"
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 45} ${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - progressPercentage / 100)}`}
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" className={`text-${mode === 'work' ? 'red' : mode === 'shortBreak' ? 'green' : 'blue'}-500`} stopColor="currentColor" />
                      <stop offset="100%" className={`text-${mode === 'work' ? 'orange' : mode === 'shortBreak' ? 'emerald' : 'cyan'}-500`} stopColor="currentColor" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Time */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-7xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="text-lg text-gray-500 dark:text-gray-400">
                    {getModeLabel(mode)}
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <button
                onClick={toggleTimer}
                className={`w-16 h-16 rounded-full bg-gradient-to-br ${getModeColor(mode)} text-white shadow-lg hover:shadow-xl transition flex items-center justify-center`}
              >
                {status === 'running' ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-1" />
                )}
              </button>

              <button
                onClick={resetTimer}
                className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition flex items-center justify-center"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                onClick={() => setShowSettings(!showSettings)}
                className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition flex items-center justify-center"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              <span className="inline-flex items-center gap-2">
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-slate-800 rounded">Space</kbd>
                <span>Iniciar/Pausar</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-slate-800 rounded ml-4">R</kbd>
                <span>Resetar</span>
              </span>
            </div>

            {/* Settings Panel */}
            {showSettings && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Configurações</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Foco (min)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={settings.workDuration}
                      onChange={(e) => setSettings({ ...settings, workDuration: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Pausa Curta (min)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={settings.shortBreakDuration}
                      onChange={(e) => setSettings({ ...settings, shortBreakDuration: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Pausa Longa (min)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={settings.longBreakDuration}
                      onChange={(e) => setSettings({ ...settings, longBreakDuration: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Pomodoros até pausa longa
                    </label>
                    <input
                      type="number"
                      min="2"
                      max="10"
                      value={settings.sessionsUntilLongBreak}
                      onChange={(e) => setSettings({ ...settings, sessionsUntilLongBreak: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.autoStartBreaks}
                      onChange={(e) => setSettings({ ...settings, autoStartBreaks: e.target.checked })}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Iniciar pausas automaticamente
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.autoStartPomodoros}
                      onChange={(e) => setSettings({ ...settings, autoStartPomodoros: e.target.checked })}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Iniciar pomodoros automaticamente
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Hoje</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {todayPomodoros}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Pomodoros</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {todayMinutes}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Minutos</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {sessions.length}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Total Sessões</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Tasks (GTD) */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Tarefas Rápidas
            </h3>

            {/* Add Task */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
                placeholder="Adicionar tarefa..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
              />
              <button
                onClick={addTask}
                className="w-10 h-10 bg-gray-900 dark:bg-slate-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-slate-600 transition flex items-center justify-center"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Task List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {tasks.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
                  Nenhuma tarefa ainda
                </div>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-slate-800 rounded-lg group"
                  >
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                        task.completed
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-300 dark:border-slate-600'
                      }`}
                    >
                      {task.completed && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <span
                      className={`flex-1 text-sm ${
                        task.completed
                          ? 'line-through text-gray-400 dark:text-gray-500'
                          : 'text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      {task.text}
                    </span>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}