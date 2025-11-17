"use client"

import React, { useState, useMemo, useEffect } from "react"
import { usePageTemplateData } from "@/core/hooks/usePageTemplateData"
import { WorkspaceTemplateComponentProps } from "@/core/types/workspace.types"
import {
  Plus, Trash2, X, BookOpen, Clock, Trophy, Target, TrendingUp, Calendar,
  Users, Flame, Award, Star, Zap, Brain, Play, Pause, CheckCircle, BarChart3,
  Download, Settings, Activity, Timer, Coffee, Rocket, Crown, Medal, ChevronUp,
  ChevronDown, Edit2, Save, Filter, Search, TrendingDown, Percent, FileText,
  ArrowUp, ArrowDown, Eye, EyeOff, Info, Check, XCircle, AlertCircle, CheckCircle2,
  Lightbulb, Heart, Sparkles
} from "lucide-react"
import ExcelJS from "exceljs"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

// ==================== TYPES ====================

type StudyTechnique = "pomodoro" | "deep-work" | "feynman" | "spaced-repetition" | "active-recall" | "free-study"

type Subject = {
  id: string
  name: string
  color: string
  totalMinutes: number
  targetMinutes?: number
}

type StudySession = {
  id: string
  userId: string
  subject: string
  technique: StudyTechnique
  startTime: string
  endTime?: string
  durationMinutes: number
  completed: boolean
  notes?: string
  focusScore?: number // 1-10
}

type Challenge = {
  id: string
  name: string
  description: string
  goal: number // minutos
  deadline: string
  participants: Participant[]
  createdAt: string
  createdBy: string
  status: "active" | "completed" | "expired"
  prize?: string
}

type Participant = {
  userId: string
  name: string
  avatar?: string
  minutesStudied: number
  lastStudyDate?: string
  rank?: number
}

type StudyGoal = {
  id: string
  name: string
  type: "daily" | "weekly" | "monthly" | "custom"
  targetHours: number
  currentMinutes: number
  deadline?: string
  completed: boolean
  icon?: string
}

type Achievement = {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt?: string
  progress: number
  target: number
}

type StudyTemplate = {
  id: string
  name: string
  technique: StudyTechnique
  duration: number
  breakDuration: number
  cycles: number
  description: string
}

type PomodoroState = {
  isActive: boolean
  isBreak: boolean
  timeLeft: number
  currentCycle: number
  totalCycles: number
  technique: StudyTechnique
}

type StudyTemplateData = {
  sessions: StudySession[]
  challenges: Challenge[]
  subjects: Subject[]
  goals: StudyGoal[]
  achievements: Achievement[]
  currentUserId: string
  currentUserName: string
  streak: number
  totalMinutes: number
  pomodoroState?: PomodoroState
}

// ==================== CONSTANTS ====================

const STUDY_TECHNIQUES: Record<StudyTechnique, {
  name: string
  description: string
  fullDescription: string
  icon: any
  bestFor: string[]
  suggestedDuration: string
  tips: string[]
  color: string
}> = {
  "pomodoro": {
    name: "Pomodoro",
    description: "25min foco + 5min pausa",
    fullDescription: "Técnica clássica de produtividade que divide o trabalho em intervalos de 25 minutos, separados por pequenas pausas.",
    icon: Timer,
    bestFor: ["Tarefas que exigem concentração moderada", "Evitar burnout", "Manter energia ao longo do dia"],
    suggestedDuration: "2-4 horas (4-8 pomodoros)",
    tips: [
      "Use um timer físico ou app dedicado",
      "Durante a pausa: levante, hidrate-se, alongue",
      "A cada 4 pomodoros, faça pausa longa de 15-30min",
      "Não quebre o pomodoro - se lembrou de algo, anote e continue"
    ],
    color: "red"
  },
  "deep-work": {
    name: "Deep Work",
    description: "90-120min de concentração máxima",
    fullDescription: "Blocos longos e ininterruptos de concentração profunda para trabalhos que exigem máximo esforço cognitivo.",
    icon: Brain,
    bestFor: ["Problemas complexos", "Escrita de artigos/TCC", "Programação", "Matemática avançada"],
    suggestedDuration: "90-120 minutos por sessão (máximo 2 por dia)",
    tips: [
      "Elimine TODAS as distrações antes de começar",
      "Melhor período: manhã (cérebro mais descansado)",
      "Não é para revisão - apenas trabalho intenso",
      "Prepare tudo antes: água, materiais, ambiente silencioso",
      "Após sessão: recompensa + descanso obrigatório de 20min+"
    ],
    color: "purple"
  },
  "feynman": {
    name: "Técnica Feynman",
    description: "Aprenda ensinando",
    fullDescription: "Aprenda explicando conceitos complexos de forma simples, como se estivesse ensinando para alguém que nunca viu o assunto.",
    icon: Users,
    bestFor: ["Entender conceitos difíceis", "Identificar gaps de conhecimento", "Preparação para provas orais"],
    suggestedDuration: "30-60 minutos por conceito",
    tips: [
      "1. Escolha um conceito e escreva tudo que sabe",
      "2. Explique em voz alta para alguém imaginário",
      "3. Quando travar, identifique o que não sabe",
      "4. Volte ao material e estude a lacuna",
      "5. Simplifique usando analogias e exemplos do dia a dia",
      "Se não consegue explicar simples, não entendeu"
    ],
    color: "blue"
  },
  "spaced-repetition": {
    name: "Repetição Espaçada",
    description: "Revise em intervalos crescentes",
    fullDescription: "Sistema de revisão baseado em curva do esquecimento: revise conteúdo em intervalos cada vez maiores para memorização permanente.",
    icon: Calendar,
    bestFor: ["Memorizar fatos/datas/fórmulas", "Idiomas (vocabulário)", "Medicina (anatomia)", "Direito (leis)"],
    suggestedDuration: "15-30 minutos por sessão de revisão",
    tips: [
      "Revisão ideal: 1 dia → 3 dias → 7 dias → 21 dias → 45 dias",
      "Use Anki, Notion ou flashcards físicos",
      "Crie cards simples: uma pergunta, uma resposta",
      "Revise TODOS os dias, mesmo que poucos cards",
      "Quanto mais difícil lembrar, mais forte fica a memória"
    ],
    color: "green"
  },
  "active-recall": {
    name: "Recordação Ativa",
    description: "Teste-se sem consultar",
    fullDescription: "Método mais eficaz de estudo comprovado cientificamente: tente lembrar ativamente ao invés de reler passivamente.",
    icon: Zap,
    bestFor: ["Consolidar conhecimento", "Preparação para provas", "Qualquer matéria que exige memorização"],
    suggestedDuration: "45-90 minutos",
    tips: [
      "NUNCA releia - sempre teste-se primeiro",
      "Feche o livro e escreva tudo que lembra",
      "Use folha em branco: escreva, desenhe, faça mapas mentais",
      "Crie questões enquanto estuda e responda depois",
      "Errar durante prática é BOM - fortalece memória",
      "Só consulte material depois de tentar lembrar"
    ],
    color: "yellow"
  },
  "free-study": {
    name: "Estudo Livre",
    description: "Estude no seu ritmo",
    fullDescription: "Estudo flexível sem técnica específica. Útil para leitura exploratória, anotações e organização de materiais.",
    icon: BookOpen,
    bestFor: ["Leitura inicial de conteúdo", "Organização de materiais", "Anotações", "Trabalhos criativos"],
    suggestedDuration: "Flexível conforme necessidade",
    tips: [
      "Bom para primeiros contatos com matéria nova",
      "Combine com outras técnicas para melhor retenção",
      "Mantenha ambiente organizado e sem distrações",
      "Faça pausas regulares a cada 50-60 minutos",
      "Anote dúvidas e perguntas para estudar depois"
    ],
    color: "gray"
  },
}

type StudyTip = {
  id: string
  category: "productivity" | "health" | "memory" | "motivation" | "organization"
  title: string
  description: string
  icon: string
  actionable: string[]
}

