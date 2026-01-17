'use client'

import { Settings } from '@/components/pages/Settings'
import { AppShell } from '@/components/AppShell'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { mockNotifications } from '@/mocks/data'

export default function SettingsPage() {
  const { user } = useCurrentUser()

  return (
    <AppShell 
      user={user} 
      notifications={mockNotifications} 
    >
      <Settings />
    </AppShell>
  )
}

