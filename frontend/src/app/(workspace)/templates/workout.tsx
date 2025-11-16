"use client"

import { useState, useMemo } from "react"
import { usePageTemplateData } from "@/core/hooks/usePageTemplateData"
import { WorkspaceTemplateComponentProps } from "@/core/types/workspace.types"
import {
  Plus, Trash2, X, Save, Dumbbell, Activity, Calendar, TrendingUp, Target,
  Clock, Play, CheckCircle, Edit2, BarChart3, Flame, Trophy,
  ChevronDown, ChevronUp, Download, Weight, Ruler, ArrowUp, ArrowDown,
  Filter, Star, Copy, RotateCcw, Timer, Zap, Heart, Menu, Info, Award,
  Settings, FileText, Percent, Users, TrendingDown, CheckCircle2
} from "lucide-react"
import ExcelJS from "exceljs"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

// ==================== TYPES ====================

type MuscleGroup = "chest" | "back" | "shoulders" | "biceps" | "triceps" | "legs" | "glutes" | "abs" | "cardio" | "full-body"
type Difficulty = "beginner" | "intermediate" | "advanced"
type WorkoutGoalType = "muscle-gain" | "strength" | "endurance" | "weight-loss" | "general-fitness"

type ExerciseLibraryItem = {
  id: string
  name: string
  muscleGroup: MuscleGroup
  difficulty: Difficulty
  equipment: string[]
  instructions?: string
}

type ExerciseSet = {
  id: string
  setNumber: number
  reps?: number
  weight?: number
  rest: number
  completed: boolean
  rpe?: number // Rate of Perceived Exertion (1-10)
}

type WorkoutExercise = {
  id: string
  exerciseId: string
  exerciseName: string
  muscleGroup: MuscleGroup
  sets: ExerciseSet[]
  notes?: string
  personalRecord?: number
}

type DayWorkout = {
  id: string
  dayName: string
  dayNumber: number
  focus: MuscleGroup[]
  exercises: WorkoutExercise[]
  completed: boolean
  lastCompleted?: string
}

type WeeklyPlan = {
  id: string
  name: string
  description: string
  difficulty: Difficulty
  goal: WorkoutGoalType
  weeks: number
  type: "abc" | "abcd" | "abcde" | "ppl" | "upper-lower" | "full-body" | "custom"
  days: DayWorkout[]
  active: boolean
  createdAt: string
}

type WorkoutSession = {
  id: string
  planId: string
  dayId: string
  date: string
  exercises: WorkoutExercise[]
  duration?: number
  totalVolume?: number
  avgRPE?: number
  completed: boolean
}

type BodyMeasurement = {
  id: string
  date: string
  weight?: number
  bodyFat?: number
  muscleMass?: number
  chest?: number
  waist?: number
  biceps?: number
  thighs?: number
}

type PersonalRecord = {
  id: string
  exerciseId: string
  exerciseName: string
  weight: number
  reps: number
  date: string
  oneRepMax: number
}

type WorkoutTemplateData = {
  weeklyPlans: WeeklyPlan[]
  sessions: WorkoutSession[]
  measurements: BodyMeasurement[]
  personalRecords: PersonalRecord[]
  activePlanId: string | null
  currentGoal: WorkoutGoalType
}

// ==================== EXERCISE LIBRARY ====================

const EXERCISE_LIBRARY: ExerciseLibraryItem[] = [
  // PEITO
  { id: "bench-press", name: "Supino Reto", muscleGroup: "chest", difficulty: "intermediate", equipment: ["barbell", "bench"] },
  { id: "incline-bench", name: "Supino Inclinado", muscleGroup: "chest", difficulty: "intermediate", equipment: ["barbell"] },
  { id: "decline-bench", name: "Supino Declinado", muscleGroup: "chest", difficulty: "intermediate", equipment: ["barbell"] },
  { id: "dumbbell-press", name: "Supino com Halteres", muscleGroup: "chest", difficulty: "beginner", equipment: ["dumbbells"] },
  { id: "chest-fly", name: "Crucifixo Reto", muscleGroup: "chest", difficulty: "beginner", equipment: ["dumbbells"] },
  { id: "incline-fly", name: "Crucifixo Inclinado", muscleGroup: "chest", difficulty: "beginner", equipment: ["dumbbells"] },
  { id: "cable-fly", name: "Crucifixo no Cabo", muscleGroup: "chest", difficulty: "intermediate", equipment: ["cable"] },
  { id: "push-up", name: "Flexão de Braço", muscleGroup: "chest", difficulty: "beginner", equipment: ["bodyweight"] },
  { id: "dips-chest", name: "Paralelas (Peito)", muscleGroup: "chest", difficulty: "intermediate", equipment: ["dip-bar"] },
  { id: "pec-deck", name: "Peck Deck", muscleGroup: "chest", difficulty: "beginner", equipment: ["machine"] },

  // COSTAS
  { id: "deadlift", name: "Levantamento Terra", muscleGroup: "back", difficulty: "advanced", equipment: ["barbell"] },
  { id: "pull-up", name: "Barra Fixa", muscleGroup: "back", difficulty: "intermediate", equipment: ["pull-up-bar"] },
  { id: "lat-pulldown", name: "Puxada Frontal", muscleGroup: "back", difficulty: "beginner", equipment: ["cable"] },
  { id: "barbell-row", name: "Remada Curvada", muscleGroup: "back", difficulty: "intermediate", equipment: ["barbell"] },
  { id: "dumbbell-row", name: "Remada Unilateral", muscleGroup: "back", difficulty: "beginner", equipment: ["dumbbell"] },
  { id: "seated-row", name: "Remada Sentada", muscleGroup: "back", difficulty: "beginner", equipment: ["cable"] },
  { id: "t-bar-row", name: "Remada T-Bar", muscleGroup: "back", difficulty: "intermediate", equipment: ["t-bar"] },
  { id: "face-pull", name: "Face Pull", muscleGroup: "back", difficulty: "beginner", equipment: ["cable"] },

  // OMBROS
  { id: "overhead-press", name: "Desenvolvimento com Barra", muscleGroup: "shoulders", difficulty: "intermediate", equipment: ["barbell"] },
  { id: "dumbbell-shoulder-press", name: "Desenvolvimento com Halteres", muscleGroup: "shoulders", difficulty: "beginner", equipment: ["dumbbells"] },
  { id: "lateral-raise", name: "Elevação Lateral", muscleGroup: "shoulders", difficulty: "beginner", equipment: ["dumbbells"] },
  { id: "front-raise", name: "Elevação Frontal", muscleGroup: "shoulders", difficulty: "beginner", equipment: ["dumbbells"] },
  { id: "rear-delt-fly", name: "Elevação Posterior", muscleGroup: "shoulders", difficulty: "beginner", equipment: ["dumbbells"] },
  { id: "arnold-press", name: "Desenvolvimento Arnold", muscleGroup: "shoulders", difficulty: "intermediate", equipment: ["dumbbells"] },
  { id: "upright-row", name: "Remada Alta", muscleGroup: "shoulders", difficulty: "intermediate", equipment: ["barbell"] },

  // BÍCEPS
  { id: "barbell-curl", name: "Rosca Direta", muscleGroup: "biceps", difficulty: "beginner", equipment: ["barbell"] },
  { id: "dumbbell-curl", name: "Rosca Alternada", muscleGroup: "biceps", difficulty: "beginner", equipment: ["dumbbells"] },
  { id: "hammer-curl", name: "Rosca Martelo", muscleGroup: "biceps", difficulty: "beginner", equipment: ["dumbbells"] },
  { id: "concentration-curl", name: "Rosca Concentrada", muscleGroup: "biceps", difficulty: "beginner", equipment: ["dumbbell"] },
  { id: "preacher-curl", name: "Rosca Scott", muscleGroup: "biceps", difficulty: "beginner", equipment: ["barbell"] },
  { id: "cable-curl", name: "Rosca no Cabo", muscleGroup: "biceps", difficulty: "beginner", equipment: ["cable"] },

  // TRÍCEPS
  { id: "close-grip-bench", name: "Supino Fechado", muscleGroup: "triceps", difficulty: "intermediate", equipment: ["barbell"] },
  { id: "skull-crusher", name: "Tríceps Testa", muscleGroup: "triceps", difficulty: "intermediate", equipment: ["barbell"] },
  { id: "tricep-dips", name: "Paralelas (Tríceps)", muscleGroup: "triceps", difficulty: "intermediate", equipment: ["dip-bar"] },
  { id: "tricep-pushdown", name: "Tríceps Pulley", muscleGroup: "triceps", difficulty: "beginner", equipment: ["cable"] },
  { id: "overhead-extension", name: "Tríceps Francês", muscleGroup: "triceps", difficulty: "beginner", equipment: ["dumbbell"] },

  // PERNAS
  { id: "squat", name: "Agachamento Livre", muscleGroup: "legs", difficulty: "intermediate", equipment: ["barbell"] },
  { id: "leg-press", name: "Leg Press", muscleGroup: "legs", difficulty: "beginner", equipment: ["machine"] },
  { id: "leg-extension", name: "Cadeira Extensora", muscleGroup: "legs", difficulty: "beginner", equipment: ["machine"] },
  { id: "leg-curl", name: "Cadeira Flexora", muscleGroup: "legs", difficulty: "beginner", equipment: ["machine"] },
  { id: "lunges", name: "Afundo", muscleGroup: "legs", difficulty: "beginner", equipment: ["dumbbells"] },
  { id: "bulgarian-split", name: "Agachamento Búlgaro", muscleGroup: "legs", difficulty: "intermediate", equipment: ["dumbbells"] },
  { id: "calf-raise", name: "Panturrilha em Pé", muscleGroup: "legs", difficulty: "beginner", equipment: ["machine"] },

  // GLÚTEOS
  { id: "hip-thrust", name: "Hip Thrust", muscleGroup: "glutes", difficulty: "intermediate", equipment: ["barbell"] },
  { id: "glute-bridge", name: "Ponte de Glúteo", muscleGroup: "glutes", difficulty: "beginner", equipment: ["bodyweight"] },
  { id: "cable-kickback", name: "Kickback no Cabo", muscleGroup: "glutes", difficulty: "beginner", equipment: ["cable"] },

  // ABDÔMEN
  { id: "crunch", name: "Abdominal Tradicional", muscleGroup: "abs", difficulty: "beginner", equipment: ["bodyweight"] },
  { id: "plank", name: "Prancha", muscleGroup: "abs", difficulty: "beginner", equipment: ["bodyweight"] },
  { id: "leg-raise", name: "Elevação de Pernas", muscleGroup: "abs", difficulty: "intermediate", equipment: ["bodyweight"] },
  { id: "russian-twist", name: "Russian Twist", muscleGroup: "abs", difficulty: "intermediate", equipment: ["medicine-ball"] },
  { id: "ab-wheel", name: "Roda Abdominal", muscleGroup: "abs", difficulty: "advanced", equipment: ["ab-wheel"] },
]

