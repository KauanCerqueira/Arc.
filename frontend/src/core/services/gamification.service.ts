import type {
  UserStats,
  LeaderboardEntry,
  Achievement,
  AchievementType,
  AchievementTier,
  SprintPerformance,
  Badge,
} from '../types/gamification.types';
import {
  ACHIEVEMENT_DEFINITIONS,
  calculateLevel,
  experienceToNextLevel,
  calculateTaskPoints,
  SPECIAL_BADGES,
} from '../types/gamification.types';

export interface Task {
  id: string;
  title: string;
  status: 'backlog' | 'in-progress' | 'done';
  storyPoints: number;
  assignee?: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  tags: string[];
  completedAt?: Date;
  createdAt?: Date;
}

export interface SprintData {
  id: string;
  tasks: Task[];
  startDate: Date;
  endDate: Date;
}

class GamificationService {
  /**
   * Calculate user statistics based on completed tasks
   */
  calculateUserStats(
    userId: string,
    allTasks: Task[],
    sprintHistory?: SprintData[]
  ): UserStats {
    const userTasks = allTasks.filter(task => task.assignee === userId);
    const completedTasks = userTasks.filter(task => task.status === 'done');

    // Calculate total points from completed tasks
    const totalPoints = completedTasks.reduce((sum, task) => {
      const completionTime = this.calculateCompletionTime(task);
      const taskType = this.getTaskType(task);
      const points = calculateTaskPoints(
        task.storyPoints,
        completionTime,
        task.priority,
        taskType
      );
      return sum + points;
    }, 0);

    // Experience is based on points
    const experience = totalPoints;
    const level = calculateLevel(experience);
    const expToNext = experienceToNextLevel(experience);

    // Calculate achievements
    const achievements = this.calculateAchievements(userId, allTasks, sprintHistory);

    // Calculate badges
    const badges = this.calculateBadges(userId, allTasks, completedTasks, achievements);

    // Calculate streaks
    const { currentStreak, longestStreak } = this.calculateStreaks(completedTasks);

    // Calculate velocity
    const averageVelocity = this.calculateVelocity(completedTasks);

    return {
      userId,
      totalPoints,
      level,
      experience,
      experienceToNextLevel: expToNext,
      tasksCompleted: completedTasks.length,
      sprintsCompleted: sprintHistory?.length || 0,
      averageVelocity,
      currentStreak,
      longestStreak,
      achievements,
      badges,
      rank: 0, // Will be calculated in leaderboard
    };
  }

  /**
   * Generate leaderboard from multiple user stats
   */
  generateLeaderboard(
    userStatsArray: Array<{
      stats: UserStats;
      userName: string;
      userAvatar: string | null;
      userRole: string;
    }>
  ): LeaderboardEntry[] {
    // Sort by points (descending)
    const sorted = userStatsArray.sort((a, b) => b.stats.totalPoints - a.stats.totalPoints);

    // Assign ranks
    return sorted.map((entry, index) => ({
      userId: entry.stats.userId,
      userName: entry.userName,
      userAvatar: entry.userAvatar,
      userRole: entry.userRole,
      points: entry.stats.totalPoints,
      level: entry.stats.level,
      tasksCompleted: entry.stats.tasksCompleted,
      achievements: entry.stats.achievements.filter(a => a.progress === 100),
      badges: entry.stats.badges,
      rank: index + 1,
      trend: 'stable', // Would need historical data to calculate
    }));
  }

