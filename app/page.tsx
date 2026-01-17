'use client'

import { useState, use, useEffect } from 'react'
import { AppShell } from '@/components/AppShell'
import type { Page } from '@/components/AppShell'
import { Dashboard } from '@/components/pages/Dashboard'
import { Profile } from '@/components/pages/Profile'
import { Leaderboard } from '@/components/pages/Leaderboard'
import { Settings } from '@/components/pages/Settings'
import { mockUsers, mockNotifications } from '@/mocks/data'
import { useSearchParams } from 'next/navigation'

// Placeholder Museum page
const Museum = () => (
  <div>
    <h1 style={{ fontFamily: 'var(--font-game)', fontSize: '20px', color: 'var(--color-accent)', marginBottom: '16px' }}>
      🏛️ Museum
    </h1>
    <p style={{ color: 'var(--color-text-muted)' }}>
      Your plant collection and exhibits will appear here.
    </p>
  </div>
)

export default function Home() {
  const searchParams = useSearchParams()
  // Default to dashboard, but assume search param might override if we want to get fancy with deep linking
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')
  const currentUser = mockUsers[0]

  useEffect(() => {
    const pageParam = searchParams.get('page')
    if (pageParam && ['dashboard', 'profile', 'museum', 'leaderboard', 'settings'].includes(pageParam)) {
      setCurrentPage(pageParam as Page)
    }
  }, [searchParams])

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'profile':
        return <Profile user={currentUser} />
      case 'museum':
        return <Museum />
      case 'leaderboard':
        return <Leaderboard />
      case 'settings':
        return <Settings />
      default:
        return <Dashboard />
    }
  }

  return (
    <AppShell
      user={currentUser}
      notifications={mockNotifications}
      currentPage={currentPage}
      onNavigate={setCurrentPage}
    >
      <div className="app-content">
        {renderPage()}
      </div>
    </AppShell>
  )
}
