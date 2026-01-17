'use client'

import { use } from 'react'
import { AppShell } from '@/components/AppShell'
import { MuseumGame } from '@/components/MuseumGame'
import { mockNotifications, mockUsers, mockAchievements } from '@/mocks/data'

interface MuseumExplorePageProps {
  params: Promise<{ userId: string }>
}

export default function MuseumExplorePage({ params }: MuseumExplorePageProps) {
  const { userId } = use(params)
  const currentUser = mockUsers[0]
  
  // Find the museum owner
  const owner = mockUsers.find(u => u.id === userId) || currentUser
  const isOwnMuseum = userId === currentUser.id
  
  return (
    <AppShell 
      user={currentUser} 
      notifications={mockNotifications} 
    >
      <MuseumGame
        avatarSeed={currentUser.avatarSeed}
        userId={userId}
        achievements={mockAchievements}
        ownerName={isOwnMuseum ? undefined : owner.displayName}
      />
    </AppShell>
  )
}
