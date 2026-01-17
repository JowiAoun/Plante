'use client'

import { use } from 'react'
import { AppShell } from '@/components/AppShell'
import { FarmGame } from '@/components/FarmGame'
import { mockNotifications, mockUsers, mockFarms } from '@/mocks/data'

interface FarmExplorePageProps {
  params: Promise<{ userId: string }>
}

export default function FarmExplorePage({ params }: FarmExplorePageProps) {
  const { userId } = use(params)
  const currentUser = mockUsers[0]
  
  // Find the farm owner
  const owner = mockUsers.find(u => u.id === userId) || currentUser
  const isOwnFarm = userId === currentUser.id
  
  // Get farms owned by this user
  const userFarms = mockFarms.filter(f => f.ownerId === userId)
  
  return (
    <AppShell 
      user={currentUser} 
      notifications={mockNotifications} 
    >
      <FarmGame
        avatarSeed={currentUser.avatarSeed}
        owner={owner}
        farms={userFarms.length > 0 ? userFarms : mockFarms.slice(0, 2)}
        isOwnFarm={isOwnFarm}
      />
    </AppShell>
  )
}
