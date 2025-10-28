"use client"

import { useState, useEffect } from "react"
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Check,
  X,
  SettingsIcon,
  TrendingUp,
  Clock,
  Target,
  Zap,
  ListTodo,
} from "lucide-react"
import { usePageTemplateData } from "@/core/hooks/usePageTemplateData"
import { WorkspaceTemplateComponentProps } from "@/core/types/workspace.types"

type TimerMode = "work" | "shortBreak" | "longBreak"
type TimerStatus = "idle" | "running" | "paused"

type Task = {
  id: string
  text: string
  completed: boolean
  createdAt: string
}

type Session = {
  id: string
  type: TimerMode
  completedAt: string
}

type Settings = {
  workDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  sessionsUntilLongBreak: number
  autoStartBreaks: boolean
  autoStartPomodoros: boolean
}

const DEFAULT_SETTINGS: Settings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsUntilLongBreak: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
}

type FocusTemplateData = {
  settings: Settings
  tasks: Task[]
  sessions: Session[]
  completedPomodoros: number
}

const DEFAULT_DATA: FocusTemplateData = {
  settings: DEFAULT_SETTINGS,
  tasks: [],
  sessions: [],
  completedPomodoros: 0,
}

export default function FocusTemplate({ groupId, pageId }: WorkspaceTemplateComponentProps) {
  const { data, setData } = usePageTemplateData<FocusTemplateData>(groupId, pageId, DEFAULT_DATA)
  const settings = data.settings ?? DEFAULT_SETTINGS
  const tasks = data.tasks ?? []
  const sessions = data.sessions ?? []
  const completedPomodoros = data.completedPomodoros ?? 0

  const updateSettings = (updater: Settings | ((current: Settings) => Settings)) => {
    setData((current) => {
      const currentSettings = current.settings ?? DEFAULT_SETTINGS
      const nextSettings =
        typeof updater === "function"
          ? (updater as (current: Settings) => Settings)({ ...currentSettings })
          : updater
      return {
        ...current,
        settings: nextSettings,
      }
    })
  }

  const updateTasks = (updater: Task[] | ((current: Task[]) => Task[])) => {
    setData((current) => {
      const currentTasks = current.tasks ?? []
      const nextTasks =
        typeof updater === "function"
          ? (updater as (current: Task[]) => Task[])(JSON.parse(JSON.stringify(currentTasks)))
          : updater
      return {
        ...current,
        tasks: nextTasks,
      }
    })
  }

  const updateSessions = (updater: Session[] | ((current: Session[]) => Session[])) => {
    setData((current) => {
      const currentSessions = current.sessions ?? []
      const nextSessions =
        typeof updater === "function"
          ? (updater as (current: Session[]) => Session[])(JSON.parse(JSON.stringify(currentSessions)))
          : updater
      return {
        ...current,
        sessions: nextSessions,
      }
    })
  }

  const updateCompletedPomodoros = (updater: number | ((prev: number) => number)) => {
    setData((current) => {
      const currentValue = current.completedPomodoros ?? 0
      const nextValue =
        typeof updater === "function" ? (updater as (prev: number) => number)(currentValue) : updater
      return {
        ...current,
        completedPomodoros: nextValue,
      }
    })
  }

  const [mode, setMode] = useState<TimerMode>("work")
  const [status, setStatus] = useState<TimerStatus>("idle")
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60)
  const [showSettings, setShowSettings] = useState(false)
  const [newTaskText, setNewTaskText] = useState("")

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (status === "running" && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0 && status === "running") {
      handleTimerComplete()
    }

    return () => clearInterval(interval)
  }, [status, timeLeft])

  const handleTimerComplete = () => {
    const newSession: Session = {
      id: `session_${Date.now()}`,
      type: mode,
      completedAt: new Date().toISOString(),
    }
    updateSessions((prev) => [...prev, newSession])

    if (mode === "work") {
      updateCompletedPomodoros((prev) => prev + 1)
    }

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Pomodoro Concluído!", {
        body: mode === "work" ? "Hora de fazer uma pausa!" : "Hora de focar!",
      })
    }

    const shouldAutoStart = mode === "work" ? settings.autoStartBreaks : settings.autoStartPomodoros

    if (shouldAutoStart) {
      switchMode(getNextMode())
      setStatus("running")
    } else {
      switchMode(getNextMode())
      setStatus("idle")
    }
  }

  const getNextMode = (): TimerMode => {
    if (mode === "work") {
      const workSessionsCompleted = sessions.filter((s) => s.type === "work").length + 1
      return workSessionsCompleted % settings.sessionsUntilLongBreak === 0 ? "longBreak" : "shortBreak"
    }
    return "work"
  }

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode)
    const duration = {
      work: settings.workDuration,
      shortBreak: settings.shortBreakDuration,
      longBreak: settings.longBreakDuration,
    }[newMode]
    setTimeLeft(duration * 60)
  }

  const toggleTimer = () => {
    if (status === "idle" || status === "paused") {
      setStatus("running")
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission()
      }
    } else {
      setStatus("paused")
    }
  }

  const resetTimer = () => {
    setStatus("idle")
    const duration = {
      work: settings.workDuration,
      shortBreak: settings.shortBreakDuration,
      longBreak: settings.longBreakDuration,
    }[mode]
    setTimeLeft(duration * 60)
  }

  const addTask = () => {
    if (!newTaskText.trim()) return

    const newTask: Task = {
      id: `task_${Date.now()}`,
      text: newTaskText,
      completed: false,
      createdAt: new Date().toISOString(),
    }

    updateTasks((prev) => [...prev, newTask])
    setNewTaskText("")
  }

  const toggleTask = (taskId: string) => {
    updateTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)))
  }

  const deleteTask = (taskId: string) => {
    updateTasks((prev) => prev.filter((task) => task.id !== taskId))
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const todaySessions = sessions.filter((s) => {
    const today = new Date()
    const sessionDate = new Date(s.completedAt)
    return sessionDate.toDateString() === today.toDateString()
  })

  const todayPomodoros = todaySessions.filter((s) => s.type === "work").length
  const todayMinutes = todayPomodoros * settings.workDuration

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return

      if (e.code === "Space") {
        e.preventDefault()
        toggleTimer()
      } else if (e.code === "KeyR") {
        e.preventDefault()
        resetTimer()
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [status])

  const getModeLabel = (m: TimerMode): string => {
    return {
      work: "Foco",
      shortBreak: "Pausa Curta",
      longBreak: "Pausa Longa",
    }[m]
  }

  const getModeColors = (m: TimerMode) => {
    return {
      work: {
        gradient: "from-rose-500 via-red-500 to-orange-500",
        bg: "bg-rose-50 dark:bg-rose-950/20",
        text: "text-rose-600 dark:text-rose-400",
        border: "border-rose-200 dark:border-rose-800/50",
        ring: "ring-rose-500/20",
      },
      shortBreak: {
        gradient: "from-emerald-500 via-green-500 to-teal-500",
        bg: "bg-emerald-50 dark:bg-emerald-950/20",
        text: "text-emerald-600 dark:text-emerald-400",
        border: "border-emerald-200 dark:border-emerald-800/50",
        ring: "ring-emerald-500/20",
      },
      longBreak: {
        gradient: "from-blue-500 via-indigo-500 to-purple-500",
        bg: "bg-blue-50 dark:bg-blue-950/20",
        text: "text-blue-600 dark:text-blue-400",
        border: "border-blue-200 dark:border-blue-800/50",
        ring: "ring-blue-500/20",
      },
    }[m]
  }

  const progressPercentage = (() => {
    const totalDuration =
      {
        work: settings.workDuration,
        shortBreak: settings.shortBreakDuration,
        longBreak: settings.longBreakDuration,
      }[mode] * 60
    return ((totalDuration - timeLeft) / totalDuration) * 100
  })()

  const colors = getModeColors(mode)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Timer Principal - Ocupa 2 colunas */}
          <div className="xl:col-span-2 space-y-6">
            {/* Timer Card */}
            <div
              className={`${colors.bg} border ${colors.border} rounded-3xl p-6 md:p-10 shadow-xl backdrop-blur-sm transition-all duration-500`}
            >
              {/* Mode Selector */}
              <div className="flex items-center justify-center gap-2 md:gap-3 mb-8 md:mb-10">
                {(["work", "shortBreak", "longBreak"] as TimerMode[]).map((m) => {
                  const mColors = getModeColors(m)
                  return (
                    <button
                      key={m}
                      onClick={() => {
                        if (status === "idle") {
                          switchMode(m)
                        }
                      }}
                      disabled={status !== "idle"}
                      className={`px-4 md:px-6 py-2.5 md:py-3 rounded-xl text-xs md:text-sm font-semibold transition-all duration-300 ${
                        mode === m
                          ? `bg-gradient-to-r ${mColors.gradient} text-white shadow-lg shadow-${m === "work" ? "rose" : m === "shortBreak" ? "emerald" : "blue"}-500/30 scale-105`
                          : `bg-white/80 dark:bg-slate-900/80 ${mColors.text} hover:bg-white dark:hover:bg-slate-800 border ${mColors.border} backdrop-blur-sm`
                      } ${status !== "idle" ? "opacity-50 cursor-not-allowed" : "hover:scale-105 active:scale-95"}`}
                    >
                      {getModeLabel(m)}
                    </button>
                  )
                })}
              </div>

              {/* Timer Display */}
              <div className="relative mb-8 md:mb-10">
                <div className="w-full aspect-square max-w-sm mx-auto relative">
                  {/* Progress Ring */}
                  <svg className="w-full h-full -rotate-90">
                    <circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-gray-200/50 dark:text-slate-800/50"
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
                      className="transition-all duration-300 drop-shadow-lg"
                      style={{ filter: "drop-shadow(0 0 8px currentColor)" }}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" className={colors.text} stopColor="currentColor" />
                        <stop offset="100%" className={colors.text} stopColor="currentColor" stopOpacity="0.6" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Time Display */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div
                      className={`text-5xl md:text-7xl font-bold ${colors.text} mb-2 md:mb-3 tracking-tight tabular-nums`}
                    >
                      {formatTime(timeLeft)}
                    </div>
                    <div className={`text-sm md:text-base font-medium ${colors.text} opacity-70`}>
                      {getModeLabel(mode)}
                    </div>
                    {status === "running" && (
                      <div
                        className={`mt-3 md:mt-4 px-3 md:px-4 py-1 md:py-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border ${colors.border} rounded-full text-xs font-medium ${colors.text} shadow-sm`}
                      >
                        Em andamento
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3 md:gap-4 mb-6 md:mb-8">
                <button
                  onClick={toggleTimer}
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br ${colors.gradient} text-white shadow-2xl hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center group`}
                >
                  {status === "running" ? (
                    <Pause className="w-7 h-7 md:w-8 md:h-8 group-hover:scale-110 transition-transform" />
                  ) : (
                    <Play className="w-7 h-7 md:w-8 md:h-8 ml-0.5 md:ml-1 group-hover:scale-110 transition-transform" />
                  )}
                </button>

                <button
                  onClick={resetTimer}
                  className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-slate-800 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center border border-gray-200 dark:border-slate-800"
                >
                  <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
                </button>

                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`w-12 h-12 md:w-14 md:h-14 rounded-xl backdrop-blur-sm text-gray-600 dark:text-gray-400 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center border shadow-lg hover:shadow-xl ${
                    showSettings
                      ? `${colors.bg} ${colors.border} ${colors.text}`
                      : "bg-white/80 dark:bg-slate-900/80 border-gray-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800"
                  }`}
                >
                  <SettingsIcon
                    className={`w-4 h-4 md:w-5 md:h-5 transition-transform ${showSettings ? "rotate-90" : ""}`}
                  />
                </button>
              </div>

              {/* Keyboard Shortcuts */}
              <div className="text-center">
                <div className="inline-flex items-center gap-3 md:gap-4 px-4 md:px-5 py-2 md:py-2.5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-xl border border-gray-200 dark:border-slate-800 text-xs md:text-sm text-gray-600 dark:text-gray-400 shadow-sm">
                  <span className="flex items-center gap-1.5 md:gap-2">
                    <kbd className="px-2 py-1 bg-white dark:bg-slate-800 rounded-md shadow-sm border border-gray-300 dark:border-slate-700 font-mono text-xs">
                      Space
                    </kbd>
                    <span className="hidden sm:inline">Play/Pause</span>
                    <span className="sm:hidden">Play</span>
                  </span>
                  <span className="text-gray-300 dark:text-slate-700">•</span>
                  <span className="flex items-center gap-1.5 md:gap-2">
                    <kbd className="px-2 py-1 bg-white dark:bg-slate-800 rounded-md shadow-sm border border-gray-300 dark:border-slate-700 font-mono text-xs">
                      R
                    </kbd>
                    <span>Reset</span>
                  </span>
                </div>
              </div>

              {/* Settings Panel */}
              {showSettings && (
                <div className="mt-6 p-5 md:p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-slate-800 shadow-lg">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base md:text-lg">Configurações</h3>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Foco (min)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={settings.workDuration}
                        onChange={(e) =>
                          updateSettings({
                            ...settings,
                            workDuration: Number(e.target.value),
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600 focus:border-transparent transition-shadow"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Pausa Curta (min)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={settings.shortBreakDuration}
                        onChange={(e) =>
                          updateSettings({
                            ...settings,
                            shortBreakDuration: Number(e.target.value),
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600 focus:border-transparent transition-shadow"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Pausa Longa (min)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={settings.longBreakDuration}
                        onChange={(e) =>
                          updateSettings({
                            ...settings,
                            longBreakDuration: Number(e.target.value),
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600 focus:border-transparent transition-shadow"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Ciclos até pausa longa
                      </label>
                      <input
                        type="number"
                        min="2"
                        max="10"
                        value={settings.sessionsUntilLongBreak}
                        onChange={(e) =>
                          updateSettings({
                            ...settings,
                            sessionsUntilLongBreak: Number(e.target.value),
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600 focus:border-transparent transition-shadow"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                      <input
                        type="checkbox"
                        checked={settings.autoStartBreaks}
                        onChange={(e) =>
                          updateSettings({
                            ...settings,
                            autoStartBreaks: e.target.checked,
                          })
                        }
                        className="w-5 h-5 rounded border-gray-300 dark:border-slate-700 text-gray-900 dark:text-slate-600 focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600 transition-colors"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
                        Iniciar pausas automaticamente
                      </span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                      <input
                        type="checkbox"
                        checked={settings.autoStartPomodoros}
                        onChange={(e) =>
                          updateSettings({
                            ...settings,
                            autoStartPomodoros: e.target.checked,
                          })
                        }
                        className="w-5 h-5 rounded border-gray-300 dark:border-slate-700 text-gray-900 dark:text-slate-600 focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600 transition-colors"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
                        Iniciar pomodoros automaticamente
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - 1 coluna */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-gray-200 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-5 md:mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base md:text-lg">Estatísticas Hoje</h3>
              </div>

              <div className="space-y-3 md:space-y-4">
                <div className="group hover:scale-[1.02] transition-transform">
                  <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950/30 dark:to-red-950/30 rounded-2xl border border-rose-200 dark:border-rose-900/50 shadow-sm">
                    <div className="w-11 h-11 md:w-12 md:h-12 bg-gradient-to-br from-rose-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <Target className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">
                        {todayPomodoros}
                      </div>
                      <div className="text-xs font-medium text-gray-600 dark:text-gray-400">Pomodoros</div>
                    </div>
                  </div>
                </div>

                <div className="group hover:scale-[1.02] transition-transform">
                  <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl border border-blue-200 dark:border-blue-900/50 shadow-sm">
                    <div className="w-11 h-11 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <Clock className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">
                        {todayMinutes}
                      </div>
                      <div className="text-xs font-medium text-gray-600 dark:text-gray-400">Minutos</div>
                    </div>
                  </div>
                </div>

                <div className="group hover:scale-[1.02] transition-transform">
                  <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 shadow-sm">
                    <div className="w-11 h-11 md:w-12 md:h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <Zap className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">
                        {sessions.length}
                      </div>
                      <div className="text-xs font-medium text-gray-600 dark:text-gray-400">Total Sessões</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Tasks Card */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-gray-200 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4 md:mb-5">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-700 dark:from-slate-700 dark:to-slate-600 rounded-xl flex items-center justify-center shadow-lg">
                  <ListTodo className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base md:text-lg">Tarefas Rápidas</h3>
              </div>

              {/* Add Task */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addTask()}
                  placeholder="Nova tarefa..."
                  className="flex-1 px-4 py-2.5 md:py-3 border border-gray-300 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600 focus:border-transparent shadow-sm transition-shadow"
                />
                <button
                  onClick={addTask}
                  className="w-11 h-11 md:w-12 md:h-12 bg-gradient-to-br from-gray-900 to-gray-700 dark:from-slate-700 dark:to-slate-600 text-white rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center flex-shrink-0"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Task List */}
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {tasks.length === 0 ? (
                  <div className="text-center py-10 md:py-12">
                    <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                      <ListTodo className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Nenhuma tarefa ainda</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Adicione uma para começar</p>
                  </div>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-3 bg-white dark:bg-slate-950 rounded-xl group hover:shadow-md transition-all border border-gray-200 dark:border-slate-800"
                    >
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`w-5 h-5 md:w-6 md:h-6 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                          task.completed
                            ? "bg-gradient-to-br from-emerald-500 to-green-500 border-emerald-500 shadow-lg shadow-emerald-500/30"
                            : "border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500"
                        }`}
                      >
                        {task.completed && <Check className="w-3 h-3 md:w-4 md:h-4 text-white" />}
                      </button>
                      <span
                        className={`flex-1 text-sm transition-all ${
                          task.completed
                            ? "line-through text-gray-400 dark:text-gray-600"
                            : "text-gray-900 dark:text-gray-100"
                        }`}
                      >
                        {task.text}
                      </span>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all flex-shrink-0"
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