  /**
   * Calculate achievements for a user
   */
  private calculateAchievements(
    userId: string,
    allTasks: Task[],
    sprintHistory?: SprintData[]
  ): Achievement[] {
    const achievements: Achievement[] = [];
    const userTasks = allTasks.filter(task => task.assignee === userId);
    const completedTasks = userTasks.filter(task => task.status === 'done');

    // Velocity achievement
    const fastCompletions = completedTasks.filter(task => {
      const time = this.calculateCompletionTime(task);
      return time < 2;
    }).length;
    achievements.push(this.createAchievement('velocity', fastCompletions));

    // Points achievement
    const totalPoints = completedTasks.reduce((sum, t) => sum + t.storyPoints, 0);
    achievements.push(this.createAchievement('points', totalPoints));

    // Streak achievement
    const { currentStreak } = this.calculateStreaks(completedTasks);
    achievements.push(this.createAchievement('streak', currentStreak));

    // First blood achievement
    const firstCompletions = this.countFirstCompletions(userId, allTasks, sprintHistory);
    achievements.push(this.createAchievement('first_blood', firstCompletions));

    // Bug hunter achievement
    const bugsFixed = completedTasks.filter(t => t.tags.includes('Bug')).length;
    achievements.push(this.createAchievement('bug_hunter', bugsFixed));

    // Team player achievement (tasks with multiple assignees or collaborative tasks)
    const teamTasks = completedTasks.filter(t =>
      t.tags.some(tag => ['Backend', 'Frontend'].includes(tag))
    ).length;
    achievements.push(this.createAchievement('team_player', teamTasks));

    // Sprint master achievement
    const perfectSprints = this.countPerfectSprints(userId, sprintHistory);
    achievements.push(this.createAchievement('sprint_master', perfectSprints));

    // Overachiever achievement
    const extraTasks = Math.max(0, completedTasks.length - (sprintHistory?.length || 1) * 5);
    achievements.push(this.createAchievement('overachiever', extraTasks));

    // Quality achievement
    const qualityTasks = completedTasks.filter(t => !t.tags.includes('Bug')).length;
    achievements.push(this.createAchievement('quality', qualityTasks));

    // Consistency achievement
    const consistentDays = this.countConsistentDays(completedTasks);
    achievements.push(this.createAchievement('consistency', consistentDays));

    return achievements;
  }

  /**
   * Create an achievement object with progress
   */
  private createAchievement(type: AchievementType, currentValue: number): Achievement {
    const definition = ACHIEVEMENT_DEFINITIONS[type];
    const tiers: AchievementTier[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];

    let currentTier: AchievementTier = 'bronze';
    let nextTier: AchievementTier | null = 'silver';

    // Find current tier
    for (let i = tiers.length - 1; i >= 0; i--) {
      if (currentValue >= definition.tiers[tiers[i]]) {
        currentTier = tiers[i];
        nextTier = i < tiers.length - 1 ? tiers[i + 1] : null;
        break;
      }
    }

    const requirement = nextTier ? definition.tiers[nextTier] : definition.tiers[currentTier];
    const progress = Math.min(100, (currentValue / requirement) * 100);

    return {
      id: `${type}_${currentTier}`,
      type,
      tier: currentTier,
      name: definition.name,
      description: definition.description,
      icon: definition.icon,
      progress,
      requirement,
      currentValue,
      unlockedAt: progress === 100 ? new Date() : undefined,
    };
  }

  /**
   * Calculate special badges earned by the user
   */
  private calculateBadges(
    userId: string,
    allTasks: Task[],
    completedTasks: Task[],
    achievements: Achievement[]
  ): Badge[] {
    const badges: Badge[] = [];

    // Perfectionist badge
    const allUserTasks = allTasks.filter(t => t.assignee === userId);
    if (allUserTasks.length > 0 && allUserTasks.every(t => t.status === 'done')) {
      badges.push({ ...SPECIAL_BADGES.find(b => b.id === 'perfectionist')!, earnedAt: new Date() });
    }

    // Speedrunner badge
    const fastTasks = completedTasks.filter(t => this.calculateCompletionTime(t) < 1);
    if (fastTasks.length >= 5) {
      badges.push({ ...SPECIAL_BADGES.find(b => b.id === 'speedrunner')!, earnedAt: new Date() });
    }

    // Marathon badge
    const tasksByDay = this.groupTasksByDay(completedTasks);
    const maxTasksInDay = Math.max(...Object.values(tasksByDay).map(tasks => tasks.length), 0);
    if (maxTasksInDay >= 10) {
      badges.push({ ...SPECIAL_BADGES.find(b => b.id === 'marathon')!, earnedAt: new Date() });
    }

    // Innovator badge
    const features = completedTasks.filter(t => t.tags.includes('Feature'));
    if (features.length >= 10) {
      badges.push({ ...SPECIAL_BADGES.find(b => b.id === 'innovator')!, earnedAt: new Date() });
    }

    return badges;
  }