const STUDY_TIPS: StudyTip[] = [
  {
    id: "tip-1",
    category: "productivity",
    title: "Elimine Distrações Digitais",
    description: "Seu smartphone é o maior inimigo da concentração. Estudos mostram que mesmo a presença do celular reduz sua capacidade cognitiva.",
    icon: "📱",
    actionable: [
      "Coloque o celular em outro cômodo durante o estudo",
      "Use apps bloqueadores: Forest, Freedom, Cold Turkey",
      "Desative todas as notificações, exceto emergências",
      "Use modo 'Não Perturbe' ou 'Foco' do sistema"
    ]
  },
  {
    id: "tip-2",
    category: "memory",
    title: "Use o Método Feynman",
    description: "Se você não consegue explicar algo de forma simples, você não entendeu. Este método força você a identificar suas lacunas de conhecimento.",
    icon: "🎓",
    actionable: [
      "1. Escolha um conceito e escreva tudo que sabe sobre ele",
      "2. Explique em voz alta como se estivesse ensinando uma criança",
      "3. Identifique as partes onde você travou",
      "4. Volte ao material e estude especificamente essas lacunas",
      "5. Simplifique sua explicação e use analogias"
    ]
  },
  {
    id: "tip-3",
    category: "health",
    title: "Durma Bem - Não é Opcional",
    description: "Dormir menos de 7h reduz sua capacidade de aprendizado em até 40%. O sono consolida memórias e limpa toxinas cerebrais.",
    icon: "😴",
    actionable: [
      "Durma 7-9 horas por noite, sem exceções",
      "Mantenha horários regulares de sono",
      "Evite telas 1h antes de dormir (luz azul prejudica melatonina)",
      "Quarto escuro, silencioso e fresco (18-21°C ideal)",
      "Cochilo de 20min pode ajudar, mas não substitui sono noturno"
    ]
  },
  {
    id: "tip-4",
    category: "productivity",
    title: "Estude em Blocos Espaçados",
    description: "Cramming (estudar tudo de uma vez) cria ilusão de aprendizado. Espaçamento aumenta retenção em 200%.",
    icon: "📅",
    actionable: [
      "Revise após 1 dia, depois 3 dias, depois 7 dias, depois 21 dias",
      "Use flashcards com sistema Anki/Notion para revisão espaçada",
      "Nunca estude o mesmo assunto por mais de 2h seguidas",
      "Alterne matérias/tópicos para evitar saturação"
    ]
  },
  {
    id: "tip-5",
    category: "memory",
    title: "Teste-se Constantemente (Active Recall)",
    description: "Reler é passivo e ineficaz. Testar-se ativamente é 50% mais eficiente para memorização de longo prazo.",
    icon: "✍️",
    actionable: [
      "Feche o livro e tente escrever tudo que lembra",
      "Crie questões sobre o conteúdo e responda sem consultar",
      "Use flashcards: pergunta na frente, resposta atrás",
      "Explique em voz alta sem olhar as anotações",
      "Quanto mais difícil recuperar, mais forte fica a memória"
    ]
  },
  {
    id: "tip-6",
    category: "productivity",
    title: "Ambiente Otimizado = Foco Otimizado",
    description: "Seu ambiente físico afeta diretamente sua capacidade de concentração e produtividade.",
    icon: "🏠",
    actionable: [
      "Estude sempre no mesmo lugar (cérebro associa local → foco)",
      "Mesa limpa, apenas o essencial visível",
      "Iluminação natural ou lâmpada de 4000-5000K (luz branca)",
      "Temperatura confortável (20-22°C ideal)",
      "Plantas melhoram concentração e reduzem estresse"
    ]
  },
  {
    id: "tip-7",
    category: "health",
    title: "Exercício Físico Turbina o Cérebro",
    description: "30min de exercício aumentam BDNF (hormônio do crescimento neuronal), melhorando memória e aprendizado.",
    icon: "🏃",
    actionable: [
      "30min de exercício aeróbico 3-5x por semana",
      "Exercício antes de estudar aumenta foco por 2-3h",
      "Caminhadas durante pausas melhoram criatividade",
      "Exercício regular melhora qualidade do sono",
      "Não precisa ser intenso: caminhada rápida já ajuda"
    ]
  },
  {
    id: "tip-8",
    category: "motivation",
    title: "Domine a Arte de Começar (5min Rule)",
    description: "A parte mais difícil é começar. Comprometa-se com apenas 5 minutos. Geralmente, você continuará.",
    icon: "🚀",
    actionable: [
      "Quando não quiser estudar, comprometa-se com 5min apenas",
      "Remova todas as barreiras: materiais organizados, local pronto",
      "Use rituais: mesma música, mesma bebida, mesmo horário",
      "Comece pela tarefa mais fácil para ganhar momentum",
      "Celebre pequenas vitórias para manter motivação"
    ]
  },
  {
    id: "tip-9",
    category: "organization",
    title: "Sistema de Anotações Cornell",
    description: "Método cientificamente comprovado para melhorar retenção e facilitar revisões.",
    icon: "📝",
    actionable: [
      "Divida página: coluna esquerda (30%), direita (70%), rodapé",
      "Coluna direita: anotações durante aula/leitura",
      "Coluna esquerda: palavras-chave e perguntas (após aula)",
      "Rodapé: resumo com suas próprias palavras",
      "Revise cobrindo coluna direita e respondendo perguntas"
    ]
  },
  {
    id: "tip-10",
    category: "health",
    title: "Hidratação e Alimentação Estratégica",
    description: "Cérebro é 75% água. Desidratação de 2% reduz desempenho cognitivo em 20%.",
    icon: "💧",
    actionable: [
      "Beba 2-3L de água por dia, sempre tenha água próxima",
      "Evite açúcar/carboidratos simples (causam picos e quedas de energia)",
      "Proteína + gordura boa mantêm energia estável (ovos, nozes, abacate)",
      "Cafeína com moderação: 100-200mg (1-2 cafés) máximo",
      "Evite refeições pesadas antes de estudar (sangue vai pra digestão)"
    ]
  },
  {
    id: "tip-11",
    category: "productivity",
    title: "Modo Deep Work - Zero Interrupções",
    description: "Blocos de 90-120min de foco profundo produzem mais que 8h de trabalho superficial.",
    icon: "🧠",
    actionable: [
      "Programe 1-2 blocos de deep work por dia",
      "Avisar família/colegas: NÃO interromper por nada",
      "Desativar TUDO: email, WhatsApp, redes sociais",
      "Trabalhe em um problema difícil, não tarefas administrativas",
      "Após bloco, recompensa: caminhada, snack, música"
    ]
  },
  {
    id: "tip-12",
    category: "memory",
    title: "Crie Conexões e Histórias",
    description: "Cérebro lembra histórias 22x melhor que fatos isolados. Use mnemônicos e associações visuais.",
    icon: "🎨",
    actionable: [
      "Transforme conceitos abstratos em imagens mentais vívidas",
      "Crie histórias conectando informações que precisa lembrar",
      "Use palácio da memória: associe informações a locais físicos",
      "Quanto mais bizarro/engraçado, mais memorável",
      "Conecte conteúdo novo com conhecimento que já possui"
    ]
  }
]

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: "first-session", name: "Primeiro Passo", description: "Complete sua primeira sessão", icon: "🎯", progress: 0, target: 1 },
  { id: "streak-7", name: "Semana Forte", description: "Estude 7 dias seguidos", icon: "🔥", progress: 0, target: 7 },
  { id: "streak-30", name: "Mês Dedicado", description: "Estude 30 dias seguidos", icon: "💪", progress: 0, target: 30 },
  { id: "hours-10", name: "10 Horas", description: "Acumule 10 horas de estudo", icon: "⏰", progress: 0, target: 600 },
  { id: "hours-50", name: "50 Horas", description: "Acumule 50 horas de estudo", icon: "📚", progress: 0, target: 3000 },
  { id: "hours-100", name: "100 Horas", description: "Acumule 100 horas de estudo", icon: "🏆", progress: 0, target: 6000 },
  { id: "pomodoro-master", name: "Mestre Pomodoro", description: "Complete 50 pomodoros", icon: "🍅", progress: 0, target: 50 },
  { id: "deep-work-expert", name: "Expert em Deep Work", description: "Complete 20 sessões de deep work", icon: "🧠", progress: 0, target: 20 },
  { id: "challenge-winner", name: "Campeão", description: "Vença um desafio", icon: "👑", progress: 0, target: 1 },
  { id: "early-bird", name: "Madrugador", description: "Estude antes das 7h", icon: "🌅", progress: 0, target: 1 },
]

const DEFAULT_DATA: StudyTemplateData = {
  sessions: [],
  challenges: [],
  subjects: [
    { id: "math", name: "Matemática", color: "blue", totalMinutes: 0 },
    { id: "physics", name: "Física", color: "purple", totalMinutes: 0 },
    { id: "programming", name: "Programação", color: "green", totalMinutes: 0 },
    { id: "languages", name: "Idiomas", color: "pink", totalMinutes: 0 },
  ],
  goals: [],
  achievements: DEFAULT_ACHIEVEMENTS,
  currentUserId: "user-1",
  currentUserName: "Você",
  streak: 0,
  totalMinutes: 0,
}