const MUSCLE_GROUPS = [
  { id: "chest" as MuscleGroup, name: "Peito", color: "blue" },
  { id: "back" as MuscleGroup, name: "Costas", color: "green" },
  { id: "shoulders" as MuscleGroup, name: "Ombros", color: "purple" },
  { id: "biceps" as MuscleGroup, name: "Bíceps", color: "pink" },
  { id: "triceps" as MuscleGroup, name: "Tríceps", color: "orange" },
  { id: "legs" as MuscleGroup, name: "Pernas", color: "red" },
  { id: "glutes" as MuscleGroup, name: "Glúteos", color: "yellow" },
  { id: "abs" as MuscleGroup, name: "Abdômen", color: "cyan" },
]

// Templates por dificuldade
const WORKOUT_TEMPLATES = [
  // INICIANTE
  {
    name: "Iniciante - Full Body A",
    difficulty: "beginner" as Difficulty,
    goal: "general-fitness" as WorkoutGoalType,
    description: "3x por semana - Corpo todo em cada treino",
    weeks: 8,
    type: "full-body" as const,
    days: [
      {
        name: "Full Body A",
        focus: ["chest" as MuscleGroup, "back" as MuscleGroup, "legs" as MuscleGroup],
        dayNumber: 1,
        exercises: ["bench-press", "lat-pulldown", "squat", "dumbbell-shoulder-press", "leg-curl", "plank"]
      },
      {
        name: "Full Body B",
        focus: ["chest" as MuscleGroup, "back" as MuscleGroup, "legs" as MuscleGroup],
        dayNumber: 3,
        exercises: ["dumbbell-press", "seated-row", "leg-press", "lateral-raise", "leg-extension", "crunch"]
      },
      {
        name: "Full Body C",
        focus: ["chest" as MuscleGroup, "back" as MuscleGroup, "legs" as MuscleGroup],
        dayNumber: 5,
        exercises: ["push-up", "dumbbell-row", "lunges", "front-raise", "calf-raise", "russian-twist"]
      },
    ]
  },
  {
    name: "Iniciante - ABC",
    difficulty: "beginner" as Difficulty,
    goal: "muscle-gain" as WorkoutGoalType,
    description: "3x por semana - Divisão básica",
    weeks: 10,
    type: "abc" as const,
    days: [
      {
        name: "Treino A - Peito/Tríceps",
        focus: ["chest" as MuscleGroup, "triceps" as MuscleGroup],
        dayNumber: 1,
        exercises: ["bench-press", "incline-bench", "chest-fly", "tricep-pushdown", "overhead-extension"]
      },
      {
        name: "Treino B - Costas/Bíceps",
        focus: ["back" as MuscleGroup, "biceps" as MuscleGroup],
        dayNumber: 3,
        exercises: ["lat-pulldown", "seated-row", "dumbbell-row", "barbell-curl", "hammer-curl"]
      },
      {
        name: "Treino C - Pernas/Ombros",
        focus: ["legs" as MuscleGroup, "shoulders" as MuscleGroup, "abs" as MuscleGroup],
        dayNumber: 5,
        exercises: ["squat", "leg-press", "leg-curl", "dumbbell-shoulder-press", "lateral-raise", "plank"]
      },
    ]
  },

  // INTERMEDIÁRIO
  {
    name: "Intermediário - ABCD",
    difficulty: "intermediate" as Difficulty,
    goal: "muscle-gain" as WorkoutGoalType,
    description: "4x por semana - Volume moderado",
    weeks: 12,
    type: "abcd" as const,
    days: [
      {
        name: "Treino A - Peito/Tríceps",
        focus: ["chest" as MuscleGroup, "triceps" as MuscleGroup],
        dayNumber: 1,
        exercises: ["bench-press", "incline-bench", "cable-fly", "dips-chest", "close-grip-bench", "tricep-pushdown"]
      },
      {
        name: "Treino B - Costas/Bíceps",
        focus: ["back" as MuscleGroup, "biceps" as MuscleGroup],
        dayNumber: 2,
        exercises: ["pull-up", "barbell-row", "lat-pulldown", "seated-row", "barbell-curl", "hammer-curl", "concentration-curl"]
      },
      {
        name: "Treino C - Pernas",
        focus: ["legs" as MuscleGroup, "glutes" as MuscleGroup],
        dayNumber: 4,
        exercises: ["squat", "leg-press", "leg-extension", "leg-curl", "hip-thrust", "calf-raise"]
      },
      {
        name: "Treino D - Ombros/Abs",
        focus: ["shoulders" as MuscleGroup, "abs" as MuscleGroup],
        dayNumber: 5,
        exercises: ["overhead-press", "dumbbell-shoulder-press", "lateral-raise", "rear-delt-fly", "plank", "leg-raise", "russian-twist"]
      },
    ]
  },
  {
    name: "Intermediário - Upper/Lower",
    difficulty: "intermediate" as Difficulty,
    goal: "strength" as WorkoutGoalType,
    description: "4x por semana - Foco em força",
    weeks: 12,
    type: "upper-lower" as const,
    days: [
      {
        name: "Upper A - Push Focus",
        focus: ["chest" as MuscleGroup, "shoulders" as MuscleGroup, "triceps" as MuscleGroup],
        dayNumber: 1,
        exercises: ["bench-press", "overhead-press", "incline-bench", "lateral-raise", "tricep-dips", "tricep-pushdown"]
      },
      {
        name: "Lower A - Squat Focus",
        focus: ["legs" as MuscleGroup, "glutes" as MuscleGroup],
        dayNumber: 2,
        exercises: ["squat", "leg-press", "leg-curl", "hip-thrust", "calf-raise"]
      },
      {
        name: "Upper B - Pull Focus",
        focus: ["back" as MuscleGroup, "biceps" as MuscleGroup],
        dayNumber: 4,
        exercises: ["pull-up", "barbell-row", "lat-pulldown", "face-pull", "barbell-curl", "hammer-curl"]
      },
      {
        name: "Lower B - Deadlift Focus",
        focus: ["legs" as MuscleGroup, "glutes" as MuscleGroup, "abs" as MuscleGroup],
        dayNumber: 5,
        exercises: ["deadlift", "bulgarian-split", "leg-extension", "glute-bridge", "plank", "leg-raise"]
      },
    ]
  },

  // AVANÇADO
  {
    name: "Avançado - PPL 6x",
    difficulty: "advanced" as Difficulty,
    goal: "muscle-gain" as WorkoutGoalType,
    description: "6x por semana - Alto volume",
    weeks: 16,
    type: "ppl" as const,
    days: [
      {
        name: "Push A",
        focus: ["chest" as MuscleGroup, "shoulders" as MuscleGroup, "triceps" as MuscleGroup],
        dayNumber: 1,
        exercises: ["bench-press", "overhead-press", "incline-bench", "dumbbell-shoulder-press", "cable-fly", "lateral-raise", "tricep-dips", "overhead-extension"]
      },
      {
        name: "Pull A",
        focus: ["back" as MuscleGroup, "biceps" as MuscleGroup],
        dayNumber: 2,
        exercises: ["deadlift", "pull-up", "barbell-row", "lat-pulldown", "face-pull", "barbell-curl", "hammer-curl", "concentration-curl"]
      },
      {
        name: "Legs A",
        focus: ["legs" as MuscleGroup, "glutes" as MuscleGroup, "abs" as MuscleGroup],
        dayNumber: 3,
        exercises: ["squat", "leg-press", "leg-extension", "leg-curl", "hip-thrust", "calf-raise", "plank", "leg-raise"]
      },
      {
        name: "Push B",
        focus: ["chest" as MuscleGroup, "shoulders" as MuscleGroup, "triceps" as MuscleGroup],
        dayNumber: 4,
        exercises: ["incline-bench", "dumbbell-press", "cable-fly", "arnold-press", "lateral-raise", "rear-delt-fly", "close-grip-bench", "tricep-pushdown"]
      },
      {
        name: "Pull B",
        focus: ["back" as MuscleGroup, "biceps" as MuscleGroup],
        dayNumber: 5,
        exercises: ["t-bar-row", "pull-up", "seated-row", "dumbbell-row", "lat-pulldown", "preacher-curl", "cable-curl", "hammer-curl"]
      },
      {
        name: "Legs B",
        focus: ["legs" as MuscleGroup, "glutes" as MuscleGroup, "abs" as MuscleGroup],
        dayNumber: 6,
        exercises: ["deadlift", "bulgarian-split", "leg-extension", "leg-curl", "glute-bridge", "calf-raise", "russian-twist", "ab-wheel"]
      },
    ]
  },
  {
    name: "Avançado - ABCDE",
    difficulty: "advanced" as Difficulty,
    goal: "strength" as WorkoutGoalType,
    description: "5x por semana - Periodização",
    weeks: 16,
    type: "abcde" as const,
    days: [
      {
        name: "Treino A - Peito",
        focus: ["chest" as MuscleGroup],
        dayNumber: 1,
        exercises: ["bench-press", "incline-bench", "decline-bench", "dumbbell-press", "cable-fly", "chest-fly", "dips-chest"]
      },
      {
        name: "Treino B - Costas",
        focus: ["back" as MuscleGroup],
        dayNumber: 2,
        exercises: ["deadlift", "pull-up", "barbell-row", "t-bar-row", "lat-pulldown", "seated-row", "dumbbell-row", "face-pull"]
      },
      {
        name: "Treino C - Pernas",
        focus: ["legs" as MuscleGroup, "glutes" as MuscleGroup],
        dayNumber: 3,
        exercises: ["squat", "leg-press", "leg-extension", "leg-curl", "lunges", "hip-thrust", "bulgarian-split", "calf-raise"]
      },
      {
        name: "Treino D - Ombros/Abs",
        focus: ["shoulders" as MuscleGroup, "abs" as MuscleGroup],
        dayNumber: 4,
        exercises: ["overhead-press", "dumbbell-shoulder-press", "arnold-press", "lateral-raise", "front-raise", "rear-delt-fly", "plank", "leg-raise", "russian-twist"]
      },
      {
        name: "Treino E - Braços",
        focus: ["biceps" as MuscleGroup, "triceps" as MuscleGroup],
        dayNumber: 5,
        exercises: ["barbell-curl", "preacher-curl", "hammer-curl", "concentration-curl", "close-grip-bench", "skull-crusher", "tricep-dips", "tricep-pushdown", "overhead-extension"]
      },
    ]
  },
]

