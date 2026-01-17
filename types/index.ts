/**
 * Plante Type Definitions
 * Central location for all domain entity types
 */

// User entity
export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarSeed: string;
  level: number;
  xp: number;
}

// Sensor reading
export interface SensorReading {
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
}

// Farm status
export type FarmStatus = 'healthy' | 'warning' | 'critical';

// Farm entity
export interface Farm {
  id: string;
  name: string;
  ownerId: string;
  status: FarmStatus;
  thumbnailUrl: string;
  sensors: {
    temp: SensorReading;
    humidity: SensorReading;
    soil: SensorReading;
  };
  lastSeen: string;
}

// Achievement rarity
export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

// Achievement entity
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  unlockedBy?: string[];
  unlockedAt?: string;
}

// Notification types
export type NotificationType = 'alert' | 'achievement' | 'social' | 'system';
export type NotificationSeverity = 'info' | 'warning' | 'critical';

// Notification entity
export interface Notification {
  id: string;
  type: NotificationType;
  severity: NotificationSeverity;
  message: string;
  ts: string;
  read: boolean;
  link?: string;
  senderAvatarSeed?: string;
}

// Exhibit image
export interface ExhibitImage {
  url: string;
  ts: string;
}

// Exhibit stats
export interface ExhibitStats {
  growthDays: number;
  waterEvents: number;
  averageTemp: number;
  yieldWeight: number;
}

// Exhibit entity (Museum)
export interface Exhibit {
  id: string;
  ownerId: string;
  title: string;
  images: ExhibitImage[];
  stats: ExhibitStats;
}

// Activity event
export interface ActivityEvent {
  id: string;
  icon: string;
  text: string;
  ts: string;
  meta?: Record<string, unknown>;
}

// Post for social features
export interface Post {
  id: string;
  author: User;
  content: string;
  media: string[];
  likes: number;
  comments: number;
  createdAt: string;
}

// Theme variants
export type ThemeVariant = 'default' | 'spring' | 'night' | 'neon';

// Pixel scale
export type PixelScale = '1x' | '2x';

// Chat message types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  audioUrl?: string;
  isLoading?: boolean;
}

// Chat user context for AI personalization
export interface ChatUserContext {
  user: {
    id: string;
    username: string;
    displayName: string;
    level: number;
    xp: number;
    avatarSeed: string;
  };
  farms: Farm[];
  achievements: Achievement[];
  recentActivity: ActivityEvent[];
}

// Chat API request/response
export interface ChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];
  voiceEnabled?: boolean;
}

export interface ChatResponse {
  response: string;
  audioUrl?: string;
  suggestedActions?: string[];
}

// Chat error types
export type ChatErrorType =
  | 'GEMINI_RATE_LIMIT'
  | 'ELEVENLABS_QUOTA'
  | 'NETWORK_ERROR'
  | 'CONTEXT_TOO_LONG';