// ==================== UTILITY FUNCTIONS ====================

const calculateStreak = (sessions: StudySession[]): number => {
  if (sessions.length === 0) return 0

  const sortedDates = [...new Set(sessions.map(s => s.startTime.split('T')[0]))].sort().reverse()
  let streak = 0
  let currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)

  for (let i = 0; i < sortedDates.length; i++) {
    const sessionDate = new Date(sortedDates[i])
    sessionDate.setHours(0, 0, 0, 0)

    const diffDays = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === streak) {
      streak++
    } else {
      break
    }
  }

  return streak
}

const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours === 0) return `${mins}min`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}min`
}

const getRankEmoji = (rank: number): string => {
  switch (rank) {
    case 1: return "🥇"
    case 2: return "🥈"
    case 3: return "🥉"
    default: return `#${rank}`
  }
}

const formatTimerDisplay = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

// ==================== MAIN COMPONENT ====================

export default function StudyTemplate({ groupId, pageId }: WorkspaceTemplateComponentProps) {
  const { data, setData } = usePageTemplateData<StudyTemplateData>(groupId, pageId, DEFAULT_DATA)

  const [activeTab, setActiveTab] = useState<"dashboard" | "study" | "challenges" | "stats" | "goals" | "achievements" | "tips">("dashboard")
  const [showAddChallenge, setShowAddChallenge] = useState(false)
  const [showAddSubject, setShowAddSubject] = useState(false)
  const [activeSession, setActiveSession] = useState<StudySession | null>(null)
  const [sessionTimer, setSessionTimer] = useState<number>(0)
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<string>("")
  const [selectedTechnique, setSelectedTechnique] = useState<StudyTechnique>("free-study")

  // Pomodoro state
  const [pomodoroActive, setPomodoroActive] = useState(false)
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60)
  const [pomodoroIsBreak, setPomodoroIsBreak] = useState(false)
  const [pomodoroCycle, setPomodoroCycle] = useState(1)

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval)
      }
    }
  }, [timerInterval])

  // ==================== COMPUTED VALUES ====================

  const metrics = useMemo(() => {
    const completedSessions = data.sessions.filter(s => s.completed)
    const totalMinutes = completedSessions.reduce((sum, s) => sum + s.durationMinutes, 0)
    const totalHours = Math.floor(totalMinutes / 60)

    const today = new Date().toISOString().split('T')[0]
    const todaySessions = completedSessions.filter(s => s.startTime.split('T')[0] === today)
    const todayMinutes = todaySessions.reduce((sum, s) => sum + s.durationMinutes, 0)

    const thisWeek = completedSessions.filter(s => {
      const sessionDate = new Date(s.startTime)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return sessionDate >= weekAgo
    })
    const weekMinutes = thisWeek.reduce((sum, s) => sum + s.durationMinutes, 0)

    const avgFocusScore = completedSessions.filter(s => s.focusScore).length > 0
      ? completedSessions.reduce((sum, s) => sum + (s.focusScore || 0), 0) / completedSessions.filter(s => s.focusScore).length
      : 0

    const streak = calculateStreak(completedSessions)

    const techniqueStats = completedSessions.reduce((acc, s) => {
      acc[s.technique] = (acc[s.technique] || 0) + 1
      return acc
    }, {} as Record<StudyTechnique, number>)

    return {
      totalSessions: completedSessions.length,
      totalMinutes,
      totalHours,
      todayMinutes,
      weekMinutes,
      avgFocusScore,
      streak,
      techniqueStats,
    }
  }, [data.sessions])

  const activeChallenges = useMemo(() => {
    return data.challenges.filter(c => c.status === "active")
  }, [data.challenges])

  const leaderboard = useMemo(() => {
    const userMap = new Map<string, { userId: string; name: string; totalMinutes: number }>()

    data.sessions.filter(s => s.completed).forEach(session => {
      const existing = userMap.get(session.userId)
      if (existing) {
        existing.totalMinutes += session.durationMinutes
      } else {
        const challenge = data.challenges[0]
        const participant = challenge?.participants.find(p => p.userId === session.userId)
        userMap.set(session.userId, {
          userId: session.userId,
          name: participant?.name || "Usuário",
          totalMinutes: session.durationMinutes
        })
      }
    })

    return Array.from(userMap.values())
      .sort((a, b) => b.totalMinutes - a.totalMinutes)
      .map((user, index) => ({ ...user, rank: index + 1 }))
  }, [data.sessions, data.challenges])

  // ==================== HANDLERS ====================

  const startStudySession = (subject: string, technique: StudyTechnique) => {
    if (activeSession) return

    const newSession: StudySession = {
      id: `session-${Date.now()}`,
      userId: data.currentUserId,
      subject,
      technique,
      startTime: new Date().toISOString(),
      durationMinutes: 0,
      completed: false,
    }

    setData(prev => ({
      ...prev,
      sessions: [...prev.sessions, newSession],
    }))

    setActiveSession(newSession)
    setSessionTimer(0)

    const interval = setInterval(() => {
      setSessionTimer(prev => prev + 1)
    }, 1000)
    setTimerInterval(interval)
  }

  const endStudySession = (focusScore?: number) => {
    if (!activeSession || !timerInterval) return

    clearInterval(timerInterval)
    setTimerInterval(null)

    const durationMinutes = Math.max(1, Math.floor(sessionTimer / 60))
    const now = new Date().toISOString()

    setData(prev => {
      // Atualizar sessão
      const updatedSessions = prev.sessions.map(s =>
        s.id === activeSession.id
          ? { ...s, endTime: now, durationMinutes, completed: true, focusScore, userId: prev.currentUserId }
          : s
      )

      // Atualizar matérias
      const updatedSubjects = prev.subjects.map(sub =>
        sub.name === activeSession.subject
          ? { ...sub, totalMinutes: sub.totalMinutes + durationMinutes }
          : sub
      )

      // Calcular novo streak
      const newStreak = calculateStreak(updatedSessions.filter(s => s.completed))

      // Atualizar competições
      const updatedChallenges = prev.challenges.map(challenge => {
        if (challenge.status !== "active") return challenge

        const updatedParticipants = challenge.participants.map(p => {
          if (p.userId === prev.currentUserId) {
            return {
              ...p,
              minutesStudied: p.minutesStudied + durationMinutes,
              lastStudyDate: now,
            }
          }
          return p
        })

        return { ...challenge, participants: updatedParticipants }
      })

      // Atualizar achievements
      const totalCompletedSessions = updatedSessions.filter(s => s.completed).length
      const totalMinutesStudied = prev.totalMinutes + durationMinutes

      const updatedAchievements = prev.achievements.map(achievement => {
        let newProgress = achievement.progress

        if (achievement.id === "first-session" && !achievement.unlockedAt) {
          newProgress = totalCompletedSessions
        } else if (achievement.id === "streak-7" && !achievement.unlockedAt) {
          newProgress = newStreak
        } else if (achievement.id === "streak-30" && !achievement.unlockedAt) {
          newProgress = newStreak
        } else if (achievement.id === "sessions-10" && !achievement.unlockedAt) {
          newProgress = totalCompletedSessions
        } else if (achievement.id === "sessions-50" && !achievement.unlockedAt) {
          newProgress = totalCompletedSessions
        } else if (achievement.id === "sessions-100" && !achievement.unlockedAt) {
          newProgress = totalCompletedSessions
        } else if (achievement.id === "hours-10" && !achievement.unlockedAt) {
          newProgress = Math.floor(totalMinutesStudied / 60)
        } else if (achievement.id === "hours-50" && !achievement.unlockedAt) {
          newProgress = Math.floor(totalMinutesStudied / 60)
        } else if (achievement.id === "hours-100" && !achievement.unlockedAt) {
          newProgress = Math.floor(totalMinutesStudied / 60)
        } else if (achievement.id === "focus-master" && !achievement.unlockedAt && focusScore && focusScore >= 9) {
          newProgress = achievement.progress + 1
        }

        const shouldUnlock = newProgress >= achievement.target && !achievement.unlockedAt

        return {
          ...achievement,
          progress: newProgress,
          unlockedAt: shouldUnlock ? now : achievement.unlockedAt,
        }
      })

      // Atualizar metas
      const updatedGoals = prev.goals.map(goal => {
        const newCurrentMinutes = goal.currentMinutes + durationMinutes
        const targetMinutes = goal.targetHours * 60
        const isCompleted = newCurrentMinutes >= targetMinutes

        return {
          ...goal,
          currentMinutes: newCurrentMinutes,
          completed: isCompleted,
        }
      })

      return {
        ...prev,
        sessions: updatedSessions,
        subjects: updatedSubjects,
        totalMinutes: totalMinutesStudied,
        streak: newStreak,
        challenges: updatedChallenges,
        achievements: updatedAchievements,
        goals: updatedGoals,
      }
    })

    setActiveSession(null)
    setSessionTimer(0)
  }

  const createChallenge = (challenge: Omit<Challenge, "id" | "createdAt" | "createdBy" | "status">) => {
    const newChallenge: Challenge = {
      ...challenge,
      id: `challenge-${Date.now()}`,
      createdAt: new Date().toISOString(),
      createdBy: data.currentUserId,
      status: "active",
    }

    setData(prev => ({
      ...prev,
      challenges: [...prev.challenges, newChallenge],
    }))

    setShowAddChallenge(false)
  }

  const addParticipantToChallenge = (challengeId: string, participant: Participant) => {
    setData(prev => ({
      ...prev,
      challenges: prev.challenges.map(c =>
        c.id === challengeId
          ? { ...c, participants: [...c.participants, participant] }
          : c
      ),
    }))
  }

  const deleteChallenge = (challengeId: string) => {
    setData(prev => ({
      ...prev,
      challenges: prev.challenges.filter(c => c.id !== challengeId),
    }))
  }

  const addSubject = (name: string, color: string) => {
    const newSubject: Subject = {
      id: `subject-${Date.now()}`,
      name,
      color,
      totalMinutes: 0,
    }

    setData(prev => ({
      ...prev,
      subjects: [...prev.subjects, newSubject],
    }))

    setShowAddSubject(false)
  }

  const deleteSubject = (subjectId: string) => {
    setData(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s.id !== subjectId),
    }))
  }

  const addGoal = (goal: Omit<StudyGoal, "id" | "currentMinutes" | "completed">) => {
    const newGoal: StudyGoal = {
      ...goal,
      id: `goal-${Date.now()}`,
      currentMinutes: 0,
      completed: false,
    }

    setData(prev => ({
      ...prev,
      goals: [...prev.goals, newGoal],
    }))
  }

  const deleteGoal = (goalId: string) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.filter(g => g.id !== goalId),
    }))
  }

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook()

    // Dashboard
    const dashboardSheet = workbook.addWorksheet("Dashboard")
    dashboardSheet.addRow(["Plataforma de Estudos - Dashboard"])
    dashboardSheet.addRow([])
    dashboardSheet.addRow(["Métrica", "Valor"])
    dashboardSheet.addRow(["Total de Sessões", metrics.totalSessions])
    dashboardSheet.addRow(["Tempo Total", `${metrics.totalHours}h ${metrics.totalMinutes % 60}min`])
    dashboardSheet.addRow(["Hoje", `${metrics.todayMinutes}min`])
    dashboardSheet.addRow(["Esta Semana", `${metrics.weekMinutes}min`])
    dashboardSheet.addRow(["Streak", `${metrics.streak} dias`])
    dashboardSheet.addRow(["Foco Médio", `${metrics.avgFocusScore.toFixed(1)}/10`])

    // Histórico
    const historySheet = workbook.addWorksheet("Histórico")
    historySheet.addRow(["Data", "Matéria", "Técnica", "Duração (min)", "Foco"])
    data.sessions.filter(s => s.completed).forEach(s => {
      historySheet.addRow([
        new Date(s.startTime).toLocaleDateString("pt-BR"),
        s.subject,
        STUDY_TECHNIQUES[s.technique].name,
        s.durationMinutes,
        s.focusScore || "-"
      ])
    })

    // Desafios
    const challengesSheet = workbook.addWorksheet("Desafios")
    challengesSheet.addRow(["Nome", "Meta (min)", "Deadline", "Status"])
    data.challenges.forEach(c => {
      challengesSheet.addRow([
        c.name,
        c.goal,
        new Date(c.deadline).toLocaleDateString("pt-BR"),
        c.status
      ])
    })

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `estudo-${new Date().toISOString().slice(0, 10)}.xlsx`
    a.click()
  }

  const exportToPDF = () => {
    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.text("Plataforma de Estudos - Relatório", 14, 20)
    doc.setFontSize(11)
    doc.text(new Date().toLocaleDateString("pt-BR"), 14, 28)

    doc.setFontSize(14)
    doc.text("Dashboard", 14, 40)

    autoTable(doc, {
      startY: 45,
      head: [["Métrica", "Valor"]],
      body: [
        ["Total de Sessões", metrics.totalSessions.toString()],
        ["Tempo Total", `${metrics.totalHours}h ${metrics.totalMinutes % 60}min`],
        ["Hoje", `${metrics.todayMinutes}min`],
        ["Esta Semana", `${metrics.weekMinutes}min`],
        ["Streak", `${metrics.streak} dias`],
        ["Foco Médio", `${metrics.avgFocusScore.toFixed(1)}/10`],
      ]
    })

    doc.save(`estudo-${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  return (
    <div className="h-full flex flex-col bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
              <h1 className="text-base font-semibold text-neutral-900 dark:text-white">
                Plataforma de Estudos
              </h1>
            </div>
            {activeSession && (
              <>
                <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700" />
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-mono text-neutral-700 dark:text-neutral-300">
                    {formatTimerDisplay(sessionTimer)}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
                    {activeSession.subject}
                  </span>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeSession ? (
              <button
                onClick={() => endStudySession()}
                className="px-2.5 py-1 text-xs flex items-center gap-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                <XCircle className="w-3 h-3" />
                Finalizar
              </button>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      {!activeSession && (
        <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4">
          <div className="flex gap-1">
            {[
              { id: "dashboard", label: "Dashboard", icon: BarChart3 },
              { id: "study", label: "Estudar", icon: BookOpen },
              { id: "challenges", label: "Competições", icon: Trophy },
              { id: "tips", label: "Dicas", icon: Lightbulb },
              { id: "stats", label: "Estatísticas", icon: Activity },
              { id: "goals", label: "Metas", icon: Target },
              { id: "achievements", label: "Conquistas", icon: Award },
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
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === "dashboard" && (
          <DashboardTab
            metrics={metrics}
            data={data}
            activeChallenges={activeChallenges}
            leaderboard={leaderboard}
            startStudySession={startStudySession}
          />
        )}

        {activeTab === "study" && (
          <StudyTab
            subjects={data.subjects}
            selectedSubject={selectedSubject}
            setSelectedSubject={setSelectedSubject}
            selectedTechnique={selectedTechnique}
            setSelectedTechnique={setSelectedTechnique}
            startStudySession={startStudySession}
            showAddSubject={showAddSubject}
            setShowAddSubject={setShowAddSubject}
            addSubject={addSubject}
            deleteSubject={deleteSubject}
          />
        )}

        {activeTab === "challenges" && (
          <ChallengesTab
            challenges={data.challenges}
            currentUserId={data.currentUserId}
            showAddChallenge={showAddChallenge}
            setShowAddChallenge={setShowAddChallenge}
            createChallenge={createChallenge}
            deleteChallenge={deleteChallenge}
            addParticipantToChallenge={addParticipantToChallenge}
          />
        )}

        {activeTab === "tips" && <TipsTab />}

        {activeTab === "stats" && (
          <StatsTab
            sessions={data.sessions}
            subjects={data.subjects}
            metrics={metrics}
          />
        )}

        {activeTab === "goals" && (
          <GoalsTab
            goals={data.goals}
            addGoal={addGoal}
            deleteGoal={deleteGoal}
          />
        )}

        {activeTab === "achievements" && (
          <AchievementsTab
            achievements={data.achievements}
            sessions={data.sessions}
          />
        )}

        {/* Active Session */}
        {activeSession && (
          <ActiveSessionTab
            activeSession={activeSession}
            sessionTimer={sessionTimer}
            endStudySession={endStudySession}
          />
        )}
      </div>
    </div>
  )
}

// ==================== TAB COMPONENTS ====================

function DashboardTab({ metrics, data, activeChallenges, leaderboard, startStudySession }: any) {
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "year">("week")
  const [showQuickStart, setShowQuickStart] = useState(false)

  // Calcular dados do período selecionado
  const periodData = useMemo(() => {
    const now = new Date()
    let startDate = new Date()

    if (selectedPeriod === "week") {
      startDate.setDate(now.getDate() - 7)
    } else if (selectedPeriod === "month") {
      startDate.setMonth(now.getMonth() - 1)
    } else {
      startDate.setFullYear(now.getFullYear() - 1)
    }

    const periodSessions = data.sessions.filter((s: StudySession) => {
      const sessionDate = new Date(s.startTime)
      return s.completed && sessionDate >= startDate
    })

    const totalMinutes = periodSessions.reduce((sum: number, s: StudySession) => sum + s.durationMinutes, 0)
    const avgPerDay = totalMinutes / ((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

    return {
      sessions: periodSessions.length,
      minutes: totalMinutes,
      hours: Math.floor(totalMinutes / 60),
      avgPerDay: Math.round(avgPerDay)
    }
  }, [data.sessions, selectedPeriod])

  // Calcular melhor técnica
  const bestTechnique = useMemo(() => {
    const techniques = data.sessions.filter((s: StudySession) => s.completed).reduce((acc: any, s: StudySession) => {
      acc[s.technique] = (acc[s.technique] || 0) + s.durationMinutes
      return acc
    }, {})

    const best = Object.entries(techniques).sort(([, a]: any, [, b]: any) => b - a)[0]
    return best ? { technique: best[0] as StudyTechnique, minutes: best[1] as number } : null
  }, [data.sessions])

  // Calcular matéria mais estudada
  const topSubject = useMemo(() => {
    return data.subjects.sort((a: Subject, b: Subject) => b.totalMinutes - a.totalMinutes)[0]
  }, [data.subjects])

  // Próximos achievements
  const nextAchievements = useMemo(() => {
    return data.achievements
      .filter((a: Achievement) => !a.unlockedAt && a.progress > 0)
      .sort((a: Achievement, b: Achievement) => {
        const aPercent = (a.progress / a.target) * 100
        const bPercent = (b.progress / b.target) * 100
        return bPercent - aPercent
      })
      .slice(0, 3)
  }, [data.achievements])

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Hero Stats monocromático */}
      <div className="relative overflow-hidden bg-neutral-900 dark:bg-neutral-950 rounded-2xl p-4 sm:p-6 border border-neutral-800 dark:border-neutral-900">
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Bem-vindo de volta!</h2>
              <p className="text-neutral-400 text-xs sm:text-sm">Continue sua jornada de aprendizado</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {["week", "month", "year"].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period as any)}
                  className={`flex-1 sm:flex-none px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    selectedPeriod === period
                      ? "bg-white text-neutral-900"
                      : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white"
                  }`}
                >
                  {period === "week" ? "7d" : period === "month" ? "30d" : "Ano"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-4 border border-neutral-700/50 hover:border-neutral-600 transition group">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-lg bg-neutral-700 group-hover:bg-neutral-600 flex items-center justify-center transition">
                  <Clock className="w-5 h-5 text-neutral-300 group-hover:text-white transition" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-neutral-400">Tempo Total</div>
                  <div className="text-2xl font-bold text-white">{periodData.hours}h</div>
                </div>
              </div>
              <div className="text-xs text-neutral-500">+{periodData.minutes % 60}min</div>
            </div>

            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-4 border border-neutral-700/50 hover:border-neutral-600 transition group">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-lg bg-neutral-700 group-hover:bg-neutral-600 flex items-center justify-center transition">
                  <Flame className="w-5 h-5 text-orange-500 group-hover:text-orange-400 transition" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-neutral-400">Sequência</div>
                  <div className="text-2xl font-bold text-white">{metrics.streak}</div>
                </div>
              </div>
              <div className="text-xs text-neutral-500">dias seguidos</div>
            </div>

            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-4 border border-neutral-700/50 hover:border-neutral-600 transition group">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-lg bg-neutral-700 group-hover:bg-neutral-600 flex items-center justify-center transition">
                  <Target className="w-5 h-5 text-neutral-300 group-hover:text-white transition" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-neutral-400">Hoje</div>
                  <div className="text-2xl font-bold text-white">{Math.floor(metrics.todayMinutes / 60)}h</div>
                </div>
              </div>
              <div className="text-xs text-neutral-500">{metrics.todayMinutes % 60}min estudados</div>
            </div>

            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-4 border border-neutral-700/50 hover:border-neutral-600 transition group">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-lg bg-neutral-700 group-hover:bg-neutral-600 flex items-center justify-center transition">
                  <BarChart3 className="w-5 h-5 text-neutral-300 group-hover:text-white transition" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-neutral-400">Sessões</div>
                  <div className="text-2xl font-bold text-white">{periodData.sessions}</div>
                </div>
              </div>
              <div className="text-xs text-neutral-500">no período</div>
            </div>
          </div>
        </div>

        {/* Decorative grid pattern */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      </div>

      {/* Grid de 2 colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Coluna Esquerda */}
        <div className="space-y-4 sm:space-y-6">
          {/* Quick Actions Premium */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-5">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
              <Rocket className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
              Iniciar Agora
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {Object.entries(STUDY_TECHNIQUES).slice(0, 4).map(([key, tech]) => (
                <button
                  key={key}
                  onClick={() => {
                    // Aqui você pode adicionar lógica para selecionar matéria
                    setShowQuickStart(true)
                  }}
                  className="p-4 border-2 border-neutral-200 dark:border-neutral-800 rounded-xl hover:border-neutral-900 dark:hover:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition group"
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    {React.createElement(tech.icon, {
                      className: "w-6 h-6 text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition"
                    })}
                    <div>
                      <div className="text-xs font-semibold text-neutral-900 dark:text-white">{tech.name}</div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">{tech.suggestedDuration}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Insights */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
              Seus Insights
            </h3>
            <div className="space-y-3">
              {bestTechnique && (
                <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-neutral-600 transition">
                  <div className="flex items-center gap-2 mb-1">
                    {React.createElement(STUDY_TECHNIQUES[bestTechnique.technique].icon, {
                      className: "w-4 h-4 text-neutral-700 dark:text-neutral-300"
                    })}
                    <span className="text-xs font-semibold text-neutral-900 dark:text-white">
                      Técnica Favorita
                    </span>
                  </div>
                  <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    {STUDY_TECHNIQUES[bestTechnique.technique].name}
                  </div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-400">
                    {formatTime(bestTechnique.minutes)} de estudo
                  </div>
                </div>
              )}

              {topSubject && (
                <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-neutral-600 transition">
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                    <span className="text-xs font-semibold text-neutral-900 dark:text-white">
                      Matéria Principal
                    </span>
                  </div>
                  <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    {topSubject.name}
                  </div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-400">
                    {formatTime(topSubject.totalMinutes)} investidos
                  </div>
                </div>
              )}

              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-neutral-600 transition">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                  <span className="text-xs font-semibold text-neutral-900 dark:text-white">
                    Média Diária
                  </span>
                </div>
                <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {periodData.avgPerDay} minutos/dia
                </div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400">
                  nos últimos {selectedPeriod === "week" ? "7" : selectedPeriod === "month" ? "30" : "365"} dias
                </div>
              </div>
            </div>
          </div>

          {/* Próximas Conquistas */}
          {nextAchievements.length > 0 && (
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                Quase Lá!
              </h3>
              <div className="space-y-3">
                {nextAchievements.map((achievement: Achievement) => {
                  const progress = (achievement.progress / achievement.target) * 100
                  return (
                    <div key={achievement.id} className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{achievement.icon}</span>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-neutral-900 dark:text-white">
                            {achievement.name}
                          </div>
                          <div className="text-xs text-neutral-600 dark:text-neutral-400">
                            {achievement.description}
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                        <div
                          className="h-2 bg-neutral-900 dark:bg-white rounded-full transition-all"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        {achievement.progress} / {achievement.target} ({Math.round(progress)}%)
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Coluna Direita */}
        <div className="space-y-6">
          {/* Competições Ativas */}
          {activeChallenges.length > 0 ? (
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                Competições Ativas
              </h3>
              <div className="space-y-4">
                {activeChallenges.slice(0, 2).map((challenge: Challenge) => {
                  const daysLeft = Math.ceil((new Date(challenge.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                  const sortedParticipants = [...challenge.participants].sort((a, b) => b.minutesStudied - a.minutesStudied)
                  const totalProgress = challenge.participants.reduce((sum, p) => sum + p.minutesStudied, 0)
                  const progress = (totalProgress / challenge.goal) * 100
                  const userParticipant = sortedParticipants.find(p => p.userId === data.currentUserId)
                  const userRank = userParticipant ? sortedParticipants.indexOf(userParticipant) + 1 : null

                  return (
                    <div key={challenge.id} className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-neutral-600 transition">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-1">
                            {challenge.name}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-neutral-600 dark:text-neutral-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {daysLeft} dias restantes
                            </div>
                            {userRank && (
                              <div className="flex items-center gap-1 text-neutral-900 dark:text-white font-semibold">
                                <Crown className="w-3 h-3" />
                                {getRankEmoji(userRank)} posição
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-neutral-600 dark:text-neutral-400">Progresso Total</span>
                          <span className="font-bold text-neutral-900 dark:text-white">
                            {formatTime(totalProgress)} / {formatTime(challenge.goal)}
                          </span>
                        </div>
                        <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2.5">
                          <div
                            className="h-2.5 bg-neutral-900 dark:bg-white rounded-full transition-all"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        {sortedParticipants.slice(0, 3).map((participant, idx) => (
                          <div
                            key={participant.userId}
                            className={`flex items-center justify-between p-2 rounded-lg ${
                              participant.userId === data.currentUserId
                                ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                                : "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold w-5">{getRankEmoji(idx + 1)}</span>
                              <span className="text-xs font-medium">
                                {participant.name}
                              </span>
                            </div>
                            <span className="text-xs opacity-75">
                              {formatTime(participant.minutesStudied)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {challenge.prize && (
                        <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                          <div className="flex items-center gap-2 text-xs">
                            <Trophy className="w-3 h-3 text-neutral-700 dark:text-neutral-300" />
                            <span className="text-neutral-700 dark:text-neutral-300">
                              Prêmio: <span className="font-semibold">{challenge.prize}</span>
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-8 text-center">
              <Trophy className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
              <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1">
                Nenhuma Competição Ativa
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Crie uma competição e desafie seus amigos!
              </p>
            </div>
          )}

          {/* Ranking Geral */}
          {leaderboard.length > 0 && (
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                <Crown className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                Hall da Fama
              </h3>
              <div className="space-y-2">
                {leaderboard.slice(0, 5).map((user: any, idx: number) => (
                  <div
                    key={user.userId}
                    className={`flex items-center justify-between p-3 rounded-lg transition hover:scale-[1.02] ${
                      idx === 0
                        ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                        : idx === 1
                        ? "bg-neutral-800 dark:bg-neutral-100 text-white dark:text-neutral-900"
                        : idx === 2
                        ? "bg-neutral-700 dark:bg-neutral-200 text-white dark:text-neutral-900"
                        : "bg-neutral-50 dark:bg-neutral-800/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-lg font-bold ${idx < 3 ? "drop-shadow-sm" : ""}`}>
                        {getRankEmoji(user.rank)}
                      </span>
                      <div>
                        <div className="text-sm font-semibold">
                          {user.name}
                        </div>
                        <div className={`text-xs ${idx < 3 ? "opacity-75" : "text-neutral-600 dark:text-neutral-400"}`}>
                          {formatTime(user.totalMinutes)}
                        </div>
                      </div>
                    </div>
                    {idx === 0 && <Crown className="w-5 h-5 opacity-75 animate-pulse" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Estatísticas Rápidas */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
              Estatísticas Rápidas
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg text-center border border-neutral-200 dark:border-neutral-700">
                <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {metrics.avgFocusScore.toFixed(1)}
                </div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                  Foco Médio
                </div>
              </div>
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg text-center border border-neutral-200 dark:border-neutral-700">
                <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {data.subjects.length}
                </div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                  Matérias Ativas
                </div>
              </div>
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg text-center border border-neutral-200 dark:border-neutral-700">
                <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {data.achievements.filter((a: Achievement) => a.unlockedAt).length}
                </div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                  Conquistas
                </div>
              </div>
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg text-center border border-neutral-200 dark:border-neutral-700">
                <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {metrics.weekMinutes > 0 ? `${Math.round((metrics.weekMinutes / (7 * 24 * 60)) * 100)}%` : "0%"}
                </div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                  Aproveitamento
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StudyTab({ subjects, selectedSubject, setSelectedSubject, selectedTechnique, setSelectedTechnique, startStudySession, showAddSubject, setShowAddSubject, addSubject, deleteSubject }: any) {
  const [newSubjectName, setNewSubjectName] = useState("")
  const [newSubjectColor, setNewSubjectColor] = useState("blue")

  const selectedTechniqueData = STUDY_TECHNIQUES[selectedTechnique as StudyTechnique]

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <h2 className="text-base font-semibold text-neutral-900 dark:text-white">Iniciar Sessão de Estudo</h2>

      {/* Subject Selection */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Escolha a Matéria</h3>
          <button
            onClick={() => setShowAddSubject(!showAddSubject)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {showAddSubject && (
          <div className="mb-4 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
            <input
              type="text"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              placeholder="Nome da matéria"
              className="w-full px-3 py-2 text-sm mb-2 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-white"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (newSubjectName.trim()) {
                    addSubject(newSubjectName, newSubjectColor)
                    setNewSubjectName("")
                  }
                }}
                className="flex-1 sm:flex-none px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Adicionar
              </button>
              <button
                onClick={() => setShowAddSubject(false)}
                className="flex-1 sm:flex-none px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {subjects.map((subject: Subject) => (
            <div
              key={subject.id}
              className={`p-3 border-2 rounded-lg cursor-pointer transition ${
                selectedSubject === subject.name
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
              }`}
              onClick={() => setSelectedSubject(subject.name)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-neutral-900 dark:text-white">{subject.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteSubject(subject.id)
                  }}
                  className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                {formatTime(subject.totalMinutes)} total
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Technique Selection */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-3 sm:p-4">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">Escolha a Técnica de Estudo</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
          {Object.entries(STUDY_TECHNIQUES).map(([key, tech]) => (
            <button
              key={key}
              onClick={() => setSelectedTechnique(key as StudyTechnique)}
              className={`p-3 border-2 rounded-lg transition text-left ${
                selectedTechnique === key
                  ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                  : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {React.createElement(tech.icon, { className: "w-4 h-4" })}
                <span className="text-sm font-medium text-neutral-900 dark:text-white">{tech.name}</span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">{tech.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Technique Details */}
      {selectedTechniqueData && (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800 p-5">
          <div className="flex items-start gap-3 mb-4">
            {React.createElement(selectedTechniqueData.icon, { className: "w-6 h-6 text-purple-600 dark:text-purple-400 mt-1" })}
            <div className="flex-1">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-1">{selectedTechniqueData.name}</h3>
              <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-3">{selectedTechniqueData.fullDescription}</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Duração Sugerida</span>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{selectedTechniqueData.suggestedDuration}</p>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Melhor Para</span>
                  </div>
                  <ul className="text-xs text-neutral-600 dark:text-neutral-400 space-y-0.5">
                    {selectedTechniqueData.bestFor.map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Lightbulb className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Dicas para Máximo Resultado</span>
                </div>
                <ul className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
                  {selectedTechniqueData.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-purple-600 dark:text-purple-400 mt-0.5">✓</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Start Button */}
      <button
        onClick={() => startStudySession(selectedSubject || "Estudo Livre", selectedTechnique)}
        disabled={!selectedSubject}
        className="w-full p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition flex items-center justify-center gap-2 font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Play className="w-5 h-5" />
        Iniciar Sessão de Estudo
      </button>
    </div>
  )
}

function ChallengesTab({ challenges, currentUserId, showAddChallenge, setShowAddChallenge, createChallenge, deleteChallenge, addParticipantToChallenge }: any) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    goal: "",
    deadline: "",
    prize: "",
  })

  const [newParticipant, setNewParticipant] = useState({ name: "", userId: "" })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.goal || !formData.deadline) return

    createChallenge({
      name: formData.name,
      description: formData.description,
      goal: parseInt(formData.goal),
      deadline: formData.deadline,
      participants: [{ userId: currentUserId, name: "Você", minutesStudied: 0 }],
      prize: formData.prize,
    })

    setFormData({ name: "", description: "", goal: "", deadline: "", prize: "" })
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-neutral-900 dark:text-white">Competições e Desafios</h2>
        <button
          onClick={() => setShowAddChallenge(!showAddChallenge)}
          className="w-full sm:w-auto px-3 py-1.5 text-xs bg-neutral-900 dark:bg-neutral-700 text-white rounded hover:bg-neutral-800 dark:hover:bg-neutral-600 flex items-center justify-center gap-1.5"
        >
          <Plus className="w-3 h-3" />
          Nova Competição
        </button>
      </div>

      {/* Add Challenge Form */}
      {showAddChallenge && (
        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-3 sm:p-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                  Nome da Competição
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-white"
                  placeholder="Ex: Desafio 100h até Dezembro"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                  Meta (minutos)
                </label>
                <input
                  type="number"
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-white"
                  placeholder="6000"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                  Data Limite
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                  Prêmio (opcional)
                </label>
                <input
                  type="text"
                  value={formData.prize}
                  onChange={(e) => setFormData({ ...formData, prize: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-white"
                  placeholder="Ex: Jantar especial"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-white"
                rows={2}
                placeholder="Descreva o desafio..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddChallenge(false)}
                className="px-3 py-1.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 text-sm bg-neutral-900 dark:bg-neutral-700 text-white rounded hover:bg-neutral-800 dark:hover:bg-neutral-600"
              >
                Criar Competição
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Challenges List */}
      {challenges.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-8 text-center">
          <Trophy className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1">Nenhuma Competição</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
            Crie uma competição e desafie seus amigos!
          </p>
          <button
            onClick={() => setShowAddChallenge(true)}
            className="px-4 py-2 bg-neutral-900 dark:bg-neutral-700 text-white rounded text-xs hover:bg-neutral-800 dark:hover:bg-neutral-600 transition"
          >
            Criar Primeira Competição
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {challenges.map((challenge: Challenge) => {
            const daysLeft = Math.ceil((new Date(challenge.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
            const sortedParticipants = [...challenge.participants].sort((a, b) => b.minutesStudied - a.minutesStudied)
            const totalProgress = challenge.participants.reduce((sum, p) => sum + p.minutesStudied, 0)
            const progress = (totalProgress / challenge.goal) * 100

            return (
              <div key={challenge.id} className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                <div className="p-3 sm:p-4 border-b border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">{challenge.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded whitespace-nowrap ${
                          challenge.status === "active" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" :
                          challenge.status === "completed" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" :
                          "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                        }`}>
                          {challenge.status === "active" ? "Ativa" : challenge.status === "completed" ? "Concluída" : "Expirada"}
                        </span>
                      </div>
                      {challenge.description && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">{challenge.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => deleteChallenge(challenge.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-neutral-600 dark:text-neutral-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span className="whitespace-nowrap">{daysLeft} dias restantes</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      <span className="whitespace-nowrap">Meta: {formatTime(challenge.goal)}</span>
                    </div>
                    {challenge.prize && (
                      <div className="flex items-center gap-1">
                        <Trophy className="w-3 h-3" />
                        <span className="truncate">{challenge.prize}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3 sm:p-4">
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-neutral-600 dark:text-neutral-400">Progresso Total</span>
                      <span className="text-xs font-medium text-neutral-900 dark:text-white">
                        {formatTime(totalProgress)} / {formatTime(challenge.goal)}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                      <div
                        className="h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">Ranking</div>
                    {sortedParticipants.map((participant, index) => (
                      <div key={participant.userId} className="flex items-center justify-between gap-2 p-2 bg-neutral-50 dark:bg-neutral-800/50 rounded">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="text-xs font-bold w-6 flex-shrink-0">{getRankEmoji(index + 1)}</span>
                          <span className="text-xs font-medium text-neutral-900 dark:text-white truncate">{participant.name}</span>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                          <span className="text-xs text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                            {formatTime(participant.minutesStudied)}
                          </span>
                          <div className="w-12 sm:w-16 bg-neutral-200 dark:bg-neutral-700 rounded-full h-1.5">
                            <div
                              className="h-1.5 bg-blue-600 rounded-full"
                              style={{ width: `${Math.min((participant.minutesStudied / challenge.goal) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      const name = prompt("Nome do participante:")
                      if (name) {
                        addParticipantToChallenge(challenge.id, {
                          userId: `user-${Date.now()}`,
                          name,
                          minutesStudied: 0,
                        })
                      }
                    }}
                    className="mt-3 w-full px-3 py-1.5 text-xs border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded hover:bg-neutral-50 dark:hover:bg-neutral-800 transition flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3 h-3" />
                    Adicionar Participante
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function StatsTab({ sessions, subjects, metrics }: any) {
  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <h2 className="text-base font-semibold text-neutral-900 dark:text-white">Estatísticas Detalhadas</h2>

      {/* Technique Stats */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-3 sm:p-4">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">Técnicas Mais Usadas</h3>
        <div className="space-y-2">
          {Object.entries(metrics.techniqueStats as Record<StudyTechnique, number>)
            .sort(([, a], [, b]) => (b as number) - (a as number))
            .map(([technique, count]) => (
              <div key={technique} className="flex items-center justify-between p-2 bg-neutral-50 dark:bg-neutral-800/50 rounded">
                <div className="flex items-center gap-2">
                  {React.createElement(STUDY_TECHNIQUES[technique as StudyTechnique].icon, { className: "w-4 h-4" })}
                  <span className="text-sm font-medium text-neutral-900 dark:text-white">
                    {STUDY_TECHNIQUES[technique as StudyTechnique].name}
                  </span>
                </div>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">{count} sessões</span>
              </div>
            ))}
        </div>
      </div>

      {/* Subject Stats */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-3 sm:p-4">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">Tempo por Matéria</h3>
        <div className="space-y-2">
          {subjects
            .sort((a: Subject, b: Subject) => b.totalMinutes - a.totalMinutes)
            .map((subject: Subject) => (
              <div key={subject.id} className="flex items-center justify-between p-2 bg-neutral-50 dark:bg-neutral-800/50 rounded">
                <span className="text-sm font-medium text-neutral-900 dark:text-white">{subject.name}</span>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">{formatTime(subject.totalMinutes)}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-neutral-200 dark:border-neutral-800">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Sessões Recentes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800">
              <tr>
                <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-neutral-700 dark:text-neutral-300">Data</th>
                <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-neutral-700 dark:text-neutral-300">Matéria</th>
                <th className="hidden sm:table-cell px-4 py-2 text-left text-xs font-medium text-neutral-700 dark:text-neutral-300">Técnica</th>
                <th className="px-3 sm:px-4 py-2 text-right text-xs font-medium text-neutral-700 dark:text-neutral-300">Duração</th>
                <th className="hidden md:table-cell px-4 py-2 text-right text-xs font-medium text-neutral-700 dark:text-neutral-300">Foco</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {sessions
                .filter((s: StudySession) => s.completed)
                .sort((a: StudySession, b: StudySession) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                .slice(0, 10)
                .map((session: StudySession) => (
                  <tr key={session.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <td className="px-3 sm:px-4 py-3 text-xs text-neutral-700 dark:text-neutral-300">
                      {new Date(session.startTime).toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit' })}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-xs text-neutral-900 dark:text-white font-medium">
                      {session.subject}
                    </td>
                    <td className="hidden sm:table-cell px-4 py-3 text-xs text-neutral-700 dark:text-neutral-300">
                      {STUDY_TECHNIQUES[session.technique].name}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-xs text-neutral-700 dark:text-neutral-300 text-right">
                      {formatTime(session.durationMinutes)}
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 text-xs text-neutral-700 dark:text-neutral-300 text-right">
                      {session.focusScore ? `${session.focusScore}/10` : "-"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function TipsTab() {
  const [selectedCategory, setSelectedCategory] = useState<"all" | "productivity" | "health" | "memory" | "motivation" | "organization">("all")
  const [expandedTip, setExpandedTip] = useState<string | null>(null)

  const filteredTips = selectedCategory === "all"
    ? STUDY_TIPS
    : STUDY_TIPS.filter(tip => tip.category === selectedCategory)

  const categoryColors: Record<string, string> = {
    productivity: "blue",
    health: "green",
    memory: "purple",
    motivation: "orange",
    organization: "pink"
  }

  const categoryLabels: Record<string, string> = {
    productivity: "Produtividade",
    health: "Saúde",
    memory: "Memória",
    motivation: "Motivação",
    organization: "Organização"
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-base font-semibold text-neutral-900 dark:text-white mb-2">Dicas de Estudo Baseadas em Ciência</h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Técnicas comprovadas por pesquisas em neurociência e psicologia cognitiva para maximizar seu aprendizado
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-3 py-1.5 text-xs rounded-full font-medium transition ${
            selectedCategory === "all"
              ? "bg-neutral-900 dark:bg-neutral-700 text-white"
              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
          }`}
        >
          Todas
        </button>
        {Object.entries(categoryLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key as any)}
            className={`px-3 py-1.5 text-xs rounded-full font-medium transition ${
              selectedCategory === key
                ? "bg-neutral-900 dark:bg-neutral-700 text-white"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tips Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredTips.map((tip) => {
          const isExpanded = expandedTip === tip.id
          const categoryColor = categoryColors[tip.category]

          return (
            <div
              key={tip.id}
              className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden"
            >
              <button
                onClick={() => setExpandedTip(isExpanded ? null : tip.id)}
                className="w-full p-3 sm:p-4 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition"
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  <span className="text-2xl sm:text-3xl flex-shrink-0">{tip.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">{tip.title}</h3>
                      <span className={`text-xs px-2 py-0.5 bg-${categoryColor}-100 dark:bg-${categoryColor}-900/30 text-${categoryColor}-700 dark:text-${categoryColor}-300 rounded whitespace-nowrap`}>
                        {categoryLabels[tip.category]}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">{tip.description}</p>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-neutral-400 transition-transform flex-shrink-0 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>

              {isExpanded && (
                <div className="px-3 sm:px-4 pb-3 sm:pb-4 border-t border-neutral-200 dark:border-neutral-800 pt-3 sm:pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      Como Aplicar (Passo a Passo)
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {tip.actionable.map((action, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-bold mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="flex-1">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function GoalsTab({ goals, addGoal, deleteGoal }: any) {
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    type: "daily" as "daily" | "weekly" | "monthly" | "custom",
    targetHours: "",
    deadline: "",
  })

  const goalTypeInfo: Record<string, { label: string; icon: any; suggestion: string }> = {
    daily: { label: "Meta Diária", icon: Target, suggestion: "1-3h por dia" },
    weekly: { label: "Meta Semanal", icon: Calendar, suggestion: "10-20h por semana" },
    monthly: { label: "Meta Mensal", icon: TrendingUp, suggestion: "40-80h por mês" },
    custom: { label: "Meta Personalizada", icon: Star, suggestion: "Defina seu próprio objetivo" },
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.targetHours) return

    addGoal({
      name: formData.name,
      type: formData.type,
      targetHours: parseFloat(formData.targetHours),
      deadline: formData.deadline || undefined,
      icon: formData.type === "daily" ? "🎯" : formData.type === "weekly" ? "📅" : formData.type === "monthly" ? "📊" : "⭐"
    })

    setFormData({ name: "", type: "daily", targetHours: "", deadline: "" })
    setShowAddGoal(false)
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-neutral-900 dark:text-white">Metas de Estudo</h2>
        <button
          onClick={() => setShowAddGoal(!showAddGoal)}
          className="w-full sm:w-auto px-3 py-1.5 text-xs bg-neutral-900 dark:bg-neutral-700 text-white rounded hover:bg-neutral-800 dark:hover:bg-neutral-600 flex items-center justify-center gap-1.5"
        >
          <Plus className="w-3 h-3" />
          Nova Meta
        </button>
      </div>

      {showAddGoal && (
        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-3 sm:p-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                  Nome da Meta
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                  Tipo
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-white"
                >
                  <option value="daily">Diária</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensal</option>
                  <option value="custom">Personalizada</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                  Meta (horas) {goalTypeInfo[formData.type] && <span className="text-neutral-500">- {goalTypeInfo[formData.type].suggestion}</span>}
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={formData.targetHours}
                  onChange={(e) => setFormData({ ...formData, targetHours: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-white"
                  placeholder="Ex: 2.5"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                  Prazo (opcional)
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-white"
                />
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

      {goals.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-8 text-center">
          <Target className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Nenhuma meta definida</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {goals.map((goal: StudyGoal) => {
            const targetMinutes = goal.targetHours * 60
            const progress = (goal.currentMinutes / targetMinutes) * 100
            const currentHours = goal.currentMinutes / 60
            const percentComplete = Math.min(Math.round(progress), 100)

            return (
              <div key={goal.id} className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {goal.icon && <span className="text-lg">{goal.icon}</span>}
                      <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">{goal.name}</h3>
                    </div>
                    <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                      {goal.type === "daily" ? "Diária" : goal.type === "weekly" ? "Semanal" : goal.type === "monthly" ? "Mensal" : "Personalizada"}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-neutral-600 dark:text-neutral-400">Progresso</span>
                    <span className="font-bold text-neutral-900 dark:text-white">
                      {currentHours.toFixed(1)}h / {goal.targetHours}h ({percentComplete}%)
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        progress >= 100
                          ? "bg-gradient-to-r from-green-600 to-emerald-600"
                          : progress >= 75
                          ? "bg-gradient-to-r from-blue-600 to-cyan-600"
                          : progress >= 50
                          ? "bg-gradient-to-r from-yellow-600 to-orange-600"
                          : "bg-gradient-to-r from-red-600 to-pink-600"
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  {goal.deadline && (
                    <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                      <Calendar className="w-3 h-3" />
                      {new Date(goal.deadline).toLocaleDateString("pt-BR")}
                    </div>
                  )}
                  {progress >= 100 && (
                    <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-semibold">
                      <CheckCircle className="w-3 h-3" />
                      Concluída!
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function AchievementsTab({ achievements, sessions }: any) {
  const updatedAchievements = achievements.map((achievement: Achievement) => {
    let progress = achievement.progress

    switch (achievement.id) {
      case "first-session":
        progress = sessions.filter((s: StudySession) => s.completed).length > 0 ? 1 : 0
        break
      case "streak-7":
        progress = calculateStreak(sessions.filter((s: StudySession) => s.completed))
        break
      case "streak-30":
        progress = calculateStreak(sessions.filter((s: StudySession) => s.completed))
        break
      case "hours-10":
      case "hours-50":
      case "hours-100":
        progress = sessions.filter((s: StudySession) => s.completed).reduce((sum: number, s: StudySession) => sum + s.durationMinutes, 0)
        break
      case "pomodoro-master":
        progress = sessions.filter((s: StudySession) => s.completed && s.technique === "pomodoro").length
        break
      case "deep-work-expert":
        progress = sessions.filter((s: StudySession) => s.completed && s.technique === "deep-work").length
        break
    }

    const unlocked = progress >= achievement.target
    return { ...achievement, progress, unlockedAt: unlocked && !achievement.unlockedAt ? new Date().toISOString() : achievement.unlockedAt }
  })

  const unlockedCount = updatedAchievements.filter((a: Achievement) => a.unlockedAt).length

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-neutral-900 dark:text-white">Conquistas</h2>
        <span className="text-sm text-neutral-600 dark:text-neutral-400">
          {unlockedCount} / {achievements.length} desbloqueadas
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {updatedAchievements.map((achievement: Achievement) => {
          const progress = (achievement.progress / achievement.target) * 100
          const unlocked = achievement.progress >= achievement.target

          return (
            <div
              key={achievement.id}
              className={`p-3 sm:p-4 rounded-lg border-2 transition ${
                unlocked
                  ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
                  : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
              }`}
            >
              <div className="text-center mb-3">
                <div className={`text-4xl mb-2 ${unlocked ? "" : "grayscale opacity-50"}`}>
                  {achievement.icon}
                </div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1">
                  {achievement.name}
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  {achievement.description}
                </p>
              </div>

              <div className="mb-2">
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      unlocked ? "bg-amber-500" : "bg-neutral-400 dark:bg-neutral-600"
                    }`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>

              <div className="text-xs text-center text-neutral-600 dark:text-neutral-400">
                {achievement.progress} / {achievement.target}
              </div>

              {unlocked && achievement.unlockedAt && (
                <div className="text-xs text-center text-amber-600 dark:text-amber-400 mt-2">
                  Desbloqueado em {new Date(achievement.unlockedAt).toLocaleDateString("pt-BR")}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ActiveSessionTab({ activeSession, sessionTimer, endStudySession }: {
  activeSession: StudySession
  sessionTimer: number
  endStudySession: (focusScore?: number) => void
}) {
  const [focusScore, setFocusScore] = useState<number>(7)
  const [notes, setNotes] = useState("")

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 sm:p-6 text-center">
        <div className="mb-6">
          <div className="text-4xl sm:text-6xl font-mono font-bold text-neutral-900 dark:text-white mb-2">
            {formatTimerDisplay(sessionTimer)}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">Estudando:</span>
            <span className="text-sm font-medium text-neutral-900 dark:text-white">{activeSession.subject}</span>
            <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded whitespace-nowrap">
              {STUDY_TECHNIQUES[activeSession.technique as StudyTechnique].name}
            </span>
          </div>
        </div>

        <div className="space-y-4 max-w-md mx-auto">
          <div>
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-2">
              Como foi seu foco? (1-10)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="10"
                value={focusScore}
                onChange={(e) => setFocusScore(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-lg font-bold text-neutral-900 dark:text-white w-8">{focusScore}</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-2">
              Notas (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-white"
              rows={3}
              placeholder="O que você estudou?"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <button
            onClick={() => endStudySession(focusScore)}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition font-semibold flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Finalizar Sessão
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== UTILITY COMPONENTS ====================

function KPICard({ label, value, icon: Icon, color, subtext }: any) {
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
      <div className="text-xs text-neutral-500 dark:text-neutral-400">
        {subtext}
      </div>
    </div>
  )
}
