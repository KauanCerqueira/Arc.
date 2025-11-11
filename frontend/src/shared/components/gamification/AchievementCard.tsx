'use client';

import React from 'react';
import type { Achievement } from '@/core/types/gamification.types';
import { TIER_COLORS, TIER_GLOW } from '@/core/types/gamification.types';
import { cn } from '@/shared/lib/utils';

interface AchievementCardProps {
  achievement: Achievement;
  compact?: boolean;
  showProgress?: boolean;
}

export function AchievementCard({ achievement, compact = false, showProgress = true }: AchievementCardProps) {
  const isUnlocked = achievement.progress === 100;
  const tierColor = TIER_COLORS[achievement.tier];
  const tierGlow = TIER_GLOW[achievement.tier];

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all',
          isUnlocked
            ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200/50 dark:border-gray-800 opacity-60'
        )}
        title={achievement.description}
      >
        <div
          className={cn(
            'text-2xl transition-all',
            isUnlocked ? 'scale-100' : 'scale-90 grayscale'
          )}
        >
          {achievement.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {achievement.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
            {achievement.tier}
          </p>
        </div>
        {showProgress && !isUnlocked && (
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
            {achievement.currentValue}/{achievement.requirement}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative group rounded-xl border-2 overflow-hidden transition-all duration-300',
        isUnlocked
          ? `bg-gradient-to-br ${tierColor} shadow-lg ${tierGlow} hover:shadow-xl hover:scale-105`
          : 'bg-gray-100 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 hover:border-gray-400'
      )}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.8),transparent)]" />
      </div>

      {/* Content */}
      <div className="relative p-6">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div
            className={cn(
              'text-6xl transition-all duration-300',
              isUnlocked
                ? 'scale-100 drop-shadow-lg'
                : 'scale-90 grayscale opacity-50'
            )}
          >
            {achievement.icon}
          </div>
        </div>

        {/* Title & Tier */}
        <div className="text-center mb-3">
          <h3
            className={cn(
              'text-lg font-bold mb-1',
              isUnlocked
                ? 'text-white drop-shadow-md'
                : 'text-gray-700 dark:text-gray-300'
            )}
          >
            {achievement.name}
          </h3>
          <p
            className={cn(
              'text-sm font-medium capitalize',
              isUnlocked
                ? 'text-white/90'
                : 'text-gray-500 dark:text-gray-400'
            )}
          >
            {achievement.tier}
          </p>
        </div>

        {/* Description */}
        <p
          className={cn(
            'text-sm text-center mb-4',
            isUnlocked
              ? 'text-white/80'
              : 'text-gray-600 dark:text-gray-400'
          )}
        >
          {achievement.description}
        </p>

        {/* Progress Bar */}
        {showProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className={isUnlocked ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'}>
                Progresso
              </span>
              <span className={isUnlocked ? 'text-white' : 'text-gray-700 dark:text-gray-300'}>
                {achievement.currentValue}/{achievement.requirement}
              </span>
            </div>
            <div
              className={cn(
                'h-2 rounded-full overflow-hidden',
                isUnlocked
                  ? 'bg-white/30'
                  : 'bg-gray-300 dark:bg-gray-700'
              )}
            >
              <div
                className={cn(
                  'h-full transition-all duration-500 rounded-full',
                  isUnlocked
                    ? 'bg-white shadow-sm'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500'
                )}
                style={{ width: `${achievement.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Unlocked Badge */}
        {isUnlocked && achievement.unlockedAt && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <p className="text-xs text-white/80 text-center">
              Desbloqueado em{' '}
              {new Date(achievement.unlockedAt).toLocaleDateString('pt-BR')}
            </p>
          </div>
        )}
      </div>

      {/* Locked Overlay */}
      {!isUnlocked && (
        <div className="absolute inset-0 bg-gray-900/5 dark:bg-black/20 pointer-events-none" />
      )}
    </div>
  );
}
