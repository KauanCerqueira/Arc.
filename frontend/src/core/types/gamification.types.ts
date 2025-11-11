// Gamification Types for Sprint System

export type AchievementType =
  | 'velocity' // Fast task completion
  | 'points' // Story points accumulated
  | 'streak' // Consecutive days active
  | 'first_blood' // First task completed in sprint
  | 'bug_hunter' // Bug fixes
  | 'team_player' // Helping with collaborative tasks
  | 'sprint_master' // Complete all assigned tasks
  | 'overachiever' // Complete more than assigned
  | 'quality' // Low bug rate on completed tasks
  | 'consistency' // Regular daily contributions

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'

export interface Achievement {
  id: string
  type: AchievementType
  tier: AchievementTier
  name: string
  description: string
  icon: string
  unlockedAt?: Date
  progress: number // 0-100
  requirement: number // Required value to unlock
  currentValue: number // Current progress value
}

export interface Badge {
  id: string
  icon: string
  name: string
  description: string
  color: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  earnedAt?: Date
}

export interface UserStats {
  userId: string
  totalPoints: number
  level: number
  experience: number
  experienceToNextLevel: number
  tasksCompleted: number
  sprintsCompleted: number
  averageVelocity: number // points per day
  currentStreak: number // days
  longestStreak: number
  achievements: Achievement[]
  badges: Badge[]
  rank: number // Position in workspace leaderboard
}

export interface LeaderboardEntry {
  userId: string
  userName: string
  userAvatar: string | null
  userRole: string
  points: number
  level: number
  tasksCompleted: number
  achievements: Achievement[]
  badges: Badge[]
  rank: number
  trend: 'up' | 'down' | 'stable' // Compared to previous period
}

export interface SprintPerformance {
  userId: string
  sprintId: string
  pointsEarned: number
  tasksCompleted: number
  tasksAssigned: number
  averageCompletionTime: number // in hours
  velocityBonus: number
  qualityBonus: number
  achievementsUnlocked: Achievement[]
}

// Achievement definitions with requirements
export const ACHIEVEMENT_DEFINITIONS: Record<AchievementType, {
  name: string
  description: string
  icon: string
  tiers: Record<AchievementTier, number>
}> = {
  velocity: {
    name: 'Velocista',
    description: 'Complete tarefas em tempo recorde',
    icon: '⚡',
    tiers: {
      bronze: 5, // 5 tasks completed in less than 2 hours
      silver: 15,
      gold: 30,
      platinum: 50,
      diamond: 100,
    },
  },
  points: {
    name: 'Acumulador',
    description: 'Acumule story points',
    icon: '💎',
    tiers: {
      bronze: 50,
      silver: 150,
      gold: 300,
      platinum: 500,
      diamond: 1000,
    },
  },
  streak: {
    name: 'Consistente',
    description: 'Mantenha uma sequência de dias ativos',
    icon: '🔥',
    tiers: {
      bronze: 3,
      silver: 7,
      gold: 14,
      platinum: 30,
      diamond: 60,
    },
  },
  first_blood: {
    name: 'Primeiro Sangue',
    description: 'Seja o primeiro a completar uma tarefa na sprint',
    icon: '🎯',
    tiers: {
      bronze: 1,
      silver: 5,
      gold: 10,
      platinum: 20,
      diamond: 50,
    },
  },
  bug_hunter: {
    name: 'Caçador de Bugs',
    description: 'Resolva bugs críticos',
    icon: '🐛',
    tiers: {
      bronze: 5,
      silver: 15,
      gold: 30,
      platinum: 50,
      diamond: 100,
    },
  },
  team_player: {
    name: 'Jogador de Equipe',
    description: 'Ajude em tarefas colaborativas',
    icon: '🤝',
    tiers: {
      bronze: 3,
      silver: 10,
      gold: 20,
      platinum: 40,
      diamond: 80,
    },
  },
  sprint_master: {
    name: 'Mestre da Sprint',
    description: 'Complete todas as tarefas atribuídas',
    icon: '🏆',
    tiers: {
      bronze: 1,
      silver: 3,
      gold: 7,
      platinum: 15,
      diamond: 30,
    },
  },
  overachiever: {
    name: 'Superação',
    description: 'Complete mais tarefas que o atribuído',
    icon: '🚀',
    tiers: {
      bronze: 5,
      silver: 15,
      gold: 30,
      platinum: 50,
      diamond: 100,
    },
  },
  quality: {
    name: 'Qualidade',
    description: 'Mantenha baixa taxa de bugs',
    icon: '✨',
    tiers: {
      bronze: 10, // 10 tasks with 0 bugs
      silver: 25,
      gold: 50,
      platinum: 100,
      diamond: 200,
    },
  },
  consistency: {
    name: 'Ritmo Constante',
    description: 'Contribua regularmente todos os dias',
    icon: '📈',
    tiers: {
      bronze: 5,
      silver: 15,
      gold: 30,
      platinum: 60,
      diamond: 120,
    },
  },
}

