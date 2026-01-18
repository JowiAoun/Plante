'use client'

import { use, useState, useEffect } from 'react'
import { AppShell } from '@/components/AppShell'
import { FarmGame } from '@/components/FarmGame'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useNotifications } from '@/hooks/useNotifications'
import type { Farm } from '@/types'

interface FarmExplorePageProps {
  params: Promise<{ userId: string }>
}

export default function FarmExplorePage({ params }: FarmExplorePageProps) {
  const { userId } = use(params)
  const { user: currentUser } = useCurrentUser()
  const { notifications } = useNotifications()

  const [farms, setFarms] = useState<Farm[]>([])
  const [loading, setLoading] = useState(true)

  // Determine if viewing own farm
  const isOwnFarm = currentUser?.id === userId

  // Fetch farms from database
  useEffect(() => {
    const fetchFarms = async () => {
      try {
        // For own farms, use /api/farms which returns authenticated user's farms
        // For other users, would need a different endpoint (not implemented yet)
        if (isOwnFarm) {
          const response = await fetch('/api/farms')
          if (response.ok) {
            const data = await response.json()
            setFarms(data)
          }
        }
      } catch (error) {
        console.error('Error fetching farms:', error)
      } finally {
        setLoading(false)
      }
    }

    if (currentUser) {
      fetchFarms()
    }
  }, [isOwnFarm, currentUser])

  // Create owner object from current user
  const owner = currentUser ? {
    id: currentUser.id,
    username: currentUser.username,
    displayName: currentUser.displayName || 'Farmer',
    avatarSeed: currentUser.avatarSeed || currentUser.id,
    level: currentUser.level || 1,
    xp: currentUser.xp || 0,
  } : null

  if (!currentUser || loading) {
    return (
      <AppShell user={currentUser} notifications={notifications}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
          fontFamily: 'var(--font-game)',
          color: 'var(--color-text-muted)'
        }}>
          Loading farms...
        </div>
      </AppShell>
    )
  }

  if (!owner) return null

  return (
    <AppShell
      user={currentUser}
      notifications={notifications}
    >
      <FarmGame
        avatarSeed={currentUser?.avatarSeed || 'guest'}
        owner={owner}
        farms={farms}
        isOwnFarm={isOwnFarm}
      />
    </AppShell>
  )
}