const DEFAULT_DATA: WorkoutTemplateData = {
  weeklyPlans: [],
  sessions: [],
  measurements: [],
  personalRecords: [],
  activePlanId: null,
  currentGoal: "general-fitness",
}

// ==================== UTILITY FUNCTIONS ====================

const calculate1RM = (weight: number, reps: number): number => {
  // Fórmula de Brzycki: 1RM = weight / (1.0278 - 0.0278 * reps)
  if (reps === 1) return weight
  return Math.round(weight / (1.0278 - 0.0278 * reps))
}

const getDifficultyColor = (difficulty: Difficulty) => {
  switch (difficulty) {
    case "beginner": return "green"
    case "intermediate": return "blue"
    case "advanced": return "red"
  }
}

const getDifficultyLabel = (difficulty: Difficulty) => {
  switch (difficulty) {
    case "beginner": return "Iniciante"
    case "intermediate": return "Intermediário"
    case "advanced": return "Avançado"
  }
}

// ==================== MAIN COMPONENT ====================

export default function WorkoutTemplate({ groupId, pageId }: WorkspaceTemplateComponentProps) {
  const { data, setData } = usePageTemplateData<WorkoutTemplateData>(groupId, pageId, DEFAULT_DATA)

  const [activeTab, setActiveTab] = useState<"dashboard" | "workout" | "plans" | "exercises" | "history" | "progress" | "tools">("dashboard")
  const [selectedDay, setSelectedDay] = useState<DayWorkout | null>(null)
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutExercise[]>([])
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [showExerciseModal, setShowExerciseModal] = useState(false)
  const [selectedDayForExercise, setSelectedDayForExercise] = useState<DayWorkout | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | "all">("all")
  const [workoutTimer, setWorkoutTimer] = useState<number>(0)
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null)

  const activePlan = useMemo(() => {
    const plans = data.weeklyPlans || []
    return plans.find(p => p.id === data.activePlanId) || null
  }, [data.weeklyPlans, data.activePlanId])

  const todayWorkout = useMemo(() => {
    if (!activePlan) return null
    const today = new Date().getDay()
    return activePlan.days.find(d => d.dayNumber === today) || null
  }, [activePlan])

  const metrics = useMemo(() => {
    const sessions = data.sessions || []
    const completedSessions = sessions.filter(s => s.completed)

    const thisWeek = completedSessions.filter(s => {
      const sessionDate = new Date(s.date)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return sessionDate >= weekAgo
    })

    const thisMonth = completedSessions.filter(s => {
      const sessionDate = new Date(s.date)
      const monthAgo = new Date()
      monthAgo.setDate(monthAgo.getDate() - 30)
      return sessionDate >= monthAgo
    })

    const totalVolume = completedSessions.reduce((sum, s) => sum + (s.totalVolume || 0), 0)
    const avgVolume = completedSessions.length > 0 ? totalVolume / completedSessions.length : 0

    const totalDuration = completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0)
    const avgDuration = completedSessions.length > 0 ? totalDuration / completedSessions.length : 0

    const latestMeasurement = [...(data.measurements || [])].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0]

    const personalRecords = data.personalRecords?.length || 0

    return {
      totalWorkouts: completedSessions.length,
      thisWeekWorkouts: thisWeek.length,
      thisMonthWorkouts: thisMonth.length,
      totalVolume,
      avgVolume,
      avgDuration,
      currentWeight: latestMeasurement?.weight || 0,
      personalRecords,
      activePlanName: activePlan?.name || "Nenhum",
    }
  }, [data, activePlan])

  // ==================== HANDLERS ====================

  const createPlanFromTemplate = (template: typeof WORKOUT_TEMPLATES[0]) => {
    const existingPlans = data.weeklyPlans || []

    const newPlan: WeeklyPlan = {
      id: `plan-${Date.now()}`,
      name: template.name,
      description: template.description,
      difficulty: template.difficulty,
      goal: template.goal,
      weeks: template.weeks,
      type: template.type,
      active: existingPlans.length === 0,
      createdAt: new Date().toISOString(),
      days: template.days.map((day, idx) => ({
        id: `day-${Date.now()}-${idx}`,
        dayName: day.name,
        dayNumber: day.dayNumber,
        focus: day.focus,
        exercises: day.exercises.map((exId, exIdx) => {
          const exercise = EXERCISE_LIBRARY.find(e => e.id === exId)
          if (!exercise) return null

          return {
            id: `ex-${Date.now()}-${idx}-${exIdx}`,
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            muscleGroup: exercise.muscleGroup,
            sets: Array.from({ length: template.difficulty === "beginner" ? 3 : template.difficulty === "intermediate" ? 4 : 4 }, (_, i) => ({
              id: `set-${Date.now()}-${idx}-${exIdx}-${i}`,
              setNumber: i + 1,
              reps: template.goal === "strength" ? 5 : template.goal === "endurance" ? 15 : 10,
              weight: 0,
              rest: template.difficulty === "beginner" ? 60 : 90,
              completed: false,
            }))
          }
        }).filter(Boolean) as WorkoutExercise[],
        completed: false,
      }))
    }

    setData(prev => ({
      ...prev,
      weeklyPlans: [...(prev.weeklyPlans || []), newPlan],
      activePlanId: prev.activePlanId || newPlan.id,
    }))

    setShowPlanModal(false)
  }

  const deletePlan = (planId: string) => {
    setData(prev => ({
      ...prev,
      weeklyPlans: (prev.weeklyPlans || []).filter(p => p.id !== planId),
      activePlanId: prev.activePlanId === planId ? null : prev.activePlanId,
    }))
  }

  const setActivePlan = (planId: string) => {
    setData(prev => ({ ...prev, activePlanId: planId }))
  }

  const addExerciseToDay = (dayId: string, exercise: ExerciseLibraryItem) => {
    if (!activePlan) return

    const newExercise: WorkoutExercise = {
      id: `ex-${Date.now()}`,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      muscleGroup: exercise.muscleGroup,
      sets: Array.from({ length: 3 }, (_, i) => ({
        id: `set-${Date.now()}-${i}`,
        setNumber: i + 1,
        reps: 10,
        weight: 0,
        rest: 90,
        completed: false,
      }))
    }

    setData(prev => ({
      ...prev,
      weeklyPlans: (prev.weeklyPlans || []).map(plan =>
        plan.id === activePlan.id
          ? {
              ...plan,
              days: plan.days.map(day =>
                day.id === dayId
                  ? { ...day, exercises: [...day.exercises, newExercise] }
                  : day
              )
            }
          : plan
      )
    }))
  }

  const startWorkout = (day: DayWorkout) => {
    setSelectedDay(day)
    setCurrentWorkout(JSON.parse(JSON.stringify(day.exercises)))
    setWorkoutTimer(0)

    const interval = setInterval(() => {
      setWorkoutTimer(prev => prev + 1)
    }, 1000)
    setTimerInterval(interval)
  }

  const completeSet = (exerciseId: string, setId: string) => {
    setCurrentWorkout(prev =>
      prev.map(ex =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map(set =>
                set.id === setId
                  ? { ...set, completed: !set.completed }
                  : set
              )
            }
          : ex
      )
    )
  }

  const updateSetValue = (exerciseId: string, setId: string, field: 'weight' | 'reps' | 'rpe', value: number) => {
    setCurrentWorkout(prev =>
      prev.map(ex =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map(set =>
                set.id === setId
                  ? { ...set, [field]: value }
                  : set
              )
            }
          : ex
      )
    )
  }

  const finishWorkout = () => {
    if (!selectedDay || !activePlan) return

    if (timerInterval) {
      clearInterval(timerInterval)
      setTimerInterval(null)
    }

    const totalVolume = currentWorkout.reduce((sum, ex) =>
      sum + ex.sets.reduce((setSum, set) =>
        setSum + (set.completed ? (set.weight || 0) * (set.reps || 0) : 0), 0
      ), 0
    )

    const completedSets = currentWorkout.flatMap(ex => ex.sets).filter(s => s.completed)
    const avgRPE = completedSets.length > 0
      ? completedSets.reduce((sum, s) => sum + (s.rpe || 0), 0) / completedSets.length
      : 0

    const newSession: WorkoutSession = {
      id: `session-${Date.now()}`,
      planId: activePlan.id,
      dayId: selectedDay.id,
      date: new Date().toISOString(),
      exercises: currentWorkout,
      totalVolume,
      duration: workoutTimer,
      avgRPE,
      completed: true,
    }

    // Check for personal records
    const newPRs: PersonalRecord[] = []
    currentWorkout.forEach(ex => {
      ex.sets.forEach(set => {
        if (set.completed && set.weight && set.reps) {
          const oneRepMax = calculate1RM(set.weight, set.reps)
          const existingPR = data.personalRecords?.find(pr => pr.exerciseId === ex.exerciseId)

          if (!existingPR || oneRepMax > existingPR.oneRepMax) {
            newPRs.push({
              id: `pr-${Date.now()}-${ex.id}`,
              exerciseId: ex.exerciseId,
              exerciseName: ex.exerciseName,
              weight: set.weight,
              reps: set.reps,
              date: new Date().toISOString(),
              oneRepMax,
            })
          }
        }
      })
    })

    setData(prev => ({
      ...prev,
      sessions: [...(prev.sessions || []), newSession],
      personalRecords: [
        ...(prev.personalRecords?.filter(pr => !newPRs.find(newPr => newPr.exerciseId === pr.exerciseId)) || []),
        ...newPRs
      ],
      weeklyPlans: (prev.weeklyPlans || []).map(plan =>
        plan.id === activePlan.id
          ? {
              ...plan,
              days: plan.days.map(day =>
                day.id === selectedDay.id
                  ? { ...day, exercises: currentWorkout, completed: true, lastCompleted: new Date().toISOString() }
                  : day
              )
            }
          : plan
      )
    }))

    setSelectedDay(null)
    setCurrentWorkout([])
    setWorkoutTimer(0)
  }

  const addMeasurement = () => {
    const newMeasurement: BodyMeasurement = {
      id: `measure-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      weight: 0,
      bodyFat: 0,
    }

    setData(prev => ({ ...prev, measurements: [...(prev.measurements || []), newMeasurement] }))
  }

  const updateMeasurement = (id: string, updates: Partial<BodyMeasurement>) => {
    setData(prev => ({
      ...prev,
      measurements: (prev.measurements || []).map(m => m.id === id ? { ...m, ...updates } : m)
    }))
  }

  const deleteMeasurement = (id: string) => {
    setData(prev => ({ ...prev, measurements: (prev.measurements || []).filter(m => m.id !== id) }))
  }

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook()

    // Dashboard
    const dashboardSheet = workbook.addWorksheet("Dashboard")
    dashboardSheet.addRow(["Treino Academia - Dashboard"])
    dashboardSheet.addRow([])
    dashboardSheet.addRow(["Métrica", "Valor"])
    dashboardSheet.addRow(["Treinos Totais", metrics.totalWorkouts])
    dashboardSheet.addRow(["Treinos Esta Semana", metrics.thisWeekWorkouts])
    dashboardSheet.addRow(["Volume Total (kg)", metrics.totalVolume])
    dashboardSheet.addRow(["Volume Médio (kg)", Math.round(metrics.avgVolume)])
    dashboardSheet.addRow(["Duração Média (min)", Math.round(metrics.avgDuration / 60)])
    dashboardSheet.addRow(["Records Pessoais", metrics.personalRecords])

    // Histórico
    const historySheet = workbook.addWorksheet("Histórico")
    historySheet.addRow(["Data", "Treino", "Duração (min)", "Volume (kg)", "RPE Médio"])
    data.sessions?.forEach(s => {
      const day = activePlan?.days.find(d => d.id === s.dayId)
      historySheet.addRow([
        new Date(s.date).toLocaleDateString("pt-BR"),
        day?.dayName || "Desconhecido",
        Math.round((s.duration || 0) / 60),
        s.totalVolume || 0,
        (s.avgRPE || 0).toFixed(1)
      ])
    })

    // Personal Records
    const prSheet = workbook.addWorksheet("Records Pessoais")
    prSheet.addRow(["Exercício", "Peso (kg)", "Reps", "1RM (kg)", "Data"])
    data.personalRecords?.forEach(pr => {
      prSheet.addRow([
        pr.exerciseName,
        pr.weight,
        pr.reps,
        pr.oneRepMax,
        new Date(pr.date).toLocaleDateString("pt-BR")
      ])
    })

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `treino-academia-${new Date().toISOString().slice(0, 10)}.xlsx`
    a.click()
  }

  const exportToPDF = () => {
    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.text("Treino Academia - Relatório", 14, 20)
    doc.setFontSize(11)
    doc.text(new Date().toLocaleDateString("pt-BR"), 14, 28)

    doc.setFontSize(14)
    doc.text("Dashboard", 14, 40)

    autoTable(doc, {
      startY: 45,
      head: [["Métrica", "Valor"]],
      body: [
        ["Treinos Totais", metrics.totalWorkouts.toString()],
        ["Treinos Esta Semana", metrics.thisWeekWorkouts.toString()],
        ["Volume Total", `${metrics.totalVolume.toLocaleString()} kg`],
        ["Volume Médio", `${Math.round(metrics.avgVolume).toLocaleString()} kg`],
        ["Duração Média", `${Math.round(metrics.avgDuration / 60)} min`],
        ["Records Pessoais", metrics.personalRecords.toString()],
      ]
    })

    doc.save(`treino-academia-${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const filteredTemplates = selectedDifficulty === "all"
    ? WORKOUT_TEMPLATES
    : WORKOUT_TEMPLATES.filter(t => t.difficulty === selectedDifficulty)

  return (
    <div className="h-full flex flex-col bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
              <h1 className="text-base font-semibold text-neutral-900 dark:text-white">
                Treino Academia
              </h1>
            </div>
            {selectedDay && (
              <>
                <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700" />
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-mono text-neutral-700 dark:text-neutral-300">
                    {formatTime(workoutTimer)}
                  </span>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {selectedDay ? (
              <button
                onClick={finishWorkout}
                className="px-2.5 py-1 text-xs flex items-center gap-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                <CheckCircle className="w-3 h-3" />
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
      {!selectedDay && (
        <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4">
          <div className="flex gap-1">
            {[
              { id: "dashboard", label: "Dashboard", icon: BarChart3 },
              { id: "workout", label: "Treino Hoje", icon: Dumbbell },
              { id: "plans", label: "Planos", icon: Calendar },
              { id: "exercises", label: "Exercícios", icon: Activity },
              { id: "history", label: "Histórico", icon: Clock },
              { id: "progress", label: "Progresso", icon: TrendingUp },
              { id: "tools", label: "Ferramentas", icon: Settings },
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
            activePlan={activePlan}
            todayWorkout={todayWorkout}
            data={data}
            startWorkout={startWorkout}
            setActiveTab={setActiveTab}
            setShowPlanModal={setShowPlanModal}
          />
        )}

        {activeTab === "workout" && (
          <WorkoutTodayTab
            todayWorkout={todayWorkout}
            startWorkout={startWorkout}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === "plans" && (
          <PlansTab
            plans={data.weeklyPlans || []}
            activePlanId={data.activePlanId}
            setActivePlan={setActivePlan}
            deletePlan={deletePlan}
            setShowPlanModal={setShowPlanModal}
            setSelectedDayForExercise={setSelectedDayForExercise}
            setShowExerciseModal={setShowExerciseModal}
          />
        )}

        {activeTab === "exercises" && (
          <ExercisesTab exercises={EXERCISE_LIBRARY} />
        )}

        {activeTab === "history" && (
          <HistoryTab
            sessions={data.sessions}
            plans={data.weeklyPlans || []}
          />
        )}

        {activeTab === "progress" && (
          <ProgressTab
            measurements={data.measurements}
            personalRecords={data.personalRecords}
            addMeasurement={addMeasurement}
            updateMeasurement={updateMeasurement}
            deleteMeasurement={deleteMeasurement}
          />
        )}

        {activeTab === "tools" && (
          <ToolsTab />
        )}

        {/* Active Workout Session */}
        {selectedDay && (
          <ActiveWorkoutTab
            selectedDay={selectedDay}
            currentWorkout={currentWorkout}
            completeSet={completeSet}
            updateSetValue={updateSetValue}
            setSelectedDay={setSelectedDay}
            finishWorkout={finishWorkout}
          />
        )}
      </div>

      {/* Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-neutral-200 dark:border-neutral-800">
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Templates de Treino</h2>
                <button onClick={() => setShowPlanModal(false)} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4">
              <div className="flex gap-2 mb-4">
                {[
                  { id: "all", label: "Todos" },
                  { id: "beginner", label: "Iniciante" },
                  { id: "intermediate", label: "Intermediário" },
                  { id: "advanced", label: "Avançado" },
                ].map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedDifficulty(filter.id as any)}
                    className={`px-3 py-1 text-xs rounded ${
                      selectedDifficulty === filter.id
                        ? "bg-neutral-900 dark:bg-neutral-700 text-white"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredTemplates.map(template => {
                  const diffColor = getDifficultyColor(template.difficulty)
                  return (
                    <button
                      key={template.name}
                      onClick={() => createPlanFromTemplate(template)}
                      className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition text-left"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-neutral-900 dark:text-white text-sm">{template.name}</h4>
                        <span className={`px-2 py-0.5 text-xs bg-${diffColor}-100 dark:bg-${diffColor}-900/30 text-${diffColor}-700 dark:text-${diffColor}-300 rounded`}>
                          {getDifficultyLabel(template.difficulty)}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3">{template.description}</p>
                      <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-500">
                        <span>{template.days.length}x por semana</span>
                        <span>•</span>
                        <span>{template.weeks} semanas</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exercise Modal */}
      {showExerciseModal && selectedDayForExercise && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-neutral-200 dark:border-neutral-800">
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Adicionar Exercício</h2>
                <button
                  onClick={() => {
                    setShowExerciseModal(false)
                    setSelectedDayForExercise(null)
                  }}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {EXERCISE_LIBRARY.map(exercise => {
                const mg = MUSCLE_GROUPS.find(m => m.id === exercise.muscleGroup)
                return (
                  <button
                    key={exercise.id}
                    onClick={() => {
                      addExerciseToDay(selectedDayForExercise.id, exercise)
                      setShowExerciseModal(false)
                      setSelectedDayForExercise(null)
                    }}
                    className="p-3 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition text-left"
                  >
                    <h3 className="font-medium text-neutral-900 dark:text-white text-sm mb-2">
                      {exercise.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded bg-${mg?.color}-100 dark:bg-${mg?.color}-900/30 text-${mg?.color}-700 dark:text-${mg?.color}-300`}>
                        {mg?.name}
                      </span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        {getDifficultyLabel(exercise.difficulty)}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ==================== TAB COMPONENTS ====================

function DashboardTab({ metrics, activePlan, todayWorkout, data, startWorkout, setActiveTab, setShowPlanModal }: any) {
  return (
    <div className="p-6 space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          label="Treinos Total"
          value={metrics.totalWorkouts}
          icon={Dumbbell}
          color="blue"
          subtext="todos os tempos"
        />
        <KPICard
          label="Esta Semana"
          value={metrics.thisWeekWorkouts}
          icon={Calendar}
          color="green"
          subtext="treinos realizados"
        />
        <KPICard
          label="Volume Total"
          value={`${(metrics.totalVolume / 1000).toFixed(1)}t`}
          icon={Weight}
          color="purple"
          subtext="carga levantada"
        />
        <KPICard
          label="Records"
          value={metrics.personalRecords}
          icon={Trophy}
          color="amber"
          subtext="recordes pessoais"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <MetricCard
          label="Volume Médio"
          value={`${Math.round(metrics.avgVolume)} kg`}
          icon={BarChart3}
          color="blue"
        />
        <MetricCard
          label="Duração Média"
          value={`${Math.round(metrics.avgDuration / 60)} min`}
          icon={Clock}
          color="green"
        />
        <MetricCard
          label="Peso Atual"
          value={metrics.currentWeight ? `${metrics.currentWeight} kg` : "-"}
          icon={Ruler}
          color="purple"
        />
      </div>

      {/* Active Plan */}
      {activePlan ? (
        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Plano Ativo</h3>
              <span className={`px-2 py-0.5 text-xs bg-${getDifficultyColor(activePlan.difficulty)}-100 dark:bg-${getDifficultyColor(activePlan.difficulty)}-900/30 text-${getDifficultyColor(activePlan.difficulty)}-700 dark:text-${getDifficultyColor(activePlan.difficulty)}-300 rounded`}>
                {getDifficultyLabel(activePlan.difficulty)}
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{activePlan.description}</p>
          </div>
          <div className="p-4 grid grid-cols-3 gap-3">
            {activePlan.days.map((day: DayWorkout) => {
              const dayName = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][day.dayNumber]
              return (
                <div
                  key={day.id}
                  className={`p-3 rounded-lg border transition ${
                    day.completed
                      ? "bg-green-50 dark:bg-green-900/10 border-green-500/30"
                      : "bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-800"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-neutral-900 dark:text-white">{dayName}</span>
                    {day.completed && <CheckCircle className="w-3 h-3 text-green-600" />}
                  </div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-2">
                    {day.exercises.length} exercícios
                  </div>
                  <button
                    onClick={() => startWorkout(day)}
                    className="w-full px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center justify-center gap-1"
                  >
                    <Play className="w-3 h-3" />
                    Iniciar
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-8 text-center">
          <Calendar className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1">Nenhum Plano Ativo</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">Escolha um template para começar</p>
          <button
            onClick={() => setShowPlanModal(true)}
            className="px-4 py-2 bg-neutral-900 dark:bg-neutral-700 text-white rounded text-xs hover:bg-neutral-800 dark:hover:bg-neutral-600 transition"
          >
            Escolher Template
          </button>
        </div>
      )}

      {/* Recent PRs */}
      {data.personalRecords && data.personalRecords.length > 0 && (
        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Records Recentes</h3>
          </div>
          <div className="p-4 space-y-2">
            {data.personalRecords.slice(-5).reverse().map((pr: PersonalRecord) => (
              <div key={pr.id} className="flex items-center justify-between p-2 bg-neutral-50 dark:bg-neutral-800/50 rounded">
                <div>
                  <div className="text-xs font-medium text-neutral-900 dark:text-white">{pr.exerciseName}</div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    {pr.weight}kg × {pr.reps} reps
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-amber-600">1RM: {pr.oneRepMax}kg</div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    {new Date(pr.date).toLocaleDateString("pt-BR")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function WorkoutTodayTab({ todayWorkout, startWorkout, setActiveTab }: any) {
  if (!todayWorkout) {
    return (
      <div className="p-6">
        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-8 text-center">
          <Calendar className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1">Dia de Descanso</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
            Você não tem treino programado para hoje
          </p>
          <button
            onClick={() => setActiveTab("plans")}
            className="px-4 py-2 bg-neutral-900 dark:bg-neutral-700 text-white rounded text-xs hover:bg-neutral-800 dark:hover:bg-neutral-600 transition"
          >
            Ver Planos
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">{todayWorkout.dayName}</h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
          {todayWorkout.exercises.length} exercícios programados
        </p>

        <div className="space-y-2 mb-4">
          {todayWorkout.exercises.map((exercise: WorkoutExercise, idx: number) => {
            const mg = MUSCLE_GROUPS.find(m => m.id === exercise.muscleGroup)
            return (
              <div key={exercise.id} className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-neutral-900 dark:text-white">
                      {idx + 1}. {exercise.exerciseName}
                    </span>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      {exercise.sets.length} séries
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded bg-${mg?.color}-100 dark:bg-${mg?.color}-900/30 text-${mg?.color}-700 dark:text-${mg?.color}-300`}>
                    {mg?.name}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        <button
          onClick={() => startWorkout(todayWorkout)}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition flex items-center justify-center gap-2 font-medium"
        >
          <Play className="w-4 h-4" />
          Iniciar Treino
        </button>
      </div>
    </div>
  )
}

function PlansTab({ plans, activePlanId, setActivePlan, deletePlan, setShowPlanModal, setSelectedDayForExercise, setShowExerciseModal }: any) {
  const safePlans = plans || []

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-neutral-900 dark:text-white">Meus Planos</h2>
        <button
          onClick={() => setShowPlanModal(true)}
          className="px-3 py-1.5 text-xs bg-neutral-900 dark:bg-neutral-700 text-white rounded hover:bg-neutral-800 dark:hover:bg-neutral-600 flex items-center gap-1.5"
        >
          <Plus className="w-3 h-3" />
          Novo Plano
        </button>
      </div>

      {safePlans.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-8 text-center">
          <Calendar className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1">Nenhum Plano Criado</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">Crie seu primeiro plano de treino</p>
          <button
            onClick={() => setShowPlanModal(true)}
            className="px-4 py-2 bg-neutral-900 dark:bg-neutral-700 text-white rounded text-xs hover:bg-neutral-800 dark:hover:bg-neutral-600 transition"
          >
            Criar Plano
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {safePlans.map((plan: WeeklyPlan) => {
            const diffColor = getDifficultyColor(plan.difficulty)
            return (
              <div
                key={plan.id}
                className={`bg-white dark:bg-neutral-900 rounded-lg border-2 transition ${
                  plan.id === activePlanId
                    ? "border-blue-500"
                    : "border-neutral-200 dark:border-neutral-800"
                }`}
              >
                <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">{plan.name}</h3>
                        {plan.id === activePlanId && (
                          <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                            Ativo
                          </span>
                        )}
                        <span className={`text-xs px-2 py-0.5 bg-${diffColor}-100 dark:bg-${diffColor}-900/30 text-${diffColor}-700 dark:text-${diffColor}-300 rounded`}>
                          {getDifficultyLabel(plan.difficulty)}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">{plan.description}</p>
                    </div>
                    <div className="flex gap-1">
                      {plan.id !== activePlanId && (
                        <button
                          onClick={() => setActivePlan(plan.id)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deletePlan(plan.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4 grid grid-cols-3 gap-2">
                  {plan.days.map((day: DayWorkout) => {
                    const dayName = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][day.dayNumber]
                    return (
                      <div key={day.id} className="p-2 bg-neutral-50 dark:bg-neutral-800/50 rounded">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-neutral-900 dark:text-white">{dayName}</span>
                          {plan.id === activePlanId && (
                            <button
                              onClick={() => {
                                setSelectedDayForExercise(day)
                                setShowExerciseModal(true)
                              }}
                              className="p-0.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <div className="text-xs text-neutral-600 dark:text-neutral-400">
                          {day.exercises.length} exercícios
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ExercisesTab({ exercises }: { exercises: ExerciseLibraryItem[] }) {
  const [filter, setFilter] = useState<MuscleGroup | "all">("all")

  const filteredExercises = filter === "all"
    ? exercises
    : exercises.filter(e => e.muscleGroup === filter)

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
          Biblioteca de Exercícios
        </h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="px-3 py-1.5 text-xs bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-white"
        >
          <option value="all">Todos</option>
          {MUSCLE_GROUPS.map(mg => (
            <option key={mg.id} value={mg.id}>{mg.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {filteredExercises.map(exercise => {
          const mg = MUSCLE_GROUPS.find(m => m.id === exercise.muscleGroup)
          return (
            <div
              key={exercise.id}
              className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-3 hover:shadow-md transition"
            >
              <h3 className="font-medium text-neutral-900 dark:text-white text-sm mb-2">
                {exercise.name}
              </h3>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded bg-${mg?.color}-100 dark:bg-${mg?.color}-900/30 text-${mg?.color}-700 dark:text-${mg?.color}-300`}>
                  {mg?.name}
                </span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {getDifficultyLabel(exercise.difficulty)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function HistoryTab({ sessions, plans }: any) {
  const safePlans = plans || []

  const sortedSessions = [...(sessions || [])].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-base font-semibold text-neutral-900 dark:text-white">Histórico de Treinos</h2>

      {sortedSessions.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-8 text-center">
          <Clock className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Nenhum treino realizado</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          <table className="w-full">
            <thead className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-neutral-700 dark:text-neutral-300">Data</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-neutral-700 dark:text-neutral-300">Treino</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-neutral-700 dark:text-neutral-300">Duração</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-neutral-700 dark:text-neutral-300">Volume</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-neutral-700 dark:text-neutral-300">RPE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {sortedSessions.map((session: WorkoutSession) => {
                const plan = safePlans.find((p: WeeklyPlan) => p.id === session.planId)
                const day = plan?.days.find((d: DayWorkout) => d.id === session.dayId)

                return (
                  <tr key={session.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <td className="px-4 py-3 text-xs text-neutral-700 dark:text-neutral-300">
                      {new Date(session.date).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-900 dark:text-white font-medium">
                      {day?.dayName || "Desconhecido"}
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-700 dark:text-neutral-300 text-right">
                      {Math.round((session.duration || 0) / 60)} min
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-700 dark:text-neutral-300 text-right font-medium">
                      {session.totalVolume?.toLocaleString()} kg
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-700 dark:text-neutral-300 text-right">
                      {session.avgRPE ? session.avgRPE.toFixed(1) : "-"}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function ProgressTab({ measurements, personalRecords, addMeasurement, updateMeasurement, deleteMeasurement }: any) {
  return (
    <div className="p-6 space-y-6">
      {/* Personal Records */}
      <div>
        <h2 className="text-base font-semibold text-neutral-900 dark:text-white mb-4">Records Pessoais</h2>

        {personalRecords && personalRecords.length > 0 ? (
          <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
            <table className="w-full">
              <thead className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-neutral-700 dark:text-neutral-300">Exercício</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-neutral-700 dark:text-neutral-300">Peso</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-neutral-700 dark:text-neutral-300">Reps</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-neutral-700 dark:text-neutral-300">1RM</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-neutral-700 dark:text-neutral-300">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {personalRecords.map((pr: PersonalRecord) => (
                  <tr key={pr.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <td className="px-4 py-3 text-xs text-neutral-900 dark:text-white font-medium">
                      {pr.exerciseName}
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-700 dark:text-neutral-300 text-right">
                      {pr.weight} kg
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-700 dark:text-neutral-300 text-right">
                      {pr.reps}
                    </td>
                    <td className="px-4 py-3 text-xs text-amber-600 font-bold text-right">
                      {pr.oneRepMax} kg
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-500 dark:text-neutral-400 text-right">
                      {new Date(pr.date).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-8 text-center">
            <Trophy className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Nenhum record pessoal ainda</p>
          </div>
        )}
      </div>

      {/* Body Measurements */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-white">Medidas Corporais</h2>
          <button
            onClick={addMeasurement}
            className="px-3 py-1.5 text-xs bg-neutral-900 dark:bg-neutral-700 text-white rounded hover:bg-neutral-800 dark:hover:bg-neutral-600 flex items-center gap-1.5"
          >
            <Plus className="w-3 h-3" />
            Nova Medição
          </button>
        </div>

        {measurements && measurements.length > 0 ? (
          <div className="space-y-3">
            {measurements
              .sort((a: BodyMeasurement, b: BodyMeasurement) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
              )
              .map((measurement: BodyMeasurement) => (
                <div key={measurement.id} className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <input
                      type="date"
                      value={measurement.date}
                      onChange={(e) => updateMeasurement(measurement.id, { date: e.target.value })}
                      className="text-sm font-medium bg-transparent border-none outline-none text-neutral-900 dark:text-white"
                    />
                    <button
                      onClick={() => deleteMeasurement(measurement.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { key: "weight", label: "Peso (kg)" },
                      { key: "bodyFat", label: "Gordura (%)" },
                      { key: "chest", label: "Peito (cm)" },
                      { key: "waist", label: "Cintura (cm)" },
                      { key: "biceps", label: "Bíceps (cm)" },
                      { key: "thighs", label: "Coxa (cm)" },
                    ].map(field => (
                      <div key={field.key}>
                        <label className="text-xs text-neutral-600 dark:text-neutral-400 block mb-1">
                          {field.label}
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={(measurement[field.key as keyof BodyMeasurement] as number) || ""}
                          onChange={(e) => updateMeasurement(measurement.id, {
                            [field.key]: parseFloat(e.target.value) || undefined
                          })}
                          className="w-full px-2 py-1 text-xs bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-white"
                          placeholder="0.0"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-8 text-center">
            <Ruler className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">Nenhuma medição registrada</p>
            <button
              onClick={addMeasurement}
              className="px-4 py-2 bg-neutral-900 dark:bg-neutral-700 text-white rounded text-xs hover:bg-neutral-800 dark:hover:bg-neutral-600 transition"
            >
              Adicionar Medição
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function ToolsTab() {
  const [rmWeight, setRmWeight] = useState("")
  const [rmReps, setRmReps] = useState("")
  const [calculated1RM, setCalculated1RM] = useState<number | null>(null)

  const handleCalculate1RM = () => {
    const weight = parseFloat(rmWeight)
    const reps = parseFloat(rmReps)
    if (weight && reps && reps >= 1 && reps <= 12) {
      setCalculated1RM(calculate1RM(weight, reps))
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-base font-semibold text-neutral-900 dark:text-white">Ferramentas</h2>

      {/* 1RM Calculator */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">Calculadora de 1RM</h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
          Calcule sua carga máxima estimada (One Rep Max)
        </p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs text-neutral-700 dark:text-neutral-300 block mb-1">
              Peso levantado (kg)
            </label>
            <input
              type="number"
              step="0.5"
              value={rmWeight}
              onChange={(e) => setRmWeight(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-white"
              placeholder="100"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-700 dark:text-neutral-300 block mb-1">
              Repetições
            </label>
            <input
              type="number"
              value={rmReps}
              onChange={(e) => setRmReps(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-white"
              placeholder="5"
            />
          </div>
        </div>

        <button
          onClick={handleCalculate1RM}
          className="w-full px-4 py-2 bg-neutral-900 dark:bg-neutral-700 text-white rounded text-sm hover:bg-neutral-800 dark:hover:bg-neutral-600 transition"
        >
          Calcular 1RM
        </button>

        {calculated1RM && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
            <div className="text-xs text-blue-700 dark:text-blue-300 mb-1">Seu 1RM estimado é</div>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
              {calculated1RM} kg
            </div>
          </div>
        )}
      </div>

      {/* Rest Timer */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">Timer de Descanso</h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
          Configure timers personalizados para descanso entre séries
        </p>
        <div className="grid grid-cols-3 gap-2">
          {[60, 90, 120, 180].map(seconds => (
            <button
              key={seconds}
              className="px-3 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white rounded text-xs hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
            >
              {seconds}s
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function ActiveWorkoutTab({ selectedDay, currentWorkout, completeSet, updateSetValue, setSelectedDay, finishWorkout }: any) {
  return (
    <div className="p-6 space-y-4">
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">{selectedDay.dayName}</h2>

        <div className="space-y-4">
          {currentWorkout.map((exercise: WorkoutExercise, idx: number) => {
            const mg = MUSCLE_GROUPS.find(m => m.id === exercise.muscleGroup)
            return (
              <div key={exercise.id} className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {idx + 1}. {exercise.exerciseName}
                    </h3>
                    <span className={`text-xs px-2 py-0.5 mt-1 inline-block rounded bg-${mg?.color}-100 dark:bg-${mg?.color}-900/30 text-${mg?.color}-700 dark:text-${mg?.color}-300`}>
                      {mg?.name}
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-neutral-200 dark:border-neutral-800">
                        <th className="text-left py-2 px-2 text-neutral-600 dark:text-neutral-400 font-medium">Série</th>
                        <th className="text-left py-2 px-2 text-neutral-600 dark:text-neutral-400 font-medium">Reps</th>
                        <th className="text-left py-2 px-2 text-neutral-600 dark:text-neutral-400 font-medium">Peso</th>
                        <th className="text-left py-2 px-2 text-neutral-600 dark:text-neutral-400 font-medium">RPE</th>
                        <th className="text-center py-2 px-2 text-neutral-600 dark:text-neutral-400 font-medium">✓</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exercise.sets.map(set => (
                        <tr
                          key={set.id}
                          className={`border-b border-neutral-100 dark:border-neutral-800 ${
                            set.completed ? "bg-green-50 dark:bg-green-900/10" : ""
                          }`}
                        >
                          <td className="py-2 px-2 font-medium text-neutral-900 dark:text-white">{set.setNumber}</td>
                          <td className="py-2 px-2">
                            <input
                              type="number"
                              value={set.reps || ""}
                              onChange={(e) => updateSetValue(exercise.id, set.id, 'reps', parseInt(e.target.value) || 0)}
                              className="w-12 px-1 py-0.5 text-xs bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-white"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="number"
                              step="0.5"
                              value={set.weight || ""}
                              onChange={(e) => updateSetValue(exercise.id, set.id, 'weight', parseFloat(e.target.value) || 0)}
                              className="w-16 px-1 py-0.5 text-xs bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-white"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={set.rpe || ""}
                              onChange={(e) => updateSetValue(exercise.id, set.id, 'rpe', parseInt(e.target.value) || 0)}
                              className="w-12 px-1 py-0.5 text-xs bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-white"
                            />
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              onClick={() => completeSet(exercise.id, set.id)}
                              className={`p-1.5 rounded transition ${
                                set.completed
                                  ? "bg-green-600 text-white"
                                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400"
                              }`}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => setSelectedDay(null)}
            className="flex-1 px-4 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded hover:bg-neutral-50 dark:hover:bg-neutral-800 transition font-medium text-neutral-900 dark:text-white"
          >
            Cancelar
          </button>
          <button
            onClick={finishWorkout}
            className="flex-1 px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition font-medium flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Finalizar Treino
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

function MetricCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 text-${color}-600`} />
        <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">{label}</span>
      </div>
      <div className="text-xl font-bold text-neutral-900 dark:text-white">
        {value}
      </div>
    </div>
  )
}
