/**
 * MSW (Mock Service Worker) Handlers
 * Mock API endpoints mirroring eventual backend contract
 */

import { http, HttpResponse } from 'msw';
import { mockUsers, mockFarms, mockAchievements, mockNotifications, mockExhibits } from './data';
import type { User, Farm, Notification, Exhibit } from '../types';

export const handlers = [
  // Users
  http.get('/api/users', () => {
    return HttpResponse.json(mockUsers);
  }),

  http.get('/api/users/:id', ({ params }) => {
    const user = mockUsers.find((u: User) => u.id === params.id);
    if (!user) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(user);
  }),

  http.get('/api/users/:id/achievements', ({ params }) => {
    return HttpResponse.json(mockAchievements.filter((a) => a.unlockedBy?.includes(params.id as string)));
  }),

  // Farms
  http.get('/api/farms', () => {
    return HttpResponse.json(mockFarms);
  }),

  http.get('/api/farms/:id', ({ params }) => {
    const farm = mockFarms.find((f: Farm) => f.id === params.id);
    if (!farm) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(farm);
  }),

  http.post('/api/farms/:id/water', ({ params }) => {
    const farm = mockFarms.find((f: Farm) => f.id === params.id);
    if (!farm) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json({ success: true, message: 'Watering initiated!' });
  }),

  http.post('/api/farms/:id/hatch', ({ params }) => {
    const farm = mockFarms.find((f: Farm) => f.id === params.id);
    if (!farm) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json({ success: true, message: 'Hatch opened!' });
  }),

  // Achievements
  http.get('/api/achievements', () => {
    return HttpResponse.json(mockAchievements);
  }),

  // Notifications
  http.get('/api/notifications', () => {
    return HttpResponse.json(mockNotifications);
  }),

  http.post('/api/notifications/:id/read', ({ params }) => {
    const notification = mockNotifications.find((n: Notification) => n.id === params.id);
    if (notification) {
      notification.read = true;
    }
    return HttpResponse.json({ success: true });
  }),

  // Exhibits (Museum)
  http.get('/api/exhibits', () => {
    return HttpResponse.json(mockExhibits);
  }),

  http.get('/api/exhibits/:id', ({ params }) => {
    const exhibit = mockExhibits.find((e: Exhibit) => e.id === params.id);
    if (!exhibit) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(exhibit);
  }),

  // Leaderboard
  http.get('/api/leaderboard', () => {
    const sorted = [...mockUsers].sort((a, b) => b.xp - a.xp);
    return HttpResponse.json(sorted.slice(0, 10));
  }),
];
