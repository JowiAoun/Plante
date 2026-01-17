'use client'

import { Dashboard } from '@/components/pages/Dashboard'
import { AppShell } from '@/components/AppShell'
import { mockNotifications, mockUsers } from '@/mocks/data'

export default function DashboardPage() {
  const currentUser = mockUsers[0]
  return (
    <AppShell 
      user={currentUser} 
      notifications={mockNotifications} 
    >
      <Dashboard />
    </AppShell>
  )
}
