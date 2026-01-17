'use client'

import { Settings } from '@/components/pages/Settings'
import { AppShell } from '@/components/AppShell'
import { mockNotifications, mockUsers } from '@/mocks/data'

export default function SettingsPage() {
  const currentUser = mockUsers[0]
  return (
    <AppShell 
      user={currentUser} 
      notifications={mockNotifications} 
    >
      <Settings />
    </AppShell>
  )
}
