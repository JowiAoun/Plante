'use client'

import { Leaderboard } from '@/components/pages/Leaderboard'
import { AppShell } from '@/components/AppShell'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { mockNotifications } from '@/mocks/data'

export default function LeaderboardPage() {
  const { user } = useCurrentUser()

  return (
    <AppShell 
      user={user} 
      notifications={mockNotifications} 
    >
      <Leaderboard />
    </AppShell>
  )
}

