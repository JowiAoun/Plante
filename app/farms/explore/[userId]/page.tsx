'use client'

import { use } from 'react'
import { AppShell } from '@/components/AppShell'
import { FarmGame } from '@/components/FarmGame'
import { mockNotifications, mockUsers, mockFarms, getUserFarms } from '@/mocks/data'
import { useCurrentUser } from '@/hooks/useCurrentUser'

interface FarmExplorePageProps {
  params: Promise<{ userId: string }>
}

export default function FarmExplorePage({ params }: FarmExplorePageProps) {
  const { userId } = use(params)
  const { user: currentUser } = useCurrentUser()
  
  // Find the farm owner
  // If viewing own profile (userId matches), utilize the real current user object
  // Otherwise look in mock users. 
  // TODO: In full implementation, fetch other users from API
  const isOwnFarm = currentUser?.id === userId
  const owner = isOwnFarm ? currentUser : (mockUsers.find(u => u.id === userId) || mockUsers[0])
  
  if (!owner) return null // Should not happen with fallback

  // Get farms owned by this user
  // If own farm, use getUserFarms which includes Kalanchoe
  const userFarms = isOwnFarm ? getUserFarms(userId) : mockFarms.filter(f => f.ownerId === userId)
  
  return (
    <AppShell 
      user={currentUser} 
      notifications={mockNotifications} 
    >
      <FarmGame
        avatarSeed={currentUser?.avatarSeed || 'guest'}
        owner={owner}
        farms={userFarms.length > 0 ? userFarms : mockFarms.slice(0, 2)}
        isOwnFarm={isOwnFarm}
      />
    </AppShell>
  )
}
