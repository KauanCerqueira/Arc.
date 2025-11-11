import { useState, useEffect } from 'react';
import teamService from '../services/team.service';
import gamificationService, { Task, SprintData } from '../services/gamification.service';
import type { WorkspaceMember } from '../types/team.types';
import type { LeaderboardEntry, UserStats } from '../types/gamification.types';

export interface UseWorkspaceGamificationResult {
  leaderboard: LeaderboardEntry[];
  userStats: Map<string, UserStats>;
  members: WorkspaceMember[];
  isLoading: boolean;
  error: Error | null;
  refreshStats: () => Promise<void>;
}

export function useWorkspaceGamification(
  workspaceId: string,
  tasks: Task[],
  sprintHistory?: SprintData[]
): UseWorkspaceGamificationResult {
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userStats, setUserStats] = useState<Map<string, UserStats>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const calculateStats = async (workspaceMembers: WorkspaceMember[]) => {
    const statsArray: Array<{
      stats: UserStats;
      userName: string;
      userAvatar: string | null;
      userRole: string;
    }> = [];

    const statsMap = new Map<string, UserStats>();

    for (const member of workspaceMembers) {
      const stats = gamificationService.calculateUserStats(
        member.userId,
        tasks,
        sprintHistory
      );

      statsMap.set(member.userId, stats);

      statsArray.push({
        stats,
        userName: member.userName,
        userAvatar: member.userIcon,
        userRole: member.role.toString(),
      });
    }

    const leaderboardData = gamificationService.generateLeaderboard(statsArray);

    setUserStats(statsMap);
    setLeaderboard(leaderboardData);
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch workspace team data
      const teamData = await teamService.getTeam(workspaceId);

      // Filter active members only
      const activeMembers = teamData.members.filter(m => m.isActive);
      setMembers(activeMembers);

      // Calculate stats for all members
      await calculateStats(activeMembers);
    } catch (err) {
      console.error('Error loading workspace gamification data:', err);
      setError(err instanceof Error ? err : new Error('Failed to load gamification data'));
    } finally {
      setIsLoading(false);
    }
  };

  const refreshStats = async () => {
    if (members.length > 0) {
      await calculateStats(members);
    } else {
      await loadData();
    }
  };

  useEffect(() => {
    if (workspaceId) {
      loadData();
    }
  }, [workspaceId]);

  // Recalculate stats when tasks change
  useEffect(() => {
    if (members.length > 0 && tasks.length > 0) {
      calculateStats(members);
    }
  }, [tasks, sprintHistory]);

  return {
    leaderboard,
    userStats,
    members,
    isLoading,
    error,
    refreshStats,
  };
}
