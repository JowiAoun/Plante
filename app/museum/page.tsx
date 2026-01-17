'use client'

import { AppShell } from '@/components/AppShell'
import { MuseumGame } from '@/components/MuseumGame'
import { mockNotifications, mockUsers, mockAchievements } from '@/mocks/data'

export default function MuseumPage() {
  const currentUser = mockUsers[0]
  
  return (
    <AppShell 
      user={currentUser} 
      notifications={mockNotifications} 
    >
      <MuseumGame
        avatarSeed={currentUser.avatarSeed}
        userId={currentUser.id}
        achievements={mockAchievements}
      />
    </AppShell>
  )
}
