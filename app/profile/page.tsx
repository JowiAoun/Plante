'use client'

import { Profile } from '@/components/pages/Profile'
import { AppShell } from '@/components/AppShell'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { mockNotifications } from '@/mocks/data'

export default function ProfilePage() {
  const { user } = useCurrentUser()
  
  if (!user) {
    return null
  }

  return (
    <AppShell 
      user={user} 
      notifications={mockNotifications} 
    >
      <Profile user={user} isOwnProfile={true} />
    </AppShell>
  )
}

