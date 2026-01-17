'use client'

import { Profile } from '@/components/pages/Profile'
import { AppShell } from '@/components/AppShell'
import { mockNotifications, mockUsers } from '@/mocks/data'

export default function ProfilePage() {
  const currentUser = mockUsers[0]
  return (
    <AppShell 
      user={currentUser} 
      notifications={mockNotifications} 
    >
      <Profile user={currentUser} isOwnProfile={true} />
    </AppShell>
  )
}