// Badge definitions
export const SPECIAL_BADGES: Badge[] = [
  {
    id: 'founder',
    icon: '👑',
    name: 'Fundador',
    description: 'Membro fundador do workspace',
    color: 'from-yellow-400 to-amber-500',
    rarity: 'legendary',
  },
  {
    id: 'perfectionist',
    icon: '💯',
    name: 'Perfeccionista',
    description: 'Complete uma sprint com 100% das tarefas',
    color: 'from-purple-400 to-pink-500',
    rarity: 'epic',
  },
  {
    id: 'speedrunner',
    icon: '⏱️',
    name: 'Speedrunner',
    description: 'Complete 5 tarefas em menos de 1 hora',
    color: 'from-cyan-400 to-blue-500',
    rarity: 'epic',
  },
  {
    id: 'night_owl',
    icon: '🦉',
    name: 'Coruja Noturna',
    description: 'Complete tarefas após 22h',
    color: 'from-indigo-400 to-purple-500',
    rarity: 'rare',
  },
  {
    id: 'early_bird',
    icon: '🌅',
    name: 'Madrugador',
    description: 'Complete tarefas antes das 7h',
    color: 'from-orange-400 to-pink-500',
    rarity: 'rare',
  },
  {
    id: 'marathon',
    icon: '🏃',
    name: 'Maratonista',
    description: 'Complete 10 tarefas em um único dia',
    color: 'from-green-400 to-emerald-500',
    rarity: 'epic',
  },
  {
    id: 'mentor',
    icon: '🎓',
    name: 'Mentor',
    description: 'Ajude 5 membros do time',
    color: 'from-blue-400 to-cyan-500',
    rarity: 'rare',
  },
  {
    id: 'innovator',
    icon: '💡',
    name: 'Inovador',
    description: 'Crie 10 features novas',
    color: 'from-yellow-400 to-orange-500',
    rarity: 'epic',
  },
]

// Level calculation
export const calculateLevel = (totalExperience: number): number => {
  // Level formula: level = floor(sqrt(experience / 100))
  return Math.floor(Math.sqrt(totalExperience / 100))
}

export const experienceForLevel = (level: number): number => {
  // Inverse formula: experience = level^2 * 100
  return level * level * 100
}

export const experienceToNextLevel = (currentExperience: number): number => {
  const currentLevel = calculateLevel(currentExperience)
  const nextLevelExp = experienceForLevel(currentLevel + 1)
  return nextLevelExp - currentExperience
}

// Point calculation based on task completion
export const calculateTaskPoints = (
  storyPoints: number,
  completionTimeHours: number,
  priority: 'urgent' | 'high' | 'medium' | 'low',
  taskType: 'bug' | 'feature' | 'task'
): number => {
  let basePoints = storyPoints * 10

  // Priority multiplier
  const priorityMultiplier = {
    urgent: 1.5,
    high: 1.3,
    medium: 1.1,
    low: 1.0,
  }

  // Type multiplier
  const typeMultiplier = {
    bug: 1.2,
    feature: 1.1,
    task: 1.0,
  }

  // Velocity bonus (faster completion = more points)
  let velocityBonus = 0
  if (completionTimeHours < 2) velocityBonus = 1.5
  else if (completionTimeHours < 4) velocityBonus = 1.3
  else if (completionTimeHours < 8) velocityBonus = 1.1
  else velocityBonus = 1.0

  const totalPoints = Math.round(
    basePoints *
    priorityMultiplier[priority] *
    typeMultiplier[taskType] *
    velocityBonus
  )

  return totalPoints
}

// Tier colors for UI
export const TIER_COLORS: Record<AchievementTier, string> = {
  bronze: 'from-amber-600 to-orange-700',
  silver: 'from-gray-300 to-gray-400',
  gold: 'from-yellow-400 to-amber-500',
  platinum: 'from-cyan-300 to-blue-400',
  diamond: 'from-purple-400 to-pink-500',
}

export const TIER_GLOW: Record<AchievementTier, string> = {
  bronze: 'shadow-amber-500/50',
  silver: 'shadow-gray-400/50',
  gold: 'shadow-yellow-400/50',
  platinum: 'shadow-cyan-400/50',
  diamond: 'shadow-purple-500/50',
}
