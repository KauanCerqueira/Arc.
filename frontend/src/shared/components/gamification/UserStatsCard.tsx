'use client';

import React from 'react';
import { Star, Target, TrendingUp, Flame, Award, Trophy } from 'lucide-react';
import type { UserStats } from '@/core/types/gamification.types';
import { AchievementCard } from './AchievementCard';
import { BadgeCollection } from './BadgeDisplay';
import { cn } from '@/shared/lib/utils';

interface UserStatsCardProps {
  stats: UserStats;
  userName: string;
  userAvatar?: string | null;
  compact?: boolean;
}

export function UserStatsCard({ stats, userName, userAvatar, compact = false }: UserStatsCardProps) {
  const experiencePercentage = (stats.experience / (stats.experience + stats.experienceToNextLevel)) * 100;

  if (compact) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-3 mb-4">
          {/* Avatar */}
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={userName}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
              {userName.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Name & Level */}
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 dark:text-gray-100">{userName}</h4>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                Nível {stats.level}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                #{stats.rank}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <StatItem icon={Star} label="Pontos" value={stats.totalPoints.toLocaleString('pt-BR')} color="text-yellow-500" />
          <StatItem icon={Target} label="Tarefas" value={stats.tasksCompleted} color="text-blue-500" />
          <StatItem icon={Flame} label="Streak" value={`${stats.currentStreak}d`} color="text-orange-500" />
        </div>

        {/* Badges */}
        {stats.badges.length > 0 && (
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <BadgeCollection badges={stats.badges} maxVisible={5} size="sm" />
          </div>
        )}
      </div>
    );
  }

  const unlockedAchievements = stats.achievements.filter(a => a.progress === 100);
  const inProgressAchievements = stats.achievements
    .filter(a => a.progress < 100 && a.progress > 0)
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-start gap-4 mb-6">
          {/* Avatar */}
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={userName}
              className="w-20 h-20 rounded-full object-cover border-4 border-white/30"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-3xl border-4 border-white/30">
              {userName.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Name & Rank */}
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-1">{userName}</h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm">
                Nível {stats.level}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm">
                Rank #{stats.rank}
              </span>
            </div>
            {/* XP Progress */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs opacity-90">
                <span>XP: {stats.experience.toLocaleString('pt-BR')}</span>
                <span>Próximo nível: {stats.experienceToNextLevel.toLocaleString('pt-BR')}</span>
              </div>
              <div className="h-2 rounded-full bg-white/30 overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${experiencePercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star className="w-4 h-4" />
              <span className="text-2xl font-bold">{stats.totalPoints.toLocaleString('pt-BR')}</span>
            </div>
            <p className="text-xs opacity-90">Pontos Totais</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="w-4 h-4" />
              <span className="text-2xl font-bold">{stats.tasksCompleted}</span>
            </div>
            <p className="text-xs opacity-90">Tarefas Completas</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame className="w-4 h-4" />
              <span className="text-2xl font-bold">{stats.currentStreak}</span>
            </div>
            <p className="text-xs opacity-90">Streak Atual</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-2xl font-bold">{stats.averageVelocity.toFixed(1)}</span>
            </div>
            <p className="text-xs opacity-90">Pts/Dia</p>
          </div>
        </div>
      </div>

      {/* Badges */}
      {stats.badges.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-purple-500" />
            <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">Conquistas Especiais</h4>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
            {stats.badges.map((badge) => (
              <div key={badge.id} className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-16 h-16 rounded-full flex items-center justify-center text-3xl',
                    'bg-gradient-to-br shadow-lg transition-transform hover:scale-110',
                    badge.color
                  )}
                >
                  {badge.icon}
                </div>
                <p className="text-xs text-center mt-2 font-medium text-gray-700 dark:text-gray-300">
                  {badge.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">Conquistas</h4>
          <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
            {unlockedAchievements.length} desbloqueadas
          </span>
        </div>

        {/* Unlocked Achievements */}
        {unlockedAchievements.length > 0 && (
          <div className="mb-6">
            <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Desbloqueadas</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {unlockedAchievements.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} compact showProgress={false} />
              ))}
            </div>
          </div>
        )}

        {/* In Progress Achievements */}
        {inProgressAchievements.length > 0 && (
          <div>
            <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Em Progresso</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {inProgressAchievements.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} compact />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {unlockedAchievements.length === 0 && inProgressAchievements.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Complete tarefas para desbloquear conquistas!</p>
          </div>
        )}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <h5 className="font-semibold text-gray-900 dark:text-gray-100">Streaks</h5>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Atual</span>
              <span className="font-bold text-gray-900 dark:text-gray-100">{stats.currentStreak} dias</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Recorde</span>
              <span className="font-bold text-gray-900 dark:text-gray-100">{stats.longestStreak} dias</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-purple-500" />
            <h5 className="font-semibold text-gray-900 dark:text-gray-100">Sprints</h5>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Completas</span>
              <span className="font-bold text-gray-900 dark:text-gray-100">{stats.sprintsCompleted}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Velocidade</span>
              <span className="font-bold text-gray-900 dark:text-gray-100">{stats.averageVelocity.toFixed(1)} pts/dia</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatItem({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <div className="text-center">
      <Icon className={cn('w-4 h-4 mx-auto mb-1', color)} />
      <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}
