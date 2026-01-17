'use client'

import { Leaderboard } from '@/components/pages/Leaderboard'
import { AppShell } from '@/components/AppShell'
import { mockNotifications, mockUsers } from '@/mocks/data'

export default function LeaderboardPage() {
  const currentUser = mockUsers[0]
  return (
    <AppShell 
      user={currentUser} 
      notifications={mockNotifications} 
    >
      <Leaderboard />
    </AppShell>
  )
}
