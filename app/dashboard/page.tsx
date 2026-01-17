'use client'

import { Dashboard } from '@/components/pages/Dashboard'
import { AppShell } from '@/components/AppShell'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { mockNotifications } from '@/mocks/data'

export default function DashboardPage() {
  const { user } = useCurrentUser()

  return (
    <AppShell 
      user={user} 
      notifications={mockNotifications} 
    >
      <Dashboard />
    </AppShell>
  )
}


