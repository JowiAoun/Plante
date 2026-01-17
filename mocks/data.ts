/**
 * Mock Data for Plante
 * Deterministic seed data for Storybook and development
 */

import type { User, Farm, Achievement, Notification, Exhibit } from '../types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: '8f7a2d',
    username: 'green_thumb',
    displayName: 'Green Thumb Gary',
    avatarSeed: 'gary2024',
    level: 12,
    xp: 4850,
  },
  {
    id: '3c9e1b',
    username: 'plant_queen',
    displayName: 'Plant Queen Pam',
    avatarSeed: 'pam2024',
    level: 18,
    xp: 8200,
  },
  {
    id: '5a4d2f',
    username: 'seedling_sam',
    displayName: 'Seedling Sam',
    avatarSeed: 'sam2024',
    level: 5,
    xp: 1200,
  },
  {
    id: '7b6c8e',
    username: 'harvest_hero',
    displayName: 'Harvest Hero Helen',
    avatarSeed: 'helen2024',
    level: 25,
    xp: 15600,
  },
];

// Mock Farms
export const mockFarms: Farm[] = [
  {
    id: 'a8x9de',
    name: 'Tomato Paradise',
    ownerId: '8f7a2d',
    status: 'healthy',
    thumbnailUrl: '/sprites/farm_tomato_32.png',
    sensors: {
      temp: { value: 24, unit: '°C', trend: 'stable' },
      humidity: { value: 65, unit: '%', trend: 'up' },
      soil: { value: 45, unit: '%', trend: 'stable' },
    },
    lastSeen: new Date().toISOString(),
  },
  {
    id: 'b7y2cf',
    name: 'Herb Haven',
    ownerId: '8f7a2d',
    status: 'warning',
    thumbnailUrl: '/sprites/farm_herb_32.png',
    sensors: {
      temp: { value: 28, unit: '°C', trend: 'up' },
      humidity: { value: 42, unit: '%', trend: 'down' },
      soil: { value: 30, unit: '%', trend: 'down' },
    },
    lastSeen: new Date().toISOString(),
  },
  {
    id: 'c5z4ab',
    name: 'Pepper Palace',
    ownerId: '3c9e1b',
    status: 'critical',
    thumbnailUrl: '/sprites/farm_pepper_32.png',
    sensors: {
      temp: { value: 35, unit: '°C', trend: 'up' },
      humidity: { value: 25, unit: '%', trend: 'down' },
      soil: { value: 15, unit: '%', trend: 'down' },
    },
    lastSeen: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'd3w1gh',
    name: 'Succulent Sanctuary',
    ownerId: '5a4d2f',
    status: 'healthy',
    thumbnailUrl: '/sprites/farm_succulent_32.png',
    sensors: {
      temp: { value: 22, unit: '°C', trend: 'stable' },
      humidity: { value: 40, unit: '%', trend: 'stable' },
      soil: { value: 25, unit: '%', trend: 'stable' },
    },
    lastSeen: new Date().toISOString(),
  },
];

// Mock Achievements
export const mockAchievements: Achievement[] = [
  {
    id: 'ach-001',
    title: 'First Seedling',
    description: 'Plant your first seed',
    icon: 'seedling',
    rarity: 'common',
    unlockedBy: ['8f7a2d', '3c9e1b', '5a4d2f', '7b6c8e'],
    unlockedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'ach-002',
    title: 'Green Streak',
    description: 'Keep plants healthy for 7 days straight',
    icon: 'streak',
    rarity: 'rare',
    unlockedBy: ['8f7a2d', '3c9e1b'],
    unlockedAt: '2024-02-01T14:30:00Z',
  },
  {
    id: 'ach-003',
    title: 'Harvest Master',
    description: 'Complete 10 successful harvests',
    icon: 'harvest',
    rarity: 'epic',
    unlockedBy: ['7b6c8e'],
    unlockedAt: '2024-03-10T09:15:00Z',
  },
  {
    id: 'ach-004',
    title: 'Water Wizard',
    description: 'Never miss a watering for 30 days',
    icon: 'water',
    rarity: 'epic',
    unlockedBy: [],
  },
  {
    id: 'ach-005',
    title: 'Community Leader',
    description: 'Help 50 other farmers',
    icon: 'community',
    rarity: 'legendary',
    unlockedBy: [],
  },
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: 'notif-001',
    type: 'alert',
    severity: 'critical',
    message: 'Pepper Palace needs water urgently!',
    ts: new Date(Date.now() - 300000).toISOString(),
    read: false,
  },
  {
    id: 'notif-002',
    type: 'achievement',
    severity: 'info',
    message: 'You unlocked "Green Streak" badge!',
    ts: new Date(Date.now() - 3600000).toISOString(),
    read: false,
  },
  {
    id: 'notif-003',
    type: 'social',
    severity: 'info',
    message: 'Plant Queen Pam followed you!',
    ts: new Date(Date.now() - 7200000).toISOString(),
    read: true,
  },
  {
    id: 'notif-004',
    type: 'system',
    severity: 'warning',
    message: 'Herb Haven humidity is below threshold',
    ts: new Date(Date.now() - 1800000).toISOString(),
    read: false,
  },
];

// Mock Exhibits (Museum)
export const mockExhibits: Exhibit[] = [
  {
    id: 'exhibit-001',
    ownerId: '8f7a2d',
    title: 'Champion Tomato 2024',
    images: [
      { url: '/timelapse/tomato_day1.png', ts: '2024-01-01T08:00:00Z' },
      { url: '/timelapse/tomato_day7.png', ts: '2024-01-07T08:00:00Z' },
      { url: '/timelapse/tomato_day14.png', ts: '2024-01-14T08:00:00Z' },
      { url: '/timelapse/tomato_day21.png', ts: '2024-01-21T08:00:00Z' },
    ],
    stats: {
      growthDays: 45,
      waterEvents: 32,
      averageTemp: 23,
      yieldWeight: 250,
    },
  },
  {
    id: 'exhibit-002',
    ownerId: '3c9e1b',
    title: 'Perfect Basil Harvest',
    images: [
      { url: '/timelapse/basil_week1.png', ts: '2024-02-01T08:00:00Z' },
      { url: '/timelapse/basil_week2.png', ts: '2024-02-08T08:00:00Z' },
      { url: '/timelapse/basil_week3.png', ts: '2024-02-15T08:00:00Z' },
    ],
    stats: {
      growthDays: 28,
      waterEvents: 20,
      averageTemp: 21,
      yieldWeight: 80,
    },
  },
];

// Utility to simulate states for Storybook
export const storyStates = {
  manyNotifications: Array.from({ length: 15 }, (_, i) => ({
    id: `notif-${i + 100}`,
    type: ['alert', 'achievement', 'social', 'system'][i % 4] as Notification['type'],
    severity: ['info', 'warning', 'critical'][i % 3] as Notification['severity'],
    message: `Notification message ${i + 1}`,
    ts: new Date(Date.now() - i * 600000).toISOString(),
    read: i > 5,
  })),
  
  criticalAlert: {
    ...mockFarms[2],
    status: 'critical' as const,
  },
  
  emptyMuseum: [] as Exhibit[],
  
  fullMuseum: Array.from({ length: 20 }, (_, i) => ({
    id: `exhibit-${i + 100}`,
    ownerId: mockUsers[i % 4].id,
    title: `Plant Exhibit ${i + 1}`,
    images: [],
    stats: { growthDays: 30 + i, waterEvents: 20 + i, averageTemp: 22, yieldWeight: 100 + i * 10 },
  })),
};
