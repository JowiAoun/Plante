'use client'

import { AppShell } from '@/components/AppShell'
import { MuseumGame } from '@/components/MuseumGame'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { mockNotifications, mockAchievements } from '@/mocks/data'

export default function MuseumPage() {
  const { user } = useCurrentUser()
  
  if (!user) {
    return null
  }

  return (
    <AppShell 
      user={user} 
      notifications={mockNotifications} 
    >
      <MuseumGame
        avatarSeed={user.avatarSeed}
        userId={user.id}
        achievements={mockAchievements}
      />
    </AppShell>
  )
}

