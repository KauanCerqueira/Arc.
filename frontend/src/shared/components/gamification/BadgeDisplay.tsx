'use client';

import React from 'react';
import type { Badge } from '@/core/types/gamification.types';
import { cn } from '@/shared/lib/utils';

interface BadgeDisplayProps {
  badge: Badge;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
}

const RARITY_COLORS = {
  common: 'from-gray-400 to-gray-500',
  rare: 'from-blue-400 to-cyan-500',
  epic: 'from-purple-400 to-pink-500',
  legendary: 'from-yellow-400 to-orange-500',
};

const RARITY_GLOW = {
  common: 'shadow-gray-400/30',
  rare: 'shadow-blue-500/50',
  epic: 'shadow-purple-500/50',
  legendary: 'shadow-yellow-500/60',
};

const SIZE_CONFIG = {
  sm: {
    container: 'w-10 h-10',
    icon: 'text-lg',
    text: 'text-xs',
  },
  md: {
    container: 'w-16 h-16',
    icon: 'text-3xl',
    text: 'text-sm',
  },
  lg: {
    container: 'w-24 h-24',
    icon: 'text-5xl',
    text: 'text-base',
  },
};

export function BadgeDisplay({ badge, size = 'md', showName = false }: BadgeDisplayProps) {
  const sizeConfig = SIZE_CONFIG[size];
  const rarityColor = badge.color || RARITY_COLORS[badge.rarity];
  const rarityGlow = RARITY_GLOW[badge.rarity];

  return (
    <div className="flex flex-col items-center gap-2 group">
      {/* Badge Icon */}
      <div
        className={cn(
          'relative rounded-full flex items-center justify-center',
          'bg-gradient-to-br transition-all duration-300',
          'hover:scale-110 cursor-pointer',
          sizeConfig.container,
          rarityColor,
          'shadow-lg',
          rarityGlow
        )}
        title={`${badge.name} - ${badge.description}`}
      >
        {/* Shine Effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Icon */}
        <span className={cn('relative z-10 drop-shadow-md', sizeConfig.icon)}>
          {badge.icon}
        </span>

        {/* Glow Ring */}
        <div
          className={cn(
            'absolute inset-0 rounded-full',
            'ring-2 ring-white/30 group-hover:ring-white/50 transition-all'
          )}
        />
      </div>

      {/* Badge Name */}
      {showName && (
        <div className="text-center">
          <p className={cn('font-semibold text-gray-900 dark:text-gray-100', sizeConfig.text)}>
            {badge.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
            {badge.rarity}
          </p>
          {badge.earnedAt && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {new Date(badge.earnedAt).toLocaleDateString('pt-BR')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

interface BadgeCollectionProps {
  badges: Badge[];
  maxVisible?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function BadgeCollection({ badges, maxVisible = 5, size = 'sm' }: BadgeCollectionProps) {
  const visibleBadges = badges.slice(0, maxVisible);
  const remainingCount = Math.max(0, badges.length - maxVisible);

  return (
    <div className="flex items-center gap-1">
      {visibleBadges.map((badge, index) => (
        <div
          key={badge.id}
          className="transform transition-transform hover:scale-125 hover:z-10"
          style={{ marginLeft: index > 0 ? '-8px' : '0' }}
        >
          <BadgeDisplay badge={badge} size={size} />
        </div>
      ))}
      {remainingCount > 0 && (
        <div
          className={cn(
            'flex items-center justify-center rounded-full',
            'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
            'font-medium border-2 border-white dark:border-gray-800',
            size === 'sm' && 'w-10 h-10 text-xs',
            size === 'md' && 'w-16 h-16 text-sm',
            size === 'lg' && 'w-24 h-24 text-base'
          )}
          style={{ marginLeft: '-8px' }}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}
