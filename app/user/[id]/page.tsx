'use client'

import React, { use } from 'react'
import Link from 'next/link'
import { Profile } from '@/components/pages/Profile/Profile'
import { mockUsers } from '@/mocks/data'

interface UserPageProps {
  params: Promise<{ id: string }>
}

import { AppShell } from '@/components/AppShell'
import { mockNotifications } from '@/mocks/data'
import { useRouter, useSearchParams } from 'next/navigation'

interface UserPageProps {
  params: Promise<{ id: string }>
}

export default function UserPage({ params }: UserPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const user = mockUsers.find(u => u.id === id)
  const currentUser = mockUsers[0] // Mock logged in user

  // Determine back link and label
  const fromPage = searchParams.get('from')
  let backLink = '/dashboard'
  let backLabel = 'Back to Dashboard'

  if (fromPage === 'leaderboard') {
    backLink = '/leaderboard'
    backLabel = 'Back to Leaderboard'
  }

  // Handle navigation from sidebar (redirect to dashboard with query param or just root)
  const handleNavigate = (page: string) => {
    // If user clicks sidebar items, we redirect to home with that page active
    // For simplicity in this demo, strict redirects:
    if (page === 'dashboard') router.push('/')
    else router.push(`/?page=${page}`)
  }

  if (!user) {
    return (
      <AppShell
        user={currentUser}
        notifications={mockNotifications}
        currentPage="profile"
        onNavigate={handleNavigate as any}
      >
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <h1 style={{ 
            fontFamily: 'var(--font-game)', 
            color: 'var(--color-critical)',
            marginBottom: '16px' 
          }}>
            User Not Found
          </h1>
          <p style={{ 
            fontFamily: 'var(--font-ui)', 
            color: 'var(--color-text-muted)', 
            marginBottom: '32px' 
          }}>
            The farmer you are looking for ({id}) could not be located.
          </p>
          <Link href="/" className="nes-btn is-primary">
            Return to Dashboard
          </Link>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell
      user={currentUser}
      notifications={mockNotifications}
      currentPage="profile" // Highlight profile or nothing
      onNavigate={handleNavigate as any}
    >
      <div className="user-profile-page" style={{ padding: '20px' }}>
         <div style={{ maxWidth: '600px', margin: '0 auto 20px auto' }}>
            <Link href={backLink} style={{ 
              fontFamily: 'var(--font-game)', 
              color: 'var(--color-text-muted)', 
              textDecoration: 'none',
              fontSize: '12px',
              display: 'inline-block',
              padding: '8px'
            }}>
              ← {backLabel}
            </Link>
         </div>
         <Profile user={user} isOwnProfile={false} />
      </div>
    </AppShell>
  )
}

