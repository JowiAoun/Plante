/**
 * Plante Achievement Definitions
 * Initial 5 achievements - to be expanded later
 */

import type { Achievement } from '../types';

export const achievements: Achievement[] = [
  {
    id: 'ach-first-seedling',
    title: 'First Seedling',
    description: 'Plant your very first seed and begin your farming journey',
    icon: 'seedling',
    rarity: 'common',
  },
  {
    id: 'ach-green-streak',
    title: 'Green Streak',
    description: 'Keep all your plants healthy for 7 consecutive days',
    icon: 'streak',
    rarity: 'rare',
  },
  {
    id: 'ach-water-wizard',
    title: 'Water Wizard',
    description: 'Never miss a scheduled watering for 30 days straight',
    icon: 'water',
    rarity: 'epic',
  },
  {
    id: 'ach-harvest-master',
    title: 'Harvest Master',
    description: 'Complete 10 successful harvests with perfect health scores',
    icon: 'harvest',
    rarity: 'epic',
  },
  {
    id: 'ach-community-hero',
    title: 'Community Hero',
    description: 'Help 25 fellow farmers by sharing tips and resources',
    icon: 'community',
    rarity: 'legendary',
  },
];

// Achievement rarity colors mapped to palette
export const rarityColors = {
  common: '#C2C3C7',    // lightGray
  rare: '#29ADFF',      // blue
  epic: '#7E2553',      // darkPurple
  legendary: '#FFEC27', // yellow
} as const;

// Achievement icon emoji placeholders (to be replaced with sprites)
export const achievementIcons = {
  seedling: '🌱',
  streak: '🔥',
  water: '💧',
  harvest: '🌾',
  community: '🤝',
} as const;

export default achievements;