  /**
   * Calculate completion time in hours (mock implementation)
   */
  private calculateCompletionTime(task: Task): number {
    // In real implementation, this would calculate actual time spent
    // For now, estimate based on story points
    if (!task.completedAt || !task.createdAt) {
      return task.storyPoints * 2; // Estimate 2 hours per story point
    }

    const diff = task.completedAt.getTime() - task.createdAt.getTime();
    return diff / (1000 * 60 * 60); // Convert to hours
  }

  /**
   * Determine task type from tags
   */
  private getTaskType(task: Task): 'bug' | 'feature' | 'task' {
    if (task.tags.includes('Bug')) return 'bug';
    if (task.tags.includes('Feature')) return 'feature';
    return 'task';
  }

  /**
   * Calculate user streaks
   */
  private calculateStreaks(completedTasks: Task[]): { currentStreak: number; longestStreak: number } {
    if (completedTasks.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    // Group tasks by day
    const tasksByDay = this.groupTasksByDay(completedTasks);
    const days = Object.keys(tasksByDay).sort();

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    const today = new Date().toISOString().split('T')[0];

    // Calculate current streak (from today backwards)
    if (days.includes(today)) {
      currentStreak = 1;
      for (let i = days.length - 2; i >= 0; i--) {
        const prevDay = new Date(days[i + 1]);
        const currDay = new Date(days[i]);
        const dayDiff = Math.floor((prevDay.getTime() - currDay.getTime()) / (1000 * 60 * 60 * 24));

        if (dayDiff === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    for (let i = 1; i < days.length; i++) {
      const prevDay = new Date(days[i - 1]);
      const currDay = new Date(days[i]);
      const dayDiff = Math.floor((currDay.getTime() - prevDay.getTime()) / (1000 * 60 * 60 * 24));

      if (dayDiff === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }

    longestStreak = Math.max(longestStreak, currentStreak, 1);

    return { currentStreak, longestStreak };
  }

  /**
   * Group tasks by day
   */
  private groupTasksByDay(tasks: Task[]): Record<string, Task[]> {
    return tasks.reduce((acc, task) => {
      if (!task.completedAt) return acc;
      const day = task.completedAt.toISOString().split('T')[0];
      if (!acc[day]) acc[day] = [];
      acc[day].push(task);
      return acc;
    }, {} as Record<string, Task[]>);
  }

  /**
   * Calculate average velocity (points per day)
   */
  private calculateVelocity(completedTasks: Task[]): number {
    if (completedTasks.length === 0) return 0;

    const totalPoints = completedTasks.reduce((sum, t) => sum + t.storyPoints, 0);
    const tasksByDay = this.groupTasksByDay(completedTasks);
    const daysActive = Object.keys(tasksByDay).length;

    return daysActive > 0 ? totalPoints / daysActive : 0;
  }

  /**
   * Count how many times user was first to complete a task
   */
  private countFirstCompletions(userId: string, allTasks: Task[], sprintHistory?: SprintData[]): number {
    // This would require tracking completion order in real implementation
    // For now, return a mock value
    return 0;
  }

  /**
   * Count perfect sprints (all tasks completed)
   */
  private countPerfectSprints(userId: string, sprintHistory?: SprintData[]): number {
    if (!sprintHistory) return 0;

    return sprintHistory.filter(sprint => {
      const userTasks = sprint.tasks.filter(t => t.assignee === userId);
      return userTasks.length > 0 && userTasks.every(t => t.status === 'done');
    }).length;
  }

  /**
   * Count consistent days (days with at least one task completed)
   */
  private countConsistentDays(completedTasks: Task[]): number {
    const tasksByDay = this.groupTasksByDay(completedTasks);
    return Object.keys(tasksByDay).length;
  }
}

export default new GamificationService();
