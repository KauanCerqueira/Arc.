'use client';

import React from 'react';
import { Trophy, TrendingUp, TrendingDown, Minus, Star, Target } from 'lucide-react';
import type { LeaderboardEntry } from '@/core/types/gamification.types';
import { BadgeCollection } from './BadgeDisplay';
import { cn } from '@/shared/lib/utils';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  highlightTop?: number;
}

const RANK_ICONS = {
  1: { icon: '🥇', color: 'from-yellow-400 to-amber-500', glow: 'shadow-yellow-400/50' },
  2: { icon: '🥈', color: 'from-gray-300 to-gray-400', glow: 'shadow-gray-400/50' },
  3: { icon: '🥉', color: 'from-amber-600 to-orange-700', glow: 'shadow-orange-500/50' },
};

const TREND_ICONS = {
  up: <TrendingUp className="w-4 h-4 text-green-500" />,
  down: <TrendingDown className="w-4 h-4 text-red-500" />,
  stable: <Minus className="w-4 h-4 text-gray-400" />,
};

export function Leaderboard({ entries, currentUserId, highlightTop = 3 }: LeaderboardProps) {
  const topEntries = entries.slice(0, highlightTop);
  const otherEntries = entries.slice(highlightTop);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Ranking do Workspace
          </h3>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {entries.length} {entries.length === 1 ? 'membro' : 'membros'}
        </div>
      </div>

      {/* Top Performers */}
      {topEntries.length > 0 && (
        <div className="space-y-2">
          {topEntries.map((entry) => (
            <TopLeaderboardCard
              key={entry.userId}
              entry={entry}
              isCurrentUser={entry.userId === currentUserId}
            />
          ))}
        </div>
      )}

      {/* Other Performers */}
      {otherEntries.length > 0 && (
        <div className="space-y-2">
          {otherEntries.map((entry) => (
            <LeaderboardCard
              key={entry.userId}
              entry={entry}
              isCurrentUser={entry.userId === currentUserId}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {entries.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Nenhum membro no workspace ainda</p>
        </div>
      )}
    </div>
  );
}

function TopLeaderboardCard({ entry, isCurrentUser }: { entry: LeaderboardEntry; isCurrentUser: boolean }) {
  const rankConfig = RANK_ICONS[entry.rank as keyof typeof RANK_ICONS];

  return (
    <div
      className={cn(
        'relative rounded-xl p-4 border-2 transition-all duration-300',
        'hover:shadow-xl hover:scale-[1.02]',
        rankConfig
          ? `bg-gradient-to-br ${rankConfig.color} ${rankConfig.glow} shadow-lg border-transparent`
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
        isCurrentUser && 'ring-4 ring-blue-500/50'
      )}
    >
      {/* Background Pattern */}
      {rankConfig && (
        <div className="absolute inset-0 rounded-xl opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.8),transparent)]" />
        </div>
      )}

      <div className="relative flex items-center gap-4">
        {/* Rank Badge */}
        <div className="flex-shrink-0">
          {rankConfig ? (
            <div className="flex items-center justify-center w-14 h-14 text-4xl">
              {rankConfig.icon}
            </div>
          ) : (
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-bold text-xl">
              {entry.rank}
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {entry.userAvatar ? (
              <img
                src={entry.userAvatar}
                alt={entry.userName}
                className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-700"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold border-2 border-white dark:border-gray-700">
                {entry.userName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4
                className={cn(
                  'font-bold text-base truncate',
                  rankConfig ? 'text-white drop-shadow-md' : 'text-gray-900 dark:text-gray-100'
                )}
              >
                {entry.userName}
                {isCurrentUser && (
                  <span className="ml-2 text-xs font-normal opacity-80">(você)</span>
                )}
              </h4>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'text-xs capitalize',
                    rankConfig ? 'text-white/90' : 'text-gray-500 dark:text-gray-400'
                  )}
                >
                  {entry.userRole}
                </span>
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-medium',
                    rankConfig
                      ? 'bg-white/30 text-white'
                      : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                  )}
                >
                  Nível {entry.level}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-shrink-0 text-right">
          <div className="flex items-center justify-end gap-1 mb-1">
            <Star className={cn('w-4 h-4', rankConfig ? 'text-white' : 'text-yellow-500')} />
            <span
              className={cn(
                'text-2xl font-bold',
                rankConfig ? 'text-white drop-shadow-md' : 'text-gray-900 dark:text-gray-100'
              )}
            >
              {entry.points.toLocaleString('pt-BR')}
            </span>
          </div>
          <div className="flex items-center justify-end gap-1">
            <Target className={cn('w-3 h-3', rankConfig ? 'text-white/80' : 'text-gray-500')} />
            <span className={cn('text-xs', rankConfig ? 'text-white/90' : 'text-gray-500 dark:text-gray-400')}>
              {entry.tasksCompleted} tarefas
            </span>
          </div>
        </div>

        {/* Trend */}
        <div className="flex-shrink-0">
          {TREND_ICONS[entry.trend]}
        </div>
      </div>

      {/* Badges */}
      {entry.badges.length > 0 && (
        <div className="relative mt-3 pt-3 border-t border-white/20">
          <BadgeCollection badges={entry.badges} maxVisible={6} size="sm" />
        </div>
      )}
    </div>
  );
}

function LeaderboardCard({ entry, isCurrentUser }: { entry: LeaderboardEntry; isCurrentUser: boolean }) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 p-3 rounded-lg border transition-all',
        'hover:bg-gray-50 dark:hover:bg-gray-800/50',
        'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
        isCurrentUser && 'ring-2 ring-blue-500/50'
      )}
    >
      {/* Rank */}
      <div className="flex-shrink-0 w-8 text-center">
        <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
          #{entry.rank}
        </span>
      </div>

      {/* User Info */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {entry.userAvatar ? (
          <img
            src={entry.userAvatar}
            alt={entry.userName}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
            {entry.userName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {entry.userName}
            {isCurrentUser && (
              <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">(você)</span>
            )}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Nível {entry.level}
          </p>
        </div>
      </div>

      {/* Points */}
      <div className="flex-shrink-0 text-right">
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 text-yellow-500" />
          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {entry.points.toLocaleString('pt-BR')}
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {entry.tasksCompleted} tarefas
        </p>
      </div>

      {/* Badges */}
      {entry.badges.length > 0 && (
        <div className="flex-shrink-0">
          <BadgeCollection badges={entry.badges} maxVisible={3} size="sm" />
        </div>
      )}

      {/* Trend */}
      <div className="flex-shrink-0">
        {TREND_ICONS[entry.trend]}
      </div>
    </div>
  );
}
