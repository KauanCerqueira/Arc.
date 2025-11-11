// Gamification Components
export { AchievementCard } from './AchievementCard';
export { BadgeDisplay, BadgeCollection } from './BadgeDisplay';
export { Leaderboard } from './Leaderboard';
export { UserStatsCard } from './UserStatsCard';

// Re-export types for convenience
export type {
  Achievement,
  AchievementType,
  AchievementTier,
  Badge,
  UserStats,
  LeaderboardEntry,
  SprintPerformance,
} from '@/core/types/gamification.types';

export {
  ACHIEVEMENT_DEFINITIONS,
  SPECIAL_BADGES,
  TIER_COLORS,
  TIER_GLOW,
  calculateLevel,
  experienceForLevel,
  experienceToNextLevel,
  calculateTaskPoints,
} from '@/core/types/gamification.types';
